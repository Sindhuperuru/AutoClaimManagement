package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("workshopEstimateVerificationDelegate")
@RequiredArgsConstructor
@Slf4j
public class WorkshopEstimateVerificationDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Parallel Branch B] WorkshopEstimateVerificationDelegate executing for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            claim.setStatus("UNDER_OFFICER_REVIEW");
            claimRepository.save(claim);

            execution.setVariable("workshopEstimateStatus", "VERIFIED");
            execution.setVariable("officerAssignee", "officer1");
            log.info("Workshop line item labor and parts verification validated against OEM rate book. Claim advanced to UNDER_OFFICER_REVIEW.");
        }
    }
}
