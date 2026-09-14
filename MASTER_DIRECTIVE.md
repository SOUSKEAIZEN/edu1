# AI-BASED STUDENT MENTORING & GROWTH PLATFORM
## MASTER ENGINEERING DIRECTIVE — WEB PLATFORM ONLY

### 1. WEB ONLY
- No native mobile apps (Android/iOS/React Native/Expo).
- Fully responsive web application.

### 2. TECHNOLOGY STACK
**Frontend:** Next.js, React, TypeScript, App Router, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Recharts/ECharts, Lucide icons, Framer Motion. Prefer Server Components.
**Backend:** Node.js, TypeScript, Express.js. Modular architecture (Routes -> Controllers -> Services -> Repositories -> PostgreSQL). Separate AI layer.

### 3. DATABASE
- PostgreSQL (using `pg`, pooling, parameterized SQL, transactions, migrations).
- ABSOLUTELY NO ORM (Prisma, Sequelize, TypeORM, etc.).
- Real educational domain design (Institution -> Department -> Program -> Year/Semester -> Course -> Enrollment -> Assessment -> Result).

### 4. AUTHENTICATION & ROLES
- Google OAuth 2.0, Email/Password (Argon2id, OTP, secure server-managed cookies).
- RBAC with STUDENT, MENTOR, ADMIN roles. Server-side authorization.

### 5. AI & ML PHILOSOPHY
- AI is an Academic Mentor, not a generic chatbot.
- Context is structured, authorized, and limited to necessary data.
- Layered intelligence: Rules -> Statistics -> ML (future) -> Recommendation -> LLM -> RAG.
- RAG using PostgreSQL + pgvector.

### 6. HUMAN-IN-THE-LOOP & RISK
- Human mentors retain decision authority.
- Risk engine is multi-dimensional and explainable.
- Interventions are tracked and measured.

### 7. SECURITY & PRIVACY
- Data minimization, secure sessions, rate limiting, RBAC, parameterized SQL.
- Students access own data; Mentors access assigned students.

### 8. DESIGN SYSTEM
- Typography: Inter (Primary), Geist/Plus Jakarta Sans (Optional).
- Light/Dark theme with specific hex codes.
- 8px spacing system. WCAG accessibility.
- Premium, intelligent, calm, trustworthy feel.

### 9. DEVELOPMENT RULE
- Inspect -> Plan -> Implement -> Test -> Verify -> Document.
- No massive parallel rewrites. Small focused modules. Strict TypeScript.
