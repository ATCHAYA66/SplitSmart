package com.splitwise.controller;

import com.splitwise.dto.request.AddExpenseRequest;
import com.splitwise.dto.response.ApiResponse;
import com.splitwise.dto.response.ExpenseResponse;
import com.splitwise.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> addExpense(@Valid @RequestBody AddExpenseRequest request,
                                                                   @AuthenticationPrincipal UserDetails userDetails) {
        ExpenseResponse expense = expenseService.addExpense(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense added successfully", expense));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getGroupExpenses(@PathVariable("groupId") Long groupId,
                                                                               @AuthenticationPrincipal UserDetails userDetails) {
        List<ExpenseResponse> expenses = expenseService.getGroupExpenses(groupId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Group expenses retrieved", expenses));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getUserExpenses(@AuthenticationPrincipal UserDetails userDetails) {
        List<ExpenseResponse> expenses = expenseService.getUserExpenses(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User expenses retrieved", expenses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseById(@PathVariable("id") Long expenseId,
                                                                       @AuthenticationPrincipal UserDetails userDetails) {
        ExpenseResponse expense = expenseService.getExpenseById(expenseId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Expense details retrieved", expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable("id") Long expenseId,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        expenseService.deleteExpense(expenseId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
    }
}
