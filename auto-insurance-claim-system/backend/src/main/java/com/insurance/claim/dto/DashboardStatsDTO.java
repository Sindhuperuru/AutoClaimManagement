package com.insurance.claim.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalClaims;
    private long submittedClaims;
    private long underAgentReview;
    private long underInvestigation;
    private long underOfficerReview;
    private long approvedClaims;
    private long rejectedClaims;
    private long settledClaims;
    private BigDecimal totalSettledAmount;
    private BigDecimal averageClaimAmount;
    private double averageResolutionDays;
    private Map<String, Long> claimsByRiskLevel;
    private Map<String, Long> claimsByMonth;
    private Map<String, Long> claimsByAccidentType;
    private long activePolicies;
    private long totalCustomers;
}
