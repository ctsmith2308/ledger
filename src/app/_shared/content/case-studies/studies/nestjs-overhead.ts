import { type CaseStudy } from '../types';

const nestjsOverhead: CaseStudy = {
  slug: 'nestjs-overhead',
  title: 'NestJS — the overhead audit',
  subtitle:
    'The project ran through a NestJS phase. The wins were real but narrow. The overhead was not.',
  badge: 'Architecture',
  summary:
    'NestJS has genuine strengths: a module system, first-class decorators, and a clear opinion on application structure. The question was whether those strengths justified the weight they came with. For this project, the honest answer was no.',
  sections: [
    {
      heading: 'What NestJS brought',
      body: 'NestJS provides a structured module system, a built-in DI container, and a decorator-driven model that maps cleanly onto familiar patterns from Angular and Spring. The opinions are well-considered and the ecosystem is mature. For teams onboarding developers at scale, the conventions are a genuine asset — everyone lands in the same place.',
    },
    {
      heading: 'Where the overhead accumulated',
      body: 'The DI container was the main cost. Every dependency had to be registered, decorated, and resolved through the framework machinery. Adding a new service meant touching the module definition, the provider list, and the injection tokens — three files for what should be a one-line constructor argument. The decorator surface area grew fast, and the mental model required to reason about instantiation order was non-trivial.',
      table: {
        headers: ['Concern', 'NestJS', 'Static factories + closures'],
        rows: [
          [
            'Dependency wiring',
            'DI container, decorators, modules',
            'Explicit constructor arguments',
          ],
          [
            'New service cost',
            'Provider registration + module update',
            'Add parameter, done',
          ],
          [
            'Testability',
            'TestingModule setup per test',
            'Pass mock directly',
          ],
          [
            'Framework coupling',
            'Deep — decorators throughout',
            'None in domain/application layers',
          ],
          [
            'Onboarding overhead',
            'High — container mental model required',
            'Low — plain TypeScript',
          ],
        ],
      },
    },
    {
      heading: 'The wins were real but narrow',
      body: 'The structured module system did enforce boundaries. The decorator-based guard and middleware model was consistent. For a large team working on a long-lived service, those rails are worth paying for. For a single-developer portfolio project with explicit DDD boundaries already enforced by convention, the container added indirection without adding value.',
    },
    {
      heading: 'What replaced it',
      body: 'Static factory functions and manual constructor injection. Each module exposes a factory that wires its own dependencies explicitly. The result is plain TypeScript: no decorators, no container, no registration step. Dependencies are visible at the call site, testable by passing a mock directly, and trivially traceable through a standard IDE.',
      code: {
        label: 'NestJS provider vs static factory — equivalent wiring',
        code: `// NestJS — container registration
@Module({
  providers: [UserRepository, PasswordHasher, RegisterUserHandler],
  exports: [RegisterUserHandler],
})
export class IdentityModule {}

// Static factory — explicit wiring
const identityModule = {
  registerUser: RegisterUserHandler.create({
    userRepository: UserRepository.create(prisma),
    hasher: BcryptHasher.create(),
    idGenerator: CuidGenerator,
  }),
};`,
      },
    },
    {
      heading: 'The verdict',
      body: 'NestJS is not the wrong tool — it is the right tool for a different context. The overhead is justified when the team size and service complexity are high enough that conventions and the container pay for themselves. This project is not that context. Manual wiring is clearer, faster to navigate, and has zero framework coupling in the layers that matter.',
    },
  ],
};

export { nestjsOverhead };
