package com.insurance.claim.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimResponseDTO {
    private Long id;
    private String claimNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String policyNumber;
    private String policyType;
    private BigDecimal sumInsured;
    private BigDecimal deductibleAmount;
    private String vehicleRegistration;
    private String vehicleMakeModel;
    private Integer vehicleYear;

    // Accident details
    private LocalDateTime accidentDateTime;
    private String accidentLocation;
    private String accidentCity;
    private String accidentState;
    private String accidentType;
    private String accidentDescription;
    private String driverName;
    private String driverLicenseNumber;
    private Boolean thirdPartyInvolved;
    private String thirdPartyDetails;
    private String policeStation;
    private String firNumber;

    // Claim state
    private String status;
    private String riskLevel;
    private Integer riskScore;
    private BigDecimal estimatedDamage;
    private BigDecimal approvedSettlementAmount;
    private String processInstanceId;
    private LocalDateTime submissionDate;
    private String rejectionReason;
    private String remarks;
    private LocalDateTime slaDueDate;

    // Active Camunda Task info
    private String currentTaskId;
    private String currentTaskName;
    private String currentTaskAssignee;

    // Documents
    private List<ClaimDocumentDTO> documents;

    // Reviews
    private List<ClaimReviewDTO> reviews;

    // Settlement
    private SettlementDTO settlement;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ClaimDocumentDTO {
        private Long id;
        private String documentType;
        private String fileName;
        private String filePath;
        private String fileType;
        private Long fileSize;
        private LocalDateTime uploadDate;
        private String verificationStatus;
        private String verificationRemarks;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ClaimReviewDTO {
        private Long id;
        private String reviewerName;
        private String role;
        private String decision;
        private String remarks;
        private LocalDateTime reviewDate;
    }
}
