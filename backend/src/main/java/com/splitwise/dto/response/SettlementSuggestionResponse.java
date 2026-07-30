package com.splitwise.dto.response;

import java.math.BigDecimal;

public class SettlementSuggestionResponse {
    private UserResponse fromUser;
    private UserResponse toUser;
    private BigDecimal amount;

    public SettlementSuggestionResponse() {
    }

    public SettlementSuggestionResponse(UserResponse fromUser, UserResponse toUser, BigDecimal amount) {
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.amount = amount;
    }

    public UserResponse getFromUser() {
        return fromUser;
    }

    public void setFromUser(UserResponse fromUser) {
        this.fromUser = fromUser;
    }

    public UserResponse getToUser() {
        return toUser;
    }

    public void setToUser(UserResponse toUser) {
        this.toUser = toUser;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
