import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHead } from '@/components/ui/SectionHead';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { ACHIEVEMENTS, HERO, SKILLS, TIMELINE } from '@/data/profile';
import { useGitHubUser } from '@/hooks/useGitHub';
import styles from './About.module.css';

const TierClass: Record<number, string | undefined> = {
  1: styles.tier1,
  2: styles.tier2,
  3: styles.tier3,
  4: styles.tier4,
};

const About = () => {
  const { data: user } = useGitHubUser();

  return (
    <>
      <Helmet>
        <title>About · {HERO.name}</title>
        <meta name="description" content={`About ${HERO.name} — ${HERO.tagline}`} />
      </Helmet>

      <PageHeader
        eyebrow="about"
        title="Background & experience"
        tagline={HERO.intro}
        avatarUrl={user?.avatar_url}
        avatarAlt={user?.name ?? HERO.name}
      />

      <section aria-labelledby="skills-head" className={styles.section}>
        <SectionHead
          id="skills-head"
          eyebrow="tech stack"
          title="What I reach for"
          description="The languages and ecosystems I've spent the most time in."
        />
        <div className={styles.skills}>
          {SKILLS.map(s => (
            <Badge key={s.name} variant={s.variant}>
              {s.name}
            </Badge>
          ))}
        </div>
      </section>

      <section aria-labelledby="timeline-head" className={styles.section}>
        <SectionHead id="timeline-head" eyebrow="experience" title="Timeline" />
        <ol className={styles.timeline}>
          {TIMELINE.map(entry => (
            <TimelineItem key={`${entry.period}-${entry.role}`} {...entry} />
          ))}
        </ol>
      </section>

      <section aria-labelledby="achievements-head" className={styles.section}>
        <SectionHead id="achievements-head" eyebrow="highlights" title="Achievements" />
        <div className={styles.achievements}>
          {ACHIEVEMENTS.map(a => (
            <div key={a.title} className={styles.achievement}>
              <span className={`${styles.tier} ${TierClass[a.tier]}`} aria-hidden />
              <div>
                <strong>{a.title}</strong>
                {a.detail ? <span className={styles.detail}> — {a.detail}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export { About };
export default About;
