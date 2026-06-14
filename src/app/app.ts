import { Component } from '@angular/core';
import { DesktopShellComponent } from './desktop/pages/desktop-shell/desktop-shell';

@Component({
  selector: 'app-root',
  imports: [DesktopShellComponent],
  template: '<app-desktop-shell />',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100dvh;
      }
    `,
  ],
})
export class App {}
