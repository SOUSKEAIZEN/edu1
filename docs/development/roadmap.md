# Development Roadmap

## Phase 0: Audit & Architecture (Completed)
- Initialize Git repository and `.gitignore`.
- Scaffold Next.js frontend and Express backend.
- Establish baseline configuration (Tailwind, TypeScript, ESLint).
- Produce architecture documentation.

## Phase 1: Core Database & Data Access
- Establish PostgreSQL schemas for educational hierarchy (Institutions, Departments, Programs, Terms, Courses).
- Establish User and Role schemas.
- Write raw SQL migrations using `node-pg-migrate`.
- Implement baseline Repository pattern using `pg`.

## Phase 2: Authentication & Security
- Implement Email/Password authentication using Argon2id.
- Implement Google OAuth 2.0.
- Setup secure HttpOnly sessions.
- Implement RBAC middleware for API endpoints.

## Phase 3: Core Domain APIs
- Build Controllers and Services for academic data management (Enrollments, Assessments, Results).
- Build Controllers and Services for user management.

## Phase 4: Frontend Foundations & Shell
- Implement dashboard layouts for Student, Mentor, and Admin roles.
- Integrate shadcn/ui components adhering to the design system (8px spacing, typography).
- Connect frontend to authentication APIs.

## Phase 5: RAG & AI Infrastructure
- Setup `pgvector`.
- Build the document upload, chunking, and embedding pipeline.
- Implement the AI Context Builder and LLM Controller.

## Phase 6: Intelligence & Intervention Tracking
- Build the explainable multi-dimensional Risk Engine.
- Implement the Human-in-the-Loop intervention tracker.
- Build the AI Mentor chat interface on the frontend.

## Phase 7: Polish, Observability & Launch
- Implement structured logging and metrics.
- Comprehensive UI/UX review.
- Security and performance audits.
