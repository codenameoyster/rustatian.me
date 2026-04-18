import { EMAIL, GITHUB, LINKEDIN, TWITCH, YOUTUBE } from '@/constants';

export interface Skill {
  name: string;
  variant: 'go' | 'rust' | 'python' | 'ai';
}

export interface TimelineEntry {
  period: string;
  role: string;
  org: string;
  summary: string;
  tags?: string[];
}

export interface Achievement {
  title: string;
  tier: 1 | 2 | 3 | 4;
  detail?: string;
}

export interface SocialLinkDef {
  label: string;
  href: string;
  handle: string;
  icon: 'github' | 'linkedin' | 'twitch' | 'youtube' | 'email';
}

export const HERO = {
  name: 'Valery Piashchynski',
  handle: 'rustatian',
  tagline: 'Systems engineer · Go, Rust, C++ · OSS maintainer',
  intro:
    'I build high-performance application servers, runtimes and developer tooling. Maintainer of RoadRunner (PHP application server), long-time contributor across the Go & Rust ecosystems, and currently spending my time on AI-infra glue and low-latency services.',
};

export const SKILLS: Skill[] = [
  { name: 'Go', variant: 'go' },
  { name: 'Rust', variant: 'rust' },
  { name: 'Python', variant: 'python' },
  { name: 'C / C++', variant: 'rust' },
  { name: 'TypeScript', variant: 'python' },
  { name: 'Kubernetes', variant: 'ai' },
  { name: 'gRPC / Protobuf', variant: 'go' },
  { name: 'LLM tooling', variant: 'ai' },
];

export const TIMELINE: TimelineEntry[] = [
  {
    period: '2023 — now',
    role: 'Staff Engineer',
    org: 'Private AI / infra',
    summary:
      'Designing low-latency inference routing, model-serving primitives and the plumbing around them. Go + Rust, a bit of Python at the edges.',
    tags: ['Go', 'Rust', 'LLM infra'],
  },
  {
    period: '2020 — 2023',
    role: 'Principal Engineer',
    org: 'Spiral Scout',
    summary:
      'Rebuilt RoadRunner v2 from the ground up — a Go-based PHP application server with a plugin runtime. Shipped jobs, workflows, temporal integration, and the v3 line.',
    tags: ['Go', 'OSS', 'Performance'],
  },
  {
    period: '2017 — 2020',
    role: 'Backend Engineer',
    org: 'Various',
    summary:
      'High-throughput services in Go and a good deal of C++ for embedded + networking work. Picked up Rust along the way and never put it down.',
    tags: ['Go', 'C++', 'Rust'],
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { title: 'RoadRunner maintainer', tier: 1, detail: '8k★ Go app server' },
  { title: 'CNCF contributor', tier: 2 },
  { title: 'Conference speaker', tier: 3, detail: 'GopherCon EU, others' },
  { title: 'Open source, 10+ years', tier: 4 },
];

export const SOCIALS: SocialLinkDef[] = [
  { label: 'GitHub', href: GITHUB, handle: '@rustatian', icon: 'github' },
  { label: 'LinkedIn', href: LINKEDIN, handle: 'in/rustatian', icon: 'linkedin' },
  { label: 'Twitch', href: TWITCH, handle: 'rustatian', icon: 'twitch' },
  { label: 'YouTube', href: YOUTUBE, handle: '@rustatian', icon: 'youtube' },
  { label: 'Email', href: `mailto:${EMAIL}`, handle: EMAIL, icon: 'email' },
];
