package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("generateRejectionReasonDelegate")
@RequiredArgsConstructor
@Slf4j
public class GenerateRejectionReasonDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        String rejectionReason = (String) execution.getVariable("rejectionReason");
        if (rejectionReason == null) {
            rejectionReason = "Claim did not satisfy insurer policy coverage requirements or regulatory criteria.";
        }

        log.info("[BPMN Service Task] GenerateRejectionReasonDelegate for claim: {}, reason: {}", claimId, rejectionReason);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            claim.setStatus("REJECTED");
            claim.setRejectionReason(rejectionReason);
            claimRepository.save(claim);
        }
    }
}
