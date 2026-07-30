package com.splitwise.dto.response;

import com.splitwise.entity.SplitType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ExpenseResponse {
    private Long id;
    private Long groupId;
    private String groupName;
    private String title;
    private BigDecimal amount;
    private String category;
    private UserResponse paidBy;
    private SplitType splitType;
    private List<ExpenseSplitResponse> splits;
    private LocalDateTime createdAt;

    public ExpenseResponse() {
    }

    public ExpenseResponse(Long id, Long groupId, String groupName, String title, BigDecimal amount, String category, UserResponse paidBy, SplitType splitType, List<ExpenseSplitResponse> splits, LocalDateTime createdAt) {
        this.id = id;
        this.groupId = groupId;
        this.groupName = groupName;
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.paidBy = paidBy;
        this.splitType = splitType;
        this.splits = splits;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
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

    public UserResponse getPaidBy() {
        return paidBy;
    }

    public void setPaidBy(UserResponse paidBy) {
        this.paidBy = paidBy;
    }

    public SplitType getSplitType() {
        return splitType;
    }

    public void setSplitType(SplitType splitType) {
        this.splitType = splitType;
    }

    public List<ExpenseSplitResponse> getSplits() {
        return splits;
    }

    public void setSplits(List<ExpenseSplitResponse> splits) {
        this.splits = splits;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
