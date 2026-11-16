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

import java.time.LocalDateTime;

@Component("registerClaimDelegate")
@RequiredArgsConstructor
@Slf4j
public class RegisterClaimDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] RegisterClaimDelegate executing for claimId: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            claim.setStatus("SUBMITTED");
            claim.setProcessInstanceId(execution.getProcessInstanceId());
            claimRepository.save(claim);

            execution.setVariable("policyNumber", claim.getPolicy().getPolicyNumber());
            execution.setVariable("customerId", claim.getCustomer().getId());
            execution.setVariable("customerName", claim.getCustomer().getUser().getFullName());
            execution.setVariable("estimatedDamage", claim.getEstimatedDamage().doubleValue());
            execution.setVariable("accidentDate", claim.getAccident().getAccidentDateTime().toString());

            auditLogRepository.save(AuditLog.builder()
                    .entityName("InsuranceClaim")
                    .entityId(claim.getClaimNumber() != null ? claim.getClaimNumber() : String.valueOf(claimId))
                    .action("WORKFLOW_REGISTER_CLAIM")
                    .performedBy("CAMUNDA_ENGINE")
                    .details("Claim registered in workflow engine. Process ID: " + execution.getProcessInstanceId())
                    .build());
        }
    }
}
