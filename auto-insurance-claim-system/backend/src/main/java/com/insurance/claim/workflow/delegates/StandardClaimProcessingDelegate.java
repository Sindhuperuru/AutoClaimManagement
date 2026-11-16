package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("standardClaimProcessingDelegate")
@RequiredArgsConstructor
@Slf4j
public class StandardClaimProcessingDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] StandardClaimProcessingDelegate (LOW RISK) for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            claim.setRiskLevel("LOW");
            claim.setRiskScore(18);
            claim.setRemarks("Low risk rating. Fast-tracked for standard parallel verification.");
            claimRepository.save(claim);
        }
    }
}
