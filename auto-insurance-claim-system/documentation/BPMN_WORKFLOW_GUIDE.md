# Camunda BPMN 2.0 Workflow Guide

**Process Definition ID:** `auto_accident_claim_process`  
**Process Name:** Auto Accident Insurance Claim Process  
**Specification Standard:** OMG BPMN 2.0  
**Target Engine:** Camunda Platform 7.21  

---

## 1. Complete Workflow Topology

The BPMN process contains 31 distinct elements handling standard processing, conditional branching, time-based boundary escalations, parallel verification, DMN decision evaluation, and payment failure handling.

```
[Start: Claim Submitted]
        │
[Service: Register Claim]
        │
[Service: Generate Unique Claim ID]
        │
[Service: Validate Policy Details]
        │
 <Gateway: Policy Valid?>
   ├── (No: Invalid) ───────────────────────────────────────────┐
   └── (Yes: Valid)                                             │
        │                                                       │
[Service: Verify Customer Details]                              │
        │                                                       │
┌─► [User: Agent Document Verification]                         │
│       │                                                       │
│ <Gateway: Documents Complete?>                                │
│   ├── (No: Incomplete)                                        │
│   │   [Service: Request Additional Docs]                      │
│   │           │                                               │
│   │   ┌── Subprocess: Wait for Documents ─────────┐           │
│   │   │  [Catch Event: Receive Docs Message] ────┼── (Back) ─┘
│   │   └───────────────────────────────────────────┘
│   │       │ [Boundary Timer: 7-Day Timeout]
│   │       ▼
│   │   [Service: Process Document Timeout] ────────────────────┤
│   └── (Yes: Complete)                                         │
│       │                                                       │
│ [Service: Validate Accident Information]                      │
│       │                                                       │
│ [Service: Calculate Initial Damage Estimate]                  │
│       │                                                       │
│ [Business Rule: Evaluate Claim Risk (DMN)]                    │
│       │                                                       │
│ <Gateway: Risk Classification>                                │
│   ├── Low Risk ────► [Standard Claim Processing]              │
│   ├── Medium Risk ─► [Additional Verification]                │
│   └── High Risk ───► [Fraud Investigation Prep]               │
│                            │                                  │
│             <Parallel Gateway: Fork>                          │
│               ├── [Police FIR Verification]                   │
│               └── [Workshop Estimate Verification]            │
│             <Parallel Gateway: Join>                          │
│                            │                                  │
│             [User: Claims Officer Review] ◄───┐               │
│                            │                  │               │
│             <Gateway: Final Decision?>        │               │
│               ├── (Investigate) ──────────────┘               │
│               │     [User: Special Investigation]             │
│               ├── (Rejected) ─────────────────────────────────┤
│               └── (Approved)                                  │
│                     │                                         │
│             [Business Rule: Calculate Settlement (DMN)]       │
│                     │                                         │
│             [Service: Generate Settlement Details]            │
│                     │                                         │
│             [User: Final Settlement Authorization]            │
│                     │                                         │
│             [Service: Process Payment Simulation]             │
│                     │    │ [Boundary Error: Payment Failed]   │
│                     │    ▼                                    │
│                     │  [User: Manual Payment Resolution]      │
│                     │    │                                    │
│             [Service: Generate Settlement Report]             │
│                     │                                         │
│             [Service: Notify Customer (Approval)]             │
│                     │                                         │
│             [End Event: Claim Approved & Settled]             │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                                │
              [Service: Generate Rejection Reason]
                                │
              [Service: Notify Customer (Rejection)]
                                │
              [End Event: Claim Rejected]
```

---

## 2. Element Inventory & Implementation Details

