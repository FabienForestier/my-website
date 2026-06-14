import { Service, signal } from '@angular/core';

export interface CtxMenuPosition {
  x: number;
  y: number;
}

@Service()
export class UiService {
  readonly paletteOpen = signal(false);
  readonly ctxMenu = signal<CtxMenuPosition | null>(null);
  readonly cvMode = signal(false);
  readonly bootDone = signal(false);

  openPalette(): void {
    this.paletteOpen.set(true);
  }
  closePalette(): void {
    this.paletteOpen.set(false);
  }
  togglePalette(): void {
    this.paletteOpen.update((v) => !v);
  }

  openCtxMenu(pos: CtxMenuPosition): void {
    this.ctxMenu.set(pos);
  }
  closeCtxMenu(): void {
    this.ctxMenu.set(null);
  }

  toggleCvMode(): void {
    this.cvMode.update((v) => !v);
  }

  markBootDone(): void {
    this.bootDone.set(true);
  }
}
