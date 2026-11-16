package com.insurance.claim.service;

import com.insurance.claim.dto.ClaimResponseDTO;
import com.insurance.claim.dto.InvestigationDTO;
import com.insurance.claim.dto.OfficerReviewDTO;
import com.insurance.claim.dto.WorkflowTaskDTO;
import com.insurance.claim.entity.ClaimReview;
import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.entity.Investigation;
import com.insurance.claim.entity.User;
import com.insurance.claim.exception.ResourceNotFoundException;
import com.insurance.claim.repository.ClaimReviewRepository;
import com.insurance.claim.repository.InsuranceClaimRepository;
import com.insurance.claim.repository.InvestigationRepository;
import com.insurance.claim.workflow.CamundaWorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfficerService {

    private final InsuranceClaimRepository claimRepository;
    private final ClaimReviewRepository reviewRepository;
    private final InvestigationRepository investigationRepository;
    private final CamundaWorkflowService workflowService;
    private final ClaimService claimService;
    private final AuditService auditService;

    public List<ClaimResponseDTO> getClaimsAwaitingOfficerReview() {
        return claimRepository.findAll().stream()
                .filter(c -> "UNDER_OFFICER_REVIEW".equalsIgnoreCase(c.getStatus()) ||
                             "UNDER_ASSESSMENT".equalsIgnoreCase(c.getStatus()) ||
                             "UNDER_INVESTIGATION".equalsIgnoreCase(c.getStatus()))
                .map(claimService::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClaimResponseDTO processOfficerReview(OfficerReviewDTO dto, User officerUser) {
        log.info("Officer {} reviewing claim ID: {}, decision: {}",
                officerUser.getUsername(), dto.getClaimId(), dto.getDecision());

        InsuranceClaim claim = claimRepository.findById(dto.getClaimId())
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + dto.getClaimId()));

        // Save review record
        reviewRepository.save(ClaimReview.builder()
                .claim(claim)
                .reviewer(officerUser)
                .role(officerUser.getRole().name())
                .decision(dto.getDecision())
                .remarks(dto.getRemarks())
                .reviewDate(LocalDateTime.now())
                .build());

        // Update local entity status
        if ("APPROVED".equalsIgnoreCase(dto.getDecision())) {
            claim.setStatus("APPROVED");
            if (dto.getManualOverrideAmount() != null) {
                claim.setApprovedSettlementAmount(dto.getManualOverrideAmount());
            }
        } else if ("REJECTED".equalsIgnoreCase(dto.getDecision())) {
            claim.setStatus("REJECTED");
            claim.setRejectionReason(dto.getRejectionReason() != null ? dto.getRejectionReason() : dto.getRemarks());
        } else if ("INVESTIGATE".equalsIgnoreCase(dto.getDecision())) {
            claim.setStatus("UNDER_INVESTIGATION");
        }
        claim.setRemarks(dto.getRemarks());
        claimRepository.save(claim);

        // Complete Camunda user task
        WorkflowTaskDTO activeTask = workflowService.getTaskForClaim(claim.getId());
        if (activeTask != null && "claimsOfficerReviewTask".equals(activeTask.getTaskDefinitionKey())) {
            Map<String, Object> taskVars = new HashMap<>();
            taskVars.put("officerDecision", dto.getDecision().toUpperCase());
            taskVars.put("rejectionReason", dto.getRejectionReason());
            taskVars.put("claimantFaultPercentage", dto.getClaimantFaultPercentage() != null ? dto.getClaimantFaultPercentage() : 0.0);

            workflowService.completeTask(activeTask.getTaskId(), taskVars);
            log.info("Completed Camunda task 'claimsOfficerReviewTask' with decision: {}", dto.getDecision());
        } else {
            log.warn("Camunda claimsOfficerReviewTask not active for claim {}", claim.getId());
        }

        auditService.log("InsuranceClaim", claim.getClaimNumber(), "OFFICER_REVIEW_DECISION",
                officerUser.getUsername(), "Officer decision: " + dto.getDecision() + ". Remarks: " + dto.getRemarks());

        return claimService.getClaimById(claim.getId());
    }

    @Transactional
    public Investigation submitInvestigationReport(InvestigationDTO dto, User investigatorUser) {
        log.info("Submitting investigation report for claim ID: {}", dto.getClaimId());

        InsuranceClaim claim = claimRepository.findById(dto.getClaimId())
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + dto.getClaimId()));

        Investigation investigation = investigationRepository.findByClaimId(dto.getClaimId())
                .orElseGet(() -> Investigation.builder().claim(claim).build());

        investigation.setInvestigator(investigatorUser);
        investigation.setStatus("COMPLETED");
        investigation.setFindings(dto.getFindings());
        investigation.setFraudRiskFlag(dto.getFraudRiskFlag());
        investigation.setSiteVisitDone(dto.getSiteVisitDone());
        investigation.setThirdPartyVerified(dto.getThirdPartyVerified());
        investigation.setWorkshopVerified(dto.getWorkshopVerified());
        investigation.setReportSummary(dto.getReportSummary());
        investigation.setCompletedDate(LocalDateTime.now());
        Investigation saved = investigationRepository.save(investigation);

        // Complete specialInvestigationTask if active
        WorkflowTaskDTO activeTask = workflowService.getTaskForClaim(claim.getId());
        if (activeTask != null && "specialInvestigationTask".equals(activeTask.getTaskDefinitionKey())) {
            Map<String, Object> vars = new HashMap<>();
            vars.put("investigationComplete", true);
            vars.put("fraudRiskFlag", dto.getFraudRiskFlag());
            workflowService.completeTask(activeTask.getTaskId(), vars);
        }

        auditService.log("Investigation", saved.getId().toString(), "INVESTIGATION_COMPLETED",
                investigatorUser.getUsername(), "Investigation findings submitted. Fraud flag: " + dto.getFraudRiskFlag());

        return saved;
    }
}
