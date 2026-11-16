package com.insurance.claim.controller;

import com.insurance.claim.dto.ApiResponse;
import com.insurance.claim.dto.SettlementDTO;
import com.insurance.claim.entity.User;
import com.insurance.claim.service.AuthService;
import com.insurance.claim.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SettlementController {

    private final SettlementService settlementService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SettlementDTO>>> getAllSettlements() {
        List<SettlementDTO> settlements = settlementService.getAllSettlements();
        return ResponseEntity.ok(ApiResponse.ok(settlements));
    }

    @GetMapping("/claim/{claimId}")
    public ResponseEntity<ApiResponse<SettlementDTO>> getSettlementByClaim(@PathVariable Long claimId) {
        SettlementDTO settlement = settlementService.getSettlementByClaimId(claimId);
        return ResponseEntity.ok(ApiResponse.ok(settlement));
    }

    @PostMapping({"/authorize/{claimId}", "/process-simulation/{claimId}"})
    public ResponseEntity<ApiResponse<SettlementDTO>> authorizeSettlement(
            @PathVariable String claimId,
            @RequestParam(defaultValue = "false") boolean simulateFailure) {

        User user = null;
        try {
            user = authService.getCurrentAuthenticatedUser();
        } catch (Exception ex) {
            // anonymous or system execution fallback
        }
        SettlementDTO settlement = settlementService.authorizeAndDisburseSettlement(claimId, user, simulateFailure);
        return ResponseEntity.ok(ApiResponse.ok("Settlement authorized and simulated payment processed successfully", settlement));
    }
}
