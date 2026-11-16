-- ===================================================================
-- AUTO ACCIDENT INSURANCE CLAIM MANAGEMENT SYSTEM
-- SQLite Database Schema Script
-- File: insurance.db
-- ===================================================================

PRAGMA foreign_keys = ON;

-- 1. USERS TABLE
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS investigations;
DROP TABLE IF EXISTS claim_reviews;
DROP TABLE IF EXISTS claim_documents;
DROP TABLE IF EXISTS insurance_claims;
DROP TABLE IF EXISTS accidents;
DROP TABLE IF EXISTS insurance_policies;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS system_rules;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role TEXT NOT NULL, -- ROLE_CUSTOMER, ROLE_AGENT, ROLE_CLAIMS_OFFICER, ROLE_ADMIN
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS TABLE
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    driving_license_number TEXT NOT NULL,
    national_id TEXT,
    emergency_contact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. VEHICLES TABLE
CREATE TABLE vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_of_manufacture INTEGER NOT NULL,
    engine_number TEXT,
    chassis_number TEXT,
    vehicle_type TEXT DEFAULT 'SEDAN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 4. INSURANCE POLICIES TABLE
CREATE TABLE insurance_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    policy_type TEXT NOT NULL, -- COMPREHENSIVE, THIRD_PARTY, COLLISION, ZERO_DEPRECIATION
    sum_insured REAL NOT NULL,
    premium_amount REAL NOT NULL,
    deductible_amount REAL DEFAULT 500.00,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED, SUSPENDED
    coverage_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 5. ACCIDENTS TABLE
CREATE TABLE accidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    accident_date_time TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    accident_type TEXT NOT NULL,
    description TEXT NOT NULL,
    weather_conditions TEXT,
    driver_name TEXT NOT NULL,
    driver_license_number TEXT NOT NULL,
    third_party_involved INTEGER DEFAULT 0,
    third_party_details TEXT,
    police_station TEXT,
    fir_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. INSURANCE CLAIMS TABLE
CREATE TABLE insurance_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    policy_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    accident_id INTEGER NOT NULL,
    status TEXT NOT NULL, -- SUBMITTED, UNDER_AGENT_REVIEW, DOCUMENTS_PENDING, UNDER_ASSESSMENT, UNDER_INVESTIGATION, UNDER_OFFICER_REVIEW, APPROVED, REJECTED, SETTLED, CLOSED
    risk_level TEXT DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
    risk_score INTEGER DEFAULT 15,
    estimated_damage REAL NOT NULL,
    approved_settlement_amount REAL DEFAULT 0.00,
    process_instance_id TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    rejection_reason TEXT,
    remarks TEXT,
    sla_due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (policy_id) REFERENCES insurance_policies(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (accident_id) REFERENCES accidents(id) ON DELETE CASCADE
);

-- 7. CLAIM DOCUMENTS TABLE
CREATE TABLE claim_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id INTEGER NOT NULL,
    document_type TEXT NOT NULL, -- DRIVING_LICENSE, VEHICLE_RC, ACCIDENT_PHOTO, POLICE_FIR, REPAIR_ESTIMATE, OTHER
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    verification_status TEXT DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    verification_remarks TEXT,
    FOREIGN KEY (claim_id) REFERENCES insurance_claims(id) ON DELETE CASCADE
);

-- 8. CLAIM REVIEWS TABLE
CREATE TABLE claim_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    decision TEXT NOT NULL, -- VERIFIED, APPROVED, REJECTED, REQUEST_ADDITIONAL_INFO, ESCALATE_INVESTIGATION
    remarks TEXT,
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES insurance_claims(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- 9. INVESTIGATIONS TABLE
CREATE TABLE investigations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id INTEGER NOT NULL,
    investigator_id INTEGER,
    status TEXT DEFAULT 'ASSIGNED', -- ASSIGNED, IN_PROGRESS, COMPLETED
    findings TEXT,
    fraud_risk_flag INTEGER DEFAULT 0,
    site_visit_done INTEGER DEFAULT 0,
    third_party_verified INTEGER DEFAULT 0,
    workshop_verified INTEGER DEFAULT 0,
    report_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_date DATETIME,
    FOREIGN KEY (claim_id) REFERENCES insurance_claims(id) ON DELETE CASCADE,
    FOREIGN KEY (investigator_id) REFERENCES users(id)
);

-- 10. SETTLEMENTS TABLE
CREATE TABLE settlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id INTEGER NOT NULL UNIQUE,
    claim_number TEXT NOT NULL,
    calculated_amount REAL NOT NULL,
    deductible_deducted REAL NOT NULL DEFAULT 0.00,
    depreciation_deducted REAL NOT NULL DEFAULT 0.00,
    final_payable_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'SIMULATED_DIRECT_DEPOSIT',
    payment_status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    transaction_reference TEXT,
    bank_name TEXT,
    account_number_masked TEXT,
    payment_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES insurance_claims(id) ON DELETE CASCADE
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO',
    is_read INTEGER DEFAULT 0,
    related_claim_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    ip_address TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. SYSTEM RULES TABLE
CREATE TABLE system_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_key TEXT NOT NULL UNIQUE,
    rule_name TEXT NOT NULL,
    rule_value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
