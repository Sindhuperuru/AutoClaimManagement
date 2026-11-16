package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.entity.Notification;
import com.insurance.claim.repository.InsuranceClaimRepository;
import com.insurance.claim.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("requestAdditionalDocsDelegate")
@RequiredArgsConstructor
@Slf4j
public class RequestAdditionalDocsDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        String missingDocs = (String) execution.getVariable("missingDocumentsReason");
        if (missingDocs == null) missingDocs = "Please upload missing accident evidence or repair estimates.";

        log.info("[BPMN Service Task] RequestAdditionalDocsDelegate for claim: {}, missing: {}", claimId, missingDocs);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            claim.setStatus("DOCUMENTS_PENDING");
            claim.setRemarks("Missing documents requested: " + missingDocs);
            claimRepository.save(claim);

            notificationRepository.save(Notification.builder()
                    .user(claim.getCustomer().getUser())
                    .title("Action Required: Missing Documents for Claim " + claim.getClaimNumber())
                    .message("The insurance agent requested additional documents: " + missingDocs + ". Please re-upload within 7 days.")
                    .type("WARNING")
                    .relatedClaimId(claim.getId())
                    .build());
        }
    }
}
