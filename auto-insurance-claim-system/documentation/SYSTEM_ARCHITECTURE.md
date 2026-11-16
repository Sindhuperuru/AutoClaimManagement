# System Architecture & Technical Specification

## 1. High-Level Architecture Overview

The **Auto Accident Insurance Claim Management System** is built on a multi-tier enterprise architecture combining **React.js** for modern responsive user interfaces, **Spring Boot 3** for core RESTful services and business entities, **Camunda Platform 7** for orchestrating complex BPMN 2.0 workflows and DMN 1.3 decision tables, and **SQLite** (`insurance.db`) for lightweight, serverless relational persistence.

```mermaid
graph TD
    subgraph Client Tier [React Frontend Client - Port 3000]
        UI1[Policyholder Portal]
        UI2[Insurance Agent Portal]
        UI3[Claims Officer Portal]
        UI4[Admin & Workflow Portal]
        AXIOS[Axios HTTP Client + JWT Auth]
    end

    subgraph Service Tier [Spring Boot 3 Application - Port 8080]
        SEC[Spring Security & JWT Filter]
        CTRL[REST Controllers]
        SERV[Business Service Layer]
        JPA[Spring Data JPA & Hibernate]
    end

    subgraph Workflow Tier [Camunda Platform 7 Process Engine]
        BPMN[BPMN 2.0 Process Engine]
        DMN[DMN 1.3 Decision Table Engine]
        DELEGATES[Java Delegates & Task Listeners]
        COCKPIT[Camunda Cockpit & Webapp]
    end

    subgraph Persistence Tier [Relational Databases]
        SQLITE[(SQLite: insurance.db\nBusiness Tables)]
        H2[(In-Memory H2\nCamunda BPM Tables)]
    end

    UI1 & UI2 & UI3 & UI4 --> AXIOS
    AXIOS -->|REST API Calls| SEC
    SEC --> CTRL
    CTRL --> SERV
    SERV --> JPA
    SERV <-->|RuntimeService / TaskService| BPMN
    DELEGATES <--> SERV
    BPMN --> DMN
    JPA --> SQLITE
    BPMN --> H2
    COCKPIT --> H2
```

---

## 2. Sequence Diagram: End-to-End Claim Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as React Frontend
    participant Backend as Spring Boot API
    participant Camunda as Camunda 7 Engine
    participant Agent as Insurance Agent
    participant Officer as Claims Officer
    participant DB as SQLite (insurance.db)

    Customer->>Frontend: Fill accident details & upload documents
    Frontend->>Backend: POST /api/claims (with files)
    Backend->>DB: INSERT INTO insurance_claims, claim_documents
    Backend->>Camunda: startProcessInstanceByKey("auto_accident_claim_process")
    Camunda->>Backend: RegisterClaimDelegate -> Generate Unique Claim ID
    Camunda->>Backend: ValidatePolicyDelegate (Checks active policy dates)
    Camunda-->>Agent: Create Task: agentDocVerificationTask
    
    Agent->>Frontend: Inspect uploaded DL, RC, photos & estimates
    Frontend->>Backend: POST /api/agent/verify-documents (documentsComplete=true)
    Backend->>Camunda: complete(agentDocVerificationTask)
    
    Camunda->>Camunda: Evaluate DMN Table: claimRiskAssessmentDecision
    Note over Camunda: Risk Classification: LOW, MEDIUM, or HIGH
    
    par Parallel Verification
        Camunda->>Backend: Police FIR Verification Task
    and
        Camunda->>Backend: Workshop Estimate Verification Task
    end
    
    Camunda-->>Officer: Create Task: claimsOfficerReviewTask
    Officer->>Frontend: Review evidence & click Approve
    Frontend->>Backend: POST /api/officer/review (decision=APPROVED)
    Backend->>Camunda: complete(claimsOfficerReviewTask)
    
    Camunda->>Camunda: Evaluate DMN: settlementCalculationDecision
    Camunda->>Backend: PaymentSimulationDelegate (Simulates ACH transfer)
    Backend->>DB: INSERT INTO settlements (TXN-SIM-XXXXXX)
    Camunda->>Backend: NotifyCustomerDelegate (Approval Notification)
    Camunda->>Camunda: End Event: Claim Approved & Settled
    Customer->>Frontend: View settled status & download receipt
```

---

## 3. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| CUSTOMERS : "1:1 user profile"
    CUSTOMERS ||--o{ VEHICLES : "owns"
    CUSTOMERS ||--o{ INSURANCE_POLICIES : "holds"
    VEHICLES ||--o{ INSURANCE_POLICIES : "insured under"
    INSURANCE_POLICIES ||--o{ INSURANCE_CLAIMS : "covers"
    CUSTOMERS ||--o{ INSURANCE_CLAIMS : "files"
    ACCIDENTS ||--|| INSURANCE_CLAIMS : "records accident for"
    INSURANCE_CLAIMS ||--o{ CLAIM_DOCUMENTS : "contains"
    INSURANCE_CLAIMS ||--o{ CLAIM_REVIEWS : "has audit trail"
    INSURANCE_CLAIMS ||--o| INVESTIGATIONS : "subject to"
    INSURANCE_CLAIMS ||--o| SETTLEMENTS : "disburses"
    USERS ||--o{ NOTIFICATIONS : "receives"

    USERS {
        int id PK
        string username UK
        string password
        string email UK
        string full_name
        string role
        int enabled
    }

    CUSTOMERS {
        int id PK
        int user_id FK
        string address
        string city
        string driving_license_number
    }

    VEHICLES {
        int id PK
        int customer_id FK
        string registration_number UK
        string make
        string model
        int year_of_manufacture
    }

    INSURANCE_POLICIES {
        int id PK
        string policy_number UK
        string policy_type
        double sum_insured
        double premium_amount
        double deductible_amount
        date start_date
        date end_date
        string status
    }

    ACCIDENTS {
        int id PK
        datetime accident_date_time
        string location
        string city
        string accident_type
        string description
        string driver_name
        string fir_number
    }

    INSURANCE_CLAIMS {
        int id PK
        string claim_number UK
        int customer_id FK
        int policy_id FK
        int vehicle_id FK
        int accident_id FK
        string status
        string risk_level
        int risk_score
        double estimated_damage
        double approved_settlement_amount
        string process_instance_id
    }

    CLAIM_DOCUMENTS {
        int id PK
        int claim_id FK
        string document_type
        string file_name
        string file_path
        string verification_status
    }

    SETTLEMENTS {
        int id PK
        int claim_id FK
        string claim_number
        double calculated_amount
        double deductible_deducted
        double depreciation_deducted
        double final_payable_amount
        string payment_status
        string transaction_reference
    }
```

---

## 4. Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        C[Policyholder / Customer]
        A[Insurance Field Agent]
        O[Claims Officer]
        AD[System Administrator]
    end

    subgraph Auto Accident Claim Management Platform
        UC1(Register & Login)
        UC2(Submit Accident Claim)
        UC3(Upload Incident Evidence & Documents)
        UC4(Track Claim in Real Time)
        UC5(Verify Documents & Request Missing Files)
        UC6(Inspect Damage Estimates & DMN Risk Scores)
        UC7(Approve, Reject or Escalate to SIU)
        UC8(Authorize & Disburse Settlement)
        UC9(Monitor Camunda Workflow & Audit Logs)
    end

    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC4

    A --> UC1
    A --> UC5
    A --> UC4

    O --> UC1
    O --> UC6
    O --> UC7
    O --> UC4

    AD --> UC1
    AD --> UC8
    AD --> UC9
```
