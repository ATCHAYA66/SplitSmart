package com.splitwise.dto.response;

import java.math.BigDecimal;

public class ExpenseSplitResponse {
    private Long id;
    private UserResponse user;
    private BigDecimal amount;
    private BigDecimal percentage;

    public ExpenseSplitResponse() {
    }

    public ExpenseSplitResponse(Long id, UserResponse user, BigDecimal amount, BigDecimal percentage) {
        this.id = id;
        this.user = user;
        this.amount = amount;
        this.percentage = percentage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }
}
