-- ===================================================================
-- AUTO ACCIDENT INSURANCE CLAIM MANAGEMENT SYSTEM
-- Database Schema Script for MySQL 8.x / 5.7
-- Database Name: auto_claim_db
-- ===================================================================

CREATE DATABASE IF NOT EXISTS auto_claim_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auto_claim_db;

-- Disable foreign key checks during creation
SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(30) NOT NULL, -- ROLE_CUSTOMER, ROLE_AGENT, ROLE_CLAIMS_OFFICER, ROLE_ADMIN
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_username (username),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. CUSTOMERS TABLE
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    driving_license_number VARCHAR(50) NOT NULL,
    national_id VARCHAR(50),
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_customer_license (driving_license_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. VEHICLES TABLE
DROP TABLE IF EXISTS vehicles;
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year_of_manufacture INT NOT NULL,
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    vehicle_type VARCHAR(30) DEFAULT 'SEDAN', -- SEDAN, SUV, HATCHBACK, TRUCK, MOTORCYCLE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_vehicle_reg (registration_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. INSURANCE POLICIES TABLE
DROP TABLE IF EXISTS insurance_policies;
CREATE TABLE insurance_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- COMPREHENSIVE, THIRD_PARTY, COLLISION, ZERO_DEPRECIATION
    sum_insured DECIMAL(12,2) NOT NULL,
    premium_amount DECIMAL(10,2) NOT NULL,
    deductible_amount DECIMAL(10,2) DEFAULT 500.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED, SUSPENDED
    coverage_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_policy_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_policy_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_policy_number (policy_number),
    INDEX idx_policy_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ACCIDENTS TABLE
DROP TABLE IF EXISTS accidents;
CREATE TABLE accidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    accident_date_time DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    accident_type VARCHAR(50) NOT NULL, -- COLLISION, ROLLOVER, REAR_END, HIT_AND_RUN, WEATHER_DAMAGE, THEFT_ATTEMPT
    description TEXT NOT NULL,
    weather_conditions VARCHAR(50),
    driver_name VARCHAR(100) NOT NULL,
    driver_license_number VARCHAR(50) NOT NULL,
    third_party_involved BOOLEAN DEFAULT FALSE,
    third_party_details TEXT,
    police_station VARCHAR(100),
    fir_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_accident_fir (fir_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. INSURANCE CLAIMS TABLE
DROP TABLE IF EXISTS insurance_claims;
CREATE TABLE insurance_claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    policy_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    accident_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL, -- SUBMITTED, UNDER_AGENT_REVIEW, DOCUMENTS_PENDING, UNDER_ASSESSMENT, UNDER_INVESTIGATION, UNDER_OFFICER_REVIEW, APPROVED, REJECTED, SETTLED, CLOSED
    risk_level VARCHAR(20) DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
    risk_score INT DEFAULT 15,
    estimated_damage DECIMAL(12,2) NOT NULL,
    approved_settlement_amount DECIMAL(12,2) DEFAULT 0.00,
    process_instance_id VARCHAR(100),
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rejection_reason TEXT,
    remarks TEXT,
    sla_due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_claim_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_claim_policy FOREIGN KEY (policy_id) REFERENCES insurance_policies(id) ON DELETE RESTRICT,
    CONSTRAINT fk_claim_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_claim_accident FOREIGN KEY (accident_id) REFERENCES accidents(id) ON DELETE CASCADE,
    INDEX idx_claim_number (claim_number),
    INDEX idx_claim_status (status),
    INDEX idx_claim_risk (risk_level),
    INDEX idx_claim_process (process_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. CLAIM DOCUMENTS TABLE
DROP TABLE IF EXISTS claim_documents;
CREATE TABLE claim_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- DRIVING_LICENSE, VEHICLE_RC, ACCIDENT_PHOTO, POLICE_FIR, REPAIR_ESTIMATE, OTHER
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    verification_remarks VARCHAR(255),
    CONSTRAINT fk_doc_claim FOREIGN KEY (claim_id) REFERENCES insurance_claims(id) ON DELETE CASCADE,
    INDEX idx_doc_claim (claim_id),
    INDEX idx_doc_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. CLAIM REVIEWS TABLE (AGENT & OFFICER AUDIT TRAIL)
DROP TABLE IF EXISTS claim_reviews;
CREATE TABLE claim_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    role VARCHAR(30) NOT NULL,
    decision VARCHAR(50) NOT NULL, -- VERIFIED, APPROVED, REJECTED, REQUEST_ADDITIONAL_INFO, ESCALATE_INVESTIGATION
    remarks TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_claim FOREIGN KEY (claim_id) REFERENCES insurance_claims(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_review_claim (claim_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. INVESTIGATIONS TABLE (FRAUD / SPECIAL INVESTIGATION UNIT)
DROP TABLE IF EXISTS investigations;
CREATE TABLE investigations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    investigator_id BIGINT,
    status VARCHAR(30) DEFAULT 'ASSIGNED', -- ASSIGNED, IN_PROGRESS, COMPLETED
    findings TEXT,
    fraud_risk_flag BOOLEAN DEFAULT FALSE,
    site_visit_done BOOLEAN DEFAULT FALSE,
    third_party_verified BOOLEAN DEFAULT FALSE,
    workshop_verified BOOLEAN DEFAULT FALSE,
    report_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_date TIMESTAMP NULL,
    CONSTRAINT fk_inv_claim FOREIGN KEY (claim_id) REFERENCES insurance_claims(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_user FOREIGN KEY (investigator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_inv_claim (claim_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. SETTLEMENTS TABLE
DROP TABLE IF EXISTS settlements;
CREATE TABLE settlements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_id BIGINT NOT NULL UNIQUE,
    claim_number VARCHAR(50) NOT NULL,
    calculated_amount DECIMAL(12,2) NOT NULL,
    deductible_deducted DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    depreciation_deducted DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    final_payable_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'SIMULATED_DIRECT_DEPOSIT', -- SIMULATED_DIRECT_DEPOSIT, SIMULATED_WIRE, SIMULATED_CHEQUE
    payment_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    transaction_reference VARCHAR(100),
    bank_name VARCHAR(100),
    account_number_masked VARCHAR(50),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_settlement_claim FOREIGN KEY (claim_id) REFERENCES insurance_claims(id) ON DELETE CASCADE,
    INDEX idx_settlement_claim (claim_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. NOTIFICATIONS TABLE
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'INFO', -- INFO, ALERT, SUCCESS, WARNING
    is_read BOOLEAN DEFAULT FALSE,
    related_claim_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. AUDIT LOGS TABLE
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_entity (entity_name, entity_id),
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. SYSTEM CONFIGURATION RULES TABLE
DROP TABLE IF EXISTS system_rules;
CREATE TABLE system_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_key VARCHAR(100) NOT NULL UNIQUE,
    rule_name VARCHAR(150) NOT NULL,
    rule_value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
