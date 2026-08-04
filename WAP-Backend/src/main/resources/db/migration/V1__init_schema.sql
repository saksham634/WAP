-- =============================================================================
-- Workforce Automation Portal (WAP) - Initial Database Schema (Flyway V1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL UNIQUE,
    domain VARCHAR(100),
    phone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    permissions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    date_of_joining DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    permissions TEXT,
    profile_picture LONGTEXT,
    base_salary DOUBLE DEFAULT 0.0,
    allowances DOUBLE DEFAULT 0.0,
    deductions DOUBLE DEFAULT 0.0,
    role_id BIGINT NOT NULL,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_org FOREIGN KEY (organization_id) REFERENCES organizations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_users (
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_pu_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_pu_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    record_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_attendance_user_date UNIQUE (user_id, record_date),
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payroll (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pay_month INT NOT NULL,
    pay_year INT NOT NULL,
    base_salary DOUBLE NOT NULL,
    allowances DOUBLE DEFAULT 0.0,
    present_days INT NOT NULL,
    deductions DOUBLE NOT NULL,
    net_salary DOUBLE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    version BIGINT DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_payroll_user_month_year UNIQUE (user_id, pay_month, pay_year),
    CONSTRAINT fk_payroll_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS direct_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    organization_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dm_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_dm_recipient FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_dm_org FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    organization_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    ip_address VARCHAR(45),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
