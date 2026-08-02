# Workforce Automation Portal (WAP)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Workforce Automation Portal (WAP)** is an enterprise-ready, multi-tenant workforce and human resource management platform. Designed for modern organizations, WAP unifies employee administration, time & attendance tracking, leave approvals, payroll computation, project management, and inter-departmental direct messaging into a cohesive, secure, and responsive web application.

---

## 🌟 Key Highlights & Role Features

### 👑 1. System Administration (`ROLE_ADMIN`)
- **Real-Time Analytics Dashboard**: Organization-wide metrics including workforce headcount, live attendance distribution, leave requests, and department breakdowns.
- **Dynamic Roles & Feature Permissions Matrix**: Fine-grained access control to toggle and enforce module privileges across HR and Employee tiers in real-time.
- **Staff & User Directory**: Create, update, activate, or suspend employee records with automated email credential dispatch.
- **Company & System Preferences**: Configurable organization name, timezone (IST/EST/GMT), standard shift hours, and security configurations with persistent storage.
- **Audit Logging**: Comprehensive traceability of security-sensitive administrative actions.

### 💼 2. HR Management (`ROLE_HR`)
- **Employee Lifecycle Directory**: Departmental roster, designations, contact management, and status updates.
- **Attendance Monitoring**: Organization-wide daily attendance logs, punctuality tracking, and exportable records.
- **Leave Request Processing**: Real-time review, approval, or rejection of time-off submissions with automated balance adjustments.
- **Payroll Processing**: Automated monthly payroll generation, salary structure calculation (Basic, HRA, Allowances, PF, Tax, Deductions), and payslip generation.
- **Project Allocation**: Track company initiatives, project milestones, priorities, and assigned team members.

### 👤 3. Standard Employee (`ROLE_EMPLOYEE`)
- **Self-Service Dashboard**: Personal attendance metrics, upcoming leaves, current project workload, and direct company announcements.
- **Time & Attendance Tracking**: One-click check-in / check-out with automatic total work duration calculation.
- **Leave Management**: Submit leave applications (Casual, Sick, Annual), monitor approval status, and track real-time leave balances.
- **Salary & Payslips**: Transparent salary slip view with detailed earnings and deductions breakdown.
- **Personal Information**: Self-service profile management, contact details, and secure password updates.

### 📬 4. Cross-Organization Direct Messaging
- Role-based internal messaging system allowing real-time communication between Admin, HR, and Employees.
- Send specific direct requests, HR inquiries, feedback, or broadcast organization announcements.

---

## 🏗️ Architecture & Project Structure

```
WAP/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated GitHub Actions CI pipeline
├── WAP-Backend/                   # Spring Boot 3 Backend Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/wap/
│   │   │   │   ├── controller/    # REST API endpoints
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── entity/        # JPA Database Entities
│   │   │   │   ├── repository/    # Spring Data JPA Repositories
│   │   │   │   ├── security/      # JWT filter & Spring Security config
│   │   │   │   ├── service/       # Business logic layer
│   │   │   │   └── util/          # Permission & helper utilities
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application.properties.example
│   │   └── test/                  # Backend Unit and Integration tests
│   ├── pom.xml                    # Maven dependencies & build definitions
│   └── mvnw / mvnw.cmd            # Maven Wrapper scripts
├── frontend/                      # React 19 + Vite Frontend SPA
│   ├── public/                    # Static assets & icons
│   ├── src/
│   │   ├── api/                   # Centralized Axios/fetch API layer
│   │   ├── assets/                # Images & styles
│   │   ├── components/            # Reusable UI components (Sidebar, Header, Layout)
│   │   ├── context/               # React Context (Auth, Sidebar)
│   │   ├── pages/                 # Role-based pages (Admin, HR, Employee, Auth)
│   │   ├── routes/                # Protected routes & permission guards
│   │   ├── styles/                # Global CSS design tokens & utilities
│   │   ├── App.jsx                # Main Application component
│   │   └── main.jsx               # Application entry point
│   ├── package.json               # Frontend dependencies & scripts
│   └── vite.config.js             # Vite configuration & proxy settings
├── wap_db.sql                     # Database schema & initial roles seed
├── .env.example                   # Environment configuration template
├── .gitignore                     # Repository git ignore rules
├── CONTRIBUTING.md                # Contribution guidelines
├── LICENSE                        # MIT License
├── README.md                      # Project documentation
└── SECURITY.md                    # Security policy & reporting guidelines
```

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have the following installed on your development machine:
- **Java JDK 17+**
- **Node.js 18+** and **npm**
- **MySQL Server 8.0+**
- **Git**

---

### Step 1: Database Setup
1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or CLI).
2. Execute the initial schema and seed script:
   ```sql
   source /path/to/WAP/wap_db.sql;
   ```
   *(Or copy-paste the queries inside `wap_db.sql` into your MySQL client)*.

---

### Step 2: Configure Environment Variables
1. Create a copy of the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Set your MySQL database credentials and optional SMTP mail settings in `.env` or in `WAP-Backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/wap_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```

---

### Step 3: Run the Spring Boot Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd WAP-Backend
   ```
2. Build and start the backend service:
   - **Windows**:
     ```cmd
     .\mvnw.cmd spring-boot:run
     ```
   - **macOS / Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```
3. The backend API will be live at `http://localhost:8080`.

---

### Step 4: Run the React Frontend
1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **`http://localhost:5173`**.

---

## 🔒 Security & Confidentiality

- **Secrets Management**: No private API keys, SMTP credentials, or database passwords are hardcoded in the codebase. All sensitive values use environment variable placeholders (`${DB_PASSWORD}`, `${MAIL_PASSWORD}`).
- **JWT Authentication**: Secure stateless token-based authorization with role and permission evaluation on both client and server.
- **Route Guards**: Client routes are protected with `<ProtectedRoute>` requiring valid authenticated sessions and verified role permissions.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
