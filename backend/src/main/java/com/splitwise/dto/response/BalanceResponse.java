package com.splitwise.dto.response;

import java.math.BigDecimal;

public class BalanceResponse {
    private UserResponse user;
    private BigDecimal netBalance; // Positive = gets back money, Negative = owes money

    public BalanceResponse() {
    }

    public BalanceResponse(UserResponse user, BigDecimal netBalance) {
        this.user = user;
        this.netBalance = netBalance;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public BigDecimal getNetBalance() {
        return netBalance;
    }

    public void setNetBalance(BigDecimal netBalance) {
        this.netBalance = netBalance;
    }
}
