# CLAUDE.md — fabien.os Portfolio Project

## Stack

- **Angular 22** — standalone components, signals, `inject()` for DI
- **Tailwind CSS v4** — CSS-first, no config file, `@theme` blocks for customization
- **Vitest 4** — native via `@angular/build:unit-test`
- **Angular ESLint 22** + **Prettier** (with `prettier-plugin-tailwindcss`)

---

## Folder structure

```
src/app/
├── core/                     # App-wide infrastructure (theme, layout, interceptors)
│   ├── services/             # e.g. ThemeService
│   └── layout/               # Global nav/footer (for future pages)
├── shared/                   # Reusable, domain-agnostic components/pipes/utils
│   └── components/
│       └── icon/             # Inline SVG icon set
└── desktop/                  # macOS desktop feature module
    ├── pages/
    │   └── desktop-shell/    # Routed entry point for the OS
    ├── components/           # Sub-components (window, dock, menu-bar, apps…)
    │   └── apps/             # App body components (profile, experience, skills…)
    ├── services/             # ContentService, UiService, WindowManagerService
    ├── models/               # TypeScript interfaces (content.types.ts)
    └── config/               # Static config (apps.config.ts)
```

---

## Angular 22 conventions

### Components

- Always use **standalone component** (no NgModule)
- Use `inject()` for dependency injection, not constructor injection
- Prefer **signals** (`signal()`, `computed()`, `effect()`) over RxJS for local state
- **No class name suffixes** — `class Profile` not `class ProfileComponent` (Angular 22 style guide)
- File naming: `kebab-case.ts` / `.html` / `.scss` / `.spec.ts`
- Selector prefix: `app-` (e.g. `app-profile`, `app-dock`)
- Use `OnPush` change detection on all new components
- Use `input()` / `output()` / `model()` signal APIs (not `@Input` / `@Output`)
- Use `host` bindings instead of `@HostBinding` / `@HostListener`

```ts
// Preferred pattern
@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Example {
  private readonly service = inject(ExampleService);
  readonly items = signal<Item[]>([]);
  readonly label = input.required<string>();
}
```

### Styles

- Design tokens (colors, shadows, radii) → CSS custom properties in `src/styles.scss`
- Component styles → `.scss` files using `var(--token-name)`
- Tailwind utilities for layout only; avoid duplicating theme tokens in Tailwind
- **No inline color values** — always use CSS custom properties

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
feat(desktop): add dock with app launcher tiles
fix(window): correct clamping on viewport resize
chore: upgrade angular to 22.0.1
style(profile): adjust hero padding on compact mode
```

---

## MCP servers configured

- **context7** — fetches up-to-date Angular 22 / Tailwind v4 docs on demand
- **github** — manages repo, PRs, issues from Claude Code
