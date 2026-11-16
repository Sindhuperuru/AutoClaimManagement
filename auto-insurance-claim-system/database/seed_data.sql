-- ===================================================================
-- AUTO ACCIDENT INSURANCE CLAIM MANAGEMENT SYSTEM
-- Sample Seed Data Script
-- ===================================================================

USE auto_claim_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE notifications;
TRUNCATE TABLE settlements;
TRUNCATE TABLE investigations;
TRUNCATE TABLE claim_reviews;
TRUNCATE TABLE claim_documents;
TRUNCATE TABLE insurance_claims;
TRUNCATE TABLE accidents;
TRUNCATE TABLE insurance_policies;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE customers;
TRUNCATE TABLE users;
TRUNCATE TABLE system_rules;

-- 1. SEED USERS (Password: password123 for all demo accounts)
-- BCrypt hash for 'password123': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (id, username, password, email, full_name, phone_number, role, enabled) VALUES
(1, 'customer1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'john.doe@autoclaim.com', 'Johnathan Doe', '+1-555-019-2831', 'ROLE_CUSTOMER', TRUE),
(2, 'customer2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sarah.connor@autoclaim.com', 'Sarah Connor', '+1-555-019-4820', 'ROLE_CUSTOMER', TRUE),
(3, 'agent1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'robert.agent@autoclaim.com', 'Robert Vance (Field Agent)', '+1-555-019-9912', 'ROLE_AGENT', TRUE),
(4, 'officer1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'elena.claims@autoclaim.com', 'Elena Rostova (Claims Officer)', '+1-555-019-8734', 'ROLE_CLAIMS_OFFICER', TRUE),
(5, 'admin1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'marcus.admin@autoclaim.com', 'Marcus Sterling (System Admin)', '+1-555-019-1100', 'ROLE_ADMIN', TRUE);

-- 2. SEED CUSTOMERS
INSERT INTO customers (id, user_id, address, city, state, postal_code, driving_license_number, national_id, emergency_contact) VALUES
(1, 1, '742 Evergreen Terrace', 'Springfield', 'IL', '62704', 'DL-IL-9847291', 'SSN-982-11-4091', '+1-555-019-3321'),
(2, 2, '1844 Cyberdyne Way', 'Los Angeles', 'CA', '90001', 'DL-CA-4029184', 'SSN-481-99-2810', '+1-555-019-7732');

-- 3. SEED VEHICLES
INSERT INTO vehicles (id, customer_id, registration_number, make, model, year_of_manufacture, engine_number, chassis_number, vehicle_type) VALUES
(1, 1, 'IL-984-XYZ', 'Toyota', 'Camry SE', 2022, 'ENG-TY849201', 'CHAS-4T1B11HK5NU8492', 'SEDAN'),
(2, 1, 'IL-312-ABT', 'Honda', 'CR-V Touring', 2021, 'ENG-HN994821', 'CHAS-2HKRW2H87MH9948', 'SUV'),
(3, 2, 'CA-882-SPD', 'Tesla', 'Model 3 Long Range', 2023, 'ENG-TS772810', 'CHAS-5YJ3E1EB8PF7728', 'SEDAN');

-- 4. SEED POLICIES
INSERT INTO insurance_policies (id, policy_number, customer_id, vehicle_id, policy_type, sum_insured, premium_amount, deductible_amount, start_date, end_date, status, coverage_details) VALUES
(1, 'POL-2026-88491', 1, 1, 'COMPREHENSIVE', 32000.00, 1250.00, 500.00, '2026-01-01', '2027-01-01', 'ACTIVE', 'Full comprehensive coverage including collision, comprehensive, roadside assistance, and zero-depreciation for first 3 years.'),
(2, 'POL-2026-99214', 1, 2, 'ZERO_DEPRECIATION', 38000.00, 1480.00, 250.00, '2026-03-15', '2027-03-15', 'ACTIVE', 'Zero depreciation bumper-to-bumper bumper shield, engine protector, roadside assist.'),
(3, 'POL-2026-33108', 2, 3, 'COMPREHENSIVE', 55000.00, 2100.00, 1000.00, '2026-05-10', '2027-05-10', 'ACTIVE', 'Comprehensive EV cover with battery replacement assurance and glass damage coverage.');

-- 5. SEED ACCIDENTS
INSERT INTO accidents (id, accident_date_time, location, city, state, accident_type, description, weather_conditions, driver_name, driver_license_number, third_party_involved, third_party_details, police_station, fir_number) VALUES
(1, '2026-11-10 14:35:00', 'Interstate 55 South & Exit 92', 'Springfield', 'IL', 'REAR_END', 'Vehicle was halted at red signal when another sedan collided with rear bumper causing severe bumper and trunk damage.', 'Clear and dry', 'Johnathan Doe', 'DL-IL-9847291', TRUE, 'Driver: Mike Jenkins, Reg: IL-552-KKL, Insurer: StateFarm', 'Springfield Central Police Precinct', 'FIR-2026-SP-9941'),
(2, '2026-11-12 09:15:00', 'Sunset Blvd & Vine St', 'Los Angeles', 'CA', 'COLLISION', 'Side-impact collision at traffic intersection during morning commute resulting in left door indentation and suspension misalignment.', 'Overcast', 'Sarah Connor', 'DL-CA-4029184', FALSE, 'None', 'LAPD Hollywood Division', 'FIR-2026-LA-1082');

-- 6. SEED CLAIMS
INSERT INTO insurance_claims (id, claim_number, customer_id, policy_id, vehicle_id, accident_id, status, risk_level, risk_score, estimated_damage, approved_settlement_amount, process_instance_id, submission_date, remarks, sla_due_date) VALUES
(1, 'CLM-2026-00101', 1, 1, 1, 1, 'UNDER_OFFICER_REVIEW', 'LOW', 18, 4200.00, 0.00, 'proc-inst-1001', '2026-11-10 16:00:00', 'Agent verified all 5 documents. Initial estimate verified with Springfield Authorized Body Shop.', '2026-11-20 16:00:00'),
(2, 'CLM-2026-00102', 2, 3, 3, 2, 'SUBMITTED', 'MEDIUM', 35, 9800.00, 0.00, 'proc-inst-1002', '2026-11-12 11:30:00', 'Claim recently registered by customer. Awaiting agent document verification.', '2026-11-22 11:30:00');

-- 7. SEED CLAIM DOCUMENTS
INSERT INTO claim_documents (id, claim_id, document_type, file_name, file_path, file_type, file_size, upload_date, verification_status, verification_remarks) VALUES
(1, 1, 'DRIVING_LICENSE', 'driving_license_johndoe.pdf', '/uploads/claims/1/dl.pdf', 'application/pdf', 1048576, '2026-11-10 16:05:00', 'VERIFIED', 'Valid driver license verified with state DMV.'),
(2, 1, 'VEHICLE_RC', 'toyota_camry_rc.pdf', '/uploads/claims/1/rc.pdf', 'application/pdf', 945200, '2026-11-10 16:05:00', 'VERIFIED', 'Registration certificate matches policy chassis and engine numbers.'),
(3, 1, 'ACCIDENT_PHOTO', 'rear_damage_photo1.jpg', '/uploads/claims/1/photo1.jpg', 'image/jpeg', 2048576, '2026-11-10 16:07:00', 'VERIFIED', 'High resolution photograph showing clear damage to rear trunk and bumper.'),
(4, 1, 'POLICE_FIR', 'police_fir_9941.pdf', '/uploads/claims/1/fir.pdf', 'application/pdf', 1548000, '2026-11-10 16:08:00', 'VERIFIED', 'Official police report on file with badge officer stamp.'),
(5, 1, 'REPAIR_ESTIMATE', 'repair_estimate_toyota.pdf', '/uploads/claims/1/estimate.pdf', 'application/pdf', 720000, '2026-11-10 16:10:00', 'VERIFIED', 'Authorized Toyota dealer quote attached for $4,200.');

-- 8. SEED CLAIM REVIEW
INSERT INTO claim_reviews (id, claim_id, reviewer_id, role, decision, remarks, review_date) VALUES
(1, 1, 3, 'ROLE_AGENT', 'VERIFIED', 'All primary policy credentials and accident photographs verified. Clear third-party liability noted.', '2026-11-11 10:15:00');

-- 9. SEED INVESTIGATION
INSERT INTO investigations (id, claim_id, investigator_id, status, findings, fraud_risk_flag, site_visit_done, third_party_verified, workshop_verified, report_summary) VALUES
(1, 1, 4, 'COMPLETED', 'Damage pattern fully consistent with reported rear impact. Repair estimate line items fall within standard regional labor and parts rate book.', FALSE, TRUE, TRUE, TRUE, 'Legitimate claim without indicators of fraudulent staging.');

-- 10. SEED NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, is_read, related_claim_id) VALUES
(1, 1, 'Claim Successfully Submitted', 'Your claim CLM-2026-00101 has been registered. Unique process instance initiated.', 'SUCCESS', TRUE, 1),
(2, 1, 'Document Verification Completed', 'Agent Robert Vance has verified all submitted documents for claim CLM-2026-00101.', 'INFO', FALSE, 1),
(3, 2, 'Claim Under Agent Review', 'Your claim CLM-2026-00102 has been received and assigned for document verification.', 'INFO', FALSE, 2);

-- 11. SEED AUDIT LOGS
INSERT INTO audit_logs (entity_name, entity_id, action, performed_by, ip_address, details) VALUES
('InsuranceClaim', 'CLM-2026-00101', 'CLAIM_SUBMITTED', 'customer1', '127.0.0.1', 'Submitted claim for accident on I-55 South with estimate $4,200.00'),
('CamundaProcess', 'proc-inst-1001', 'PROCESS_STARTED', 'SYSTEM', '127.0.0.1', 'BPMN process auto_accident_claim_process initialized'),
('ClaimReview', 'CLM-2026-00101', 'AGENT_DOC_VERIFICATION', 'agent1', '127.0.0.1', 'Agent completed document verification checklist with all 5 mandatory docs approved.');

-- 12. SEED SYSTEM RULES
INSERT INTO system_rules (rule_key, rule_name, rule_value, description) VALUES
('SLA_HOURS_AGENT', 'Agent Document SLA', '24', 'Maximum allowed hours for agent to verify submitted documents before escalation'),
('SLA_HOURS_OFFICER', 'Claims Officer SLA', '48', 'Maximum allowed hours for claims officer review before escalation'),
('HIGH_RISK_THRESHOLD', 'High Risk Damage Threshold', '15000', 'Claims with damage exceeding this amount automatically require investigation'),
('AUTO_APPROVAL_THRESHOLD', 'Auto Approval Fast Track Limit', '2000', 'Low risk claims below this threshold qualify for fast track settlement');

SET FOREIGN_KEY_CHECKS = 1;
