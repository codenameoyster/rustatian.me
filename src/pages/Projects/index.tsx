import { Helmet } from 'react-helmet-async';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { SectionHead } from '@/components/ui/SectionHead';
import { GITHUB } from '@/constants';
import { useFeaturedRepos } from '@/hooks/useGitHub';
import styles from './Projects.module.css';

const Projects = () => {
  const { data: repos, isLoading, isError, source } = useFeaturedRepos(6);
  const meta = isLoading
    ? '// loading …'
    : isError
      ? '// offline — couldn\u2019t reach the worker'
      : `// ${source === 'pinned' ? 'pinned' : 'top-starred'} · ${repos?.length ?? 0} repos`;

  return (
    <>
      <Helmet>
        <title>projects · rustatian</title>
        <meta
          name="description"
          content="Pinned open-source projects from github.com/rustatian, ranked by stargazers and recent activity."
        />
      </Helmet>

      <PageHeader
        eyebrow="projects"
        title="Open-source, pulled from GitHub."
        lead="Pinned repositories from github.com/rustatian. Ranked by a combination of stargazers and recent activity."
      />

      <div className={`container route-enter ${styles.page}`}>
        <section aria-labelledby="pinned-head">
          <SectionHead id="pinned-head" title="Pinned on GitHub" meta={meta} />

          {isLoading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeleton} aria-hidden />
              ))}
            </div>
          ) : isError || !repos || repos.length === 0 ? (
            <div className={styles.grid}>
              <div className={styles.fallback}>
                Unable to load repositories. Visit the profile on{' '}
                <a className="link" href={GITHUB} target="_blank" rel="noopener">
                  GitHub
                </a>
                .
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              {repos.map(repo => (
                <ProjectCard key={repo.name} repo={repo} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export { Projects };
export default Projects;
