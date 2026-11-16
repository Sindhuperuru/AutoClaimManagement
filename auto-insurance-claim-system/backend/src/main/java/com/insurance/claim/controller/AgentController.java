package com.insurance.claim.controller;

import com.insurance.claim.dto.ApiResponse;
import com.insurance.claim.dto.ClaimResponseDTO;
import com.insurance.claim.dto.DocumentVerificationDTO;
import com.insurance.claim.entity.User;
import com.insurance.claim.service.AgentService;
import com.insurance.claim.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AgentController {

    private final AgentService agentService;
    private final AuthService authService;

    @GetMapping("/claims")
    public ResponseEntity<ApiResponse<List<ClaimResponseDTO>>> getPendingClaims() {
        List<ClaimResponseDTO> claims = agentService.getPendingVerificationClaims();
        return ResponseEntity.ok(ApiResponse.ok(claims));
    }

    @PostMapping("/verify-documents")
    public ResponseEntity<ApiResponse<ClaimResponseDTO>> verifyDocuments(@Valid @RequestBody DocumentVerificationDTO dto) {
        User agentUser = authService.getCurrentAuthenticatedUser();
        ClaimResponseDTO updated = agentService.processDocumentVerification(dto, agentUser);
        return ResponseEntity.ok(ApiResponse.ok("Document verification completed and workflow updated", updated));
    }
}
