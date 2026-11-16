package com.insurance.claim.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationDTO {
    @NotNull(message = "Claim ID is required")
    private Long claimId;

    private String taskId;
    private String findings;
    private Boolean fraudRiskFlag = false;
    private Boolean siteVisitDone = false;
    private Boolean thirdPartyVerified = false;
    private Boolean workshopVerified = false;
    private String reportSummary;
}
