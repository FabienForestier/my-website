import { Component, ElementRef, computed, effect, inject, input, signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme';
import { WindowManagerService } from '../../../desktop/services/window-manager';
import type { WinState } from '../../../desktop/models/window';

@Component({
  selector: 'app-window',
  templateUrl: './window.html',
  styleUrl: './window.scss',
})
export class WindowComponent {
  readonly win = input.required<WinState>();
  readonly title = input.required<string>();
  readonly accentVar = input<string>('--color-accent');

  private readonly wm = inject(WindowManagerService);
  private readonly theme = inject(ThemeService);
  private readonly el = inject(ElementRef);

  // Animation state — private backing + public readonly views
  private readonly _mounted = signal(false);
  private readonly _shown = signal(false);
  private readonly _exitKind = signal<'close' | 'minimize'>('close');

  readonly mounted = this._mounted.asReadonly();

  // Interaction hover state for traffic lights
  readonly hoverClose = signal(false);
  readonly hoverMin = signal(false);
  readonly hoverMax = signal(false);

  // Drag / resize in-progress flags
  readonly dragging = signal(false);
  readonly resizing = signal(false);

  readonly active = computed(() => this.dragging() || this.resizing());

  readonly visible = computed(() => {
    const w = this.win();
    return w.open && !w.minimized;
  });

  readonly accentColor = computed(() => `var(${this.accentVar()})`);

  readonly titleBarBg = computed(() =>
    this.active()
      ? 'linear-gradient(to bottom, var(--color-chrome-bar), var(--color-chrome))'
      : 'var(--color-chrome-bar)',
  );

  readonly containerStyle = computed((): Record<string, string> => {
    const w = this.win();
    const shown = this._shown();
    const dark = this.theme.dark();
    const a = this.active();
    const accent = this.accentColor();

    const boxShadow = a
      ? `0 32px 80px rgba(0,0,0,${dark ? 0.65 : 0.32}), 0 0 0 1px color-mix(in srgb, ${accent} 40%, transparent), inset 0 1px 0 rgba(255,255,255,${dark ? 0.05 : 0.5})`
      : `0 12px 32px rgba(0,0,0,${dark ? 0.45 : 0.18}), inset 0 1px 0 rgba(255,255,255,${dark ? 0.03 : 0.3})`;

    const transition =
      a || this.reduce
        ? 'box-shadow .25s'
        : 'transform .3s cubic-bezier(.2,.8,.25,1), opacity .26s ease, box-shadow .25s, left .2s, top .2s, width .2s, height .2s, border-radius .2s';

    const hiddenTransform = this.computeHiddenTransform(w);
    const transform = shown ? 'translate(0,0) scale(1)' : hiddenTransform;

    const base: Record<string, string> = {
      background: 'var(--color-chrome)',
      border: '1px solid var(--color-chrome-border)',
      boxShadow,
      transform,
      opacity: shown ? '1' : '0',
      transition,
      willChange: 'transform, opacity',
      transformOrigin: 'center center',
      borderRadius: w.max ? '0' : '10px',
      zIndex: String(w.z + 10),
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    };

    if (w.max) {
      return { ...base, position: 'fixed', left: '0', top: '28px', right: '0', bottom: '0' };
    }

    return {
      ...base,
      position: 'absolute',
      left: `${w.x}px`,
      top: `${w.y}px`,
      width: `${w.w}px`,
      height: `${w.h}px`,
    };
  });

  private readonly reduce =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  private readonly animationEffect = effect((onCleanup) => {
    const v = this.visible();
    if (v) {
      this._mounted.set(true);
      if (this.reduce) {
        this._shown.set(true);
        return;
      }
      let rafId2 = 0;
      const rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => this._shown.set(true));
      });
      onCleanup(() => {
        cancelAnimationFrame(rafId1);
        cancelAnimationFrame(rafId2);
      });
    } else {
      this._exitKind.set(this.win().minimized ? 'minimize' : 'close');
      this._shown.set(false);
      if (this.reduce) {
        this._mounted.set(false);
        return;
      }
      const tm = window.setTimeout(() => this._mounted.set(false), 320);
      onCleanup(() => window.clearTimeout(tm));
    }
  });

  onWindowMouseDown(): void {
    this.wm.focus(this.win().id);
  }

  onTitlePointerDown(e: PointerEvent): void {
    const w = this.win();
    if (w.max) return;
    if ((e.target as Element).closest('[data-no-drag]')) return;
    e.preventDefault();
    this.wm.focus(w.id);
    this.dragging.set(true);
    let lx = e.clientX;
    let ly = e.clientY;

    const onMove = (ev: PointerEvent): void => {
      const s = this.scaleOf();
      this.wm.move(w.id, (ev.clientX - lx) / s, (ev.clientY - ly) / s);
      lx = ev.clientX;
      ly = ev.clientY;
    };
    const onUp = (): void => {
      this.dragging.set(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  onResizePointerDown(dir: string, e: PointerEvent): void {
    const w = this.win();
    if (w.max) return;
    e.preventDefault();
    e.stopPropagation();
    this.wm.focus(w.id);
    this.resizing.set(true);
    let lx = e.clientX;
    let ly = e.clientY;

    const onMove = (ev: PointerEvent): void => {
      const s = this.scaleOf();
      const dx = (ev.clientX - lx) / s;
      const dy = (ev.clientY - ly) / s;
      this.wm.resize(w.id, dir.includes('r') ? dx : 0, dir.includes('b') ? dy : 0);
      lx = ev.clientX;
      ly = ev.clientY;
    };
    const onUp = (): void => {
      this.resizing.set(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  onClose(e: MouseEvent): void {
    e.stopPropagation();
    this.wm.close(this.win().id);
  }

  onMinimize(e: MouseEvent): void {
    e.stopPropagation();
    this.wm.minimize(this.win().id);
  }

  onToggleMax(e: MouseEvent): void {
    e.stopPropagation();
    this.wm.toggleMax(this.win().id);
  }

  onDoubleClickTitleBar(): void {
    this.wm.toggleMax(this.win().id);
  }

  private computeHiddenTransform(w: WinState): string {
    if (this._exitKind() !== 'minimize') return 'scale(0.86)';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = w.max ? vw / 2 : w.x + w.w / 2;
    const cy = w.max ? vh / 2 : w.y + w.h / 2;
    const dx = vw / 2 - cx;
    const dy = vh - cy;
    return `translate(${dx}px, ${dy}px) scale(0.1)`;
  }

  private scaleOf(): number {
    const parent = (this.el.nativeElement as HTMLElement).parentElement;
    if (!parent) return 1;
    return parent.getBoundingClientRect().width / (parent.offsetWidth || 1) || 1;
  }
}
