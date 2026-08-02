# Contributing to Workforce Automation Portal (WAP)

Thank you for your interest in contributing to **WAP**! We welcome contributions, bug fixes, and feature enhancements.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/WAP.git
   cd WAP
   ```
3. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/my-new-feature
   ```

## Development Workflow

### Backend (Spring Boot 3 / Java 17)
```bash
cd WAP-Backend
./mvnw clean compile
./mvnw test
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
npm run build
```

## Commit Guidelines
- Use descriptive commit messages following the Conventional Commits specification:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation updates
  - `refactor:` for code restructuring without behavioral changes
  - `style:` for styling or formatting changes

## Submitting Pull Requests
1. Push your branch to GitHub:
   ```bash
   git push origin feature/my-new-feature
   ```
2. Open a Pull Request against the `main` branch.
3. Provide a clear description of the problem solved and changes made.
