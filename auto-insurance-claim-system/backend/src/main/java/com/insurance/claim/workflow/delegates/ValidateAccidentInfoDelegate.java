package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.Accident;
import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;

@Component("validateAccidentInfoDelegate")
@RequiredArgsConstructor
@Slf4j
public class ValidateAccidentInfoDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Service Task] ValidateAccidentInfoDelegate for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null) {
            claim.setStatus("UNDER_ASSESSMENT");
            claimRepository.save(claim);

            Accident accident = claim.getAccident();
            long delayDays = ChronoUnit.DAYS.between(accident.getAccidentDateTime(), claim.getSubmissionDate());
            if (delayDays < 0) delayDays = 0;

            boolean hasFir = accident.getFirNumber() != null && !accident.getFirNumber().trim().isEmpty();

            // Set variables required for DMN claimRiskAssessmentDecision
            execution.setVariable("accidentDelayDays", (int) delayDays);
            execution.setVariable("policeFirAvailable", hasFir);
            execution.setVariable("accidentType", accident.getAccidentType());
            log.info("Accident validated. Delay days: {}, Police FIR: {}", delayDays, hasFir);
        }
    }
}
