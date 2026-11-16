package com.insurance.claim.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "accidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Accident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @Column(name = "accident_date_time", nullable = false)
    private LocalDateTime accidentDateTime;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "accident_type", nullable = false, length = 50)
    private String accidentType; // COLLISION, ROLLOVER, REAR_END, HIT_AND_RUN, WEATHER_DAMAGE, THEFT_ATTEMPT

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "weather_conditions", length = 50)
    private String weatherConditions;

    @Column(name = "driver_name", nullable = false, length = 100)
    private String driverName;

    @Column(name = "driver_license_number", nullable = false, length = 50)
    private String driverLicenseNumber;

    @Column(name = "third_party_involved")
    private Boolean thirdPartyInvolved = false;

    @Column(name = "third_party_details", columnDefinition = "TEXT")
    private String thirdPartyDetails;

    @Column(name = "police_station", length = 100)
    private String policeStation;

    @Column(name = "fir_number", length = 50)
    private String firNumber;

    @Convert(converter = com.insurance.claim.config.LocalDateTimeConverter.class)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
