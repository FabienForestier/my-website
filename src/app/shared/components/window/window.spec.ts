import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WindowComponent } from './window';
import { WindowManagerService } from '../../../desktop/services/window-manager';
import type { WinState } from '../../../desktop/models/window';

function makeWin(overrides: Partial<WinState> = {}): WinState {
  return {
    id: 'profile',
    x: 100,
    y: 100,
    w: 480,
    h: 360,
    z: 1,
    open: true,
    minimized: false,
    max: false,
    ...overrides,
  };
}

describe('WindowComponent', () => {
  let fixture: ComponentFixture<WindowComponent>;
  let wm: WindowManagerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    fixture = TestBed.createComponent(WindowComponent);
    wm = TestBed.inject(WindowManagerService);
  });

  function setWin(win: WinState): void {
    fixture.componentRef.setInput('win', win);
    fixture.componentRef.setInput('title', win.id);
  }

  it('mounts when the window is open', async () => {
    setWin(makeWin({ open: true, minimized: false }));
    fixture.detectChanges();
    // Wait for the double-rAF animation gate to set _shown
    await new Promise((r) => setTimeout(r, 50));
    fixture.detectChanges();
    expect(fixture.componentInstance.mounted()).toBe(true);
  });

  it('stays unmounted when closed', () => {
    setWin(makeWin({ open: false }));
    fixture.detectChanges();
    expect(fixture.componentInstance.mounted()).toBe(false);
  });

  it('calls wm.close when the red traffic light is clicked', async () => {
    setWin(makeWin());
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 50));
    fixture.detectChanges();
    const spy = vi.spyOn(wm, 'close');
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.traffic-light--red');
    btn.click();
    expect(spy).toHaveBeenCalledWith('profile');
  });

  it('calls wm.minimize when the yellow traffic light is clicked', async () => {
    setWin(makeWin());
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 50));
    fixture.detectChanges();
    const spy = vi.spyOn(wm, 'minimize');
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.traffic-light--yellow');
    btn.click();
    expect(spy).toHaveBeenCalledWith('profile');
  });

  it('calls wm.toggleMax when the green traffic light is clicked', async () => {
    setWin(makeWin());
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 50));
    fixture.detectChanges();
    const spy = vi.spyOn(wm, 'toggleMax');
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.traffic-light--green');
    btn.click();
    expect(spy).toHaveBeenCalledWith('profile');
  });

  it('hides resize handles when maximized', async () => {
    setWin(makeWin({ max: true }));
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 50));
    fixture.detectChanges();
    const handle = fixture.nativeElement.querySelector('.win-resize');
    expect(handle).toBeNull();
  });
});
