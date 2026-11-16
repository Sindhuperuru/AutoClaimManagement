package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;

@Component("calculateInitialDamageDelegate")
@RequiredArgsConstructor
@Slf4j
public class CalculateInitialDamageDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] CalculateInitialDamageDelegate for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            double estimatedDamage = claim.getEstimatedDamage().doubleValue();
            execution.setVariable("estimatedDamage", estimatedDamage);

            // Compute policy age in months
            long policyAgeMonths = ChronoUnit.MONTHS.between(claim.getPolicy().getStartDate(), claim.getAccident().getAccidentDateTime().toLocalDate());
            if (policyAgeMonths < 0) policyAgeMonths = 0;
            execution.setVariable("policyAgeMonths", (int) policyAgeMonths);

            // Count prior claims
            Integer priorClaims = claimRepository.countByCustomerId(claim.getCustomer().getId());
            int prevClaims = (priorClaims != null && priorClaims > 1) ? priorClaims - 1 : 0;
            execution.setVariable("previousClaimsCount", prevClaims);

            // Damage vs sum insured ratio
            double ratio = estimatedDamage / claim.getPolicy().getSumInsured().doubleValue();
            execution.setVariable("damageVsCoverageRatio", ratio);

            // Safe fallback default for claimRisk variable
            execution.setVariable("claimRisk", "LOW");

            log.info("Damage details calculated. Damage: ${}, Policy Age: {} months, Prior claims: {}, Coverage ratio: {}",
                    estimatedDamage, policyAgeMonths, prevClaims, String.format("%.2f", ratio));
        }
    }
}
