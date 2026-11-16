package com.insurance.claim.service;

import com.insurance.claim.dto.AuthRequest;
import com.insurance.claim.dto.AuthResponse;
import com.insurance.claim.dto.RegisterRequest;
import com.insurance.claim.entity.Customer;
import com.insurance.claim.entity.Role;
import com.insurance.claim.entity.User;
import com.insurance.claim.exception.BadRequestException;
import com.insurance.claim.exception.ResourceNotFoundException;
import com.insurance.claim.repository.CustomerRepository;
import com.insurance.claim.repository.UserRepository;
import com.insurance.claim.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(AuthRequest request) {
        log.info("Authenticating user: {}", request.getUsername());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long customerId = null;
        if (user.getRole() == Role.ROLE_CUSTOMER) {
            customerId = customerRepository.findByUserId(user.getId())
                    .map(Customer::getId)
                    .orElse(null);
        }

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .customerId(customerId)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        Long customerId = null;

        if (savedUser.getRole() == Role.ROLE_CUSTOMER) {
            Customer customer = Customer.builder()
                    .user(savedUser)
                    .address(request.getAddress())
                    .city(request.getCity())
                    .state(request.getState())
                    .postalCode(request.getPostalCode())
                    .drivingLicenseNumber(request.getDrivingLicenseNumber() != null ? request.getDrivingLicenseNumber() : "DL-PENDING")
                    .nationalId(request.getNationalId())
                    .emergencyContact(request.getEmergencyContact())
                    .build();
            Customer savedCustomer = customerRepository.save(customer);
            customerId = savedCustomer.getId();
        }

        String token = tokenProvider.generateTokenFromUsername(savedUser.getUsername());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .customerId(customerId)
                .build();
    }

    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new BadRequestException("No authenticated user in context");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
