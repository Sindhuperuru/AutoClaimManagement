package com.insurance.claim.service;

import com.insurance.claim.entity.Customer;
import com.insurance.claim.entity.InsurancePolicy;
import com.insurance.claim.entity.Vehicle;
import com.insurance.claim.exception.ResourceNotFoundException;
import com.insurance.claim.repository.CustomerRepository;
import com.insurance.claim.repository.InsurancePolicyRepository;
import com.insurance.claim.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyService {

    private final InsurancePolicyRepository policyRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;

    public List<InsurancePolicy> getAllPolicies() {
        return policyRepository.findAll();
    }

    public InsurancePolicy getPolicyByNumber(String policyNumber) {
        return policyRepository.findByPolicyNumber(policyNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with number: " + policyNumber));
    }

    public List<InsurancePolicy> getPoliciesByCustomerId(Long customerId) {
        return policyRepository.findByCustomerId(customerId);
    }

    @Transactional
    public InsurancePolicy createPolicy(InsurancePolicy policy, Long customerId, Long vehicleId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + vehicleId));

        policy.setCustomer(customer);
        policy.setVehicle(vehicle);
        return policyRepository.save(policy);
    }
}
