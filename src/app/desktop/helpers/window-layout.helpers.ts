import type { AppMeta } from '../config/apps.config';
import type { WinState } from '../models/window.types';

export const MENU_BAR_H = 28;
export const DOCK_H = 84;
export const MIN_W = 240;
export const MIN_H = 160;

export function vw(): number {
  return window.innerWidth;
}

export function vh(): number {
  return window.innerHeight;
}

export function computeLayout(): Record<string, { x: number; y: number; w: number; h: number }> {
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

export function buildDefaults(apps: readonly AppMeta[]): WinState[] {
  const layout = computeLayout();
  return apps.map((app, i) => {
    const pos = layout[app.id] ?? { x: 100 + i * 20, y: 100 + i * 20, w: 480, h: 360 };
    return {
      id: app.id,
      x: pos.x, y: pos.y, w: pos.w, h: pos.h,
      z: apps.length - i,
      open: app.defaultOpen,
      minimized: false,
      max: false,
    };
  });
}

export function clampMove(win: WinState, nx: number, ny: number): { x: number; y: number } {
  const maxX = Math.max(0, vw() - win.w);
  const maxY = Math.max(MENU_BAR_H, vh() - 60);
  return {
    x: Math.min(maxX, Math.max(0, nx)),
    y: Math.min(maxY, Math.max(MENU_BAR_H, ny)),
  };
}

export function clampResize(win: WinState, nw: number, nh: number): { w: number; h: number } {
  return {
    w: Math.min(vw() - win.x, Math.max(MIN_W, nw)),
    h: Math.min(vh() - win.y - DOCK_H, Math.max(MIN_H, nh)),
  };
}
