-- Razorpay Payments Table
-- Add to blood_management database (or run manually — Hibernate will create it via ddl-auto=update)

USE blood_management;

CREATE TABLE IF NOT EXISTS payments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    order_id    VARCHAR(100) NOT NULL UNIQUE COMMENT 'Razorpay order ID (order_XXXXXX)',
    payment_id  VARCHAR(100)          COMMENT 'Razorpay payment ID — populated after verification',
    signature   VARCHAR(255)          COMMENT 'HMAC-SHA256 signature — verified on backend',
    amount      BIGINT NOT NULL       COMMENT 'Amount in paise (1 INR = 100 paise)',
    currency    CHAR(3) NOT NULL DEFAULT 'INR',
    purpose     VARCHAR(200) NOT NULL,
    status      ENUM('CREATED','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'CREATED',
    notes       TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
