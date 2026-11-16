package com.insurance.claim.controller;

import com.insurance.claim.dto.ApiResponse;
import com.insurance.claim.dto.WorkflowTaskDTO;
import com.insurance.claim.workflow.CamundaWorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflow")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final CamundaWorkflowService workflowService;

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<WorkflowTaskDTO>>> getTasks(
            @RequestParam(required = false) String candidateGroup,
            @RequestParam(required = false) String assignee) {

        List<WorkflowTaskDTO> tasks = workflowService.getActiveTasks(candidateGroup, assignee);
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @GetMapping("/claim/{claimId}/task")
    public ResponseEntity<ApiResponse<WorkflowTaskDTO>> getTaskForClaim(@PathVariable Long claimId) {
        WorkflowTaskDTO task = workflowService.getTaskForClaim(claimId);
        return ResponseEntity.ok(ApiResponse.ok(task));
    }

    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<ApiResponse<Void>> completeTask(
            @PathVariable String taskId,
            @RequestBody(required = false) Map<String, Object> variables) {

        workflowService.completeTask(taskId, variables);
        return ResponseEntity.ok(ApiResponse.ok("Task completed successfully", null));
    }

    @GetMapping("/history/{processInstanceId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProcessHistory(@PathVariable String processInstanceId) {
        List<Map<String, Object>> history = workflowService.getProcessHistory(processInstanceId);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/status/{processInstanceId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProcessStatus(@PathVariable String processInstanceId) {
        Map<String, Object> status = workflowService.getProcessInstanceStatus(processInstanceId);
        return ResponseEntity.ok(ApiResponse.ok(status));
    }

    @PostMapping("/correlate-documents")
    public ResponseEntity<ApiResponse<Void>> correlateDocuments(
            @RequestParam String processInstanceId,
            @RequestParam Long claimId) {

        workflowService.correlateReceiveDocumentsMessage(processInstanceId, claimId);
        return ResponseEntity.ok(ApiResponse.ok("Additional documents message correlated to Camunda engine", null));
    }
}
