package com.insurance.claim.controller;

import com.insurance.claim.dto.ApiResponse;
import com.insurance.claim.entity.ClaimDocument;
import com.insurance.claim.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ClaimDocument>> uploadDocument(
            @RequestParam("claimId") Long claimId,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) {

        ClaimDocument document = documentService.uploadDocument(claimId, documentType, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Document uploaded successfully", document));
    }

    @GetMapping("/claim/{claimId}")
    public ResponseEntity<ApiResponse<List<ClaimDocument>>> getClaimDocuments(@PathVariable Long claimId) {
        List<ClaimDocument> docs = documentService.getDocumentsForClaim(claimId);
        return ResponseEntity.ok(ApiResponse.ok(docs));
    }

    @GetMapping("/download/{documentId}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        Resource resource = documentService.loadFileAsResource(documentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @PatchMapping("/{documentId}/verify")
    public ResponseEntity<ApiResponse<ClaimDocument>> verifyDocument(
            @PathVariable Long documentId,
            @RequestBody Map<String, String> body) {

        String status = body.getOrDefault("status", "VERIFIED");
        String remarks = body.getOrDefault("remarks", "");
        ClaimDocument updated = documentService.verifySingleDocument(documentId, status, remarks);
        return ResponseEntity.ok(ApiResponse.ok("Document verified", updated));
    }
}
