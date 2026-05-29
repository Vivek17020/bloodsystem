package com.bloodmanagement.service;

import com.bloodmanagement.dto.JwtResponse;
import com.bloodmanagement.dto.LoginRequest;
import com.bloodmanagement.dto.RegisterRequest;
import com.bloodmanagement.entity.BloodType;
import com.bloodmanagement.entity.Donor;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.exception.BadRequestException;
import com.bloodmanagement.repository.DonorRepository;
import com.bloodmanagement.repository.UserRepository;
import com.bloodmanagement.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication service — handles login and registration.
 */
@Service
public class AuthService {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private DonorRepository donorRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        return new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phone(request.getPhone())
            .role(request.getRole() != null ? request.getRole() : User.Role.DONOR)
            .build();

        userRepository.save(user);

        // Auto-create donor profile if role is DONOR
        if (user.getRole() == User.Role.DONOR && request.getBloodType() != null) {
            Donor donor = Donor.builder()
                .user(user)
                .bloodType(BloodType.fromDisplayName(request.getBloodType()))
                .status(Donor.DonorStatus.ACTIVE)
                .eligible(true)
                .totalDonations(0)
                .build();
            donorRepository.save(donor);
        }
    }

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Current user not found"));
    }
}
