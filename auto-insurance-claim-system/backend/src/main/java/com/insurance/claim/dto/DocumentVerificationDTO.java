package com.insurance.claim.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentVerificationDTO {
    @NotNull(message = "Claim ID is required")
    private Long claimId;

    private String taskId;

    // Document ID -> Verification Status (VERIFIED / REJECTED)
    private Map<Long, String> documentDecisions;

    private boolean allVerified;
    private String agentRemarks;
    private String missingDocumentsReason;
}
