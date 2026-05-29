-- Seed data for development and testing
-- Passwords are BCrypt hashes of: admin123, donor123, hospital123, bloodbank123

INSERT IGNORE INTO users (username, email, password, first_name, last_name, role) VALUES
('admin',     'admin@bms.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'System',  'Admin',    'ADMIN'),
('donor1',    'donor1@bms.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'John',    'Doe',      'DONOR'),
('hospital1', 'hospital1@bms.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'City',    'Hospital', 'HOSPITAL'),
('bloodbank1','bloodbank1@bms.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Central', 'BloodBank','BLOOD_BANK');

INSERT IGNORE INTO donors (user_id, blood_type, eligible, total_donations, status, date_of_birth, gender, weight, city)
SELECT id, 'O_POSITIVE', TRUE, 5, 'ACTIVE', '1990-05-15', 'Male', 75.0, 'New York'
FROM users WHERE username = 'donor1';

INSERT IGNORE INTO blood_banks (user_id, name, city, phone, active)
SELECT id, 'Central Blood Bank', 'New York', '555-0100', TRUE
FROM users WHERE username = 'bloodbank1';

INSERT IGNORE INTO hospitals (user_id, name, city, phone, active)
SELECT id, 'City General Hospital', 'New York', '555-0200', TRUE
FROM users WHERE username = 'hospital1';

-- Sample inventory (run after blood_banks are created)
INSERT IGNORE INTO blood_inventory (blood_type, units, collection_date, expiry_date, status, blood_bank_id)
SELECT 'A_POSITIVE',  20, CURDATE() - INTERVAL 5 DAY, CURDATE() + INTERVAL 37 DAY, 'AVAILABLE', id FROM blood_banks WHERE name = 'Central Blood Bank';

INSERT IGNORE INTO blood_inventory (blood_type, units, collection_date, expiry_date, status, blood_bank_id)
SELECT 'B_POSITIVE',  15, CURDATE() - INTERVAL 3 DAY, CURDATE() + INTERVAL 39 DAY, 'AVAILABLE', id FROM blood_banks WHERE name = 'Central Blood Bank';

INSERT IGNORE INTO blood_inventory (blood_type, units, collection_date, expiry_date, status, blood_bank_id)
SELECT 'O_NEGATIVE',   8, CURDATE() - INTERVAL 10 DAY, CURDATE() + INTERVAL 5 DAY, 'AVAILABLE', id FROM blood_banks WHERE name = 'Central Blood Bank';

INSERT IGNORE INTO blood_inventory (blood_type, units, collection_date, expiry_date, status, blood_bank_id)
SELECT 'AB_POSITIVE',  5, CURDATE() - INTERVAL 7 DAY, CURDATE() + INTERVAL 35 DAY, 'AVAILABLE', id FROM blood_banks WHERE name = 'Central Blood Bank';
