package com.insurance.claim.repository;

import com.insurance.claim.entity.ClaimReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimReviewRepository extends JpaRepository<ClaimReview, Long> {
    List<ClaimReview> findByClaimIdOrderByReviewDateDesc(Long claimId);
}
