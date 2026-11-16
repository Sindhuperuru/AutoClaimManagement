package com.insurance.claim.service;

import com.insurance.claim.dto.ClaimResponseDTO;
import com.insurance.claim.dto.DocumentVerificationDTO;
import com.insurance.claim.dto.WorkflowTaskDTO;
import com.insurance.claim.entity.ClaimDocument;
import com.insurance.claim.entity.ClaimReview;
import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.entity.User;
import com.insurance.claim.exception.ResourceNotFoundException;
import com.insurance.claim.repository.ClaimDocumentRepository;
import com.insurance.claim.repository.ClaimReviewRepository;
import com.insurance.claim.repository.InsuranceClaimRepository;
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
public class AgentService {

    private final InsuranceClaimRepository claimRepository;
    private final ClaimDocumentRepository documentRepository;
    private final ClaimReviewRepository reviewRepository;
    private final CamundaWorkflowService workflowService;
    private final ClaimService claimService;
    private final AuditService auditService;

    public List<ClaimResponseDTO> getPendingVerificationClaims() {
        return claimRepository.findAll().stream()
                .filter(c -> "UNDER_AGENT_REVIEW".equalsIgnoreCase(c.getStatus()) || "SUBMITTED".equalsIgnoreCase(c.getStatus()))
                .map(claimService::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClaimResponseDTO processDocumentVerification(DocumentVerificationDTO dto, User agentUser) {
        log.info("Agent {} verifying documents for claim ID: {}", agentUser.getUsername(), dto.getClaimId());

        InsuranceClaim claim = claimRepository.findById(dto.getClaimId())
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + dto.getClaimId()));

        // Update document statuses
        if (dto.getDocumentDecisions() != null) {
            dto.getDocumentDecisions().forEach((docId, status) -> {
                documentRepository.findById(docId).ifPresent(doc -> {
                    doc.setVerificationStatus(status);
                    doc.setVerificationRemarks("Verified by Agent " + agentUser.getFullName());
                    documentRepository.save(doc);
                });
            });
        }

        // Create review record
        String decision = dto.isAllVerified() ? "VERIFIED" : "REQUEST_ADDITIONAL_INFO";
        reviewRepository.save(ClaimReview.builder()
                .claim(claim)
                .reviewer(agentUser)
                .role(agentUser.getRole().name())
                .decision(decision)
                .remarks(dto.getAgentRemarks())
                .reviewDate(LocalDateTime.now())
                .build());

        // Update claim entity status immediately
        if (dto.isAllVerified()) {
            claim.setStatus("UNDER_OFFICER_REVIEW");
            claim.setRiskLevel("LOW");
        } else {
            claim.setStatus("DOCUMENTS_PENDING");
            claim.setRemarks("Missing documents requested: " + dto.getMissingDocumentsReason());
        }
        claimRepository.save(claim);

        // Find and complete Camunda User Task
        WorkflowTaskDTO activeTask = workflowService.getTaskForClaim(claim.getId());
        if (activeTask != null && "agentDocVerificationTask".equals(activeTask.getTaskDefinitionKey())) {
            Map<String, Object> taskVars = new HashMap<>();
            taskVars.put("documentsComplete", dto.isAllVerified());
            if (!dto.isAllVerified()) {
                taskVars.put("missingDocumentsReason", dto.getMissingDocumentsReason());
            }

            workflowService.completeTask(activeTask.getTaskId(), taskVars);
            log.info("Completed Camunda task 'agentDocVerificationTask' with documentsComplete={}", dto.isAllVerified());
        } else {
            log.warn("Camunda agentDocVerificationTask was not in active state for claim {}", claim.getId());
        }

        auditService.log("InsuranceClaim", claim.getClaimNumber(), "AGENT_VERIFICATION_COMPLETED",
                agentUser.getUsername(), "Verification result: " + decision + ". Remarks: " + dto.getAgentRemarks());

        return claimService.getClaimById(claim.getId());
    }
}
