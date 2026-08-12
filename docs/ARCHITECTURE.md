# Workforce Automation Portal (WAP) — Architecture & System Design

This document describes the high-level system architecture, authentication & token rotation lifecycle, security model, and role-based access control (RBAC) implementation for the Workforce Automation Portal.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Frontend)"]
        Browser["Web Browser (Chrome, Safari, Firefox, Edge)"]
        SPA["React 19 + Vite Single Page Application<br/>(TailwindCSS Design System, Lucide Icons)"]
        Browser --> SPA
    end

    subgraph GatewayLayer ["Reverse Proxy & SSL/TLS Gateway"]
        Nginx["Nginx Reverse Proxy<br/>- HTTPS (TLS 1.3)<br/>- Gzip Compression<br/>- Security Headers (HSTS, CSP, XFO)<br/>- Static Asset Serving"]
    end

    subgraph SecurityLayer ["Security & Protection Filters"]
        RateLimiter["RateLimitingFilter<br/>(Token Bucket: 10 req/min/IP on /api/auth/**)"]
        CorsFilter["CorsConfigurationSource<br/>(Configurable Allowed Origins)"]
        JwtFilter["JwtAuthenticationFilter<br/>(Stateless Bearer JWT Validation)"]
    end

    subgraph BackendLayer ["Backend Application (Spring Boot 3.3.x)"]
        Controllers["Spring REST Controllers<br/>- AuthController<br/>- AdminController<br/>- AttendanceController<br/>- LeaveController<br/>- PayrollController<br/>- ProjectController<br/>- DirectMessageController"]
        OpenAPI["SpringDoc OpenAPI / Swagger 3.0 UI<br/>(/swagger-ui.html)"]
        GlobalEx["GlobalExceptionHandler<br/>(@RestControllerAdvice)"]
        Validation["Jakarta Bean Validation (@Valid)"]
        
        Services["Service Layer (Transactional Business Logic)<br/>- AuthService & RefreshTokenService<br/>- AdminService & AuditLog<br/>- AttendanceService<br/>- LeaveService<br/>- PayrollService<br/>- ProjectService<br/>- DirectMessageService<br/>- OtpService (SMTP Mail)"]
        
        Repositories["Spring Data JPA Repositories<br/>- UserRepository<br/>- RefreshTokenRepository<br/>- OrganizationRepository<br/>- AttendanceRepository<br/>- LeaveRequestRepository<br/>- PayrollRepository<br/>- ProjectRepository<br/>- DirectMessageRepository"]
    end

    subgraph DataLayer ["Persistence & External Services"]
        MySQL[("MySQL 8.0+ Enterprise Database<br/>- InnoDB Storage Engine<br/>- UTF8MB4 Encoding<br/>- Foreign Key Cascades & Indexes")]
        SMTP["SMTP Mail Server (Gmail / SendGrid)"]
    end

    SPA -->|HTTPS / REST API Requests| Nginx
    Nginx -->|Proxy Pass :8080| RateLimiter
    RateLimiter --> CorsFilter
    CorsFilter --> JwtFilter
    JwtFilter --> Validation
    Validation --> Controllers
    Controllers --> OpenAPI
    Controllers --> Services
    Services --> Repositories
    Services --> SMTP
    Repositories --> MySQL
    GlobalEx -.->|Intercepts Exceptions & Formats JSON| Controllers
```

---

## 2. Authentication & Token Rotation Flow

WAP implements a hardened token architecture consisting of:
- **Short-Lived JWT Access Token (15 Minutes)**: Used for stateless authorization on protected endpoints.
- **Database-Backed Rotating Refresh Token (7 Days)**: Single-use token rotated on every refresh call to prevent replay attacks.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client SPA
    participant RateLimit as RateLimitingFilter
    participant AuthCtrl as AuthController / AuthService
    participant RefreshSvc as RefreshTokenService
    participant DB as MySQL Database
    participant API as Protected Endpoints

    Note over User,AuthCtrl: Phase 1: User Authentication (Login)
    User->>RateLimit: POST /api/auth/login { email, password }
    RateLimit->>RateLimit: Check IP Token Bucket (<= 10 req/min)
    RateLimit->>AuthCtrl: Forward validated request
    AuthCtrl->>AuthCtrl: BCrypt.checkpw(password, hash)
    AuthCtrl->>RefreshSvc: createRefreshToken(userEmail)
    RefreshSvc->>DB: Invalidate old tokens & Save new RefreshToken (UUID)
    AuthCtrl-->>User: HTTP 200 { accessToken (15m), refreshToken (7d), userProfile }
    User->>User: Store accessToken & refreshToken in localStorage

    Note over User,API: Phase 2: Accessing Protected Resources
    User->>API: GET /api/admin/dashboard (Authorization: Bearer <accessToken>)
    API-->>User: HTTP 200 { dashboard metrics }

    Note over User,API: Phase 3: Silent Refresh on Expiry (After 15 mins)
    User->>API: GET /api/leave/my-leaves (Expired accessToken)
    API-->>User: HTTP 401 Unauthorized
    User->>RateLimit: POST /api/auth/refresh { refreshToken }
    RateLimit->>AuthCtrl: Forward refresh request
    AuthCtrl->>RefreshSvc: rotateRefreshToken(oldRefreshToken)
    RefreshSvc->>DB: Check expiry & delete old token
    RefreshSvc->>DB: Save new rotated RefreshToken
    AuthCtrl-->>User: HTTP 200 { new accessToken, new refreshToken }
    User->>User: Update localStorage with new token pair
    User->>API: Replay GET /api/leave/my-leaves (with new accessToken)
    API-->>User: HTTP 200 { leave records }
```

