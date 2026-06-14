import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dock-icon',
  templateUrl: './dock-icon.html',
})
export class DockIconComponent {
  readonly name = input.required<string>();
  readonly size = input<number>(21);
}
