# Security Policy & Architecture Guidelines

## Supported Versions

| Version | Supported          |
| :--- | :---: |
| 1.0.x | :white_check_mark: |

---

## Security Architecture & Built-in Controls

The Workforce Automation Portal (WAP) incorporates enterprise-grade security controls:

1. **Password Hashing & Storage**:
   - Industry-standard **BCrypt** with 10 salt rounds (`BCryptPasswordEncoder(10)`).
   - Raw passwords are never persisted or logged in plain text.

2. **Dual-Token Authentication Architecture**:
   - **Access Tokens**: Short-lived (15 minutes) HMAC-SHA256 signed JSON Web Tokens (JWT) for stateless authorization.
   - **Refresh Tokens**: Cryptographically random UUIDs stored in the database with a 7-day expiration, single-use rotation on refresh, and user-wide revocation on logout or account deletion.

3. **Brute-Force & Denial-of-Service Protection (Rate Limiting)**:
   - Auth endpoints (`/api/auth/**`) are protected by an in-memory token bucket rate limiter restricting requests to **10 requests per minute per IP address**.
   - Violating requests receive HTTP `429 Too Many Requests` with a `Retry-After: 60` response header.

4. **Input Validation & Injection Defense**:
   - All input DTOs are validated using Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`, `@Min`).
   - Database queries utilize Spring Data JPA / Hibernate parameterized queries, safeguarding against SQL injection.

5. **Cross-Origin Resource Sharing (CORS)**:
   - Configurable allowed origins via application properties (`app.cors.allowed-origins`).
   - Restricts unapproved origins from reading sensitive response headers or payloads.

6. **Global Exception Handling & Error Privacy**:
   - Centralized `@RestControllerAdvice` prevents stack traces or database schema internals from leaking to API consumers.

---

## Reporting a Vulnerability

We take the security of **Workforce Automation Portal (WAP)** seriously. If you discover a security vulnerability, please do **NOT** open a public issue.

Please report vulnerabilities privately to the project maintainers with:
- Type of issue (e.g., Auth bypass, SQL injection, Privilege escalation)
- Source file paths and line references
- Step-by-step reproduction instructions or PoC
- Impact assessment and suggested mitigations
