package com.bloodmanagement.controller;

import com.bloodmanagement.service.AuthService;
import com.bloodmanagement.service.RazorpayService;
// AuthService.getCurrentUser() resolves the JWT principal to a User entity
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Payment REST controller — Razorpay order creation, verification, and history.
 *
 * All endpoints are JWT-protected. The token is validated by AuthTokenFilter
 * before any method is invoked.
 */
@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired private RazorpayService razorpayService;
    @Autowired private AuthService authService;

    /**
     * POST /api/payments/create-order
     * Creates a Razorpay order and returns the order object to the frontend.
     * The frontend uses this to open the Razorpay checkout dialog.
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
        @RequestBody CreateOrderRequest request) {

        Map<String, Object> order = razorpayService.createOrder(
            request.amount(),
            request.currency() != null ? request.currency() : "INR",
            request.purpose(),
            authService.getCurrentUser()
        );
        return ResponseEntity.ok(order);
    }

    /**
     * POST /api/payments/verify
     * Verifies the Razorpay signature after successful checkout.
     * Must be called immediately after the frontend receives payment confirmation.
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(
        @RequestBody VerifyRequest request) {

        Map<String, Object> result = razorpayService.verifyPayment(
            request.razorpayOrderId(),
            request.razorpayPaymentId(),
            request.razorpaySignature()
        );
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/payments/history
     * Returns the JWT-authenticated user's payment history.
     */
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory() {
        return ResponseEntity.ok(razorpayService.getPaymentHistory(authService.getCurrentUser()));
    }

    // ── Request record types ─────────────────────────────────────────────────

    public record CreateOrderRequest(
        @Min(1) long amount,
        String currency,
        @NotBlank String purpose
    ) {}

    public record VerifyRequest(
        @NotBlank String razorpayOrderId,
        @NotBlank String razorpayPaymentId,
        @NotBlank String razorpaySignature
    ) {}
}
