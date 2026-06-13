# CLAUDE.md — Angular 22 Portfolio Project

## Stack
- **Angular 22** — standalone components, signals, `inject()` for DI, `@Service()` for services
- **Tailwind CSS v4** — CSS-first, no config file, `@theme` blocks for customization
- **Vitest 4** — native via `@angular/build:unit-test`
- **Angular ESLint 22** + **Prettier** (with `prettier-plugin-tailwindcss`)

---

## Angular conventions

### Components
- Always use **standalone components** (no NgModule)
- Use `inject()` for dependency injection, not constructor injection
- Prefer **signals** (`signal()`, `computed()`, `effect()`) over RxJS for local state
- File naming: `kebab-case.component.ts` / `.html` / `.scss` / `.spec.ts`
- Selector prefix: `app-` (e.g. `app-hero`, `app-skills-list`)

```ts
// Preferred pattern
@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.scss',
})
export class ExampleComponent {
  private readonly service = inject(ExampleService);
  readonly items = signal<Item[]>([]);
}
```

### Services
- Always use `@Service()` decorator (Angular 22) instead of `@Injectable({ providedIn: 'root' })`
- `@Service()` automatically provides the service in the root injector
- Import `Service` from `@angular/core`

```ts
// Preferred pattern
import { Service, signal } from '@angular/core';

@Service()
export class ExampleService {
  readonly items = signal<Item[]>([]);
}
```

### Styles
- Component styles → `.scss` files
- Global styles → `src/styles.scss` (SCSS variables, fonts, resets)
- Tailwind globals → `src/tailwind.css` (do not add SCSS here)
- Use Tailwind utility classes directly in templates; avoid duplicating utilities in SCSS
- Custom Tailwind tokens go in `src/styles.scss` using `@theme` blocks

### Testing
- Test files: `*.spec.ts` co-located with source files
- Use native `async/await` — **no** `fakeAsync`, `flush`, or `waitForAsync` (not supported with Vitest)
- Use `vi.useFakeTimers()` for timer mocking
- Run tests: `npm test`
- Run with coverage: `npm run test:coverage`

---

## Scripts reference

| Script | Command |
|---|---|
| Dev server | `npm start` |
| Production build | `npm run build` |
| Tests | `npm test` |
| Tests + coverage | `npm run test:coverage` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Check format | `npm run format:check` |
| Validate last commit | `npm run commitlint` |

---

## Pre-commit checklist

Before every commit, verify all of the following pass:

1. **TypeScript** — `npx tsc --noEmit` (no type errors)
2. **Tests** — `npm test` (all specs pass)
3. **Lint** — `npm run lint` (no ESLint errors)
4. **Functionality** — start the dev server (`npm start`) and confirm the feature works as expected in the browser at `http://localhost:4200`

Only commit when all four are green.

---

## Conventional commits

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>

Types: feat | fix | chore | style | refactor | test | docs | ci | perf
```

Examples:
```
feat(hero): add animated typing effect to headline
fix(nav): correct active link highlight on scroll
chore: upgrade angular to 21.3.0
style(skills): adjust grid gap on mobile
```

---

## MCP servers configured
- **context7** — fetches up-to-date Angular 22 / Tailwind v4 docs on demand
- **github** — manages repo, PRs, issues from Claude Code
