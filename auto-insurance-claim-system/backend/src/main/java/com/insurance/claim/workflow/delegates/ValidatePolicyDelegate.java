package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.entity.InsurancePolicy;
import com.insurance.claim.repository.InsuranceClaimRepository;
import com.insurance.claim.repository.InsurancePolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component("validatePolicyDelegate")
@RequiredArgsConstructor
@Slf4j
public class ValidatePolicyDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;
    private final InsurancePolicyRepository policyRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] ValidatePolicyDelegate checking policy for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim == null) {
            execution.setVariable("isPolicyValid", false);
            execution.setVariable("rejectionReason", "Claim record not found");
            return;
        }

        InsurancePolicy policy = claim.getPolicy();
        LocalDate accidentDate = claim.getAccident().getAccidentDateTime().toLocalDate();

        boolean isActive = "ACTIVE".equalsIgnoreCase(policy.getStatus());
        boolean isWithinDates = !accidentDate.isBefore(policy.getStartDate()) && !accidentDate.isAfter(policy.getEndDate());

        if (isActive && isWithinDates) {
            execution.setVariable("isPolicyValid", true);
            execution.setVariable("coverageType", policy.getPolicyType());
            execution.setVariable("policyCoverageLimit", policy.getSumInsured().doubleValue());
            execution.setVariable("deductibleAmount", policy.getDeductibleAmount().doubleValue());
            log.info("Policy {} is VALID for claim {}", policy.getPolicyNumber(), claim.getClaimNumber());
        } else {
            execution.setVariable("isPolicyValid", false);
            String reason = !isActive ? "Policy status is " + policy.getStatus() : "Accident occurred outside active policy period";
            execution.setVariable("rejectionReason", reason);
            log.warn("Policy {} is INVALID: {}", policy.getPolicyNumber(), reason);
        }
    }
}
