package com.splitwise.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SettleUpRequest {

    @NotNull(message = "Group ID is required")
    private Long groupId;

    @NotNull(message = "Payer ID is required")
    private Long payerId;

    @NotNull(message = "Payee ID is required")
    private Long payeeId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Settlement amount must be greater than 0")
    private BigDecimal amount;

    private String notes;

    public SettleUpRequest() {
    }

    public SettleUpRequest(Long groupId, Long payerId, Long payeeId, BigDecimal amount, String notes) {
        this.groupId = groupId;
        this.payerId = payerId;
        this.payeeId = payeeId;
        this.amount = amount;
        this.notes = notes;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public Long getPayerId() {
        return payerId;
    }

    public void setPayerId(Long payerId) {
        this.payerId = payerId;
    }

    public Long getPayeeId() {
        return payeeId;
    }

    public void setPayeeId(Long payeeId) {
        this.payeeId = payeeId;
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
}
