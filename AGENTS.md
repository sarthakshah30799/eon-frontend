# Coding Rules — eon-frontend

## Data Fetching

- Always create custom hooks for `useQuery` / `useMutation`. Never call them directly in components.
- Hook naming: `use[Feature]` (e.g. `useDashboard`, `useListBranchProfiles`).
- Place hooks in `src/pages/<feature>/hooks/` or `src/modules/<feature>/hooks/`.
- Return computed/derived state from the hook — keep components JSX-only.

## Component Structure

- One component per file. Extract nested components into separate files under `components/`.
- Page components should be thin — import from hook + compose sub-components with props.
- Reusable charts and data visualizations go in parent-level `components/` and accept data via props.

## Imports

- Use `@/` alias for src/ (e.g. `@/components/ui/button1`, `@/api/dashboard/dashboard.api`).
- Use `@heroicons/react/24/outline` for icons — never inline SVG.
- Named exports for utilities and types; default exports for page components.

## UI Components

- Use existing reusable components: `Button` from `@/components/ui/button1`, `Loader` from `@/components/ui/loader`, `CardSection`, `Table`, `Modal`, etc.
- Avoid raw `<button>` / `<table>` where reusable equivalents exist.

## State & Logic

- Keep all state logic inside custom hooks (useState, useMemo, useCallback).
- Component files only call hooks and render JSX — no data transformations.
- Formatting utilities can be exported from hook files and imported directly.

## Session Dumps

- Branch session dumps go in `.opencode/session-<branch>.md`.
- **Never commit, push, or stage session dumps.** They are local reference only.

## Git

- Do not push, commit, or execute git commands directly. Only output the commands for the user to run.
