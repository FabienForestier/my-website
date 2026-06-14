import { Service, signal, effect } from '@angular/core';

export type AccentColor = 'blue' | 'green' | 'coral' | 'violet';

@Service()
export class ThemeService {
  readonly dark = signal(true);
  readonly accent = signal<AccentColor>('blue');

  private readonly applyThemeEffect = effect(() => {
    document.body.classList.toggle('theme-light', !this.dark());
    document.body.dataset['accent'] = this.accent();
  });

  toggle(): void {
    this.dark.update((d) => !d);
  }

  setAccent(accent: AccentColor): void {
    this.accent.set(accent);
  }
}
