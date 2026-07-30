package com.splitwise.dto.request;

import com.splitwise.entity.SplitType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class AddExpenseRequest {

    @NotNull(message = "Group ID is required")
    private Long groupId;

    @NotBlank(message = "Expense title is required")
    private String title;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private String category;

    @NotNull(message = "Paid by user ID is required")
    private Long paidByUserId;

    @NotNull(message = "Split type is required")
    private SplitType splitType;

    @NotEmpty(message = "Splits participants list cannot be empty")
    private List<ExpenseSplitRequest> splits;

    public AddExpenseRequest() {
    }

    public AddExpenseRequest(Long groupId, String title, BigDecimal amount, String category, Long paidByUserId, SplitType splitType, List<ExpenseSplitRequest> splits) {
        this.groupId = groupId;
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.paidByUserId = paidByUserId;
        this.splitType = splitType;
        this.splits = splits;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getPaidByUserId() {
        return paidByUserId;
    }

    public void setPaidByUserId(Long paidByUserId) {
        this.paidByUserId = paidByUserId;
    }

    public SplitType getSplitType() {
        return splitType;
    }

    public void setSplitType(SplitType splitType) {
        this.splitType = splitType;
    }

    public List<ExpenseSplitRequest> getSplits() {
        return splits;
    }

    public void setSplits(List<ExpenseSplitRequest> splits) {
        this.splits = splits;
    }
}
