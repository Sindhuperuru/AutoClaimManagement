package com.insurance.claim.service;

import com.insurance.claim.entity.ClaimDocument;
import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.exception.BadRequestException;
import com.insurance.claim.exception.ResourceNotFoundException;
import com.insurance.claim.repository.ClaimDocumentRepository;
import com.insurance.claim.repository.InsuranceClaimRepository;
import com.insurance.claim.workflow.CamundaWorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    @Value("${app.upload.dir:./uploads/claims/}")
    private String uploadBaseDir;

    private final ClaimDocumentRepository documentRepository;
    private final InsuranceClaimRepository claimRepository;
    private final CamundaWorkflowService workflowService;
    private final AuditService auditService;

    @Transactional
    public ClaimDocument uploadDocument(Long claimId, String documentType, MultipartFile file) {
        log.info("Uploading document type: {} for claim ID: {}", documentType, claimId);

        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        String fileExtension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            fileExtension = originalFilename.substring(dotIdx);
        }

        String storedFileName = documentType.toLowerCase() + "_" + System.currentTimeMillis() + fileExtension;
        Path claimDir = Paths.get(uploadBaseDir, String.valueOf(claimId)).toAbsolutePath().normalize();

        try {
            if (!Files.exists(claimDir)) {
                Files.createDirectories(claimDir);
            }

            Path targetPath = claimDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Upsert document record if same type exists
            ClaimDocument document = documentRepository.findByClaimIdAndDocumentType(claimId, documentType)
                    .orElseGet(() -> ClaimDocument.builder()
                            .claim(claim)
                            .documentType(documentType)
                            .build());

            document.setFileName(originalFilename);
            document.setFilePath("/uploads/claims/" + claimId + "/" + storedFileName);
            document.setFileType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setVerificationStatus("PENDING");
            document.setVerificationRemarks(null);
            document.setUploadDate(LocalDateTime.now());

            ClaimDocument saved = documentRepository.save(document);

            // Check if claim was waiting for missing documents in Camunda, trigger message correlation!
            if ("DOCUMENTS_PENDING".equalsIgnoreCase(claim.getStatus()) && claim.getProcessInstanceId() != null) {
                try {
                    workflowService.correlateReceiveDocumentsMessage(claim.getProcessInstanceId(), claim.getId());
                    claim.setStatus("UNDER_AGENT_REVIEW");
                    claimRepository.save(claim);
                } catch (Exception ex) {
                    log.warn("Document correlation not triggered (could already be at user task): {}", ex.getMessage());
                }
            }

            auditService.log("ClaimDocument", saved.getId().toString(), "DOCUMENT_UPLOADED",
                    "CUSTOMER", "Uploaded " + documentType + " (" + originalFilename + ")");

            return saved;
        } catch (IOException ex) {
            log.error("Failed to store file for claim {}: {}", claimId, ex.getMessage(), ex);
            throw new BadRequestException("Could not store uploaded file: " + ex.getMessage());
        }
    }

    public List<ClaimDocument> getDocumentsForClaim(Long claimId) {
        return documentRepository.findByClaimId(claimId);
    }

    public Resource loadFileAsResource(Long documentId) {
        ClaimDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + documentId));

        try {
            Path filePath = Paths.get("." + doc.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found or unreadable on disk: " + doc.getFileName());
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File path invalid: " + ex.getMessage());
        }
    }

    @Transactional
    public ClaimDocument verifySingleDocument(Long documentId, String status, String remarks) {
        ClaimDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));

        doc.setVerificationStatus(status);
        doc.setVerificationRemarks(remarks);
        return documentRepository.save(doc);
    }
}