---

## 3. Role-Based Access Control (RBAC) Matrix

| Module / Endpoint | Anonymous | ROLE_EMPLOYEE | ROLE_HR | ROLE_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| **Authentication** (`/api/auth/login`, `/register-org`, `/send-otp`) | ✅ | ✅ | ✅ | ✅ |
| **Silent Refresh** (`/api/auth/refresh`) | ✅ | ✅ | ✅ | ✅ |
| **API Documentation** (`/swagger-ui.html`, `/v3/api-docs/**`) | ✅ | ✅ | ✅ | ✅ |
| **Employee Self Check-in/Out** (`/api/attendance/check-in`, `/check-out`) | ❌ | ✅ | ✅ | ✅ |
| **Leave Applications** (`/api/leave/submit`, `/my-leaves`) | ❌ | ✅ | ✅ | ✅ |
| **My Payslips** (`/api/payroll/my-payslips`) | ❌ | ✅ | ✅ | ✅ |
| **Projects Team View** (`/api/projects`, `/team-stats`) | ❌ | ✅ | ✅ | ✅ |
| **Direct Messaging** (`/api/messages/**`) | ❌ | ✅ | ✅ | ✅ |
| **HR Org Attendance** (`/api/attendance/org-today`) | ❌ | ❌ | ✅ | ✅ |
| **HR Leave Approvals / Rejections** (`/api/leave/hr/**`) | ❌ | ❌ | ✅ | ✅ |
| **HR Batch Payroll Processing** (`/api/payroll/hr/generate`) | ❌ | ❌ | ✅ | ✅ |
| **User Directory & Creation** (`/api/admin/users`) | ❌ | ❌ | ✅ | ✅ |
| **User Deletion & Cascade Clean** (`DELETE /api/admin/users/{id}`) | ❌ | ❌ | ❌ | ✅ |
| **Role & Permission Customization** (`/api/admin/roles/permissions`) | ❌ | ❌ | ❌ | ✅ |
| **Organization Settings & Timezone** (`/api/admin/settings`) | ❌ | ❌ | ❌ | ✅ |
| **System Audit Logs** (`/api/admin/audit`) | ❌ | ❌ | ❌ | ✅ |

---

## 4. Database Entity Relationships

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : contains
    ORGANIZATION ||--o{ PROJECT : owns
    USER ||--o{ REFRESH_TOKEN : owns
    USER ||--o{ ATTENDANCE : logs
    USER ||--o{ LEAVE_REQUEST : submits
    USER ||--o{ PAYROLL : receives
    USER ||--o{ DIRECT_MESSAGE : sends
    USER }o--o{ PROJECT : assigned_to
    ROLE ||--o{ USER : classifies

    ORGANIZATION {
        bigint id PK
        varchar company_name
        varchar support_email
        varchar timezone
        varchar work_hours
    }

    USER {
        bigint id PK
        bigint organization_id FK
        bigint role_id FK
        varchar employee_id UK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar status
        double base_salary
        double allowances
        double deductions
    }

    REFRESH_TOKEN {
        bigint id PK
        varchar token UK
        bigint user_id FK
        timestamp expiry_date
        boolean revoked
    }

    ATTENDANCE {
        bigint id PK
        bigint user_id FK
        date date
        time check_in
        time check_out
        varchar status
    }

    LEAVE_REQUEST {
        bigint id PK
        bigint user_id FK
        varchar leave_type
        date start_date
        date end_date
        varchar status
        varchar reason
    }

    PAYROLL {
        bigint id PK
        bigint user_id FK
        varchar month
        int year
        double net_pay
        varchar status
    }
```
