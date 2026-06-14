import { Service, signal, effect, computed } from '@angular/core';
import { APPS } from '../config/apps.config';
import {
  buildDefaults,
  clampMove,
  clampResize,
  vw,
  vh,
  MENU_BAR_H,
  DOCK_H,
} from '../helpers/window-layout';
import type { WinState } from '../models/window';

const LS_KEY = 'fabienos.layout.v1';

@Service()
export class WindowManagerService {
  // Private backing signal — declared before public views that depend on it
  private readonly _windows = signal<WinState[]>(this.loadOrDefault());
  private _zTop = APPS.length;

  readonly windows = this._windows.asReadonly();
  readonly topId = computed(() => {
    const open = this._windows().filter((w) => w.open && !w.minimized);
    if (!open.length) return null;
    return open.reduce((a, b) => (a.z > b.z ? a : b)).id;
  });

  private readonly persistEffect = effect(() => {
    const snapshot = this._windows().map(({ id, x, y, w, h, z, open, minimized, max }) => ({
      id,
      x,
      y,
      w,
      h,
      z,
      open,
      minimized,
      max,
    }));
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
    } catch {
      /* ignore */
    }
  });

  focus(id: string): void {
    this._zTop += 1;
    const z = this._zTop;
    this.patch(id, (w) => ({ ...w, z, minimized: false, open: true }));
  }

  open(id: string): void {
    this.patch(id, (w) => ({ ...w, open: true, minimized: false }));
    this.focus(id);
  }

  close(id: string): void {
    this.patch(id, (w) => ({ ...w, open: false, minimized: false, max: false }));
  }

  minimize(id: string): void {
    this.patch(id, (w) => ({ ...w, minimized: true }));
  }

  toggleMax(id: string): void {
    this.patch(id, (w) => ({ ...w, max: !w.max }));
  }

  move(id: string, dx: number, dy: number): void {
    this._windows.update((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        const c = clampMove(w, w.x + dx, w.y + dy);
        return { ...w, x: c.x, y: c.y };
      }),
    );
  }

  resize(id: string, dw: number, dh: number): void {
    this._windows.update((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        const c = clampResize(w, w.w + dw, w.h + dh);
        return { ...w, w: c.w, h: c.h };
      }),
    );
  }

  openAll(): void {
    this._windows.update((ws) => ws.map((w) => ({ ...w, open: true, minimized: false })));
  }

  closeAll(): void {
    this._windows.update((ws) =>
      ws.map((w) => ({ ...w, open: false, minimized: false, max: false })),
    );
  }

  reset(): void {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    this._windows.set(buildDefaults(APPS));
  }

  clampToViewport(): void {
    this._windows.update((ws) =>
      ws.map((w) => {
        const nw = Math.min(w.w, vw() - 16);
        const nh = Math.min(w.h, vh() - MENU_BAR_H - DOCK_H);
        const nx = Math.min(Math.max(0, w.x), Math.max(0, vw() - nw));
        const ny = Math.min(Math.max(MENU_BAR_H, w.y), Math.max(MENU_BAR_H, vh() - 60));
        return { ...w, w: nw, h: nh, x: nx, y: ny };
      }),
    );
  }

  getWindow(id: string): WinState | undefined {
    return this._windows().find((w) => w.id === id);
  }

  private loadOrDefault(): WinState[] {
    const defaults = buildDefaults(APPS);
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaults;
      const saved: Partial<WinState>[] = JSON.parse(raw);
      return defaults.map((d) => {
        const s = saved.find((x) => x.id === d.id);
        return s
          ? {
              ...d,
              x: s.x ?? d.x,
              y: s.y ?? d.y,
              w: s.w ?? d.w,
              h: s.h ?? d.h,
              z: s.z ?? d.z,
              open: s.open ?? d.open,
              minimized: s.minimized ?? d.minimized,
              max: s.max ?? d.max,
            }
          : d;
      });
    } catch {
      return defaults;
    }
  }

  private patch(id: string, fn: (w: WinState) => WinState): void {
    this._windows.update((ws) => ws.map((w) => (w.id === id ? fn(w) : w)));
  }
}
