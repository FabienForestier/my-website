# CLAUDE.md — Angular 22 Portfolio Project

## Stack

- **Angular 22** — standalone components, signals, `inject()` for DI, `@Service()` decorator
- **Tailwind CSS v4** — CSS-first, no config file, `@theme` blocks for customization
- **Vitest 4** — native via `@angular/build:unit-test`
- **Angular ESLint 22** + **Prettier** (with `prettier-plugin-tailwindcss`)

---

## Angular conventions

### Components

- Always use **standalone components** (no NgModule)
- Use `inject()` for dependency injection, not constructor injection
- Prefer **signals** (`signal()`, `computed()`, `effect()`) over RxJS for local state
- **Do NOT specify `changeDetection`** — `OnPush` is the default in Angular 22 for signal-based components; declaring it is redundant
- File naming: **no type suffixes** — use only the feature name in kebab-case (e.g. `theme.ts`, `window-layout.ts`, `resume-content.ts`). No `.component`, `.service`, `.helper`, `.types` suffixes. Exception: `.spec.ts` for test files and `.html`/`.scss` for component templates/styles.
- Selector prefix: `app-` (e.g. `app-hero`, `app-skills-list`)

```ts
// Preferred pattern
@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.scss',
})
export class ExampleComponent {
  // 1. Public properties
  readonly items = signal<Item[]>([]);

  // 2. Private properties
  private readonly service = inject(ExampleService);

  // 3. Public methods
  loadItems(): void { ... }

  // 4. Private methods
  private filterItems(): Item[] { ... }
}
```

### Class member ordering

Inside every class (components, services, directives…), always follow this order:

1. **Public properties** (including signals and injected tokens exposed publicly)
2. **Private properties** (including `private readonly` injected services)
3. **Constructor** (only when required; prefer `inject()` to avoid it)
4. **Public methods**
5. **Private methods**

> **Exception for signal backing fields**: when a private `_signal` backs a public `signal.asReadonly()` view, declare the private backing field first (JavaScript class field initialization order requires this). Always place the public readonly view immediately after.

```ts
// ✅ Correct
export class ExampleService {
  readonly data = signal<Item[]>([]);       // public property first

  private readonly http = inject(HttpClient); // private property after

  getData(): Observable<Item[]> { ... }     // public method

  private mapResponse(r: unknown): Item[] { ... } // private method last
}

// ❌ Wrong — private members before public
export class ExampleService {
  private readonly http = inject(HttpClient);
  readonly data = signal<Item[]>([]);
  private mapResponse(r: unknown): Item[] { ... }
  getData(): Observable<Item[]> { ... }
}
```

### Services

Use the Angular 22 `@Service()` decorator — never `@Injectable({ providedIn: 'root' })`:

```ts
import { Service, inject } from '@angular/core';

@Service()
export class ExampleService {
  private readonly http = inject(HttpClient);
}
```

### Signals & effects

- Declare effects as **named `private readonly` class properties** outside the constructor. The name should describe the goal of the effect.
- Never create anonymous effects inside a constructor.

```ts
// ✅ Correct — named effect as class property
@Service()
export class ThemeService {
  readonly dark = signal(true);

  private readonly applyThemeEffect = effect(() => {
    document.body.classList.toggle('theme-light', !this.dark());
  });
}

// ❌ Wrong — anonymous effect in constructor
@Service()
export class ThemeService {
  constructor() {
    effect(() => {
      document.body.classList.toggle('theme-light', !this.dark());
    });
  }
}
```

### HTTP data fetching — rxResource

Use `rxResource` from `@angular/core/rxjs-interop` for HTTP data fetching instead of manual signal triplets:

```ts
import { Service, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

@Service()
export class ContentService {
  private readonly http = inject(HttpClient);

  // consumers use: content.value(), content.isLoading(), content.error()
  readonly content = rxResource({
    loader: () => this.http.get<ContentData>('assets/resume-content.json'),
  });
}
```

### Helpers

Reusable pure functions (layout calculations, geometry clamping, etc.) that do not need DI belong in a **helpers folder** (`src/app/<feature>/helpers/`) as plain TypeScript functions — not as service methods. Each helper file must have a co-located `*.spec.ts` with unit tests.

### Styles

- Component styles → `.scss` files
- Global styles → `src/styles.scss` (fonts, resets, runtime theme overrides)
- Tailwind entry point → `src/tailwind.css` — contains `@import "tailwindcss"` **and** the `@theme` design token block
- Use Tailwind utility classes directly in templates; avoid duplicating utilities in SCSS
- **All design tokens go in `src/tailwind.css` inside `@theme {}`** — this is the Tailwind v4 equivalent of `tailwind.config.js`. Never put `@theme` in `styles.scss`.
- **No raw CSS variables** — all design tokens must be defined in `@theme` blocks using `--color-*` naming; never use a bare `:root { --var: value }` block

```css
/* ✅ Correct — Tailwind @theme tokens */
@theme {
  --color-accent: #8ab4ff;
  --color-desk: #0d1117;
  --font-sans: 'Inter', system-ui, sans-serif;
}

/* ❌ Wrong — raw CSS variables */
:root {
  --accent: #8ab4ff;
  --desk: #0d1117;
}
```

### Testing

- Test files: `*.spec.ts` co-located with source files
- Use native `async/await` — **no** `fakeAsync`, `flush`, or `waitForAsync` (not supported with Vitest)
- Use `vi.useFakeTimers()` for timer mocking
- Run tests: `npm test`
- Run with coverage: `npm run test:coverage`

---

## Scripts reference

| Script               | Command                 |
| -------------------- | ----------------------- |
| Dev server           | `npm start`             |
| Production build     | `npm run build`         |
| Tests                | `npm test`              |
| Tests + coverage     | `npm run test:coverage` |
| Lint                 | `npm run lint`          |
| Format               | `npm run format`        |
| Check format         | `npm run format:check`  |
| Validate last commit | `npm run commitlint`    |

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
