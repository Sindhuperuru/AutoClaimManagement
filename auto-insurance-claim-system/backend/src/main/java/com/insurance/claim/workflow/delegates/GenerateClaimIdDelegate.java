package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component("generateClaimIdDelegate")
@RequiredArgsConstructor
@Slf4j
public class GenerateClaimIdDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] GenerateClaimIdDelegate for claimId: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            String claimNumber = String.format("CLM-%d-%05d", Year.now().getValue(), claimId);
            claim.setClaimNumber(claimNumber);
            claimRepository.save(claim);

            execution.setVariable("claimNumber", claimNumber);
            log.info("Assigned unique claim number: {}", claimNumber);
        }
    }
}
