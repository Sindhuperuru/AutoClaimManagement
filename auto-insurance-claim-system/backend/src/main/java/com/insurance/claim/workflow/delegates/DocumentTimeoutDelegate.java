package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.AuditLog;
import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.repository.AuditLogRepository;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("documentTimeoutDelegate")
@RequiredArgsConstructor
@Slf4j
public class DocumentTimeoutDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.warn("[BPMN Service Task] Document submission timed out for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            String reason = "Claim closed due to customer document submission deadline expiration (7-day timeout)";
            claim.setRejectionReason(reason);
            claim.setStatus("REJECTED");
            claimRepository.save(claim);

            execution.setVariable("rejectionReason", reason);

            auditLogRepository.save(AuditLog.builder()
                    .entityName("InsuranceClaim")
                    .entityId(claim.getClaimNumber())
                    .action("SLA_TIMEOUT_EXPIRED")
                    .performedBy("CAMUNDA_TIMER")
                    .details(reason)
                    .build());
        }
    }
}
