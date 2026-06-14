import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DockIconComponent } from './dock-icon';

describe('DockIconComponent', () => {
  let fixture: ComponentFixture<DockIconComponent>;

  function create(name: string, size = 21): DockIconComponent {
    fixture = TestBed.createComponent(DockIconComponent);
    fixture.componentRef.setInput('name', name);
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  const knownIcons = [
    'profile',
    'work',
    'skills',
    'contact',
    'readme',
    'terminal',
    'reco',
    'download',
    'palette',
    'sun',
    'moon',
    'education',
  ];

  it.each(knownIcons)('renders an svg for name="%s"', (name) => {
    create(name);
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('passes the size attribute to the svg element', () => {
    create('profile', 32);
    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
  });

  it('renders nothing for an unknown icon name', () => {
    create('unknown-icon');
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeNull();
  });
});
