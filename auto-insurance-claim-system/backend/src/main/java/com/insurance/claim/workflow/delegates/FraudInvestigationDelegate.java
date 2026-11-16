package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.entity.Investigation;
import com.insurance.claim.repository.InsuranceClaimRepository;
import com.insurance.claim.repository.InvestigationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("fraudInvestigationDelegate")
@RequiredArgsConstructor
@Slf4j
public class FraudInvestigationDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;
    private final InvestigationRepository investigationRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.warn("[BPMN Service Task] FraudInvestigationDelegate (HIGH RISK) flagged for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            claim.setRiskLevel("HIGH");
            claim.setRiskScore(85);
            claim.setStatus("UNDER_INVESTIGATION");
            claim.setRemarks("HIGH RISK indicator flagged by DMN rule engine. Special Investigation Unit assigned.");
            claimRepository.save(claim);

            // Automatically open investigation record
            if (investigationRepository.findByClaimId(claimId).isEmpty()) {
                investigationRepository.save(Investigation.builder()
                        .claim(claim)
                        .status("ASSIGNED")
                        .fraudRiskFlag(true)
                        .findings("Automated DMN risk trigger: High damage amount / incident discrepancy.")
                        .build());
            }
        }
    }
}
