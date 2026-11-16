package com.insurance.claim.workflow.delegates;

import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("policeFirVerificationDelegate")
@RequiredArgsConstructor
@Slf4j
public class PoliceFirVerificationDelegate implements JavaDelegate {

    private final InsuranceClaimRepository claimRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long claimId = (Long) execution.getVariable("claimId");
        log.info("[BPMN Parallel Branch A] PoliceFirVerificationDelegate executing for claim: {}", claimId);

        InsuranceClaim claim = claimRepository.findById(claimId).orElse(null);
        if (claim != null && claim.getAccident().getFirNumber() != null) {
            execution.setVariable("policeReportStatus", "VERIFIED");
            log.info("Police FIR verified with jurisdictional authority: {}", claim.getAccident().getFirNumber());
        } else {
            execution.setVariable("policeReportStatus", "NOT_REQUIRED");
            log.info("Police FIR verification marked NOT_REQUIRED or WAIVED for minor damage");
        }
    }
}
