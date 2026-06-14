import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the desktop shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const shell = (fixture.nativeElement as HTMLElement).querySelector('app-desktop-shell');
    expect(shell).not.toBeNull();
  });
});
