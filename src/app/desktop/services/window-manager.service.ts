import { Injectable, signal, effect, computed } from '@angular/core';
import { APPS } from '../config/apps.config';

export interface WinState {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  open: boolean;
  minimized: boolean;
  max: boolean;
}

const MENU_BAR_H = 28;
const DOCK_H = 84;
const MIN_W = 240;
const MIN_H = 160;
const LS_KEY = 'fabienos.layout.v1';

function vw(): number { return window.innerWidth; }
function vh(): number { return window.innerHeight; }

function computeLayout(): Record<string, { x: number; y: number; w: number; h: number }> {
  const w = vw(), h = vh();
  const TOP = 40;
  const usableH = Math.max(360, h - TOP - DOCK_H);
  const small = w < 1100;

  if (small) {
    const colW = Math.min(520, Math.round(w * 0.62));
    const sideW = Math.max(220, Math.min(300, w - colW - 36));
    const sideX = Math.min(w - sideW - 12, 12 + colW + 12);
    const halfH = Math.round(usableH / 2) - 8;
    return {
      profile:   { x: 12,    y: TOP,              w: colW,  h: usableH },
      work:      { x: sideX, y: TOP,              w: sideW, h: halfH   },
      skills:    { x: sideX, y: TOP + halfH + 12, w: sideW, h: halfH - 4 },
      contact:   { x: 12,    y: TOP + 8,          w: 260,   h: 260     },
      readme:    { x: 12,    y: TOP + 16,         w: 240,   h: 220     },
      reco:      { x: 16,    y: TOP + 20,         w: Math.min(w - 32, 440), h: Math.min(usableH, 440) },
      terminal:  { x: 24,    y: TOP + 24,         w: Math.min(w - 48, 560), h: Math.min(usableH, 360) },
      education: { x: 24,    y: TOP + 28,         w: Math.min(w - 48, 440), h: Math.min(usableH, 320) },
    };
  }

  const workH = Math.min(540, Math.round(usableH * 0.58));
  return {
    profile:   { x: 56,                       y: TOP,             w: 520, h: Math.min(720, usableH)        },
    work:      { x: 600,                      y: TOP,             w: 540, h: workH                         },
    skills:    { x: 600,                      y: TOP + workH + 16,w: 540, h: Math.max(220, usableH - workH - 16) },
    contact:   { x: Math.max(56, w - 344),    y: TOP + 24,        w: 280, h: 290                           },
    readme:    { x: Math.max(360, w - 600),   y: Math.max(TOP + 320, h - DOCK_H - 240), w: 240, h: 220    },
    reco:      { x: Math.round(w / 2 - 230),  y: Math.max(TOP + 40, Math.round(h / 2 - 230)), w: 460, h: Math.min(460, usableH) },
    terminal:  { x: Math.round(w / 2 - 290),  y: Math.max(TOP + 60, Math.round(h / 2 - 200)), w: 580, h: 380 },
    education: { x: Math.round(w / 2 - 220),  y: Math.max(TOP + 80, Math.round(h / 2 - 160)), w: 440, h: 320 },
  };
}

function buildDefaults(): WinState[] {
  const layout = computeLayout();
  return APPS.map((app, i) => {
    const pos = layout[app.id] ?? { x: 100 + i * 20, y: 100 + i * 20, w: 480, h: 360 };
    return {
      id: app.id,
      x: pos.x, y: pos.y, w: pos.w, h: pos.h,
      z: APPS.length - i,
      open: app.defaultOpen,
      minimized: false,
      max: false,
    };
  });
}

function clampMove(win: WinState, nx: number, ny: number): { x: number; y: number } {
  const maxX = Math.max(0, vw() - win.w);
  const maxY = Math.max(MENU_BAR_H, vh() - 60);
  return {
    x: Math.min(maxX, Math.max(0, nx)),
    y: Math.min(maxY, Math.max(MENU_BAR_H, ny)),
  };
}

function clampResize(win: WinState, nw: number, nh: number): { w: number; h: number } {
  return {
    w: Math.min(vw() - win.x, Math.max(MIN_W, nw)),
    h: Math.min(vh() - win.y - DOCK_H, Math.max(MIN_H, nh)),
  };
}

@Injectable({ providedIn: 'root' })
export class WindowManagerService {
  private readonly _windows = signal<WinState[]>([]);
  private _zTop = APPS.length;

  readonly windows = this._windows.asReadonly();

  readonly topId = computed(() => {
    const open = this._windows().filter((w) => w.open && !w.minimized);
    if (!open.length) return null;
    return open.reduce((a, b) => (a.z > b.z ? a : b)).id;
  });

  constructor() {
    this._windows.set(this.loadOrDefault());

    effect(() => {
      const snapshot = this._windows().map(({ id, x, y, w, h, z, open, minimized, max }) =>
        ({ id, x, y, w, h, z, open, minimized, max }));
      try { localStorage.setItem(LS_KEY, JSON.stringify(snapshot)); } catch { /* ignore */ }
    });
  }

  private loadOrDefault(): WinState[] {
    const defaults = buildDefaults();
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaults;
      const saved: Partial<WinState>[] = JSON.parse(raw);
      return defaults.map((d) => {
        const s = saved.find((x) => x.id === d.id);
        return s ? { ...d, x: s.x ?? d.x, y: s.y ?? d.y, w: s.w ?? d.w, h: s.h ?? d.h,
                     z: s.z ?? d.z, open: s.open ?? d.open,
                     minimized: s.minimized ?? d.minimized, max: s.max ?? d.max } : d;
      });
    } catch { return defaults; }
  }

  private patch(id: string, fn: (w: WinState) => WinState): void {
    this._windows.update((ws) => ws.map((w) => (w.id === id ? fn(w) : w)));
  }

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
    this._windows.update((ws) => ws.map((w) => ({ ...w, open: false, minimized: false, max: false })));
  }

  reset(): void {
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    this._windows.set(buildDefaults());
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
}
