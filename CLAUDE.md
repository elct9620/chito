# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chito is a Telegram AI travel assistant bot deployed on Cloudflare Workers, designed to help Taiwanese travelers with common travel problems. The bot uses OpenAI's GPT models for conversational AI and receipt OCR/translation features.

## Development Commands

### Running and Testing
- `npm run dev` - Start local development server with Wrangler
- `npm test` - Run tests with Vitest
- `npm run tsc` - Type check TypeScript code
- `npm run deploy` - Deploy to Cloudflare Workers

### Configuration
After deployment, visit the `/register` endpoint to register the Telegram webhook for the bot.

Required environment variables (configured as secrets in Cloudflare dashboard):
- `CLOUDFLARE_AI_GATEWAY` - URL of the Cloudflare AI Gateway
- `OPENAI_API_TOKEN` - OpenAI API token
- `TELEGRAM_BOT_DOMAIN` - Domain for the Telegram bot
- `TELEGRAM_BOT_TOKEN` - Telegram bot token

## Architecture

This project follows **Clean Architecture** with strict layer separation:

### Layer Structure
```
Entity Layer (domain models)
    ↑
Use Case Layer (business logic)
    ↑
Service/Repository Layer (infrastructure adapters)
    ↑
Controller/Presenter Layer (external interfaces)
```

### Key Architectural Principles

1. **Dependency Injection with TSyringe**: All services and repositories use constructor injection with Symbol-based tokens. Container configuration is in `src/container.ts`.

2. **Interface-Based Design**: Use case layer depends on interfaces (defined in `src/usecase/interface.ts`), not concrete implementations. Implementations live in `src/service/*` and `src/repository/*`.

3. **Path Aliases**: The codebase uses TypeScript path aliases to enforce layer boundaries:
   - `@entity/*` - Domain entities
   - `@usecase/*` - Use cases (business logic)
   - `@service/*` - Service implementations
   - `@repository/*` - Repository implementations
   - `@controller/*` - HTTP controllers
   - `@presenter/*` - Response presenters
   - `@bot/*` - Bot platform integrations

4. **Dependency Direction**: Dependencies must always point inward (from outer layers to inner layers). Controllers depend on use cases, use cases depend on interfaces, services implement interfaces.

### Code Organization

- **Entities** (`src/entity/`): Domain models with immutable state (e.g., `Conversation`, `Message`, `Instruction`)
- **Use Cases** (`src/usecase/`): Business logic orchestration (e.g., `ProcessUserQueryUseCase`, `ProcessPhotoUseCase`)
- **Services** (`src/service/`): Infrastructure implementations prefixed with technology (e.g., `AiSdkAssistantService`, `AiSdkOcrService`)
- **Repositories** (`src/repository/`): Data persistence implementations (e.g., `KvConversationRepository`)
- **Controllers** (`src/controller/`): HTTP endpoints using Hono framework
- **Presenters** (`src/presenter/`): Response formatting for different platforms
- **Bot Integrations** (`src/bot/`): Platform-specific bot logic (currently Telegram via Telegraf)

## Code Quality Standards

The project enforces code quality standards documented in `docs/rubrics/typescript.md`. Key requirements:

1. **Clean Architecture Layering**: No reverse dependencies, clear separation of concerns
2. **Dependency Injection**: All services use `@injectable()` decorator with Symbol-based tokens
3. **Interface-Based Design**: Business logic depends on interfaces in `usecase/interface.ts`
4. **Type Safety**: Strict TypeScript mode, no `any` types, discriminated unions for polymorphic types
5. **Naming Conventions**:
   - Files: PascalCase with layer suffix (e.g., `ProcessUserQueryUseCase.ts`)
   - Classes/Interfaces: PascalCase without "I" prefix
   - Methods/Variables: camelCase
   - Implementations prefixed with technology (e.g., `Kv*`, `AiSdk*`)

## Testing

Tests use Vitest with the Cloudflare Workers test pool (`@cloudflare/vitest-pool-workers`). Test configuration in `vitest.config.mts` includes:
- `vite-tsconfig-paths` plugin for path alias support
- Wrangler config path pointing to `wrangler.jsonc`

Tests are located in the `test/` directory and use the pattern `*.spec.ts`.
