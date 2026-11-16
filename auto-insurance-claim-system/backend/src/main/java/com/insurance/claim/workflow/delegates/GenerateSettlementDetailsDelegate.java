package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.entity.Settlement;
import com.insurance.claim.repository.InsuranceClaimRepository;
import com.insurance.claim.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Component("generateSettlementDetailsDelegate")
@RequiredArgsConstructor
@Slf4j
public class GenerateSettlementDetailsDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;
    private final SettlementRepository settlementRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] GenerateSettlementDetailsDelegate for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            BigDecimal estimated = claim.getEstimatedDamage();
            BigDecimal deductible = claim.getPolicy().getDeductibleAmount() != null ? claim.getPolicy().getDeductibleAmount() : new BigDecimal("500.00");
            BigDecimal depreciation = BigDecimal.ZERO;

            if ("COMPREHENSIVE".equalsIgnoreCase(claim.getPolicy().getPolicyType())) {
                depreciation = estimated.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
            }

            // Check if DMN result passed via execution
            Object dmnResult = execution.getVariable("settlementDecisionResult");
            BigDecimal finalPayable;

            if (dmnResult instanceof Map) {
                Map<?, ?> map = (Map<?, ?>) dmnResult;
                if (map.containsKey("approvedAmount") && map.get("approvedAmount") instanceof Number) {
                    finalPayable = BigDecimal.valueOf(((Number) map.get("approvedAmount")).doubleValue()).setScale(2, RoundingMode.HALF_UP);
                } else {
                    finalPayable = estimated.subtract(deductible).subtract(depreciation).max(BigDecimal.ZERO);
                }
            } else {
                finalPayable = estimated.subtract(deductible).subtract(depreciation).max(BigDecimal.ZERO);
            }

            claim.setApprovedSettlementAmount(finalPayable);
            claim.setStatus("APPROVED");
            claimRepository.save(claim);

            Settlement settlement = settlementRepository.findByClaimId(claimId).orElseGet(() ->
                    Settlement.builder().claim(claim).claimNumber(claim.getClaimNumber()).build()
            );

            settlement.setCalculatedAmount(estimated);
            settlement.setDeductibleDeducted(deductible);
            settlement.setDepreciationDeducted(depreciation);
            settlement.setFinalPayableAmount(finalPayable);
            settlement.setPaymentStatus("PENDING_AUTHORIZATION");
            settlement.setPaymentMethod("SIMULATED_DIRECT_DEPOSIT");
            settlement.setBankName("First Citizens National Bank (Simulated)");
            settlement.setAccountNumberMasked("****-****-****-9482");
            settlementRepository.save(settlement);

            execution.setVariable("finalPayableAmount", finalPayable.doubleValue());
            log.info("Settlement record created. Final Payable: ${}", finalPayable);
        }
    }
}
