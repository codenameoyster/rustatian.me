import type { BadgeVariant } from '@/components/ui/Badge';
import { EMAIL, GITHUB, LINKEDIN, TWITCH, YOUTUBE } from '@/constants';

export interface Profile {
  name: string;
  handle: string;
  bio: string;
  location: string;
  status: string;
  years: string;
}

export type StatKey = 'public_repos' | 'followers' | 'following';
export type StatAccent = 'green' | 'blue' | 'yellow' | 'magenta';

export interface Stat {
  key: StatKey;
  label: string;
  value: string;
  accent: StatAccent;
  delta?: string;
}

// Single source of truth for the stats displayed on /. Consumers derive both
// STATS_FALLBACK (below) and the live-hydrated variant (Home.statsFromUser)
// from this tuple so a new stat only needs editing in one place.
export const STAT_DEFS = [
  { key: 'public_repos', label: 'Public repos', accent: 'green' },
  { key: 'followers', label: 'Followers', accent: 'blue' },
  { key: 'following', label: 'Following', accent: 'yellow' },
] as const satisfies readonly Omit<Stat, 'value' | 'delta'>[];

export interface TechItem {
  label: string;
  variant: BadgeVariant;
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

export type SocialIcon = 'github' | 'linkedin' | 'twitch' | 'youtube' | 'email';

export interface SocialItem {
  label: string;
  href: string;
  icon: SocialIcon;
}

export const PROFILE: Profile = {
  name: 'Valery',
  handle: 'rustatian',
  bio: 'Staff backend engineer working on distributed systems, workflow orchestration, high-throughput runtimes, and AI. Primarily Go and Python.',
  location: 'Wrocław, PL',
  status: 'Available for occasional consulting',
  years: '15+',
};

export const STATS_FALLBACK: Stat[] = STAT_DEFS.map(d => ({
  ...d,
  value: '—',
  delta: 'via /api/v1/github/user',
}));

export const TECH: TechItem[] = [
  { label: 'Go', variant: 'go' },
  { label: 'Python', variant: 'python' },
  { label: 'Rust', variant: 'rust' },
  { label: 'Temporal', variant: 'neutral' },
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
    kind: 'oss',
    date: '12/2017 — Present',
    role: 'Algorithms in Rust & Go',
    org: 'Algos · Open Source',
    body: 'A catalogue of algorithm and data-structure implementations in Rust and Go, sourced from classic interview texts, LeetCode, CodeWars and GeeksForGeeks. Organised as separate Go and Rust submodules so each language stays idiomatic with its own test harness, build, and benchmarks. Kept as an ongoing reference and scratchpad for deep-dives into data-structure internals.',
    stack: 'Rust · Go',
    current: true,
  },
  {
    kind: 'oss',
    date: '05/2020 — Present',
    role: 'Dotfiles',
    org: 'dotfiles · Open Source',
    body: 'My personal Arch Linux + Hyprland development environment: a fully-configured Neovim with an isolated Python venv for plugins, a Mason-managed toolchain (LSPs, formatters, linters, DAP adapters) covering Go, Rust, Python and shell, plus curated desktop tooling (bpftune, uwsm, LACT, Mission Center). Used daily as the machine I ship from.',
    stack: 'Neovim · Lua · Bash · Hyprland · Arch Linux',
    current: true,
  },
  {
    kind: 'oss',
    date: '04/2020 — Present',
    role: 'Golang pprof information parser in Rust',
    org: 'rock · Open Source',
    body: 'A Rust library that parses Go\u2019s pprof profile format (zip / pb.gz) end-to-end, backed by mimalloc on Linux for low-overhead allocation. Exposes a single Buffer::decode entry point returning a fully-parsed Profile — designed to drop into an HTTP server for continuous on-the-fly profile ingestion without shelling out to the Go toolchain.',
    stack: 'Rust · Protobuf · mimalloc',
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

export const SOCIALS: SocialItem[] = [
  { label: 'GitHub', href: GITHUB, icon: 'github' },
  { label: 'LinkedIn', href: LINKEDIN, icon: 'linkedin' },
  { label: 'Twitch', href: TWITCH, icon: 'twitch' },
  { label: 'YouTube', href: YOUTUBE, icon: 'youtube' },
  { label: 'Email', href: `mailto:${EMAIL}`, icon: 'email' },
];