| Element ID | Type | Name | Java Delegate / Implementation |
| :--- | :--- | :--- | :--- |
| `claimSubmittedStartEvent` | Start Event | Claim Submitted | Instantiated via `runtimeService.startProcessInstanceByKey()` |
| `registerClaimTask` | Service Task | Register Claim | `RegisterClaimDelegate` |
| `generateClaimIdTask` | Service Task | Generate Unique Claim ID | `GenerateClaimIdDelegate` (assigns `CLM-YYYY-XXXXX`) |
| `validatePolicyTask` | Service Task | Validate Policy Details | `ValidatePolicyDelegate` (checks start/end date and status) |
| `gatewayPolicyValid` | Exclusive Gateway | Policy Valid? | `${isPolicyValid == true}` vs `${isPolicyValid == false}` |
| `verifyCustomerTask` | Service Task | Verify Customer Details | `VerifyCustomerDelegate` (transitions status, sets SLA) |
| `agentDocVerificationTask` | User Task | Agent Document Verification | Candidate Group: `AGENTS`, Assignee: `${agentAssignee}` |
| `gatewayDocsComplete` | Exclusive Gateway | Documents Complete? | `${documentsComplete == true}` vs `${documentsComplete == false}` |
| `requestAdditionalDocsTask` | Service Task | Request Additional Docs | `RequestAdditionalDocsDelegate` |
| `docWaitingSubprocess` | Subprocess | Document Wait Subprocess | Holds message catch event with boundary timer |
| `receiveDocsMessageEvent` | Message Catch | Receive Documents | Message: `Message_ReceiveAdditionalDocuments` |
| `docTimeoutBoundaryTimer` | Boundary Timer | 7-Day Timeout | Timer duration expression: `${docTimeoutDuration}` |
| `docTimeoutTask` | Service Task | Process Document Timeout | `DocumentTimeoutDelegate` (terminates on SLA lapse) |
| `validateAccidentInfoTask` | Service Task | Validate Accident Information | `ValidateAccidentInfoDelegate` |
| `calculateInitialDamageTask` | Service Task | Calculate Damage Estimate | `CalculateInitialDamageDelegate` (computes ratios & prior claims) |
| `evaluateClaimDmnTask` | Business Rule | Evaluate Claim Risk (DMN) | Decision Ref: `claimRiskAssessmentDecision` |
| `gatewayRiskClass` | Exclusive Gateway | Risk Classification | `${claimRisk == 'LOW'}`, `'MEDIUM'`, `'HIGH'` |
| `parallelGatewayFork` | Parallel Gateway | Parallel Verification Fork | Forks into concurrent Police & Workshop validation |
| `policeFirVerificationTask` | Service Task | Police FIR Verification | `PoliceFirVerificationDelegate` |
| `workshopEstimateVerificationTask` | Service Task | Workshop Estimate Verification | `WorkshopEstimateVerificationDelegate` |
| `parallelGatewayJoin` | Parallel Gateway | Parallel Verification Join | Synchronizes parallel branches before officer review |
| `claimsOfficerReviewTask` | User Task | Claims Officer Review | Candidate Group: `CLAIMS_OFFICERS` |
| `gatewayFinalDecision` | Exclusive Gateway | Final Decision? | `${officerDecision == 'APPROVED'}`, `'REJECTED'`, `'INVESTIGATE'` |
| `specialInvestigationTask` | User Task | Special Investigation Review | Candidate Group: `INVESTIGATORS` (SIU) |
| `calculateSettlementDmnTask` | Business Rule | Calculate Settlement (DMN) | Decision Ref: `settlementCalculationDecision` |
| `generateSettlementDetailsTask` | Service Task | Generate Settlement Details | `GenerateSettlementDetailsDelegate` |
| `finalAuthorizationTask` | User Task | Final Settlement Auth | Candidate Group: `ADMINS` |
| `processPaymentSimulationTask` | Service Task | Process Payment Simulation | `PaymentSimulationDelegate` |
| `paymentFailureBoundaryEvent` | Boundary Error | Payment Failed | Error Ref: `Error_PaymentFailed` (`ERR_PAYMENT_FAILED`) |
| `manualPaymentResolutionTask` | User Task | Manual Payment Resolution | Candidate Group: `ADMINS` |
| `generateSettlementReportTask` | Service Task | Generate Settlement Report | `GenerateSettlementReportDelegate` |
| `notifyCustomerApprovalTask` | Service Task | Notify Customer (Approval) | `NotifyCustomerDelegate` |
| `claimCompletedEndEvent` | End Event | Claim Approved & Settled | Workflow reaches successful terminal state |
| `generateRejectionReasonTask` | Service Task | Generate Rejection Reason | `GenerateRejectionReasonDelegate` |
| `notifyCustomerRejectionTask` | Service Task | Notify Customer (Rejection) | `NotifyCustomerDelegate` |
| `claimRejectedEndEvent` | End Event | Claim Rejected | Workflow reaches rejected terminal state |
