package com.bloodmanagement.service;

import com.bloodmanagement.entity.Payment;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.exception.BadRequestException;
import com.bloodmanagement.exception.ResourceNotFoundException;
// BadRequestException and ResourceNotFoundException are handled by GlobalExceptionHandler
import com.bloodmanagement.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Razorpay payment service — order creation and signature verification.
 *
 * NOTE: Replace the placeholder key/secret in application.properties with your actual
 * Razorpay API credentials before running. Use test credentials for development.
 */
@Service
public class RazorpayService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayService.class);

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final PaymentRepository paymentRepository;

    public RazorpayService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Creates a Razorpay order via the REST API and saves a local record.
     * Amount is in the smallest currency unit (paise for INR).
     */
    @Transactional
    public Map<String, Object> createOrder(long amount, String currency, String purpose, User user) {
        try {
            // Call Razorpay Orders API
            String orderId = callRazorpayCreateOrder(amount, currency, purpose);

            // Persist to database
            Payment payment = Payment.builder()
                .user(user)
                .orderId(orderId)
                .amount(amount)
                .currency(currency)
                .purpose(purpose)
                .status(Payment.PaymentStatus.CREATED)
                .build();
            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("id",       orderId);
            response.put("amount",   amount);
            response.put("currency", currency);
            response.put("receipt",  "rcpt_" + System.currentTimeMillis());
            response.put("status",   "created");
            return response;

        } catch (Exception e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage());
            throw new BadRequestException("Could not create payment order: " + e.getMessage());
        }
    }

    /**
     * Verifies the Razorpay payment signature and marks the payment as SUCCESS.
     * Signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)
     */
    @Transactional
    public Map<String, Object> verifyPayment(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            String expectedSig = hmacSha256(payload, keySecret);

            if (!expectedSig.equals(signature)) {
                log.warn("Signature mismatch for order {}", orderId);
                throw new BadRequestException("Payment signature verification failed.");
            }

            Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found: " + orderId));

            payment.setPaymentId(paymentId);
            payment.setSignature(signature);
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            log.info("Payment {} verified successfully for order {}", paymentId, orderId);
            return Map.of("success", true, "message", "Payment verified successfully.");

        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error verifying payment: {}", e.getMessage());
            throw new BadRequestException("Payment verification error: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getPaymentHistory(User user) {
        return paymentRepository.findByUserOrderByCreatedAtDesc(user).stream()
            .map(p -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id",        p.getId());
                m.put("orderId",   p.getOrderId());
                m.put("paymentId", p.getPaymentId());
                m.put("amount",    p.getAmount());
                m.put("currency",  p.getCurrency());
                m.put("status",    p.getStatus().name());
                m.put("purpose",   p.getPurpose());
                m.put("createdAt", p.getCreatedAt());
                return m;
            })
            .collect(Collectors.toList());
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Calls Razorpay Orders API via plain HTTPS (no SDK dependency).
     * Returns the Razorpay order ID (e.g. "order_XXXXXXXXXXXXXXXX").
     */
    private String callRazorpayCreateOrder(long amount, String currency, String receipt) throws Exception {
        java.net.URL url = new java.net.URL("https://api.razorpay.com/v1/orders");
        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setRequestProperty("Content-Type", "application/json");

        // Basic Auth: key_id:key_secret encoded as Base64
        String credentials = keyId + ":" + keySecret;
        String encoded = java.util.Base64.getEncoder().encodeToString(
            credentials.getBytes(StandardCharsets.UTF_8));
        conn.setRequestProperty("Authorization", "Basic " + encoded);

        String body = String.format(
            "{\"amount\":%d,\"currency\":\"%s\",\"receipt\":\"%s\"}",
            amount, currency, receipt
        );
        try (java.io.OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes(StandardCharsets.UTF_8));
        }

        int statusCode = conn.getResponseCode();
        if (statusCode != 200) {
            throw new RuntimeException("Razorpay API returned status " + statusCode);
        }

        try (java.io.BufferedReader br = new java.io.BufferedReader(
            new java.io.InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            // Parse the "id" field from JSON response
            String json = sb.toString();
            int start = json.indexOf("\"id\":\"") + 6;
            int end = json.indexOf("\"", start);
            return json.substring(start, end);
        }
    }

    private String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
