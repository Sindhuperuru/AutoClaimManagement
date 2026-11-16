package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.AuditLog;
import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.entity.Settlement;
import com.insurance.claim.repository.AuditLogRepository;
import com.insurance.claim.repository.InsuranceClaimRepository;
import com.insurance.claim.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.BpmnError;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component("paymentSimulationDelegate")
@RequiredArgsConstructor
@Slf4j
public class PaymentSimulationDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;
    private final SettlementRepository settlementRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] PaymentSimulationDelegate executing for claim: {}", claimId);

        // Check if payment failure test flag is explicitly simulated
        Boolean simulateFail = (Boolean) execution.getVariable("simulatePaymentFailure");
        if (Boolean.TRUE.equals(simulateFail)) {
            log.warn("Simulating intentional banking gateway timeout/failure for claim: {}", claimId);
            throw new BpmnError("ERR_PAYMENT_FAILED", "Simulated banking settlement network error");
        }

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            Settlement settlement = settlementRepository.findByClaimId(claimId).orElseGet(() -> {
                java.math.BigDecimal estimated = claim.getEstimatedDamage() != null ? claim.getEstimatedDamage() : new java.math.BigDecimal("1500.00");
                java.math.BigDecimal deductible = (claim.getPolicy() != null && claim.getPolicy().getDeductibleAmount() != null)
                        ? claim.getPolicy().getDeductibleAmount() : new java.math.BigDecimal("500.00");
                java.math.BigDecimal depreciation = estimated.multiply(new java.math.BigDecimal("0.10")).setScale(2, java.math.RoundingMode.HALF_UP);
                java.math.BigDecimal finalPayable = estimated.subtract(deductible).subtract(depreciation).max(java.math.BigDecimal.ZERO);

                Settlement newSettle = Settlement.builder()
                        .claim(claim)
                        .claimNumber(claim.getClaimNumber())
                        .calculatedAmount(estimated)
                        .deductibleDeducted(deductible)
                        .depreciationDeducted(depreciation)
                        .finalPayableAmount(finalPayable)
                        .paymentStatus("PENDING_AUTHORIZATION")
                        .paymentMethod("SIMULATED_DIRECT_DEPOSIT")
                        .bankName("JPMorgan Chase (Simulated)")
                        .accountNumberMasked("****-****-****-6812")
                        .build();
                return settlementRepository.save(newSettle);
            });

            String txnRef = "ACH-DISB-2026-" + String.format("%05d", (int) (Math.random() * 90000 + 10000));
            settlement.setTransactionReference(txnRef);
            settlement.setPaymentStatus("COMPLETED");
            settlement.setPaymentDate(LocalDateTime.now());
            if (settlement.getBankName() == null) {
                settlement.setBankName("JPMorgan Chase (Simulated)");
            }
            if (settlement.getAccountNumberMasked() == null) {
                settlement.setAccountNumberMasked("****-****-****-6812");
            }
            settlementRepository.save(settlement);

            claim.setStatus("SETTLED");
            claim.setApprovedSettlementAmount(settlement.getFinalPayableAmount());
            claimRepository.save(claim);

            execution.setVariable("paymentTransactionRef", txnRef);
            execution.setVariable("paymentStatus", "COMPLETED");

            try {
                auditLogRepository.save(AuditLog.builder()
                        .entityName("Settlement")
                        .entityId(settlement.getId().toString())
                        .action("PAYMENT_SIMULATION_EXECUTED")
                        .performedBy("SIMULATED_PAYMENT_GATEWAY")
                        .details("Simulated direct deposit of $" + settlement.getFinalPayableAmount() + " completed. TxnRef: " + txnRef)
                        .build());
            } catch (Exception ex) {
                log.warn("Non-critical audit log error: {}", ex.getMessage());
            }

            log.info("Simulated settlement payment successful. Reference: {}", txnRef);
        }
    }
}
