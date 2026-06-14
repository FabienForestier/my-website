export interface Social {
  label: string;
  handle: string;
  url: string;
}

export interface Profile {
  name: string;
  handle: string;
  title: string;
  location: string;
  available: string;
  intro: string;
  longerIntro: string;
  email: string;
  socials: Social[];
}

export interface Experience {
  role: string;
  company: string;
  companyNote: string;
  period: string;
  duration: string;
  location: string;
  summary: string;
  bullets: string[];
  stack: string[];
}

export interface SkillItem {
  name: string;
  level: number;
}

export interface SkillGroup {
  group: string;
  items: SkillItem[];
}

export interface Education {
  school: string;
  degree: string;
  period: string;
  location: string;
  extra: string[];
}

export interface Language {
  name: string;
  level: string;
}

export interface Recommendation {
  name: string;
  role: string;
  company: string;
  date: string;
  text: string;
}

export interface Resume {
  profile: Profile;
  experience: Experience[];
  skills: SkillGroup[];
  education: Education;
  languages: Language[];
  certifications: string[];
  recommendations: Recommendation[];
  cvFile: string;
}
