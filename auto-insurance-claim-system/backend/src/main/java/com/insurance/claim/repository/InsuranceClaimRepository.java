package com.insurance.claim.repository;

import com.insurance.claim.entity.InsuranceClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    Optional<InsuranceClaim> findByClaimNumber(String claimNumber);
    Optional<InsuranceClaim> findByProcessInstanceId(String processInstanceId);
    List<InsuranceClaim> findByCustomerId(Long customerId);
    List<InsuranceClaim> findByStatus(String status);
    List<InsuranceClaim> findByRiskLevel(String riskLevel);

    @Query("SELECT COUNT(c) FROM InsuranceClaim c WHERE c.customer.id = :customerId")
    Integer countByCustomerId(Long customerId);

    @Query("SELECT COUNT(c) FROM InsuranceClaim c WHERE c.status = :status")
    Long countByStatus(String status);
}
