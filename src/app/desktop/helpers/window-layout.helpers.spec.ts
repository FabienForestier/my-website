import { describe, it, expect, beforeEach } from 'vitest';
import {
  MENU_BAR_H,
  DOCK_H,
  MIN_W,
  MIN_H,
  vw,
  vh,
  buildDefaults,
  clampMove,
  clampResize,
} from './window-layout.helpers';
import type { AppMeta } from '../config/apps.config';
import type { WinState } from '../models/window.types';

const MOCK_APPS: readonly AppMeta[] = [
  { id: 'profile',  title: 'Profile',    icon: 'profile',  accentVar: '--color-accent',  defaultOpen: true  },
  { id: 'work',     title: 'Experience', icon: 'work',     accentVar: '--color-accent2', defaultOpen: false },
  { id: 'terminal', title: 'Terminal',   icon: 'terminal', accentVar: '--color-accent',  defaultOpen: false },
];

function makeWin(overrides: Partial<WinState> = {}): WinState {
  return { id: 'test', x: 100, y: 100, w: 400, h: 300, z: 1, open: true, minimized: false, max: false, ...overrides };
}

describe('window-layout helpers', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth',  { value: 1400, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 900,  writable: true, configurable: true });
  });

  describe('constants', () => {
    it('MENU_BAR_H is 28', () => expect(MENU_BAR_H).toBe(28));
    it('DOCK_H is 84', () => expect(DOCK_H).toBe(84));
    it('MIN_W is 240', () => expect(MIN_W).toBe(240));
    it('MIN_H is 160', () => expect(MIN_H).toBe(160));
  });

  describe('vw / vh', () => {
    it('reads window.innerWidth', () => expect(vw()).toBe(1400));
    it('reads window.innerHeight', () => expect(vh()).toBe(900));
  });

  describe('buildDefaults', () => {
    it('creates one entry per app', () => {
      const result = buildDefaults(MOCK_APPS);
      expect(result).toHaveLength(3);
    });

    it('maps app ids correctly', () => {
      const result = buildDefaults(MOCK_APPS);
      expect(result.map((w) => w.id)).toEqual(['profile', 'work', 'terminal']);
    });

    it('sets z-index descending from app count', () => {
      const result = buildDefaults(MOCK_APPS);
      expect(result[0].z).toBe(3);
      expect(result[1].z).toBe(2);
      expect(result[2].z).toBe(1);
    });

    it('respects defaultOpen', () => {
      const result = buildDefaults(MOCK_APPS);
      expect(result[0].open).toBe(true);   // profile: defaultOpen true
      expect(result[1].open).toBe(false);  // work: defaultOpen false
    });

    it('starts all windows as not minimized and not maximized', () => {
      const result = buildDefaults(MOCK_APPS);
      for (const w of result) {
        expect(w.minimized).toBe(false);
        expect(w.max).toBe(false);
      }
    });
  });

  describe('clampMove', () => {
    it('clamps x to minimum 0', () => {
      const win = makeWin({ w: 400 });
      const result = clampMove(win, -50, 100);
      expect(result.x).toBe(0);
    });

    it('clamps x to maximum (viewport width - window width)', () => {
      const win = makeWin({ w: 400 });
      const result = clampMove(win, 9999, 100);
      expect(result.x).toBe(1400 - 400);
    });

    it('clamps y to minimum MENU_BAR_H', () => {
      const win = makeWin();
      const result = clampMove(win, 100, -10);
      expect(result.y).toBe(MENU_BAR_H);
    });

    it('allows valid positions through unchanged', () => {
      const win = makeWin({ w: 400 });
      const result = clampMove(win, 200, 100);
      expect(result.x).toBe(200);
      expect(result.y).toBe(100);
    });
  });

  describe('clampResize', () => {
    it('enforces minimum width', () => {
      const win = makeWin({ x: 100, y: 100 });
      const result = clampResize(win, 10, 300);
      expect(result.w).toBe(MIN_W);
    });

    it('enforces minimum height', () => {
      const win = makeWin({ x: 100, y: 100 });
      const result = clampResize(win, 400, 10);
      expect(result.h).toBe(MIN_H);
    });

    it('clamps width to viewport minus window x', () => {
      const win = makeWin({ x: 1000, y: 100 });
      const result = clampResize(win, 9999, 300);
      expect(result.w).toBe(1400 - 1000);
    });

    it('clamps height to viewport minus y and dock', () => {
      const win = makeWin({ x: 100, y: 100 });
      const result = clampResize(win, 400, 9999);
      expect(result.h).toBe(900 - 100 - DOCK_H);
    });

    it('allows valid size through unchanged', () => {
      const win = makeWin({ x: 100, y: 100 });
      const result = clampResize(win, 400, 300);
      expect(result.w).toBe(400);
      expect(result.h).toBe(300);
    });
  });
});
