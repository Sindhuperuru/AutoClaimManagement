# AUTO ACCIDENT INSURANCE CLAIM MANAGEMENT SYSTEM
### Advanced Fourth-Year Engineering Capstone Project
**Camunda Platform 7 • Spring Boot 3 • SQLite • React.js • Vite**

---

## 1. Executive Summary

The **Auto Accident Insurance Claim Management System (AutoShield Enterprise)** is an advanced, production-grade automated claims processing platform designed to orchestrate the entire lifecycle of automobile accident claims. 

The architecture bridges an enterprise **Camunda 7 BPMN 2.0 process engine** with a **Spring Boot 3** REST API backend, **SQLite (`insurance.db`)** for zero-friction local relational storage, and a responsive **React.js (Vite)** dashboard.

### Core Capabilities:
- **Full Role-Based Workspaces**: Dedicated portals for Policyholders, Field Agents, Claims Officers, and Administrators.
- **Advanced BPMN 2.0 Engine**: 31 workflow elements including Service Tasks, User Tasks, Exclusive Gateways, Parallel Verification Gateways, 7-Day Boundary Timers with Message Catch Subprocesses, and Boundary Error Events.
- **5 DMN 1.3 Decision Tables**: Automated evaluation for Policy Eligibility, Document Completeness, Claim Risk Scoring, Approval Recommendations, and Net Settlement Calculation.
- **Real-Time Data Persistence in SQLite**: All site operations are saved directly into `insurance.db`, allowing instant inspection via the `sqlite3` CLI.
- **Simulated Financial Settlement**: Automated gross damage deductions (deductibles & depreciation riders) and electronic direct deposit simulation with cryptographic transaction reference numbers.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router 6, Axios, Lucide Icons, Modern Responsive CSS |
| **Backend** | Java 17 / 21, Spring Boot 3.2.5, Spring Security 6, Spring Data JPA, Hibernate 6, JJWT 0.12.5 |
| **Workflow Engine** | Camunda Platform 7.21 (Embedded Spring Boot Starter), Camunda Cockpit, Camunda Tasklist |
| **Database** | SQLite 3 (`insurance.db`), Dual-DataSource support (H2 for Camunda Engine, SQLite for Business Data) |
| **Standards** | BPMN 2.0 XML, DMN 1.3 XML, RESTful JSON APIs, JWT Bearer Tokens |

---

## 3. Project Directory Structure

```
AutoClaimManagement/
└── auto-insurance-claim-system/
    ├── start_system.bat          <-- Master 1-Click Launcher (Starts Backend & Frontend)
    ├── start_backend.bat         <-- Starts Spring Boot & Camunda Backend (Port 8080)
    ├── start_frontend.bat        <-- Starts React Frontend (Port 3000)
    ├── open_sqlite.bat           <-- Double-click to open SQLite CLI on insurance.db
    ├── insurance.db              <-- Local SQLite database with all 13 tables
    ├── mvnw.cmd                  <-- Bundled Maven command wrapper
    ├── backend/
    │   ├── pom.xml               <-- Maven dependencies (Spring Boot, Camunda, SQLite, JWT)
    │   ├── src/main/java/com/insurance/claim/
    │   │   ├── AutoClaimApplication.java
    │   │   ├── entity/           <-- 13 JPA Entities
    │   │   ├── repository/       <-- 13 Spring Data Repositories
    │   │   ├── service/          <-- Business Services
    │   │   ├── controller/       <-- 10 REST Controllers
    │   │   ├── workflow/         <-- Camunda Workflow Service & 18 Java Delegates
    │   │   ├── security/         <-- Spring Security, JWT Token Provider & Filter
    │   │   └── config/           <-- Dual DataSource & DataInitializer seeder
    │   └── src/main/resources/
    │       ├── application.yml   <-- SQLite & Camunda configuration
    │       ├── processes/        <-- auto_accident_claim_process.bpmn (BPMN 2.0)
    │       └── dmn/              <-- 5 DMN Decision Tables
    ├── frontend/
    │   ├── package.json          <-- React, Vite, Axios, Lucide
    │   ├── vite.config.js        <-- Reverse proxy to port 8080
    │   ├── index.html
    │   └── src/
    │       ├── App.jsx           <-- Full routing tree
    │       ├── context/          <-- AuthContext & 1-Click Role Switcher
    │       ├── components/       <-- Navbar, Sidebar, ClaimTimeline, Badges
    │       └── pages/            <-- 18 Complete Frontend Views
    ├── camunda/
    │   ├── bpmn/                 <-- BPMN 2.0 diagrams for Camunda Modeler
    │   └── dmn/                  <-- 5 DMN Decision XMLs
    ├── database/
    │   ├── schema_sqlite.sql     <-- SQLite DDL creation script
    │   └── seed_sqlite.sql       <-- Sample seed data for demo
    └── documentation/
        ├── SYSTEM_ARCHITECTURE.md
        ├── BPMN_WORKFLOW_GUIDE.md
        ├── DMN_DECISIONS_GUIDE.md
        └── SQLITE_GUIDE.md
```

---

## 4. How to Run the Project on Windows

### Method 1: The Master 1-Click Launcher (Recommended)
Simply navigate into `auto-insurance-claim-system/` and run:
```cmd
start_system.bat
```
This automatically launches the Spring Boot backend on port 8080 and the React frontend on port 3000 in separate windows!

---

### Method 2: Running via Two Terminal Windows

