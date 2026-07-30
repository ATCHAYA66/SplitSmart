package com.splitwise.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SettlementResponse {
    private Long id;
    private Long groupId;
    private UserResponse payer;
    private UserResponse payee;
    private BigDecimal amount;
    private String notes;
    private LocalDateTime settledAt;

    public SettlementResponse() {
    }

    public SettlementResponse(Long id, Long groupId, UserResponse payer, UserResponse payee, BigDecimal amount, String notes, LocalDateTime settledAt) {
        this.id = id;
        this.groupId = groupId;
        this.payer = payer;
        this.payee = payee;
        this.amount = amount;
        this.notes = notes;
        this.settledAt = settledAt;
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

    public UserResponse getPayer() {
        return payer;
    }

    public void setPayer(UserResponse payer) {
        this.payer = payer;
    }

    public UserResponse getPayee() {
        return payee;
    }

    public void setPayee(UserResponse payee) {
        this.payee = payee;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getSettledAt() {
        return settledAt;
    }

    public void setSettledAt(LocalDateTime settledAt) {
        this.settledAt = settledAt;
    }
}
