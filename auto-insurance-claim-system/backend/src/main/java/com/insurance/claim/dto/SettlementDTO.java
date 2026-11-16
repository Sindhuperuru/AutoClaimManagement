package com.insurance.claim.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementDTO {
    private Long id;
    private Long claimId;
    private String claimNumber;
    private BigDecimal calculatedAmount;
    private BigDecimal deductibleDeducted;
    private BigDecimal depreciationDeducted;
    private BigDecimal finalPayableAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionReference;
    private String bankName;
    private String accountNumberMasked;
    private LocalDateTime paymentDate;
}
