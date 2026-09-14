# System Architecture

## Target Architecture

The AI-Based Student Mentoring & Growth Platform operates strictly as a web platform. The architecture emphasizes strict separation of concerns, data privacy, and a layered AI implementation that avoids high-stakes autonomous decision-making in favor of a "Human-in-the-Loop" ecosystem.

### Frontend
- **Framework:** Next.js (App Router, primarily utilizing Server Components).
- **Routing:** Next.js App Router for role-based structural routing (Student, Mentor, Admin dashboards).
- **State Management:** React state + TanStack Query for remote data synchronization.
- **Component Architecture:** Modular, reusable components built with shadcn/ui.
- **Styling:** Tailwind CSS with a strict 8px spacing system and predefined Light/Dark HEX color scales.
- **Validation:** Zod (shared with backend where possible) and React Hook Form.
- **API Communication:** Fetch API / TanStack Query mapped to the Node.js backend.

### Backend
- **Core:** Node.js, Express, TypeScript.
- **Modules:** Domain-driven modular design (e.g., Auth, Users, Academics, AI).
- **Flow:** Route Handlers → Controllers → Services → Repositories → PostgreSQL.
- **Validation:** Zod for runtime DTO validation.
- **Middleware:** RBAC authorization, secure session cookies, rate limiting.

### Database
- **Engine:** PostgreSQL 16 (via Docker).
- **Connection:** `node-postgres` (`pg`) with connection pooling.
- **Data Access:** Pure parameterized SQL within the Repository layer. **Strictly NO ORMs.**
- **Migration Strategy:** `node-pg-migrate` for SQL-based schema evolution.
- **Transaction Strategy:** Database transactions managed strictly within the Service layer wrapping Repository calls.

### AI Architecture
- **Philosophy:** AI acts as an Academic Mentor, not a generic chatbot. Explains, analyzes, and recommends, but relies on Human Mentors for final authority.
- **Data Flow:** Student Request → AuthZ → Intent Detection → Context Builder → LLM/RAG → Output Validation.
- **Context Engine:** Assembles strictly authorized, timestamped data (grades, attendance, tasks).
- **RAG Engine:** PostgreSQL + `pgvector`. Documents are chunked, embedded, and stored with version and metadata tracing to prevent prompt injection and hallucination.
- **Intelligence Layers:** Deterministic Rules → Statistics → Machine Learning → Recommendations → LLM → RAG.
- **Risk Engine:** Multi-dimensional (Academic, Attendance, Engagement, Workload) explainable risk scores.

### Security
- **Authentication:** Email/Password (Argon2id hashing, OTP) and Google OAuth 2.0.
- **Authorization:** Server-side RBAC (STUDENT, MENTOR, ADMIN).
- **Sessions:** HttpOnly, Secure, SameSite cookies.
- **API Security:** CORS, Rate limiting, parameter validation, no exposed stack traces.
- **Data Privacy:** Principle of least privilege. Strict data isolation per role.
