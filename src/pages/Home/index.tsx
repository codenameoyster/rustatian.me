import { Helmet } from 'react-helmet-async';
import type { GitHubUser } from '@/api/githubRequests';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { ContribGrid } from '@/components/ui/ContribGrid';
import { SectionHead } from '@/components/ui/SectionHead';
import { StatCard } from '@/components/ui/StatCard';
import { PROFILE, STAT_DEFS, STATS_FALLBACK, type Stat, type StatKey, TECH } from '@/data/profile';
import { useGitHubContributions, useGitHubUser } from '@/hooks/useGitHub';
import { computeStreak } from '@/utils/computeStreak';
import styles from './Home.module.css';

type UserLike = Pick<GitHubUser, 'login' | 'public_repos' | 'followers' | 'following'>;

const statsFromUser = (user: UserLike | null | undefined): Stat[] => {
  if (!user) return STATS_FALLBACK;
  const live: Record<StatKey, Pick<Stat, 'value' | 'delta'>> = {
    public_repos: { value: String(user.public_repos), delta: `@${user.login}` },
    followers: { value: String(user.followers), delta: 'live' },
    following: { value: String(user.following), delta: 'live' },
  };
  return STAT_DEFS.map(d => ({ ...d, ...live[d.key] }));
};

const Home = () => {
  const { data: user } = useGitHubUser();
  const { data: contributions } = useGitHubContributions();
  const stats = statsFromUser(user ?? null);
  const metaNote = user ? `// @${user.login} · live` : '// GET /api/v1/github/user';
  const streak = contributions ? computeStreak(contributions.days) : undefined;

  return (
    <>
      <Helmet>
        <title>rustatian — home</title>
        <meta name="description" content={PROFILE.bio} />
        <meta property="og:title" content="rustatian — home" />
        <meta property="og:description" content={PROFILE.bio} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className={`container route-enter ${styles.page}`}>
        <section className={styles.hero} aria-label="Intro">
          <div>
            <p className={styles.bio}>{PROFILE.bio}</p>
            <div className={styles.actions}>
              <ButtonLink variant="primary" href="/about">
                about <span aria-hidden>→</span>
              </ButtonLink>
              <ButtonLink variant="ghost" href="/contact">
                get in touch
              </ButtonLink>
            </div>
            <div className={styles.meta}>
              <div>
                <div className="label">Location</div>
                <div className={styles.metaVal}>{PROFILE.location}</div>
              </div>
              <div>
                <div className="label">Experience</div>
                <div className={styles.metaVal}>
                  <b>{PROFILE.years}</b> years
                </div>
              </div>
              <div>
                <div className="label">Primary</div>
                <div className={styles.metaVal}>Go · Python</div>
              </div>
            </div>
          </div>
          <ContribGrid
            days={contributions?.days}
            total={contributions?.totalContributions}
            streak={streak}
          />
        </section>

        <section aria-labelledby="stats-head">
          <SectionHead id="stats-head" title="GitHub, at a glance" meta={metaNote} />
          <div className={styles.stats}>
            {stats.map(s => (
              <StatCard
                key={s.key}
                label={s.label}
                value={s.value}
                accent={s.accent}
                delta={s.delta}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="tech-head">
          <SectionHead id="tech-head" title="Tech stack" meta="// things I reach for first" />
          <div className={styles.badges}>
            {TECH.map(t => (
              <Badge key={t.label} variant={t.variant}>
                {t.label}
              </Badge>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export { Home };
export default Home;
