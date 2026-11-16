package com.insurance.claim.repository;

import com.insurance.claim.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    Optional<Settlement> findByClaimId(Long claimId);
    Optional<Settlement> findByClaimNumber(String claimNumber);
    Optional<Settlement> findByTransactionReference(String transactionReference);
    boolean existsByClaimId(Long claimId);
    boolean existsByClaimNumber(String claimNumber);
}
