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
  host: { class: 'block w-full h-full' },
})
export class DesktopShellComponent {
  readonly apps = APPS;
  readonly windowManager = inject(WindowManagerService);
  readonly theme = inject(ThemeService);

  onDockIconClick(id: string): void {
    const windowState = this.windowManager.getWindow(id);
    if (!windowState) return;
    if (windowState.open && !windowState.minimized) {
      if (this.windowManager.topId() === id) {
        this.windowManager.minimize(id);
      } else {
        this.windowManager.focus(id);
      }
    } else {
      this.windowManager.open(id);
    }
  }
}
