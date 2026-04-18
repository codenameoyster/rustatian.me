import { Helmet } from 'react-helmet-async';
import { ButtonLink } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { SectionHead } from '@/components/ui/SectionHead';
import { StatCard } from '@/components/ui/StatCard';
import { GITHUB } from '@/constants';
import { HERO } from '@/data/profile';
import { useFeaturedRepos, useGitHubUser } from '@/hooks/useGitHub';
import styles from './Home.module.css';

const Home = () => {
  const { data: user } = useGitHubUser();
  const { data: featured, isLoading } = useFeaturedRepos(3);

  const featuredStars = featured?.reduce((acc, repo) => acc + repo.stargazers_count, 0) ?? 0;

  return (
    <>
      <Helmet>
        <title>{HERO.name} · rustatian.me</title>
        <meta name="description" content={HERO.intro} />
        <meta property="og:title" content={`${HERO.name} · rustatian.me`} />
        <meta property="og:description" content={HERO.intro} />
        <meta property="og:type" content="website" />
      </Helmet>

      <PageHeader
        eyebrow="home · rustatian.me"
        title={HERO.name}
        tagline={HERO.tagline}
        avatarUrl={user?.avatar_url}
        avatarAlt={user?.name ?? HERO.name}
      />

      <section className={styles.intro}>
        <p>{HERO.intro}</p>
        <div className={styles.cta}>
          <ButtonLink href={GITHUB} target="_blank" rel="noopener noreferrer">
            GitHub →
          </ButtonLink>
          <ButtonLink href="/projects" variant="secondary">
            Browse projects
          </ButtonLink>
        </div>
      </section>

      <section className={styles.stats} aria-labelledby="stats-head">
        <SectionHead
          id="stats-head"
          eyebrow="by the numbers"
          title="Activity"
          description="Live from the GitHub REST API via an edge-cached worker."
        />
        <div className={styles.statsGrid}>
          <StatCard label="Followers" value={user?.followers ?? 0} />
          <StatCard label="Public repos" value={user?.public_repos ?? 0} />
          <StatCard label="Following" value={user?.following ?? 0} />
          <StatCard
            label="Featured ★"
            value={featuredStars}
            sub={featured?.length ? `across ${featured.length} repos` : undefined}
          />
        </div>
      </section>

      <section aria-labelledby="featured-head">
        <SectionHead
          id="featured-head"
          eyebrow="selected work"
          title="Featured projects"
          description="A handful of things I've pinned — full list on /projects."
        />
        {isLoading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className={styles.projectGrid}>
            {featured.map(repo => (
              <ProjectCard key={repo.name} repo={repo} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Unable to load projects right now.</p>
        )}
      </section>
    </>
  );
};

export { Home };
export default Home;
