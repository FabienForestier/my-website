export interface AppMeta {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly accentVar: string;
  readonly defaultOpen: boolean;
}

export const APPS: readonly AppMeta[] = [
  { id: 'profile',   title: 'Profile',        icon: 'profile',  accentVar: '--color-accent',  defaultOpen: true  },
  { id: 'work',      title: 'Experience',     icon: 'work',     accentVar: '--color-accent2', defaultOpen: true  },
  { id: 'skills',    title: 'Skills',         icon: 'skills',   accentVar: '--color-green',   defaultOpen: true  },
  { id: 'contact',   title: 'Contact',        icon: 'contact',  accentVar: '--color-yellow',  defaultOpen: false },
  { id: 'readme',    title: 'Readme',         icon: 'readme',   accentVar: '--color-red',     defaultOpen: true  },
  { id: 'reco',      title: 'Recommendations',icon: 'reco',     accentVar: '--color-accent2', defaultOpen: false },
  { id: 'terminal',  title: 'Terminal',       icon: 'terminal', accentVar: '--color-accent',  defaultOpen: false },
  { id: 'education', title: 'Education',      icon: 'readme',   accentVar: '--color-green',   defaultOpen: false },
] as const;
