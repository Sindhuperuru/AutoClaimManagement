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

@Component("notifyCustomerDelegate")
@RequiredArgsConstructor
@Slf4j
public class NotifyCustomerDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] NotifyCustomerDelegate for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null && claim.getCustomer() != null && claim.getCustomer().getUser() != null) {
            boolean isApproved = "APPROVED".equalsIgnoreCase(claim.getStatus()) || "SETTLED".equalsIgnoreCase(claim.getStatus());
            String title = isApproved
                    ? "Claim " + claim.getClaimNumber() + " - Approved & Disbursed"
                    : "Claim " + claim.getClaimNumber() + " - Review Decision Notice";

            String message = isApproved
                    ? "Congratulations! Your accident claim has been approved and settled for $" + claim.getApprovedSettlementAmount() + ". Funds transferred via simulated banking gateway."
                    : "Your claim has been rejected. Reason: " + claim.getRejectionReason();

            String type = isApproved ? "SUCCESS" : "ALERT";

            try {
                notificationRepository.save(Notification.builder()
                        .user(claim.getCustomer().getUser())
                        .title(title)
                        .message(message)
                        .type(type)
                        .relatedClaimId(claim.getId())
                        .build());

                log.info("Notification dispatched to customer {} for claim status: {}",
                        claim.getCustomer().getUser().getUsername(), claim.getStatus());
            } catch (Exception ex) {
                log.warn("Customer notification dispatch failed non-critically: {}", ex.getMessage());
            }
        }
    }
}
