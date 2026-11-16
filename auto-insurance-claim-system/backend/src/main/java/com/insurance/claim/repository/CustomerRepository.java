package com.insurance.claim.repository;

import com.insurance.claim.entity.Customer;
import com.insurance.claim.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUser(User user);
    Optional<Customer> findByUserId(Long userId);
    Optional<Customer> findByDrivingLicenseNumber(String drivingLicenseNumber);
}
