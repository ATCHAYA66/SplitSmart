package com.splitwise.service;

import com.splitwise.dto.request.AddExpenseRequest;
import com.splitwise.dto.request.ExpenseSplitRequest;
import com.splitwise.dto.response.ExpenseResponse;
import com.splitwise.dto.response.ExpenseSplitResponse;
import com.splitwise.entity.*;
import com.splitwise.exception.BadRequestException;
import com.splitwise.exception.ResourceNotFoundException;
import com.splitwise.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public ExpenseService(ExpenseRepository expenseRepository,
                          ExpenseSplitRepository expenseSplitRepository,
                          GroupRepository groupRepository,
                          GroupMemberRepository groupMemberRepository,
                          UserRepository userRepository,
                          AuthService authService) {
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional
    public ExpenseResponse addExpense(AddExpenseRequest request, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + request.getGroupId()));

        if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), currentUser.getId())) {
            throw new BadRequestException("Access denied. You are not a member of this group.");
        }

        User paidBy = userRepository.findById(request.getPaidByUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Payer user not found with ID: " + request.getPaidByUserId()));

        if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), paidBy.getId())) {
            throw new BadRequestException("The user who paid is not a member of this group.");
        }

        BigDecimal totalAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);

        Expense expense = new Expense(
                group,
                request.getTitle().trim(),
                totalAmount,
                request.getCategory() != null ? request.getCategory().trim() : "General",
                paidBy,
                request.getSplitType()
        );

        Expense savedExpense = expenseRepository.save(expense);
        List<ExpenseSplit> splits = new ArrayList<>();

        int numParticipants = request.getSplits().size();
        if (numParticipants == 0) {
            throw new BadRequestException("Expense must have at least one participant split.");
        }

        switch (request.getSplitType()) {
            case EQUAL -> {
                BigDecimal equalShare = totalAmount.divide(BigDecimal.valueOf(numParticipants), 2, RoundingMode.DOWN);
                BigDecimal totalDistributed = equalShare.multiply(BigDecimal.valueOf(numParticipants));
                BigDecimal remainder = totalAmount.subtract(totalDistributed);

                for (int i = 0; i < numParticipants; i++) {
                    ExpenseSplitRequest splitReq = request.getSplits().get(i);
                    User participant = userRepository.findById(splitReq.getUserId())
                            .orElseThrow(() -> new ResourceNotFoundException("Participant user not found: " + splitReq.getUserId()));

                    if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), participant.getId())) {
                        throw new BadRequestException("User " + participant.getName() + " is not a member of this group.");
                    }

                    // Add remainder penny to the first split
                    BigDecimal share = (i == 0) ? equalShare.add(remainder) : equalShare;
                    BigDecimal percentage = BigDecimal.valueOf(100).divide(BigDecimal.valueOf(numParticipants), 2, RoundingMode.HALF_UP);

                    splits.add(new ExpenseSplit(savedExpense, participant, share, percentage));
                }
            }
            case EXACT -> {
                BigDecimal sumSplits = BigDecimal.ZERO;
                for (ExpenseSplitRequest splitReq : request.getSplits()) {
                    if (splitReq.getAmount() == null || splitReq.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new BadRequestException("Exact split amount must be greater than 0.");
                    }
                    sumSplits = sumSplits.add(splitReq.getAmount());
                }

                if (sumSplits.setScale(2, RoundingMode.HALF_UP).compareTo(totalAmount) != 0) {
                    throw new BadRequestException("Sum of exact splits (" + sumSplits + ") does not equal total expense amount (" + totalAmount + ").");
                }

                for (ExpenseSplitRequest splitReq : request.getSplits()) {
                    User participant = userRepository.findById(splitReq.getUserId())
                            .orElseThrow(() -> new ResourceNotFoundException("Participant user not found: " + splitReq.getUserId()));

                    if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), participant.getId())) {
                        throw new BadRequestException("User " + participant.getName() + " is not a member of this group.");
                    }

                    BigDecimal splitAmt = splitReq.getAmount().setScale(2, RoundingMode.HALF_UP);
                    BigDecimal percentage = splitAmt.multiply(BigDecimal.valueOf(100)).divide(totalAmount, 2, RoundingMode.HALF_UP);

                    splits.add(new ExpenseSplit(savedExpense, participant, splitAmt, percentage));
                }
            }
            case PERCENTAGE -> {
                BigDecimal sumPercentage = BigDecimal.ZERO;
                for (ExpenseSplitRequest splitReq : request.getSplits()) {
                    if (splitReq.getPercentage() == null || splitReq.getPercentage().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new BadRequestException("Percentage split must be greater than 0.");
                    }
                    sumPercentage = sumPercentage.add(splitReq.getPercentage());
                }

                if (sumPercentage.setScale(2, RoundingMode.HALF_UP).compareTo(new BigDecimal("100.00")) != 0) {
                    throw new BadRequestException("Sum of split percentages (" + sumPercentage + "%) must equal 100%.");
                }

                BigDecimal calculatedTotal = BigDecimal.ZERO;
                for (int i = 0; i < numParticipants; i++) {
                    ExpenseSplitRequest splitReq = request.getSplits().get(i);
                    User participant = userRepository.findById(splitReq.getUserId())
                            .orElseThrow(() -> new ResourceNotFoundException("Participant user not found: " + splitReq.getUserId()));

                    if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), participant.getId())) {
                        throw new BadRequestException("User " + participant.getName() + " is not a member of this group.");
                    }

                    BigDecimal pct = splitReq.getPercentage().setScale(2, RoundingMode.HALF_UP);
                    BigDecimal splitAmt = totalAmount.multiply(pct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                    if (i == numParticipants - 1) {
                        // Adjust last item to handle rounding penny drift
                        splitAmt = totalAmount.subtract(calculatedTotal);
                    } else {
                        calculatedTotal = calculatedTotal.add(splitAmt);
                    }

                    splits.add(new ExpenseSplit(savedExpense, participant, splitAmt, pct));
                }
            }
        }

        expenseSplitRepository.saveAll(splits);
        savedExpense.setSplits(splits);

        return mapToExpenseResponse(savedExpense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getGroupExpenses(Long groupId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new BadRequestException("Access denied. You are not a member of this group.");
        }

        List<Expense> expenses = expenseRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
        return expenses.stream().map(this::mapToExpenseResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getUserExpenses(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<GroupMember> memberships = groupMemberRepository.findByUserId(currentUser.getId());
        List<Long> groupIds = memberships.stream().map(gm -> gm.getGroup().getId()).toList();

        List<Expense> allExpenses = new ArrayList<>();
        for (Long gid : groupIds) {
            allExpenses.addAll(expenseRepository.findByGroupIdOrderByCreatedAtDesc(gid));
        }

        return allExpenses.stream()
                .distinct()
                .sorted((e1, e2) -> e2.getCreatedAt().compareTo(e1.getCreatedAt()))
                .map(this::mapToExpenseResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long expenseId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + expenseId));

        if (!groupMemberRepository.existsByGroupIdAndUserId(expense.getGroup().getId(), currentUser.getId())) {
            throw new BadRequestException("Access denied. You are not a member of the group for this expense.");
        }

        return mapToExpenseResponse(expense);
    }

    @Transactional
    public void deleteExpense(Long expenseId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + expenseId));

        if (!groupMemberRepository.existsByGroupIdAndUserId(expense.getGroup().getId(), currentUser.getId())) {
            throw new BadRequestException("Access denied. You are not a member of this group.");
        }

        expenseRepository.delete(expense);
    }

    public ExpenseResponse mapToExpenseResponse(Expense expense) {
        List<ExpenseSplitResponse> splitResponses = expense.getSplits().stream()
                .map(s -> new ExpenseSplitResponse(
                        s.getId(),
                        authService.mapToUserResponse(s.getUser()),
                        s.getAmount(),
                        s.getPercentage()
                )).toList();

        return new ExpenseResponse(
                expense.getId(),
                expense.getGroup().getId(),
                expense.getGroup().getName(),
                expense.getTitle(),
                expense.getAmount(),
                expense.getCategory(),
                authService.mapToUserResponse(expense.getPaidBy()),
                expense.getSplitType(),
                splitResponses,
                expense.getCreatedAt()
        );
    }
}
