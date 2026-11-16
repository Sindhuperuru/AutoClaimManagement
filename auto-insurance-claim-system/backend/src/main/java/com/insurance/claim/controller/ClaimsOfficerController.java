package com.insurance.claim.controller;

import com.insurance.claim.dto.ApiResponse;
import com.insurance.claim.dto.ClaimResponseDTO;
import com.insurance.claim.dto.InvestigationDTO;
import com.insurance.claim.dto.OfficerReviewDTO;
import com.insurance.claim.entity.Investigation;
import com.insurance.claim.entity.User;
import com.insurance.claim.service.AuthService;
import com.insurance.claim.service.OfficerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClaimsOfficerController {

    private final OfficerService officerService;
    private final AuthService authService;

    @GetMapping("/claims")
    public ResponseEntity<ApiResponse<List<ClaimResponseDTO>>> getAwaitingReviewClaims() {
        List<ClaimResponseDTO> claims = officerService.getClaimsAwaitingOfficerReview();
        return ResponseEntity.ok(ApiResponse.ok(claims));
    }

    @PostMapping("/review")
    public ResponseEntity<ApiResponse<ClaimResponseDTO>> submitReview(@Valid @RequestBody OfficerReviewDTO dto) {
        User officerUser = authService.getCurrentAuthenticatedUser();
        ClaimResponseDTO updated = officerService.processOfficerReview(dto, officerUser);
        return ResponseEntity.ok(ApiResponse.ok("Claims officer review decision recorded", updated));
    }

    @PostMapping("/investigations")
    public ResponseEntity<ApiResponse<Investigation>> submitInvestigation(@Valid @RequestBody InvestigationDTO dto) {
        User user = authService.getCurrentAuthenticatedUser();
        Investigation investigation = officerService.submitInvestigationReport(dto, user);
        return ResponseEntity.ok(ApiResponse.ok("Investigation report recorded", investigation));
    }
}
