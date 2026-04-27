import { type ArchitectureDecision } from '../types';

const fsdFrontend: ArchitectureDecision = {
  slug: 'fsd-frontend',
  title: 'Feature-Sliced Design (lite)',
  subtitle:
    'The layered model and one-way dependency rules from FSD, without the full specification overhead.',
  badge: 'Frontend architecture',
  context:
    'React projects commonly devolve into a `components/` folder that mixes presentational primitives with feature-specific logic. Hooks import from components, components import from hooks that import from other components. Nothing governs what can import from what, so everything imports from everywhere and the coupling only surfaces when it hurts.',
  decision:
    'Apply a lite variant of Feature-Sliced Design (https://feature-sliced.design/overview). The layer names, one-way dependency rule, and barrel index convention come directly from FSD. The full specification (formal slice/segment naming, strict public API enforcement) is not applied. Same idea as DDD-lite: the discipline is real, the ceremony is reduced.',
  rationale: [
    'The one-way rule is enforced by convention and code review. Not a linter today, but the rules are explicit and documented. Adding eslint-plugin-boundaries is a one-sprint addition.',
    "Each layer has a barrel `index.ts`. Consumers import from the barrel, not from deep internal paths. A layer's internal structure can be refactored without touching imports outside it.",
    'Feature modules own their complete slice: server actions, hooks, and UI. Adding a feature means adding a folder, not touching shared infrastructure.',
    'Primitive components (`_components/`) are stateless and have no feature dependencies. They can be extracted to a shared package with no refactoring.',
  ],
  tradeoffs: [
    {
      pro: 'Dependency direction is explicit and reviewable. A wrong import is visible in a PR.',
      con: 'Without a linter rule, the convention relies on discipline. `eslint-plugin-boundaries` should be added to enforce it automatically.',
    },
    {
      pro: 'Features are isolated. You can delete an entire feature folder without breaking others.',
      con: 'The "lite" label means not following the full FSD spec. Engineers familiar with FSD may find the deviations inconsistent.',
    },
  ],
  codeBlocks: [
    {
      label: 'Layer structure and dependency direction',
      code: `src/app/
  _shared/       # cross-cutting content and config
  _components/   # primitive, stateless UI. Button, input, card
  _widgets/      # compositional blocks. Header, footer, dashboard-header
  _layouts/      # layout shells composed by route segments
  _providers/    # app-level context. Theme, query client
  _entities/     # data access grouped by domain. Actions, schemas, loaders
  _features/     # feature modules. Hooks, UI, feature-specific schemas

# Dependency rule: lower layers never import from higher ones
# _shared → _entities → _features → routes`,
    },
    {
      label: 'Entity + feature split for auth',
      code: `_entities/identity/
  actions/
    login.action.ts      # 'use server', calls identityService
    register.action.ts
    index.ts
  schema/
    login.schema.ts
    index.ts

_features/auth/
  hooks/
    use-login-form.hook.ts    # TanStack Form + mutation, calls entity action
    use-register-form.hook.ts
    index.ts
  ui/
    login-form.tsx       # consumes hook, renders _components
    register-form.tsx
    index.ts`,
    },
  ],
};

export { fsdFrontend };
