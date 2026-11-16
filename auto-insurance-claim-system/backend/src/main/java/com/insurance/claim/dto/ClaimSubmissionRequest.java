package com.insurance.claim.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClaimSubmissionRequest {

    @NotBlank(message = "Policy number is required")
    private String policyNumber;

    @NotNull(message = "Accident date and time is required")
    private LocalDateTime accidentDateTime;

    @NotBlank(message = "Accident location is required")
    private String location;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Accident type is required")
    private String accidentType; // COLLISION, ROLLOVER, REAR_END, HIT_AND_RUN, WEATHER_DAMAGE, THEFT_ATTEMPT

    @NotBlank(message = "Description is required")
    private String description;

    private String weatherConditions;

    @NotBlank(message = "Driver name is required")
    private String driverName;

    @NotBlank(message = "Driver license number is required")
    private String driverLicenseNumber;

    private Boolean thirdPartyInvolved = false;
    private String thirdPartyDetails;
    private String policeStation;
    private String firNumber;

    @NotNull(message = "Estimated damage amount is required")
    @DecimalMin(value = "1.00", message = "Damage amount must be greater than zero")
    private BigDecimal estimatedDamage;
}
