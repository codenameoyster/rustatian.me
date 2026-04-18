import { EMAIL, GITHUB, LINKEDIN, TWITCH, YOUTUBE } from '@/constants';

export interface Profile {
  name: string;
  handle: string;
  bio: string;
  location: string;
  status: string;
  years: string;
}

export type StatAccent = 'green' | 'blue' | 'yellow' | 'magenta';

export interface Stat {
  key: 'public_repos' | 'followers' | 'following';
  label: string;
  value: string;
  accent: StatAccent;
  delta?: string;
}

export type TechVariant = 'go' | 'rust' | 'python' | 'ai' | 'aws' | 'magenta' | 'neutral';

export interface TechItem {
  label: string;
  variant: TechVariant;
}

export type AchievementTier = 1 | 2 | 3 | 4;

export interface Achievement {
  label: string;
  desc: string;
  tier?: AchievementTier;
}

export type TimelineKind = 'oss' | 'enterprise';

export interface TimelineEntry {
  kind: TimelineKind;
  date: string;
  role: string;
  org: string;
  body: string;
  stack?: string;
  current?: boolean;
}

export interface SkillGroup {
  key: string;
  value: string;
}

export interface EducationEntry {
  date: string;
  name: string;
  detail: string;
}

export interface LanguageEntry {
  key: string;
  value: string;
}

export type SocialIcon = 'github' | 'linkedin' | 'twitch' | 'youtube' | 'email';

export interface SocialItem {
  label: string;
  href: string;
  icon: SocialIcon;
}

export const PROFILE: Profile = {
  name: 'Valery',
  handle: 'rustatian',
  bio: 'Staff backend engineer working on distributed systems, workflow orchestration, and high-throughput runtimes. Primarily Go, Python, and AI.',
  location: 'Wrocław, PL',
  status: 'Available for occasional consulting',
  years: '15+',
};

export const STATS_FALLBACK: Stat[] = [
  {
    key: 'public_repos',
    label: 'Public repos',
    value: '—',
    accent: 'green',
    delta: 'via /api/v1/github/user',
  },
  {
    key: 'followers',
    label: 'Followers',
    value: '—',
    accent: 'blue',
    delta: 'via /api/v1/github/user',
  },
  {
    key: 'following',
    label: 'Following',
    value: '—',
    accent: 'yellow',
    delta: 'via /api/v1/github/user',
  },
];

