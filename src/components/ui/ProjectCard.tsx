import type { Repo } from '@/api/githubRequests';
import { PROFILE } from '@/data/profile';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  repo: Repo;
}

const LANG_COLORS: Record<string, string> = {
  Go: '#00ADD8',
  Rust: '#dea584',
  Python: '#3572A5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  C: '#555555',
  'C++': '#f34b7d',
  Shell: '#89e051',
  HTML: '#e34c26',
  PHP: '#4F5D95',
  Dockerfile: '#384d54',
};

const fmtCount = (n: number | null | undefined): string => {
  if (n == null) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
};

const langColor = (lang: string | null): string => {
  if (!lang) return 'var(--fg-3)';
  return LANG_COLORS[lang] ?? 'var(--fg-3)';
};

export const ProjectCard = ({ repo }: ProjectCardProps) => {
  const lang = repo.language ?? '—';
  return (
    <a className={styles.project} href={repo.html_url} target="_blank" rel="noopener noreferrer">
      <div className={styles.head}>
        <span className={styles.name}>
          <span className={styles.slash}>{PROFILE.handle}/</span>
          {repo.name}
        </span>
        <span className="kbd" aria-hidden>
          ↗
        </span>
      </div>
      <div className={styles.desc}>{repo.description || '—'}</div>
      <div className={styles.meta}>
        <span className={styles.lang} style={`--_lang-color: ${langColor(repo.language)}`}>
          {lang}
        </span>
        <span className={styles.stars}>{fmtCount(repo.stargazers_count)}</span>
        <span className={styles.forks}>{fmtCount(repo.forks_count)}</span>
      </div>
    </a>
  );
};
