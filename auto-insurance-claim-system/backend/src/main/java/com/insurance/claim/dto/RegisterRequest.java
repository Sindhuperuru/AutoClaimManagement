package com.insurance.claim.dto;

import com.insurance.claim.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phoneNumber;
    private Role role = Role.ROLE_CUSTOMER;

    // Customer specific fields
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String drivingLicenseNumber;
    private String nationalId;
    private String emergencyContact;
}
