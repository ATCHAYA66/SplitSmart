package com.splitwise.service;

import com.splitwise.dto.request.SettleUpRequest;
import com.splitwise.dto.response.BalanceResponse;
import com.splitwise.dto.response.SettlementResponse;
import com.splitwise.dto.response.SettlementSuggestionResponse;
import com.splitwise.dto.response.UserResponse;
import com.splitwise.entity.*;
import com.splitwise.exception.BadRequestException;
import com.splitwise.exception.ResourceNotFoundException;
import com.splitwise.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class SettlementService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public SettlementService(GroupRepository groupRepository,
                             GroupMemberRepository groupMemberRepository,
                             ExpenseRepository expenseRepository,
                             SettlementRepository settlementRepository,
                             UserRepository userRepository,
                             AuthService authService) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRepository = settlementRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public Map<Long, BigDecimal> calculateRawNetBalances(Long groupId) {
        List<GroupMember> members = groupMemberRepository.findAllMembersByGroupIdFetchUser(groupId);
        Map<Long, BigDecimal> balances = new HashMap<>();

        for (GroupMember gm : members) {
            balances.put(gm.getUser().getId(), BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }

        // Process Expenses
        List<Expense> expenses = expenseRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
        for (Expense expense : expenses) {
            Long paidById = expense.getPaidBy().getId();
            BigDecimal currentPaidByBal = balances.getOrDefault(paidById, BigDecimal.ZERO);
            balances.put(paidById, currentPaidByBal.add(expense.getAmount()));

            for (ExpenseSplit split : expense.getSplits()) {
                Long participantId = split.getUser().getId();
                BigDecimal currentParticipantBal = balances.getOrDefault(participantId, BigDecimal.ZERO);
                balances.put(participantId, currentParticipantBal.subtract(split.getAmount()));
            }
        }

        // Process Settlements recorded
        List<Settlement> settlements = settlementRepository.findByGroupIdOrderBySettledAtDesc(groupId);
        for (Settlement settlement : settlements) {
            Long payerId = settlement.getPayer().getId();
            Long payeeId = settlement.getPayee().getId();

            // Payer paid money out of pocket to settle -> increase net balance (less debt)
            BigDecimal currentPayerBal = balances.getOrDefault(payerId, BigDecimal.ZERO);
            balances.put(payerId, currentPayerBal.add(settlement.getAmount()));

            // Payee received money -> decrease net balance (less credit)
            BigDecimal currentPayeeBal = balances.getOrDefault(payeeId, BigDecimal.ZERO);
            balances.put(payeeId, currentPayeeBal.subtract(settlement.getAmount()));
        }

        return balances;
    }

    @Transactional(readOnly = true)
    public List<BalanceResponse> getGroupBalances(Long groupId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new BadRequestException("Access denied. You are not a member of this group.");
        }

        Map<Long, BigDecimal> rawBalances = calculateRawNetBalances(groupId);
        List<GroupMember> members = groupMemberRepository.findAllMembersByGroupIdFetchUser(groupId);

        List<BalanceResponse> result = new ArrayList<>();
        for (GroupMember gm : members) {
            User user = gm.getUser();
            BigDecimal netBal = rawBalances.getOrDefault(user.getId(), BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            result.add(new BalanceResponse(authService.mapToUserResponse(user), netBal));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<SettlementSuggestionResponse> getSettlementSuggestions(Long groupId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new BadRequestException("Access denied. You are not a member of this group.");
        }

        Map<Long, BigDecimal> rawBalances = calculateRawNetBalances(groupId);
        List<GroupMember> members = groupMemberRepository.findAllMembersByGroupIdFetchUser(groupId);

        Map<Long, User> userMap = new HashMap<>();
        for (GroupMember gm : members) {
            userMap.put(gm.getUser().getId(), gm.getUser());
        }

        // Priority queues for Debtors (negative balance) and Creditors (positive balance)
        // Debtor balance is stored as positive amount owed for easy max comparison
        class UserBalance {
            final Long userId;
            BigDecimal amount;

            UserBalance(Long userId, BigDecimal amount) {
                this.userId = userId;
                this.amount = amount;
            }
        }

        PriorityQueue<UserBalance> debtors = new PriorityQueue<>((a, b) -> b.amount.compareTo(a.amount));
        PriorityQueue<UserBalance> creditors = new PriorityQueue<>((a, b) -> b.amount.compareTo(a.amount));

        for (Map.Entry<Long, BigDecimal> entry : rawBalances.entrySet()) {
            BigDecimal bal = entry.getValue();
            if (bal.compareTo(new BigDecimal("-0.01")) < 0) {
                debtors.add(new UserBalance(entry.getKey(), bal.abs()));
            } else if (bal.compareTo(new BigDecimal("0.01")) > 0) {
                creditors.add(new UserBalance(entry.getKey(), bal));
            }
        }

        List<SettlementSuggestionResponse> suggestions = new ArrayList<>();

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            UserBalance debtor = debtors.poll();
            UserBalance creditor = creditors.poll();

            BigDecimal settleAmount = debtor.amount.min(creditor.amount).setScale(2, RoundingMode.HALF_UP);

            if (settleAmount.compareTo(BigDecimal.ZERO) > 0) {
                User fromUser = userMap.get(debtor.userId);
                User toUser = userMap.get(creditor.userId);

                suggestions.add(new SettlementSuggestionResponse(
                        authService.mapToUserResponse(fromUser),
                        authService.mapToUserResponse(toUser),
                        settleAmount
                ));

                debtor.amount = debtor.amount.subtract(settleAmount);
                creditor.amount = creditor.amount.subtract(settleAmount);

                if (debtor.amount.compareTo(new BigDecimal("0.01")) >= 0) {
                    debtors.add(debtor);
                }
                if (creditor.amount.compareTo(new BigDecimal("0.01")) >= 0) {
                    creditors.add(creditor);
                }
            }
        }

        return suggestions;
    }

    @Transactional
    public SettlementResponse recordSettlement(SettleUpRequest request, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + request.getGroupId()));

        if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), currentUser.getId())) {
            throw new BadRequestException("Access denied. You are not a member of this group.");
        }

        User payer = userRepository.findById(request.getPayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Payer user not found"));

        User payee = userRepository.findById(request.getPayeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Payee user not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), payer.getId()) ||
            !groupMemberRepository.existsByGroupIdAndUserId(group.getId(), payee.getId())) {
            throw new BadRequestException("Both payer and payee must be members of the group.");
        }

        if (payer.getId().equals(payee.getId())) {
            throw new BadRequestException("Payer and payee cannot be the same user.");
        }

        BigDecimal amount = request.getAmount().setScale(2, RoundingMode.HALF_UP);

        Settlement settlement = new Settlement(
                group,
                payer,
                payee,
                amount,
                request.getNotes() != null ? request.getNotes().trim() : "Settlement payment"
        );

        Settlement saved = settlementRepository.save(settlement);

        return mapToSettlementResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SettlementResponse> getGroupSettlementHistory(Long groupId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new BadRequestException("Access denied. You are not a member of this group.");
        }

        List<Settlement> settlements = settlementRepository.findByGroupIdOrderBySettledAtDesc(groupId);
        return settlements.stream().map(this::mapToSettlementResponse).toList();
    }

    public SettlementResponse mapToSettlementResponse(Settlement s) {
        return new SettlementResponse(
                s.getId(),
                s.getGroup().getId(),
                authService.mapToUserResponse(s.getPayer()),
                authService.mapToUserResponse(s.getPayee()),
                s.getAmount(),
                s.getNotes(),
                s.getSettledAt()
        );
    }
}
