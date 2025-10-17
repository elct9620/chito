# TypeScript Code Quality Rubric

This document outlines the criteria for evaluating the quality of TypeScript code in the Chito project. We assert at least 80% of the criteria must be met to pass.

## Criteria

### Clean Architecture Layering (1 point)

> Code must follow Clean Architecture principles with clear layer separation and dependencies pointing inward. No reverse dependencies allowed.

```typescript
// Correct: Use case depends on repository interface
export class ProcessUserQueryUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly assistantService: AssistantService,
  ) {}
}
```

- Use cases orchestrate domain logic without framework dependencies
- Entities contain no infrastructure code
- Controllers/adapters depend on use case layer, not vice versa
- Path aliases enforce layer boundaries (`@entity/*`, `@usecase/*`, `@service/*`, etc.)

### Dependency Injection Pattern (1 point)

> All services, repositories, and infrastructure dependencies must use TSyringe dependency injection with Symbol-based tokens.

```typescript
// Correct: Injectable service with Symbol-based token
@injectable()
export class AiSdkAssistantService implements AssistantService {
  constructor(@inject(AssistantModel) private readonly model: LanguageModel) {}
}

// Correct: Symbol token registration
export const AssistantModel = Symbol("AssistantModel");
container.register<LanguageModel>(AssistantModel, {
  useValue: provider("gpt-4o-mini"),
});
```

- All services use `@injectable()` decorator
- Dependencies injected via constructor with `@inject()`
- Symbol-based tokens for type safety
- No direct instantiation of services in business logic

### Interface-Based Design (1 point)

> Business logic must depend on interfaces, not concrete implementations. All repository and service contracts defined in `usecase/interface.ts`.

```typescript
// Correct: Interface definition
export interface ConversationRepository {
  findByProvider(provider: ConversationProvider, id: string): Promise<Conversation>;
  save(conversation: Conversation): Promise<void>;
}

// Correct: Implementation
@injectable()
export class KvConversationRepository implements ConversationRepository {
  // Implementation details
}
```

- Service interfaces in `usecase/interface.ts` (ports)
- Implementations in `service/` or `repository/` directories (adapters)
- Small, focused interfaces (Interface Segregation Principle)
- No implementation details leaked through interface

### Type Safety and Immutability (1 point)

> Code must use TypeScript strict mode with proper type definitions. Entities must be immutable with encapsulated state.

```typescript
// Correct: Discriminated union types
export type Message =
  | { role: "user"; content: string | UserContent[]; }
  | { role: "assistant"; content: string; }
  | { role: "system"; content: string; };

// Correct: Immutable entity with defensive copying
export class Conversation {
  private _messages: Message[] = [];

  public get messages(): Message[] {
    return [...this._messages]; // Returns copy
  }

  public addMessages(...messages: Message[]): void {
    this._messages = [...this._messages, ...messages]; // Immutable update
  }
}
```

- Strict TypeScript mode enabled (`tsconfig.json`)
- No `any` types except for necessary third-party integrations
- Discriminated unions for polymorphic types
- Private fields with public getters returning defensive copies
- Use `readonly` for immutable properties

### Naming Conventions (1 point)

> Code must follow consistent naming conventions for files, classes, interfaces, and variables.

```typescript
// Files: PascalCase with layer suffix
ProcessUserQueryUseCase.ts
KvConversationRepository.ts
AiSdkAssistantService.ts

// Classes and interfaces: PascalCase without "I" prefix
export class Conversation { }
export interface ConversationRepository { }

// Methods and variables: camelCase
async execute(input: { userQuery: string }): Promise<void>

// Enums: PascalCase for name and values
export enum ConversationProvider {
  Telegram = "tg",
}
```

- Files: PascalCase with pattern `{Name}{LayerSuffix}.ts`
- Classes/Interfaces: PascalCase without "I" prefix
- Methods/Variables: camelCase, descriptive names
- Concrete implementations prefixed with technology (e.g., `Kv*`, `AiSdk*`)
