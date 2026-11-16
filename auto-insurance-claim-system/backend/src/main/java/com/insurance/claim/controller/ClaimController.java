package com.insurance.claim.controller;

import com.insurance.claim.dto.ApiResponse;
import com.insurance.claim.dto.ClaimResponseDTO;
import com.insurance.claim.dto.ClaimSubmissionRequest;
import com.insurance.claim.entity.User;
import com.insurance.claim.service.AuthService;
import com.insurance.claim.service.ClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimService claimService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<ClaimResponseDTO>> submitClaim(@Valid @RequestBody ClaimSubmissionRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        ClaimResponseDTO claim = claimService.submitClaim(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Claim submitted and Camunda process instance launched successfully", claim));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClaimResponseDTO>> getClaimById(@PathVariable Long id) {
        ClaimResponseDTO claim = claimService.getClaimById(id);
        return ResponseEntity.ok(ApiResponse.ok(claim));
    }

    @GetMapping("/track/{claimNumber}")
    public ResponseEntity<ApiResponse<ClaimResponseDTO>> trackClaim(@PathVariable String claimNumber) {
        ClaimResponseDTO claim = claimService.getClaimByNumber(claimNumber);
        return ResponseEntity.ok(ApiResponse.ok("Real-time claim status retrieved", claim));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<ClaimResponseDTO>>> getClaimsByCustomer(@PathVariable Long customerId) {
        List<ClaimResponseDTO> claims = claimService.getClaimsForCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.ok(claims));
    }

    @GetMapping("/my-claims")
    public ResponseEntity<ApiResponse<List<ClaimResponseDTO>>> getMyClaims() {
        User user = authService.getCurrentAuthenticatedUser();
        Long customerId = null;
        if (user.getId() != null) {
            // Find by user id
            List<ClaimResponseDTO> all = claimService.getAllClaims();
            List<ClaimResponseDTO> myClaims = all.stream()
                    .filter(c -> c.getCustomerEmail() != null && c.getCustomerEmail().equalsIgnoreCase(user.getEmail()))
                    .toList();
            return ResponseEntity.ok(ApiResponse.ok(myClaims));
        }
        return ResponseEntity.ok(ApiResponse.ok(List.of()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClaimResponseDTO>>> getAllClaims() {
        List<ClaimResponseDTO> claims = claimService.getAllClaims();
        return ResponseEntity.ok(ApiResponse.ok(claims));
    }
}
