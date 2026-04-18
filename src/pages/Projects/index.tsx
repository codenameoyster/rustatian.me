import { Helmet } from 'react-helmet-async';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { SectionHead } from '@/components/ui/SectionHead';
import { HERO } from '@/data/profile';
import { useFeaturedRepos, useGitHubUser } from '@/hooks/useGitHub';
import styles from './Projects.module.css';

const Projects = () => {
  const { data: user } = useGitHubUser();
  const { data: repos, isLoading, isError, source } = useFeaturedRepos(24);

  return (
    <>
      <Helmet>
        <title>Projects · {HERO.name}</title>
        <meta
          name="description"
          content={`Open-source projects and repositories by ${HERO.name}.`}
        />
      </Helmet>

      <PageHeader
        eyebrow="projects"
        title="Open source"
        tagline={
          source === 'pinned'
            ? 'Pinned repositories — the ones I point people at.'
            : 'Public repositories sorted by stars.'
        }
        avatarUrl={user?.avatar_url}
        avatarAlt={user?.name ?? HERO.name}
      />

      <section aria-labelledby="projects-head">
        <SectionHead
          id="projects-head"
          eyebrow={source === 'pinned' ? 'pinned' : 'public'}
          title={source === 'pinned' ? 'Pinned repositories' : 'Public repositories'}
        />

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : isError ? (
          <p className={styles.empty}>Couldn't reach the GitHub proxy. Try again in a moment.</p>
        ) : repos && repos.length > 0 ? (
          <div className={styles.grid}>
            {repos.map(repo => (
              <ProjectCard key={repo.name} repo={repo} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No projects to show yet.</p>
        )}
      </section>
    </>
  );
};

export { Projects };
export default Projects;
