export interface AppMeta {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly accentVar: string;
  readonly defaultOpen: boolean;
}

export const APPS: readonly AppMeta[] = [
  { id: 'profile',  title: 'Profile',          icon: 'profile',  accentVar: '--accent',  defaultOpen: true  },
  { id: 'work',     title: 'Experience',        icon: 'work',     accentVar: '--accent2', defaultOpen: true  },
  { id: 'skills',   title: 'Skills',            icon: 'skills',   accentVar: '--green',   defaultOpen: true  },
  { id: 'contact',  title: 'Contact',           icon: 'contact',  accentVar: '--yellow',  defaultOpen: false },
  { id: 'readme',   title: 'Readme',            icon: 'readme',   accentVar: '--red',     defaultOpen: true  },
  { id: 'reco',     title: 'Recommendations',   icon: 'reco',     accentVar: '--accent2', defaultOpen: false },
  { id: 'terminal', title: 'Terminal',          icon: 'terminal', accentVar: '--accent',  defaultOpen: false },
  { id: 'education',title: 'Education',         icon: 'readme',   accentVar: '--green',   defaultOpen: false },
] as const;
