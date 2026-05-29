-- Blood Management System — MySQL Schema
-- Run this once to create the database and tables.
-- Spring Boot's spring.jpa.hibernate.ddl-auto=update will manage columns after initial setup.

CREATE DATABASE IF NOT EXISTS blood_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blood_management;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(120) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    first_name VARCHAR(80)  NOT NULL,
    last_name  VARCHAR(80)  NOT NULL,
    phone      VARCHAR(20),
    role       ENUM('ADMIN','DONOR','HOSPITAL','BLOOD_BANK') NOT NULL DEFAULT 'DONOR',
    enabled    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Donors
CREATE TABLE IF NOT EXISTS donors (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id            BIGINT NOT NULL UNIQUE,
    blood_type         ENUM('A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE') NOT NULL,
    date_of_birth      DATE,
    gender             VARCHAR(10),
    address            VARCHAR(255),
    city               VARCHAR(100),
    weight             DOUBLE,
    eligible           BOOLEAN NOT NULL DEFAULT TRUE,
    last_donation_date DATE,
    next_eligible_date DATE,
    total_donations    INT NOT NULL DEFAULT 0,
    status             ENUM('ACTIVE','INACTIVE','DEFERRED','BANNED') NOT NULL DEFAULT 'ACTIVE',
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blood Banks
CREATE TABLE IF NOT EXISTS blood_banks (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT NOT NULL UNIQUE,
    name             VARCHAR(150) NOT NULL,
    address          VARCHAR(255),
    city             VARCHAR(100),
    phone            VARCHAR(20),
    email            VARCHAR(120),
    license_number   VARCHAR(50),
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT NOT NULL UNIQUE,
    name                 VARCHAR(150) NOT NULL,
    address              VARCHAR(255),
    city                 VARCHAR(100),
    phone                VARCHAR(20),
    email                VARCHAR(120),
    registration_number  VARCHAR(50),
    active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blood Inventory
CREATE TABLE IF NOT EXISTS blood_inventory (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    blood_type      ENUM('A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE') NOT NULL,
    units           INT NOT NULL,
    collection_date DATE NOT NULL,
    expiry_date     DATE NOT NULL,
    status          ENUM('AVAILABLE','RESERVED','EXPIRED','USED','DISCARDED') NOT NULL DEFAULT 'AVAILABLE',
    blood_bank_id   BIGINT NOT NULL,
    donor_id        BIGINT,
    notes           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id),
    FOREIGN KEY (donor_id)      REFERENCES donors(id),
    INDEX idx_blood_type (blood_type),
    INDEX idx_status (status),
    INDEX idx_expiry (expiry_date)
);

-- Blood Requests
CREATE TABLE IF NOT EXISTS blood_requests (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id     BIGINT NOT NULL,
    blood_type       ENUM('A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE') NOT NULL,
    units            INT NOT NULL,
    urgency          ENUM('NORMAL','URGENT','CRITICAL') NOT NULL DEFAULT 'NORMAL',
    status           ENUM('PENDING','APPROVED','REJECTED','FULFILLED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    reason           TEXT NOT NULL,
    patient_name     VARCHAR(150),
    contact_phone    VARCHAR(20),
    required_by_date DATE NOT NULL,
    approved_date    DATETIME,
    approved_by_id   BIGINT,
    notes            TEXT,
    request_date     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id)   REFERENCES users(id),
    FOREIGN KEY (approved_by_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_urgency (urgency)
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id        BIGINT NOT NULL,
    blood_bank_id   BIGINT NOT NULL,
    scheduled_date  DATE NOT NULL,
    scheduled_time  TIME NOT NULL,
    status          ENUM('SCHEDULED','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    notes           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id)      REFERENCES donors(id),
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id),
    INDEX idx_scheduled_date (scheduled_date)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    title               VARCHAR(200) NOT NULL,
    message             TEXT NOT NULL,
    type                ENUM('INFO','WARNING','CRITICAL','SUCCESS','EXPIRY_ALERT','LOW_STOCK','REQUEST_APPROVED','REQUEST_REJECTED','APPOINTMENT_REMINDER') NOT NULL DEFAULT 'INFO',
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_id   BIGINT,
    related_entity_type VARCHAR(50),
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
);
