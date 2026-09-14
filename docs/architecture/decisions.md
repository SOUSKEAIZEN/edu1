# Architecture Decisions (ADR)

## 1. Web-Only Platform
**Decision:** Do not build native mobile applications (Android/iOS) or use React Native/Expo.
**Reason:** Focus all engineering effort on delivering a highly stable, responsive web application. Mobile native apps are deferred to a future phase.

## 2. No ORM (Object-Relational Mapping)
**Decision:** All database interactions must use parameterized SQL via `node-postgres` (`pg`). Prisma, TypeORM, Sequelize, etc., are strictly forbidden.
**Reason:** To maintain absolute control over query performance, ensure architectural transparency, and align with the principle that the database represents the real educational domain without ORM-induced abstractions.

## 3. Layered AI Architecture
**Decision:** Implement AI intelligence sequentially starting from Deterministic Rules and Statistics, moving up to LLMs and RAG.
**Reason:** Ensures explainability and reliability. LLMs are not used for tasks that simple statistics or rules can solve deterministically.

## 4. Human-in-the-Loop Interventions
**Decision:** The AI recommends and detects, but Human Mentors retain final decision-making authority.
**Reason:** Prevents autonomous high-stakes mistakes, maintains accountability, and adheres to ethical AI integration in education.

## 5. Structured Context over Raw Dumps
**Decision:** The AI Context Builder must pull specific, scoped, and authorized data slices rather than dumping the whole database into the prompt.
**Reason:** Data privacy, token efficiency, and hallucination reduction.

## 6. Monodirectory Structure
**Decision:** The project is organized into `/frontend` and `/backend` directories within a single Git repository without complex monorepo tooling (like Turborepo) at this initial stage.
**Reason:** Keeps the build and deployment processes simple while strictly separating the Node.js API from the Next.js frontend.
