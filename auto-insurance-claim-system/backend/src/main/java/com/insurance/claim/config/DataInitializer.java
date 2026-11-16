package com.insurance.claim.config;

import com.insurance.claim.entity.*;
import com.insurance.claim.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final InsurancePolicyRepository policyRepository;
    private final InsuranceClaimRepository claimRepository;
    private final ClaimDocumentRepository documentRepository;
    private final SettlementRepository settlementRepository;
    private final SystemRuleRepository ruleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Ensure upload directory exists
        File uploadFolder = new File("./uploads/claims/");
        if (!uploadFolder.exists()) {
            uploadFolder.mkdirs();
        }

        if (userRepository.count() > 0) {
            log.info("Database already seeded. Ensuring all demo users have password123 as their password...");
            String encodedPwd = passwordEncoder.encode("password123");
            userRepository.findAll().forEach(u -> {
                u.setPassword(encodedPwd);
                userRepository.save(u);
            });
            if (!userRepository.existsByUsername("surveyor1")) {
                userRepository.save(User.builder()
                        .username("surveyor1")
                        .password(encodedPwd)
                        .email("david.surveyor@autosure.com")
                        .fullName("David Miller (Certified Vehicle Surveyor)")
                        .phoneNumber("+1-555-019-5566")
                        .role(Role.ROLE_SURVEYOR)
                        .enabled(true)
                        .build());
            }

            claimRepository.findByClaimNumber("CLM-2026-00101").ifPresent(c -> {
                if (!settlementRepository.existsByClaimId(c.getId())) {
                    BigDecimal est = c.getEstimatedDamage() != null ? c.getEstimatedDamage() : new BigDecimal("1500.00");
                    BigDecimal ded = (c.getPolicy() != null && c.getPolicy().getDeductibleAmount() != null)
                            ? c.getPolicy().getDeductibleAmount() : new BigDecimal("500.00");
                    BigDecimal dep = est.multiply(new BigDecimal("0.10")).setScale(2, java.math.RoundingMode.HALF_UP);
                    BigDecimal finalPay = est.subtract(ded).subtract(dep).max(BigDecimal.ZERO);

                    settlementRepository.save(Settlement.builder()
                            .claim(c)
                            .claimNumber(c.getClaimNumber())
                            .calculatedAmount(est)
                            .deductibleDeducted(ded)
                            .depreciationDeducted(dep)
                            .finalPayableAmount(finalPay)
                            .paymentStatus("PENDING_AUTHORIZATION")
                            .paymentMethod("SIMULATED_DIRECT_DEPOSIT")
                            .bankName("JPMorgan Chase (Simulated)")
                            .accountNumberMasked("****-****-****-6812")
                            .build());
                    log.info("Initialized pending settlement record for CLM-2026-00101");
                }
            });
            return;
        }

        log.info("Seeding initial demo data for Auto Accident Claim Management System...");

        String encodedPwd = passwordEncoder.encode("password123");

        // 1. Users
        User customer1User = userRepository.save(User.builder()
                .username("customer1")
                .password(encodedPwd)
                .email("john.doe@autoclaim.com")
                .fullName("Johnathan Doe")
                .phoneNumber("+1-555-019-2831")
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build());

        User customer2User = userRepository.save(User.builder()
                .username("customer2")
                .password(encodedPwd)
                .email("sarah.connor@autoclaim.com")
                .fullName("Sarah Connor")
                .phoneNumber("+1-555-019-4820")
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build());

        User agentUser = userRepository.save(User.builder()
                .username("agent1")
                .password(encodedPwd)
                .email("robert.agent@autoclaim.com")
                .fullName("Robert Vance (Field Agent)")
                .phoneNumber("+1-555-019-9912")
                .role(Role.ROLE_AGENT)
                .enabled(true)
                .build());

        User officerUser = userRepository.save(User.builder()
                .username("officer1")
                .password(encodedPwd)
                .email("elena.claims@autoclaim.com")
                .fullName("Elena Rostova (Claims Officer)")
                .phoneNumber("+1-555-019-8734")
                .role(Role.ROLE_CLAIMS_OFFICER)
                .enabled(true)
                .build());

        User adminUser = userRepository.save(User.builder()
                .username("admin1")
                .password(encodedPwd)
                .email("marcus.admin@autoclaim.com")
                .fullName("Marcus Sterling (Administrator)")
                .phoneNumber("+1-555-019-1100")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build());

        // 2. Customers
        Customer customer1 = customerRepository.save(Customer.builder()
                .user(customer1User)
                .address("742 Evergreen Terrace")
                .city("Springfield")
                .state("IL")
                .postalCode("62704")
                .drivingLicenseNumber("DL-IL-9847291")
                .nationalId("SSN-982-11-4091")
                .emergencyContact("+1-555-019-3321")
                .build());

        Customer customer2 = customerRepository.save(Customer.builder()
                .user(customer2User)
                .address("1844 Cyberdyne Way")
                .city("Los Angeles")
                .state("CA")
                .postalCode("90001")
                .drivingLicenseNumber("DL-CA-4029184")
                .nationalId("SSN-481-99-2810")
                .emergencyContact("+1-555-019-7732")
                .build());

        // 3. Vehicles
        Vehicle vehicle1 = vehicleRepository.save(Vehicle.builder()
                .customer(customer1)
                .registrationNumber("IL-984-XYZ")
                .make("Toyota")
                .model("Camry SE")
                .yearOfManufacture(2022)
                .engineNumber("ENG-TY849201")
                .chassisNumber("CHAS-4T1B11HK5NU8492")
                .vehicleType("SEDAN")
                .build());

        Vehicle vehicle2 = vehicleRepository.save(Vehicle.builder()
                .customer(customer1)
                .registrationNumber("IL-312-ABT")
                .make("Honda")
                .model("CR-V Touring")
                .yearOfManufacture(2021)
                .engineNumber("ENG-HN994821")
                .chassisNumber("CHAS-2HKRW2H87MH9948")
                .vehicleType("SUV")
                .build());

        Vehicle vehicle3 = vehicleRepository.save(Vehicle.builder()
                .customer(customer2)
                .registrationNumber("CA-882-SPD")
                .make("Tesla")
                .model("Model 3 Long Range")
                .yearOfManufacture(2023)
                .engineNumber("ENG-TS772810")
                .chassisNumber("CHAS-5YJ3E1EB8PF7728")
                .vehicleType("SEDAN")
                .build());

        // 4. Insurance Policies
        InsurancePolicy policy1 = policyRepository.save(InsurancePolicy.builder()
                .policyNumber("POL-2026-88491")
                .customer(customer1)
                .vehicle(vehicle1)
                .policyType("COMPREHENSIVE")
                .sumInsured(new BigDecimal("32000.00"))
                .premiumAmount(new BigDecimal("1250.00"))
                .deductibleAmount(new BigDecimal("500.00"))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2027, 1, 1))
                .status("ACTIVE")
                .coverageDetails("Full comprehensive coverage including collision, comprehensive, roadside assistance, and zero-depreciation rider.")
                .build());

        policyRepository.save(InsurancePolicy.builder()
                .policyNumber("POL-2026-99214")
                .customer(customer1)
                .vehicle(vehicle2)
                .policyType("ZERO_DEPRECIATION")
                .sumInsured(new BigDecimal("38000.00"))
                .premiumAmount(new BigDecimal("1480.00"))
                .deductibleAmount(new BigDecimal("250.00"))
                .startDate(LocalDate.of(2026, 3, 15))
                .endDate(LocalDate.of(2027, 3, 15))
                .status("ACTIVE")
                .coverageDetails("Zero depreciation bumper-to-bumper shield, engine protector, roadside assist.")
                .build());

        policyRepository.save(InsurancePolicy.builder()
                .policyNumber("POL-2026-33108")
                .customer(customer2)
                .vehicle(vehicle3)
                .policyType("COMPREHENSIVE")
                .sumInsured(new BigDecimal("55000.00"))
                .premiumAmount(new BigDecimal("2100.00"))
                .deductibleAmount(new BigDecimal("1000.00"))
                .startDate(LocalDate.of(2026, 5, 10))
                .endDate(LocalDate.of(2027, 5, 10))
                .status("ACTIVE")
                .coverageDetails("Comprehensive EV cover with battery replacement assurance and glass damage coverage.")
                .build());

        // 5. System Rules
        ruleRepository.save(SystemRule.builder()
                .ruleKey("SLA_HOURS_AGENT")
                .ruleName("Agent Document SLA")
                .ruleValue("24")
                .description("Maximum allowed hours for agent to verify submitted documents before escalation")
                .build());

        ruleRepository.save(SystemRule.builder()
                .ruleKey("SLA_HOURS_OFFICER")
                .ruleName("Claims Officer SLA")
                .ruleValue("48")
                .description("Maximum allowed hours for claims officer review before escalation")
                .build());

        ruleRepository.save(SystemRule.builder()
                .ruleKey("HIGH_RISK_THRESHOLD")
                .ruleName("High Risk Damage Threshold")
                .ruleValue("15000")
                .description("Claims with damage exceeding this amount automatically require investigation")
                .build());

        ruleRepository.save(SystemRule.builder()
                .ruleKey("AUTO_APPROVAL_THRESHOLD")
                .ruleName("Auto Approval Fast Track Limit")
                .ruleValue("2000")
                .description("Low risk claims below this threshold qualify for fast track settlement")
                .build());

        // 6. Initial Audit Log
        auditLogRepository.save(AuditLog.builder()
                .entityName("SYSTEM")
                .entityId("INIT")
                .action("DATABASE_SEEDED")
                .performedBy("SYSTEM_STARTUP")
                .ipAddress("127.0.0.1")
                .details("Initial system users, policies, vehicles, and rules successfully provisioned.")
                .build());

        log.info("System successfully initialized with default demo credentials.");
    }
}
