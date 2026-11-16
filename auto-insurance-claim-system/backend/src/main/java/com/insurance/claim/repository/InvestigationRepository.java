package com.insurance.claim.repository;

import com.insurance.claim.entity.Investigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvestigationRepository extends JpaRepository<Investigation, Long> {
    Optional<Investigation> findByClaimId(Long claimId);
    List<Investigation> findByStatus(String status);
    List<Investigation> findByInvestigatorId(Long investigatorId);
}
