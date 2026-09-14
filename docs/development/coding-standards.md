# Coding Standards

## General Rule
**Never implement multiple huge systems simultaneously.**
Inspect -> Plan -> Implement -> Test -> Verify -> Document.

## TypeScript
- Strict mode is mandatory (`"strict": true`).
- No use of `any` type unless absolutely necessary and documented.
- Define explicit interfaces and types for API contracts.

## Backend (Node.js/Express)
- **Modularity:** Keep files small and focused. 
- **Separation of Concerns:** 
  - Routes handle HTTP mapping.
  - Controllers handle request/response parsing.
  - Services contain business logic.
  - Repositories contain SQL queries.
- **SQL Execution:** ALL SQL MUST be in the repository layer using parameterized queries. No SQL in services or controllers. No duplicated SQL.
- **Error Handling:** Centralized error handling middleware. Never expose internal stack traces to the client.
- **Secrets:** Hardcoded credentials are strictly forbidden. Use environment variables.

## Frontend (Next.js)
- **Component Design:** Prioritize Server Components. Only use Client Components (`"use client"`) when interactivity, hooks, or browser APIs are required.
- **Styling:** Use Tailwind CSS utility classes strictly following the configured color variables and 8px spacing system.
- **No Duplication:** Avoid duplicated UI elements; extract them into reusable components.
- **Accessibility:** Maintain WCAG compliance (keyboard navigation, ARIA labels, semantic HTML).

## Design System
- **Spacing:** Use 4, 8, 16, 24, 32, 40, 48, 64 pixel increments.
- **Component States:** Ensure every component handles default, hover, active, focus, disabled, loading, error, and success states.

## Testing & Verification
- Test all major modules before moving to the next feature.
- Compile TypeScript (`tsc`) and run linting regularly.
