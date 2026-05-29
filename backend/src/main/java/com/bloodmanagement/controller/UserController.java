package com.bloodmanagement.controller;

import com.bloodmanagement.dto.RegisterRequest;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.exception.ResourceNotFoundException;
import com.bloodmanagement.repository.UserRepository;
import com.bloodmanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * User management REST controller — admin CRUD for system users.
 * All endpoints require ADMIN role except /me (any authenticated user).
 */
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private AuthService authService;
    @Autowired private PasswordEncoder passwordEncoder;

    /** GET /api/users — list all users */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
            .map(this::toSummary)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /** GET /api/users/{id} */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return ResponseEntity.ok(toSummary(user));
    }

    /** GET /api/users/me — current authenticated user's profile */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        return ResponseEntity.ok(toSummary(authService.getCurrentUser()));
    }

    /** POST /api/users — admin creates a new user */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> create(@RequestBody RegisterRequest request) {
        authService.register(request);
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED).body(toSummary(user));
    }

    /** PUT /api/users/{id}/activate — enable a user account */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> activate(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setEnabled(true);
        return ResponseEntity.ok(toSummary(userRepository.save(user)));
    }

    /** PUT /api/users/{id}/deactivate — disable a user account */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deactivate(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (user.getRole() == User.Role.ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot deactivate an admin account."));
        }
        user.setEnabled(false);
        return ResponseEntity.ok(toSummary(userRepository.save(user)));
    }

    /** PUT /api/users/{id}/role — change a user's role */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> changeRole(@PathVariable Long id,
                                                          @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setRole(User.Role.valueOf(body.get("role")));
        return ResponseEntity.ok(toSummary(userRepository.save(user)));
    }

    /** PUT /api/users/{id}/password — admin resets a user's password */
    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long id,
                                                             @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setPassword(passwordEncoder.encode(body.get("newPassword")));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }

    /** DELETE /api/users/{id} */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (user.getRole() == User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toSummary(User u) {
        return Map.of(
            "id",        u.getId(),
            "username",  u.getUsername(),
            "email",     u.getEmail(),
            "firstName", u.getFirstName(),
            "lastName",  u.getLastName(),
            "phone",     u.getPhone() != null ? u.getPhone() : "",
            "role",      u.getRole().name(),
            "enabled",   u.isEnabled(),
            "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
        );
    }
}
