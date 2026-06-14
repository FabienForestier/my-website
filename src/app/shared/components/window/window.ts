import { Component, ElementRef, computed, effect, inject, input, signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme';
import { WindowManagerService } from '../../../desktop/services/window-manager';
import type { WinState } from '../../../desktop/models/window';

@Component({
  selector: 'app-window',
  templateUrl: './window.html',
  host: { class: 'contents' },
})
export class WindowComponent {
  readonly win = input.required<WinState>();
  readonly title = input.required<string>();
  readonly accentVar = input<string>('--color-accent');

  private readonly windowManager = inject(WindowManagerService);
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
    const windowState = this.win();
    return windowState.open && !windowState.minimized;
  });

  readonly accentColor = computed(() => `var(${this.accentVar()})`);

  readonly titleBarBg = computed(() =>
    this.active()
      ? 'linear-gradient(to bottom, var(--color-chrome-bar), var(--color-chrome))'
      : 'var(--color-chrome-bar)',
  );

  readonly containerStyle = computed((): Record<string, string> => {
    const windowState = this.win();
    const shown = this._shown();
    const dark = this.theme.dark();
    const isActive = this.active();
    const accent = this.accentColor();

    const boxShadow = isActive
      ? `0 32px 80px rgba(0,0,0,${dark ? 0.65 : 0.32}), 0 0 0 1px color-mix(in srgb, ${accent} 40%, transparent), inset 0 1px 0 rgba(255,255,255,${dark ? 0.05 : 0.5})`
      : `0 12px 32px rgba(0,0,0,${dark ? 0.45 : 0.18}), inset 0 1px 0 rgba(255,255,255,${dark ? 0.03 : 0.3})`;

    const transition =
      isActive || this.reduce
        ? 'box-shadow .25s'
        : 'transform .3s cubic-bezier(.2,.8,.25,1), opacity .26s ease, box-shadow .25s, left .2s, top .2s, width .2s, height .2s, border-radius .2s';

    const hiddenTransform = this.computeHiddenTransform(windowState);
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
      borderRadius: windowState.max ? '0' : '10px',
      zIndex: String(windowState.z + 10),
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    };

    if (windowState.max) {
      return { ...base, position: 'fixed', left: '0', top: '28px', right: '0', bottom: '0' };
    }

    return {
      ...base,
      position: 'absolute',
      left: `${windowState.x}px`,
      top: `${windowState.y}px`,
      width: `${windowState.w}px`,
      height: `${windowState.h}px`,
    };
  });

  private readonly reduce =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  private readonly animationEffect = effect((onCleanup) => {
    const isVisible = this.visible();
    if (isVisible) {
      this._mounted.set(true);
      if (this.reduce) {
        this._shown.set(true);
        return;
      }
      let secondRafId = 0;
      const firstRafId = requestAnimationFrame(() => {
        secondRafId = requestAnimationFrame(() => this._shown.set(true));
      });
      onCleanup(() => {
        cancelAnimationFrame(firstRafId);
        cancelAnimationFrame(secondRafId);
      });
    } else {
      this._exitKind.set(this.win().minimized ? 'minimize' : 'close');
      this._shown.set(false);
      if (this.reduce) {
        this._mounted.set(false);
        return;
      }
      const timeoutId = window.setTimeout(() => this._mounted.set(false), 320);
      onCleanup(() => window.clearTimeout(timeoutId));
    }
  });

  onWindowMouseDown(): void {
    this.windowManager.focus(this.win().id);
  }

  onTitlePointerDown(event: PointerEvent): void {
    const windowState = this.win();
    if (windowState.max) return;
    if ((event.target as Element).closest('[data-no-drag]')) return;
    event.preventDefault();
    this.windowManager.focus(windowState.id);
    this.dragging.set(true);
    let lastX = event.clientX;
    let lastY = event.clientY;

    const onMove = (moveEvent: PointerEvent): void => {
      const scale = this.scaleOf();
      this.windowManager.move(windowState.id, (moveEvent.clientX - lastX) / scale, (moveEvent.clientY - lastY) / scale);
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
    };
    const onUp = (): void => {
      this.dragging.set(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  onResizePointerDown(dir: string, event: PointerEvent): void {
    const windowState = this.win();
    if (windowState.max) return;
    event.preventDefault();
    event.stopPropagation();
    this.windowManager.focus(windowState.id);
    this.resizing.set(true);
    let lastX = event.clientX;
    let lastY = event.clientY;

    const onMove = (moveEvent: PointerEvent): void => {
      const scale = this.scaleOf();
      const deltaX = (moveEvent.clientX - lastX) / scale;
      const deltaY = (moveEvent.clientY - lastY) / scale;
      this.windowManager.resize(windowState.id, dir.includes('r') ? deltaX : 0, dir.includes('b') ? deltaY : 0);
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
    };
    const onUp = (): void => {
      this.resizing.set(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.windowManager.close(this.win().id);
  }

  onMinimize(event: MouseEvent): void {
    event.stopPropagation();
    this.windowManager.minimize(this.win().id);
  }

  onToggleMax(event: MouseEvent): void {
    event.stopPropagation();
    this.windowManager.toggleMax(this.win().id);
  }

  onDoubleClickTitleBar(): void {
    this.windowManager.toggleMax(this.win().id);
  }

  private computeHiddenTransform(windowState: WinState): string {
    if (this._exitKind() !== 'minimize') return 'scale(0.86)';
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = windowState.max ? viewportWidth / 2 : windowState.x + windowState.w / 2;
    const centerY = windowState.max ? viewportHeight / 2 : windowState.y + windowState.h / 2;
    const offsetX = viewportWidth / 2 - centerX;
    const offsetY = viewportHeight - centerY;
    return `translate(${offsetX}px, ${offsetY}px) scale(0.1)`;
  }

  private scaleOf(): number {
    const parent = (this.el.nativeElement as HTMLElement).parentElement;
    if (!parent) return 1;
    return parent.getBoundingClientRect().width / (parent.offsetWidth || 1) || 1;
  }
}