#### Terminal 1 — Start Backend (Spring Boot & Camunda):
```powershell
cd C:\Users\sindh\OneDrive\Documents\AutoClaimManagement\auto-insurance-claim-system\backend
.\mvnw.cmd spring-boot:run
```
*The backend will initialize, deploy the Camunda BPMN & DMN models, seed demo records into `insurance.db`, and listen on `http://localhost:8080`.*

#### Terminal 2 — Start Frontend (React & Vite):
```powershell
cd C:\Users\sindh\OneDrive\Documents\AutoClaimManagement\auto-insurance-claim-system\frontend
npm.cmd run dev
```
*The frontend will start instantly on `http://localhost:3000`.*

---

## 5. How to Inspect Live Data in SQLite (`insurance.db`)

You can inspect the database at any time using:

### Double-Click:
Run `auto-insurance-claim-system\open_sqlite.bat`.

### Command Prompt or PowerShell:
```cmd
cd C:\Users\sindh\OneDrive\Documents\AutoClaimManagement\auto-insurance-claim-system
sqlite3 insurance.db
```
*(or `C:\sqlite\sqlite3.exe insurance.db`)*

### Key SQLite Commands:
```sql
-- 1. Turn on headers and column alignment
.headers on
.mode column

-- 2. View all 13 application tables
.tables

-- 3. Query submitted claims
SELECT id, claim_number, status, risk_level, estimated_damage, approved_settlement_amount FROM insurance_claims;

-- 4. Query active insurance policies
SELECT policy_number, policy_type, sum_insured, deductible_amount, status FROM insurance_policies;

-- 5. Query completed financial disbursements
SELECT claim_number, final_payable_amount, payment_status, transaction_reference, payment_date FROM settlements;

-- 6. Query real-time audit log
SELECT timestamp, action, performed_by, details FROM audit_logs ORDER BY timestamp DESC LIMIT 10;
```

---

## 6. Demo User Accounts

All demo accounts share the password: **`password123`**  
*(Note: A 1-Click Quick Role Switcher is also available directly on the Login page and Topbar).*

| Role | Username | Password | Purpose in Review |
| :--- | :--- | :--- | :--- |
| **Policyholder** | `customer1` | `password123` | File new claims, upload 5 documents, track BPMN stages |
| **Field Agent** | `agent1` | `password123` | Inspect document checklist, verify & advance to DMN |
| **Claims Officer** | `officer1` | `password123` | Review DMN risk scores, approve, reject, or send to SIU |
| **Administrator** | `admin1` | `password123` | Authorize settlements, trigger banking payment simulation |

---

## 7. Web URLs Quick Reference

| Service | URL | Credentials |
| :--- | :--- | :--- |
| **Main Web Application** | `http://localhost:3000` | Any demo account above |
| **Camunda Cockpit** | `http://localhost:8080/camunda/app/cockpit/default/` | `admin` / `admin` |
| **Camunda Tasklist** | `http://localhost:8080/camunda/app/tasklist/default/` | `admin` / `admin` |
| **Camunda REST API** | `http://localhost:8080/engine-rest/` | None required |
| **Backend REST Endpoints**| `http://localhost:8080/api/` | Bearer Token / Open |

---

## 8. College Project Review Demonstration Walkthrough

When presenting this project to external examiners or college faculty, follow this structured demo script:

1. **Step 1: Introduction & Architecture**
   - Show the architecture diagram: React frontend communicating with Spring Boot 3, Camunda 7 executing the BPMN 2.0 workflow, and SQLite storing business entities.
2. **Step 2: Customer Submits Accident Claim**
   - Sign in as `customer1`.
   - Go to **Submit Claim** wizard: Select policy `POL-2026-88491` (Toyota Camry SE).
   - Enter accident details (Location: `I-55 South`, Damage: `$4,200`).
   - Attach sample files for the 5 categories (License, RC, Scene Photos, Police FIR, Repair Estimate).
   - Click **Submit Claim**: show that a unique claim number (`CLM-2026-00103`) is generated, and Camunda automatically initializes an active process instance!
3. **Step 3: Field Agent Verifies Documents**
   - Click the topbar demo button to switch to **Agent** (`agent1`).
   - Open **Doc Verification**: inspect the checklist.
   - Click **Verify & Forward to DMN**: show that Camunda completes `agentDocVerificationTask` and evaluates DMN risk rules.
4. **Step 4: Claims Officer Adjudication**
   - Switch to **Claims Officer** (`officer1`).
   - Open **Claims Queue**: notice the claim is rated **LOW RISK** by the DMN engine.
   - Click **Adjudicate**: select **Approve Claim** and submit.
   - Camunda evaluates `settlementCalculationDecision`: applies policy deductible ($500) and comprehensive depreciation (10%) to determine the net settlement.
5. **Step 5: Admin Disbursement & Payment Simulation**
   - Switch to **Admin** (`admin1`).
   - Go to **Settlement Center**: see the calculated disbursement.
   - Click **Authorize & Disburse Payment**: the simulated banking gateway executes, generating transaction reference `TXN-SIM-XXXXXXXX`.
6. **Step 6: Real-Time Verification in SQLite Terminal**
   - Open the command prompt or double-click `open_sqlite.bat`.
   - Run: `SELECT * FROM insurance_claims;` and `SELECT * FROM settlements;`.
   - Show the examiners the live data updated in SQLite!
7. **Step 7: Camunda Cockpit Proof**
   - Open `http://localhost:8080/camunda/app/cockpit/default/`.
   - Log in with `admin / admin`.
   - Show the examiners the visual BPMN diagram with historic tokens showing every step executed!
