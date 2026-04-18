import type { Repo } from '@/api/githubRequests';
import { Badge, variantForLanguage } from './Badge';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  repo: Repo;
}

const StarIcon = () => (
  <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0l2.5 5 5.5.8-4 3.9.9 5.5L8 12.5 3.1 15.2 4 9.7 0 5.8l5.5-.8L8 0z" />
  </svg>
);

const ForkIcon = () => (
  <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M5 3a2 2 0 11-1 3.732V8.5A1.5 1.5 0 005.5 10h5A1.5 1.5 0 0012 8.5V6.732A2 2 0 1113 6.732V8.5A2.5 2.5 0 0110.5 11H9v1.268a2 2 0 11-2 0V11H5.5A2.5 2.5 0 013 8.5V6.732A2 2 0 015 3zm0 1a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zm-3 9a1 1 0 100 2 1 1 0 000-2z" />
  </svg>
);

const ExternalIcon = () => (
  <svg
    aria-hidden
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
  >
    <path d="M6 3h7v7" />
    <path d="M13 3L6 10" />
    <path d="M11 9v4H3V5h4" />
  </svg>
);

export const ProjectCard = ({ repo }: ProjectCardProps) => (
  <a className={styles.card} href={repo.html_url} target="_blank" rel="noopener noreferrer">
    <header className={styles.header}>
      <h3 className={styles.title}>{repo.name}</h3>
      <span className={styles.externalIcon}>
        <ExternalIcon />
      </span>
    </header>
    {repo.description ? (
      <p className={styles.description}>{repo.description}</p>
    ) : (
      <p className={styles.description} style={{ fontStyle: 'italic' }}>
        No description provided.
      </p>
    )}
    <footer className={styles.meta}>
      {repo.language ? (
        <Badge variant={variantForLanguage(repo.language)}>{repo.language}</Badge>
      ) : (
        <span />
      )}
      <div className={styles.stats}>
        <span className={styles.stat}>
          <StarIcon /> {repo.stargazers_count}
        </span>
        <span className={styles.stat}>
          <ForkIcon /> {repo.forks_count}
        </span>
      </div>
    </footer>
  </a>
);
