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

@Component("generateSettlementReportDelegate")
@RequiredArgsConstructor
@Slf4j
public class GenerateSettlementReportDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] GenerateSettlementReportDelegate for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            String reportId = "RPT-" + claim.getClaimNumber();
            execution.setVariable("settlementReportId", reportId);

            auditLogRepository.save(AuditLog.builder()
                    .entityName("InsuranceClaim")
                    .entityId(claim.getClaimNumber())
                    .action("SETTLEMENT_REPORT_GENERATED")
                    .performedBy("CAMUNDA_ENGINE")
                    .details("Official electronic claim disbursement report generated. Report ID: " + reportId)
                    .build());
        }
    }
}
