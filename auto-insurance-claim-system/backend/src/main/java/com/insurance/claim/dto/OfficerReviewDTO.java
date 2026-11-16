package com.insurance.claim.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OfficerReviewDTO {
    @NotNull(message = "Claim ID is required")
    private Long claimId;

    private String taskId;

    @NotBlank(message = "Decision is required (APPROVED, REJECTED, INVESTIGATE)")
    private String decision; // APPROVED, REJECTED, INVESTIGATE

    private String remarks;
    private String rejectionReason;
    private BigDecimal manualOverrideAmount;
    private Double claimantFaultPercentage = 0.0;
}
