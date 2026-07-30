package com.splitwise.controller;

import com.splitwise.dto.request.SettleUpRequest;
import com.splitwise.dto.response.ApiResponse;
import com.splitwise.dto.response.BalanceResponse;
import com.splitwise.dto.response.SettlementResponse;
import com.splitwise.dto.response.SettlementSuggestionResponse;
import com.splitwise.service.SettlementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @GetMapping("/group/{groupId}/balances")
    public ResponseEntity<ApiResponse<List<BalanceResponse>>> getGroupBalances(@PathVariable("groupId") Long groupId,
                                                                               @AuthenticationPrincipal UserDetails userDetails) {
        List<BalanceResponse> balances = settlementService.getGroupBalances(groupId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Group balances calculated", balances));
    }

    @GetMapping("/group/{groupId}/suggestions")
    public ResponseEntity<ApiResponse<List<SettlementSuggestionResponse>>> getSettlementSuggestions(@PathVariable("groupId") Long groupId,
                                                                                                     @AuthenticationPrincipal UserDetails userDetails) {
        List<SettlementSuggestionResponse> suggestions = settlementService.getSettlementSuggestions(groupId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Minimum transaction settlement suggestions calculated", suggestions));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SettlementResponse>> recordSettlement(@Valid @RequestBody SettleUpRequest request,
                                                                             @AuthenticationPrincipal UserDetails userDetails) {
        SettlementResponse settlement = settlementService.recordSettlement(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Settlement payment recorded successfully", settlement));
    }

    @GetMapping("/group/{groupId}/history")
    public ResponseEntity<ApiResponse<List<SettlementResponse>>> getGroupSettlementHistory(@PathVariable("groupId") Long groupId,
                                                                                            @AuthenticationPrincipal UserDetails userDetails) {
        List<SettlementResponse> settlements = settlementService.getGroupSettlementHistory(groupId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Group settlement history retrieved", settlements));
    }
}
