package com.insurance.claim.workflow;

import com.insurance.claim.dto.WorkflowTaskDTO;
import com.insurance.claim.entity.InsuranceClaim;
import com.insurance.claim.exception.ResourceNotFoundException;
import com.insurance.claim.exception.WorkflowExecutionException;
import com.insurance.claim.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.history.HistoricActivityInstance;
import org.camunda.bpm.engine.history.HistoricProcessInstance;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.engine.task.TaskQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CamundaWorkflowService {

    public static final String PROCESS_KEY = "auto_accident_claim_process";
    public static final String MSG_RECEIVE_DOCS = "Message_ReceiveAdditionalDocuments";

    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final HistoryService historyService;
    private final RepositoryService repositoryService;
    private final InsuranceClaimRepository claimRepository;

    /**
     * Start the BPMN process for a newly registered claim
     */
    @Transactional
    public String startClaimProcess(Long claimId, Map<String, Object> initialVariables) {
        try {
            log.info("Starting BPMN process '{}' for claim ID: {}", PROCESS_KEY, claimId);
            Map<String, Object> vars = new HashMap<>(initialVariables);
            vars.put("claimId", claimId);
            vars.put("docTimeoutDuration", "P7D"); // 7 days in production; configurable

            ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
                    PROCESS_KEY,
                    "CLAIM-" + claimId,
                    vars
            );

            log.info("Process instance started successfully. ProcessInstanceId: {}", processInstance.getId());
            return processInstance.getId();
        } catch (Exception ex) {
            log.error("Failed to start Camunda process for claim {}: {}", claimId, ex.getMessage(), ex);
            throw new WorkflowExecutionException("Could not initiate Camunda workflow: " + ex.getMessage(), ex);
        }
    }

    /**
     * Get active tasks filtered by candidate group or assignee
     */
    public List<WorkflowTaskDTO> getActiveTasks(String candidateGroup, String assignee) {
        TaskQuery query = taskService.createTaskQuery().active().initializeFormKeys();

        if (candidateGroup != null && !candidateGroup.isEmpty()) {
            query.taskCandidateGroup(candidateGroup);
        }
        if (assignee != null && !assignee.isEmpty()) {
            query.taskAssignee(assignee);
        }

        List<Task> tasks = query.orderByTaskCreateTime().desc().list();

        return tasks.stream().map(task -> {
            Map<String, Object> vars = taskService.getVariables(task.getId());
            Long claimId = null;
            if (vars.containsKey("claimId")) {
                Object cId = vars.get("claimId");
                if (cId instanceof Number) {
                    claimId = ((Number) cId).longValue();
                }
            }

            String claimNumber = (String) vars.get("claimNumber");
            Double damage = null;
            if (vars.containsKey("estimatedDamage") && vars.get("estimatedDamage") instanceof Number) {
                damage = ((Number) vars.get("estimatedDamage")).doubleValue();
            }

            return WorkflowTaskDTO.builder()
                    .taskId(task.getId())
                    .taskName(task.getName())
                    .taskDefinitionKey(task.getTaskDefinitionKey())
                    .processInstanceId(task.getProcessInstanceId())
                    .executionId(task.getExecutionId())
                    .assignee(task.getAssignee())
                    .createTime(task.getCreateTime())
                    .dueDate(task.getDueDate())
                    .claimId(claimId)
                    .claimNumber(claimNumber)
                    .customerName((String) vars.get("customerName"))
                    .policyNumber((String) vars.get("policyNumber"))
                    .riskLevel((String) vars.get("claimRisk"))
                    .estimatedDamage(damage)
                    .variables(vars)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Get current active task for a specific claim
     */
    public WorkflowTaskDTO getTaskForClaim(Long claimId) {
        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));

        if (claim.getProcessInstanceId() == null) {
            return null;
        }

        Task task = taskService.createTaskQuery()
                .processInstanceId(claim.getProcessInstanceId())
                .active()
                .singleResult();

        if (task == null) {
            return null;
        }

        Map<String, Object> vars = taskService.getVariables(task.getId());
        return WorkflowTaskDTO.builder()
                .taskId(task.getId())
                .taskName(task.getName())
                .taskDefinitionKey(task.getTaskDefinitionKey())
                .processInstanceId(task.getProcessInstanceId())
                .executionId(task.getExecutionId())
                .assignee(task.getAssignee())
                .createTime(task.getCreateTime())
                .dueDate(task.getDueDate())
                .claimId(claimId)
                .claimNumber(claim.getClaimNumber())
                .variables(vars)
                .build();
    }

    /**
     * Complete a user task with variables
     */
    @Transactional
    public void completeTask(String taskId, Map<String, Object> variables) {
        try {
            log.info("Completing task '{}' with variables: {}", taskId, variables);
            Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
            if (task == null) {
                throw new ResourceNotFoundException("Active workflow task not found: " + taskId);
            }

            if (variables != null && !variables.isEmpty()) {
                taskService.complete(taskId, variables);
            } else {
                taskService.complete(taskId);
            }
            log.info("Task '{}' completed successfully", taskId);
        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to complete task {}: {}", taskId, ex.getMessage(), ex);
            throw new WorkflowExecutionException("Error completing task: " + ex.getMessage(), ex);
        }
    }

    /**
     * Send message to Camunda when missing documents are submitted
     */
    public void correlateReceiveDocumentsMessage(String processInstanceId, Long claimId) {
        try {
            log.info("Correlating message '{}' for processInstanceId: {}, claimId: {}",
                    MSG_RECEIVE_DOCS, processInstanceId, claimId);

            runtimeService.createMessageCorrelation(MSG_RECEIVE_DOCS)
                    .processInstanceId(processInstanceId)
                    .setVariable("documentsResubmitted", true)
                    .correlate();

            log.info("Message correlated successfully.");
        } catch (Exception ex) {
            log.error("Error correlating message for claim {}: {}", claimId, ex.getMessage(), ex);
            throw new WorkflowExecutionException("Message correlation failed: " + ex.getMessage(), ex);
        }
    }

    /**
     * Retrieve execution audit history of BPMN steps
     */
    public List<Map<String, Object>> getProcessHistory(String processInstanceId) {
        if (processInstanceId == null) {
            return Collections.emptyList();
        }

        List<HistoricActivityInstance> activities = historyService.createHistoricActivityInstanceQuery()
                .processInstanceId(processInstanceId)
                .orderByHistoricActivityInstanceStartTime().asc()
                .list();

        return activities.stream().map(act -> {
            Map<String, Object> map = new HashMap<>();
            map.put("activityId", act.getActivityId());
            map.put("activityName", act.getActivityName());
            map.put("activityType", act.getActivityType());
            map.put("startTime", act.getStartTime());
            map.put("endTime", act.getEndTime());
            map.put("durationInMillis", act.getDurationInMillis());
            map.put("assignee", act.getAssignee());
            map.put("completed", act.getEndTime() != null);
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Check if process instance is currently active or ended
     */
    public Map<String, Object> getProcessInstanceStatus(String processInstanceId) {
        Map<String, Object> status = new HashMap<>();
        if (processInstanceId == null) {
            status.put("exists", false);
            return status;
        }

        ProcessInstance active = runtimeService.createProcessInstanceQuery()
                .processInstanceId(processInstanceId)
                .singleResult();

        if (active != null) {
            status.put("exists", true);
            status.put("ended", false);
            status.put("suspended", active.isSuspended());
            List<Task> activeTasks = taskService.createTaskQuery().processInstanceId(processInstanceId).list();
            status.put("activeTasks", activeTasks.stream().map(Task::getName).collect(Collectors.toList()));
        } else {
            HistoricProcessInstance historic = historyService.createHistoricProcessInstanceQuery()
                    .processInstanceId(processInstanceId)
                    .singleResult();

            if (historic != null) {
                status.put("exists", true);
                status.put("ended", true);
                status.put("startTime", historic.getStartTime());
                status.put("endTime", historic.getEndTime());
                status.put("duration", historic.getDurationInMillis());
            } else {
                status.put("exists", false);
            }
        }
        return status;
    }
}
