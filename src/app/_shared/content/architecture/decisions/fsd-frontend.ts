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
    'Route segments can own a private `_components/` folder for glue components scoped to that segment. These are components that compose entities and widgets for a specific page but are not reusable outside that route. Next.js treats underscore-prefixed folders as private (not routable), so this works at the framework level. This gives three UI tiers: app-level primitives (`_components/`), route-scoped glue (`(route)/_components/`), and shared compositional blocks (`_widgets/`).',
  ],
  tradeoffs: [
    {
      pro: 'Dependency direction is explicit and reviewable. A wrong import is visible in a PR.',
      con: 'Without a linter rule, the convention relies on discipline. `eslint-plugin-boundaries` should be added to enforce it automatically.',
    },
    {
      pro: 'Features are isolated. You can delete an entire feature folder without breaking others.',
      con: 'The "lite" label means not following the full FSD spec. Route-scoped `_components/` folders and the absence of formal entity UI segments are intentional deviations from the full spec, trading strict layer purity for pragmatic co-location with Next.js routing conventions.',
    },
  ],
  codeBlocks: [
    {
      label: 'Layer structure and dependency direction',
      code: `src/app/
  _shared/       # cross-cutting content and config
  _components/   # primitive, stateless UI. Button, input, card
  _providers/    # app-level context. Theme, query client
  _entities/     # data access grouped by domain. Actions, schemas, loaders
  _features/     # feature modules. Hooks, UI, feature-specific schemas
  _widgets/      # compositional blocks that assemble features into page sections

# Dependency rule: layers import from layers below, never above
# _shared -> _components -> _entities -> _features -> _widgets -> pages`,
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
