package com.splitwise.dto.request;

import jakarta.validation.constraints.NotBlank;

public class JoinGroupRequest {

    @NotBlank(message = "Join code is required")
    private String joinCode;

    public JoinGroupRequest() {
    }

    public JoinGroupRequest(String joinCode) {
        this.joinCode = joinCode;
    }

    public String getJoinCode() {
        return joinCode;
    }

    public void setJoinCode(String joinCode) {
        this.joinCode = joinCode;
    }
}
