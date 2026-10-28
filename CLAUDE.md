# Project: Skully

React 19 + TypeScript 6.x component library. Vite build system.

## Commands

- `npm run test` — run all tests with Vitest
- `npm run test -- --run src/components/Button.test.tsx` — run a single test file
- `npm run lint` — ESLint + Prettier check
- `npm run lint:fix` — auto-fix lint issues
- `npm run typecheck` — tsc --noEmit

## Architecture

- `src/components/` — reusable UI components (Button, Modal, Table, etc.)
- `src/features/` — feature modules (auth, dashboard, settings), each with its own components, hooks, and API calls
- `src/hooks/` — shared custom hooks
- `src/types/` — shared TypeScript types and interfaces
- `src/utils/` — pure utility functions
- `src/stores/` — Zustand stores

## Component Conventions

- Functional components only — no class components
- Use named exports, not default exports
- Co-locate tests: `Button.tsx` → `Button.test.tsx` in the same directory
- Co-locate styles: `Button.tsx` → `Button.module.css` (CSS Modules if no library is choosen)
- Props interface named `{Component}Props` — e.g., `ButtonProps`
- Destructure props in the function signature

```tsx
// Good
export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={styles[variant]} onClick={onClick}>
      {label}
    </button>
  )
}
```

## State Management

- Local state: useState/useReducer
- Global state: Zustand stores in `src/stores/`
- No Redux — do not introduce Redux or Redux Toolkit

## Testing

- Use Vitest + React Testing Library
- Test behavior, not implementation — query by role, text, or test ID
- Every component should have at least a smoke test (renders without crashing)
- Place test utilities in `src/test/helpers.ts`

## Storybook

- Co-locate stories: `Button.tsx` → `Button.stories.tsx` in the same directory
- Use CSF3 with `satisfies Meta<typeof Component>` and `StoryObj<typeof meta>`
- Stories should cover all meaningful component states (variants, disabled, loading, error)
- Exception to the no-default-exports rule: the story `meta` object must be the default export (required by CSF)
- All other project rules still apply in stories — no inline styles, no `any`

## Subagents

Project subagents live in `.claude/agents/`. This is a standing instruction: **always** delegate the matching work to them, without asking first. Do not write that work yourself, including during the first implementation of a feature.

- `react-test-writer` — MUST be used for writing, extending, or repairing Vitest + React Testing Library tests (`*.test.ts(x)`, `*.test-d.ts(x)`, `src/test/`)
- `storybook-expert` — MUST be used for writing stories, MDX docs, Storybook config, addons, and interaction/visual tests (`*.stories.tsx`, `*.mdx`, `.storybook/`)

When a task includes both code and tests/stories: implement the code yourself, then hand the tests and stories to the agents with full context (the spec or requirements, the files involved, and these conventions). Review and verify their output (`npm run test`, `npm run typecheck`, `npm run lint`) before reporting back.

## TypeScript

- Strict mode enabled — do not use `any` unless absolutely necessary with a comment explaining why
- Prefer `interface` over `type` for object shapes
- Use discriminated unions for state machines and complex state

## Do NOT

- Do not use `any` without a justifying comment
- Do not add new dependencies without discussing first
- Do not use inline styles — use CSS Modules or the choosen css library
- Do not use default exports (except Storybook story `meta`)
