# SQLite Database Inspection & Query Guide

This project is configured to use **SQLite** (`insurance.db`) as its primary database. Every action performed on the React website (customer submitting claims, uploading documents, field agent verifying checklists, claims officer adjudications, and automated settlement disbursements) is immediately saved and updated in your local SQLite database file.

---

## 1. Quick Access Options on Windows

### Option A: Double-Click Launcher
Simply double-click the included batch script in the project root:
```
auto-insurance-claim-system\open_sqlite.bat
```
This automatically opens the SQLite interactive terminal connected to `insurance.db`.

### Option B: From Command Prompt (cmd) or PowerShell
Open a terminal in the project directory:
```powershell
cd C:\Users\sindh\OneDrive\Documents\AutoClaimManagement\auto-insurance-claim-system
sqlite3 insurance.db
```
*(If sqlite3 is installed in `C:\sqlite\`, you can also run `C:\sqlite\sqlite3.exe insurance.db`)*

---

## 2. Essential SQLite Navigation Commands

| SQLite Command | Description |
| :--- | :--- |
| `.tables` | Lists all 13 tables in the database |
| `.schema <table_name>` | Displays the SQL DDL structure of a specific table |
| `.headers on` | Turns on column name headers in query outputs |
| `.mode column` | Formats query output into readable tabular columns |
| `.exit` or `.quit` | Exits the SQLite console |

---

## 3. Useful SQL Queries to Inspect Your Live Data

Before running queries, format the output for readability:
```sql
.headers on
.mode column
```

### 1. View All Insurance Claims
```sql
SELECT id, claim_number, status, risk_level, risk_score, estimated_damage, approved_settlement_amount, submission_date 
FROM insurance_claims;
```

### 2. View Active Insurance Policies & Bound Vehicles
```sql
SELECT p.policy_number, p.policy_type, p.sum_insured, p.deductible_amount, v.make, v.model, v.registration_number, p.status
FROM insurance_policies p
JOIN vehicles v ON p.vehicle_id = v.id;
```

### 3. View All Registered User Accounts & Roles
```sql
SELECT id, username, full_name, email, role, enabled FROM users;
```

### 4. View Uploaded Documents per Claim
```sql
SELECT id, claim_id, document_type, file_name, verification_status, upload_date 
FROM claim_documents;
```

### 5. View Completed Financial Settlements & ACH Transaction References
```sql
SELECT claim_number, calculated_amount, deductible_deducted, depreciation_deducted, final_payable_amount, payment_status, transaction_reference, payment_date
FROM settlements;
```

### 6. View Special Investigation Unit (SIU) Findings
```sql
SELECT id, claim_id, status, fraud_risk_flag, site_visit_done, third_party_verified, workshop_verified, findings 
FROM investigations;
```

### 7. View Real-Time Audit Logs
```sql
SELECT id, timestamp, entity_name, entity_id, action, performed_by, details 
FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 15;
```

---

## 4. How Changes from the Website Reflect in SQLite

1. **Customer Submits Claim**:
   - A new row is inserted into `accidents` and `insurance_claims` with status `SUBMITTED`.
   - Camunda engine initializes process instance and records `process_instance_id`.
2. **Customer Uploads Evidence**:
   - Rows are inserted into `claim_documents` with document category (`DRIVING_LICENSE`, `VEHICLE_RC`, etc.).
3. **Agent Verifies Checklist**:
   - Updates `claim_documents.verification_status` to `VERIFIED`.
   - Transitions `insurance_claims.status` to `UNDER_ASSESSMENT` / `UNDER_OFFICER_REVIEW`.
4. **Officer Approves Claim**:
   - Evaluates DMN rules, records `claim_reviews`, sets `insurance_claims.status` to `APPROVED`.
5. **Settlement Disbursed**:
   - Generates entry in `settlements` with auto-calculated net amount (`Damage - Deductible - Depreciation`).
   - Payment simulation assigns cryptographic `transaction_reference` (`TXN-SIM-XXXXXXXX`) and sets `payment_status = 'COMPLETED'`.
