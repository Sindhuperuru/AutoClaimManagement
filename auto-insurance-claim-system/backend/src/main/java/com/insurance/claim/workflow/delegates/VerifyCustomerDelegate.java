package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component("verifyCustomerDelegate")
@RequiredArgsConstructor
@Slf4j
public class VerifyCustomerDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] VerifyCustomerDelegate for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            claim.setStatus("UNDER_AGENT_REVIEW");
            claim.setSlaDueDate(LocalDateTime.now().plusHours(24));
            claimRepository.save(claim);

            execution.setVariable("agentAssignee", "agent1");
            log.info("Claim {} transitioned to UNDER_AGENT_REVIEW assigned to agent1", claim.getClaimNumber());
        }
    }
}
