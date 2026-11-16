package com.insurance.claim.controller;

import com.insurance.claim.dto.ApiResponse;
import com.insurance.claim.entity.InsurancePolicy;
import com.insurance.claim.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InsurancePolicy>>> getAllPolicies() {
        List<InsurancePolicy> policies = policyService.getAllPolicies();
        return ResponseEntity.ok(ApiResponse.ok(policies));
    }

    @GetMapping("/{policyNumber}")
    public ResponseEntity<ApiResponse<InsurancePolicy>> getPolicyByNumber(@PathVariable String policyNumber) {
        InsurancePolicy policy = policyService.getPolicyByNumber(policyNumber);
        return ResponseEntity.ok(ApiResponse.ok(policy));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<InsurancePolicy>>> getPoliciesByCustomer(@PathVariable Long customerId) {
        List<InsurancePolicy> policies = policyService.getPoliciesByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.ok(policies));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InsurancePolicy>> createPolicy(
            @RequestBody InsurancePolicy policy,
            @RequestParam Long customerId,
            @RequestParam Long vehicleId) {

        InsurancePolicy created = policyService.createPolicy(policy, customerId, vehicleId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Policy issued successfully", created));
    }
}
