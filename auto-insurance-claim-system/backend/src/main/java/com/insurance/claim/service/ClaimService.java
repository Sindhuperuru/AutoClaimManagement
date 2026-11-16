package com.insurance.claim.service;

import com.insurance.claim.dto.ClaimResponseDTO;
import com.insurance.claim.dto.ClaimSubmissionRequest;
import com.insurance.claim.dto.SettlementDTO;
import com.insurance.claim.dto.WorkflowTaskDTO;
import com.insurance.claim.entity.*;
import com.insurance.claim.exception.BadRequestException;
import com.insurance.claim.exception.ResourceNotFoundException;
import com.insurance.claim.repository.*;
import com.insurance.claim.workflow.CamundaWorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClaimService {

    private final InsuranceClaimRepository claimRepository;
    private final InsurancePolicyRepository policyRepository;
    private final CustomerRepository customerRepository;
    private final AccidentRepository accidentRepository;
    private final SettlementRepository settlementRepository;
    private final ClaimDocumentRepository documentRepository;
    private final ClaimReviewRepository reviewRepository;
    private final CamundaWorkflowService workflowService;
    private final AuditService auditService;

    @Transactional
    public ClaimResponseDTO submitClaim(ClaimSubmissionRequest request, User currentUser) {
        log.info("Submitting new claim for policy: {} by user: {}", request.getPolicyNumber(), currentUser.getUsername());

        InsurancePolicy policy = policyRepository.findByPolicyNumber(request.getPolicyNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with number: " + request.getPolicyNumber()));

        Customer customer;
        if (currentUser.getRole() == Role.ROLE_CUSTOMER) {
            customer = customerRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BadRequestException("Customer profile missing for user"));
            if (!policy.getCustomer().getId().equals(customer.getId())) {
                throw new BadRequestException("The specified policy does not belong to the current customer.");
            }
        } else {
            customer = policy.getCustomer();
        }

        // 1. Create Accident Entity
        Accident accident = Accident.builder()
                .accidentDateTime(request.getAccidentDateTime())
                .location(request.getLocation())
                .city(request.getCity())
                .state(request.getState())
                .accidentType(request.getAccidentType())
                .description(request.getDescription())
                .weatherConditions(request.getWeatherConditions())
                .driverName(request.getDriverName())
                .driverLicenseNumber(request.getDriverLicenseNumber())
                .thirdPartyInvolved(Boolean.TRUE.equals(request.getThirdPartyInvolved()))
                .thirdPartyDetails(request.getThirdPartyDetails())
                .policeStation(request.getPoliceStation())
                .firNumber(request.getFirNumber())
                .build();
        accident = accidentRepository.save(accident);

        // 2. Create Initial Claim record
        InsuranceClaim claim = InsuranceClaim.builder()
                .claimNumber("CLM-PENDING")
                .customer(customer)
                .policy(policy)
                .vehicle(policy.getVehicle())
                .accident(accident)
                .status("SUBMITTED")
                .riskLevel("LOW")
                .riskScore(15)
                .estimatedDamage(request.getEstimatedDamage())
                .submissionDate(LocalDateTime.now())
                .slaDueDate(LocalDateTime.now().plusHours(24))
                .build();

        claim = claimRepository.save(claim);

        // Assign formal unique claim number
        String claimNumber = String.format("CLM-%d-%05d", Year.now().getValue(), claim.getId());
        claim.setClaimNumber(claimNumber);
        claim = claimRepository.save(claim);

        // 3. Initiate Camunda BPMN Process!
        Map<String, Object> initialVariables = new HashMap<>();
        initialVariables.put("claimNumber", claimNumber);
        initialVariables.put("estimatedDamage", request.getEstimatedDamage().doubleValue());
        initialVariables.put("policyNumber", policy.getPolicyNumber());
        initialVariables.put("customerName", customer.getUser().getFullName());
        initialVariables.put("accidentDelayDays", 0);
        initialVariables.put("policeFirAvailable", request.getFirNumber() != null && !request.getFirNumber().isEmpty());

        try {
            String processInstanceId = workflowService.startClaimProcess(claim.getId(), initialVariables);
            claim.setProcessInstanceId(processInstanceId);
            claim = claimRepository.save(claim);
        } catch (Exception ex) {
            log.error("Failed to kick off Camunda process, setting status to SUBMITTED fallback: {}", ex.getMessage());
        }

        auditService.log("InsuranceClaim", claim.getClaimNumber(), "CLAIM_SUBMITTED",
                currentUser.getUsername(), "Accident claim submitted for amount: $" + request.getEstimatedDamage());

        return mapToDTO(claim);
    }

    public ClaimResponseDTO getClaimById(Long id) {
        InsuranceClaim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + id));
        return mapToDTO(claim);
    }

    public ClaimResponseDTO getClaimByNumber(String claimNumber) {
        InsuranceClaim claim = claimRepository.findByClaimNumber(claimNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with number: " + claimNumber));
        return mapToDTO(claim);
    }

    public List<ClaimResponseDTO> getClaimsForCustomer(Long customerId) {
        return claimRepository.findByCustomerId(customerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ClaimResponseDTO> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ClaimResponseDTO mapToDTO(InsuranceClaim claim) {
        List<ClaimResponseDTO.ClaimDocumentDTO> docDTOs = documentRepository.findByClaimId(claim.getId()).stream()
                .map(doc -> ClaimResponseDTO.ClaimDocumentDTO.builder()
                        .id(doc.getId())
                        .documentType(doc.getDocumentType())
                        .fileName(doc.getFileName())
                        .filePath(doc.getFilePath())
                        .fileType(doc.getFileType())
                        .fileSize(doc.getFileSize())
                        .uploadDate(doc.getUploadDate())
                        .verificationStatus(doc.getVerificationStatus())
                        .verificationRemarks(doc.getVerificationRemarks())
                        .build())
                .collect(Collectors.toList());

        List<ClaimResponseDTO.ClaimReviewDTO> reviewDTOs = reviewRepository.findByClaimIdOrderByReviewDateDesc(claim.getId()).stream()
                .map(rev -> ClaimResponseDTO.ClaimReviewDTO.builder()
                        .id(rev.getId())
                        .reviewerName(rev.getReviewer().getFullName())
                        .role(rev.getRole())
                        .decision(rev.getDecision())
                        .remarks(rev.getRemarks())
                        .reviewDate(rev.getReviewDate())
                        .build())
                .collect(Collectors.toList());

        SettlementDTO settlementDTO = settlementRepository.findByClaimId(claim.getId())
                .map(s -> SettlementDTO.builder()
                        .id(s.getId())
                        .claimId(claim.getId())
                        .claimNumber(s.getClaimNumber())
                        .calculatedAmount(s.getCalculatedAmount())
                        .deductibleDeducted(s.getDeductibleDeducted())
                        .depreciationDeducted(s.getDepreciationDeducted())
                        .finalPayableAmount(s.getFinalPayableAmount())
                        .paymentMethod(s.getPaymentMethod())
                        .paymentStatus(s.getPaymentStatus())
                        .transactionReference(s.getTransactionReference())
                        .bankName(s.getBankName())
                        .accountNumberMasked(s.getAccountNumberMasked())
                        .paymentDate(s.getPaymentDate())
                        .build())
                .orElse(null);

        // Fetch active task from Camunda
        WorkflowTaskDTO activeTask = null;
        try {
            activeTask = workflowService.getTaskForClaim(claim.getId());
        } catch (Exception ignored) {}

        return ClaimResponseDTO.builder()
                .id(claim.getId())
                .claimNumber(claim.getClaimNumber())
                .customerId(claim.getCustomer().getId())
                .customerName(claim.getCustomer().getUser().getFullName())
                .customerEmail(claim.getCustomer().getUser().getEmail())
                .customerPhone(claim.getCustomer().getUser().getPhoneNumber())
                .policyNumber(claim.getPolicy().getPolicyNumber())
                .policyType(claim.getPolicy().getPolicyType())
                .sumInsured(claim.getPolicy().getSumInsured())
                .deductibleAmount(claim.getPolicy().getDeductibleAmount())
                .vehicleRegistration(claim.getVehicle().getRegistrationNumber())
                .vehicleMakeModel(claim.getVehicle().getMake() + " " + claim.getVehicle().getModel())
                .vehicleYear(claim.getVehicle().getYearOfManufacture())
                .accidentDateTime(claim.getAccident().getAccidentDateTime())
                .accidentLocation(claim.getAccident().getLocation())
                .accidentCity(claim.getAccident().getCity())
                .accidentState(claim.getAccident().getState())
                .accidentType(claim.getAccident().getAccidentType())
                .accidentDescription(claim.getAccident().getDescription())
                .driverName(claim.getAccident().getDriverName())
                .driverLicenseNumber(claim.getAccident().getDriverLicenseNumber())
                .thirdPartyInvolved(claim.getAccident().getThirdPartyInvolved())
                .thirdPartyDetails(claim.getAccident().getThirdPartyDetails())
                .policeStation(claim.getAccident().getPoliceStation())
                .firNumber(claim.getAccident().getFirNumber())
                .status(claim.getStatus())
                .riskLevel(claim.getRiskLevel())
                .riskScore(claim.getRiskScore())
                .estimatedDamage(claim.getEstimatedDamage())
                .approvedSettlementAmount(claim.getApprovedSettlementAmount())
                .processInstanceId(claim.getProcessInstanceId())
                .submissionDate(claim.getSubmissionDate())
                .rejectionReason(claim.getRejectionReason())
                .remarks(claim.getRemarks())
                .slaDueDate(claim.getSlaDueDate())
                .currentTaskId(activeTask != null ? activeTask.getTaskId() : null)
                .currentTaskName(activeTask != null ? activeTask.getTaskName() : null)
                .currentTaskAssignee(activeTask != null ? activeTask.getAssignee() : null)
                .documents(docDTOs)
                .reviews(reviewDTOs)
                .settlement(settlementDTO)
                .build();
    }
}
