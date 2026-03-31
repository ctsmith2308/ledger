import { type ArchitectureDecision } from '../types';

const fsdFrontend: ArchitectureDecision = {
  slug: 'fsd-frontend',
  title: 'Feature-Sliced Design (lite)',
  subtitle:
    'The layered model and one-way dependency rules from FSD — without the full specification overhead.',
  badge: 'Frontend architecture',
  context:
    'React projects commonly devolve into a `components/` folder that is half presentational primitives, half feature-specific logic, with hooks importing from components and components importing from hooks that import from other components. There is no rule governing what can import from what, so the answer becomes "anything from anywhere" and the coupling is invisible until it is painful.',
  decision:
    'Apply a lite variant of Feature-Sliced Design (https://feature-sliced.design/overview). The layer names, one-way dependency rule, and barrel index convention are taken directly from FSD. The full specification — formal slice/segment naming, strict public API enforcement — is not applied. Analogous to DDD-lite: the discipline is real, the ceremony is reduced.',
  rationale: [
    'The one-way rule is enforced by convention and code review — not a linter today, but the rules are explicit and documented. Adding eslint-plugin-boundaries is a one-sprint addition.',
    "Each layer has a barrel `index.ts`. Consumers import from the barrel, not from deep internal paths. This means a layer's internal structure can be refactored without touching import paths outside it.",
    'Feature modules own their complete slice — server actions, hooks, and UI. Adding a feature means adding a folder, not touching shared infrastructure.',
    'Primitive components (`_components/`) are stateless and have no feature dependencies. They can be extracted to a shared package with no refactoring.',
  ],
  tradeoffs: [
    {
      pro: 'Dependency direction is explicit and reviewable — a wrong import is visible in a PR.',
      con: 'Without a linter rule, the convention relies on discipline. `eslint-plugin-boundaries` should be added to enforce it automatically.',
    },
    {
      pro: 'Features are isolated — you can delete an entire feature folder without breaking others.',
      con: 'The "lite" label means not following the full FSD spec — engineers familiar with FSD may find the deviations inconsistent.',
    },
  ],
  codeBlocks: [
    {
      label: 'Layer structure and dependency direction',
      code: `src/app/
  _lib/          # base layer — shared utilities, factories, services
  _components/   # primitive, stateless UI — button, input, card
  _widgets/      # compositional blocks — header, footer, dashboard-header
  _providers/    # app-level context — theme, auth
  _features/     # domain feature modules
    auth/
      actions/   # server actions
      hooks/       # client hooks (useLoginForm, useRegisterForm)
      ui/        # feature-specific components (LoginForm, RegisterForm)

# Dependency rule: lower layers never import from higher ones
# _lib → _components → _widgets → _features → routes`,
    },
    {
      label: 'Feature module — complete slice in one folder',
      code: `_features/auth/
  actions/
    login.action.ts      # 'use server' — calls commandBus
    register.action.ts
    index.ts
  hooks/
    use-login-form.hook.ts    # TanStack Form + mutation
    use-register-form.hook.ts
    index.ts
  ui/
    login-form.tsx       # uses hooks, _components only
    register-form.tsx
    index.ts`,
    },
  ],
};

export { fsdFrontend };
