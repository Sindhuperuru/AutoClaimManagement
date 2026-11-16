package com.insurance.claim.dto;

import lombok.*;

import java.util.Date;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowTaskDTO {
    private String taskId;
    private String taskName;
    private String taskDefinitionKey;
    private String processInstanceId;
    private String executionId;
    private String assignee;
    private Date createTime;
    private Date dueDate;
    private Long claimId;
    private String claimNumber;
    private String customerName;
    private String policyNumber;
    private String riskLevel;
    private Double estimatedDamage;
    private Map<String, Object> variables;
}
