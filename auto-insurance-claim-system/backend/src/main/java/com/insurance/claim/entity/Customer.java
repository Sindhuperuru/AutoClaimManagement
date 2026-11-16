package com.insurance.claim.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    private String address;
    private String city;
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "driving_license_number", nullable = false, length = 50)
    private String drivingLicenseNumber;

    @Column(name = "national_id", length = 50)
    private String nationalId;

    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