export const TECH: TechItem[] = [
  { label: 'Go', variant: 'go' },
  { label: 'Python', variant: 'python' },
  { label: 'Rust', variant: 'rust' },
  { label: 'Temporal', variant: 'ai' },
  { label: 'AWS', variant: 'aws' },
  { label: 'Lambda', variant: 'neutral' },
  { label: 'AgentCore', variant: 'neutral' },
  { label: 'EC2', variant: 'neutral' },
  { label: 'SQS', variant: 'neutral' },
  { label: 'S3', variant: 'neutral' },
  { label: 'DynamoDB', variant: 'neutral' },
  { label: 'gRPC', variant: 'neutral' },
  { label: 'Kafka', variant: 'neutral' },
  { label: 'RabbitMQ', variant: 'neutral' },
  { label: 'PostgreSQL', variant: 'neutral' },
  { label: 'Redis', variant: 'neutral' },
  { label: 'Kubernetes', variant: 'neutral' },
  { label: 'Elasticsearch', variant: 'neutral' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { label: 'Pair Extraordinaire', desc: 'Co-authored merged PRs', tier: 3 },
  { label: 'Galaxy Brain', desc: 'Answered discussions', tier: 4 },
  { label: 'Pull Shark', desc: 'Merged pull requests', tier: 4 },
  { label: 'Public Sponsor', desc: 'Sponsored 5+ orgs' },
  { label: 'YOLO', desc: 'Merged without review' },
  { label: 'Quickdraw', desc: 'Fast first response' },
  { label: 'Starstruck', desc: 'Repo with many stars' },
  { label: 'Arctic Code Vault', desc: '2020 Archive Program' },
];

export const TIMELINE: TimelineEntry[] = [
  {
    kind: 'oss',
    date: '03/2018 — Present',
    role: 'Co-Creator & Lead Maintainer',
    org: 'RoadRunner · Open Source',
    body: 'Co-created and shipped a Go application server that has grown to 11M+ installations and 8.5K+ GitHub stars, now deployed in production across enterprise PHP/Go stacks worldwide. Designed a custom IPC layer and extensible plugin system enabling 10+ first-party plugins (Kafka, AMQP, gRPC, HTTP, Redis, Temporal) without per-plugin core changes. Optimized hot paths with binary heaps and topological scheduling to sustain high throughput on commodity hardware.',
    stack: 'Go · Kafka · gRPC · AMQP · Temporal · Redis · Docker · pprof',
    current: true,
  },
  {
    kind: 'enterprise',
    date: '03/2025 — Present',
    role: 'Clinical Workflow Platform',
    org: 'Roche · via SpiralScout',
    body: 'Designed a Temporal-based orchestration engine in Python for multi-step clinical workflows, cutting VM provisioning for 1,500 VMs from 4h to 30m (8× faster) at 99% success. Built the production observability stack (Grafana metrics/logs/traces + Datadog + Prometheus). Shipped Rust integration modules on Kubernetes (Rancher) + PostgreSQL for cross-team dependencies.',
    stack: 'Python · Temporal · Rust · K8s · PostgreSQL · Grafana · Datadog',
    current: true,
  },
  {
    kind: 'enterprise',
    date: '02/2021 — Present',
    role: 'Real-Time Delivery Engine',
    org: 'AppSpace · via SpiralScout',
    body: 'Built a Go/WebSocket/RabbitMQ real-time engine sustaining 3,000+ payloads/sec per node at sub-50ms p99, under strict hardware limits. Designed custom scheduling and batching algorithms from scratch — no off-the-shelf broker met the latency budget — and owned the end-to-end architecture review.',
    stack: 'Go · WebSockets · RabbitMQ',
  },
  {
    kind: 'enterprise',
    date: '03/2018 — 02/2021',
    role: 'Platform Modernization',
    org: 'INTURN · via SpiralScout',
    body: 'Migrated a legacy PHP backend to Go, delivering ~10× lower API response times and significantly reducing infrastructure costs. Built PostgreSQL → Elasticsearch pipelines powering full-text search across the platform\u2019s catalog. Resolved production latency bottlenecks through pprof-led profiling; established the team\u2019s performance-debugging playbook.',
    stack: 'Go · PostgreSQL · Elasticsearch · Redis · pprof',
  },
  {
    kind: 'enterprise',
    date: '04/2017 — 03/2018',
    role: 'Senior Go Engineer',
    org: 'Adexin',
    body: 'Architected Go microservices from scratch for a voice-to-text transcription system used by medical professionals. Delivered a secure license issuance backend achieving 90%+ fulfillment of allocated access slots via optimized scheduling.',
    stack: 'Go',
  },
  {
    kind: 'enterprise',
    date: '08/2010 — 03/2016',
    role: 'Senior .NET Engineer',
    org: 'Enterprise (NDA)',
    body: 'Built an end-to-end encrypted document exchange system (server + client) and high-frequency trading algorithms for NYSE and MOEX. Solved .NET/native interop via P/Invoke and VC++ DLLs; maintained the WCF communication stack.',
    stack: 'C# · .NET · VC++ · WCF',
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  { key: 'Languages', value: 'Go (primary), Python, Rust' },
  {
    key: 'Distributed systems',
    value:
      'Temporal workflow orchestration, event-driven architecture, microservices, in-memory processing',
  },
  { key: 'Messaging & APIs', value: 'gRPC, REST, Kafka, RabbitMQ, AMQP, WebSockets' },
  { key: 'Cloud / AWS', value: 'Lambda, AgentCore, EC2, SQS, S3, DynamoDB, CloudWatch, IAM' },
  { key: 'Data', value: 'PostgreSQL, Redis, Elasticsearch' },
  {
    key: 'Infra & platform',
    value: 'Kubernetes, Docker, Terraform, AWS (EC2, RDS, S3), GitHub Actions, Linux',
  },
  {
    key: 'Performance & reliability',
    value:
      'pprof profiling, benchmarking, SLO/SLA design, observability (Prometheus, Grafana, Datadog)',
  },
  { key: 'AI / LLM', value: 'OpenAI API, Anthropic Claude, AutoGen, CrewAI' },
];

export const EDUCATION: EducationEntry[] = [
  { date: '2003 — 2008', name: 'Academy of Belarus', detail: 'Engineer, Information Technology' },
  { date: '2010 — 2012', name: 'Yanka Kupala State University', detail: 'Finance' },
];

export const LANGUAGES: LanguageEntry[] = [
  { key: 'English', value: 'Professional' },
  { key: 'Polish', value: 'B2' },
  { key: 'Russian', value: 'Native' },
  { key: 'Belarusian', value: 'Native' },
];

export const SOCIALS: SocialItem[] = [
  { label: 'GitHub', href: GITHUB, icon: 'github' },
  { label: 'LinkedIn', href: LINKEDIN, icon: 'linkedin' },
  { label: 'Twitch', href: TWITCH, icon: 'twitch' },
  { label: 'YouTube', href: YOUTUBE, icon: 'youtube' },
  { label: 'Email', href: `mailto:${EMAIL}`, icon: 'email' },
];
