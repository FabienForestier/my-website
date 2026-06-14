import { Component, inject } from '@angular/core';
import { APPS } from '../../config/apps.config';
import { WindowManagerService } from '../../services/window-manager';
import { ThemeService } from '../../../core/services/theme';
import { WindowComponent } from '../../../shared/components/window/window';
import { DockIconComponent } from '../../../shared/components/dock-icon/dock-icon';

@Component({
  selector: 'app-desktop-shell',
  templateUrl: './desktop-shell.html',
  styleUrl: './desktop-shell.scss',
  imports: [WindowComponent, DockIconComponent],
})
export class DesktopShellComponent {
  readonly apps = APPS;
  readonly wm = inject(WindowManagerService);
  readonly theme = inject(ThemeService);

  onDockIconClick(id: string): void {
    const w = this.wm.getWindow(id);
    if (!w) return;
    if (w.open && !w.minimized) {
      if (this.wm.topId() === id) {
        this.wm.minimize(id);
      } else {
        this.wm.focus(id);
      }
    } else {
      this.wm.open(id);
    }
  }
}
