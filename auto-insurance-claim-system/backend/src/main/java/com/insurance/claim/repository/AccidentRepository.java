package com.insurance.claim.repository;

import com.insurance.claim.entity.Accident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccidentRepository extends JpaRepository<Accident, Long> {
    Optional<Accident> findByFirNumber(String firNumber);
}
