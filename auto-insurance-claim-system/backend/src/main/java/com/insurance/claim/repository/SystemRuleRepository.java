package com.insurance.claim.repository;

import com.insurance.claim.entity.SystemRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemRuleRepository extends JpaRepository<SystemRule, Long> {
    Optional<SystemRule> findByRuleKey(String ruleKey);
}
