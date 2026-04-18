import { Helmet } from 'react-helmet-async';
import { SectionHead } from '@/components/ui/SectionHead';
import { Timeline, TimelineItem } from '@/components/ui/TimelineItem';
import { SKILL_GROUPS, TIMELINE } from '@/data/profile';
import styles from './About.module.css';

const About = () => {
  const ossItems = TIMELINE.filter(t => t.kind === 'oss');
  const entItems = TIMELINE.filter(t => t.kind !== 'oss');
  return (
    <>
      <Helmet>
        <title>about · rustatian</title>
        <meta
          name="description"
          content="About Valery 'rustatian' Piashchynski: staff backend engineer, distributed systems, open source."
        />
      </Helmet>

      <div className={`container route-enter ${styles.page}`}>
        <section aria-labelledby="xp-head">
          <SectionHead id="xp-head" title="Experience" meta="// open source · enterprise" />
          <div className={styles.xp}>
            <div className={styles.col}>
              <div className={styles.colHead}>
                <span className={styles.tag}>
                  <span className={`${styles.tagDot} ${styles.tagDotEnt}`} />
                  Enterprise
                </span>
                <span className={styles.count}>{entItems.length} roles</span>
              </div>
              <Timeline compact>
                {entItems.map(t => (
                  <TimelineItem key={`${t.date}-${t.role}`} {...t} />
                ))}
              </Timeline>
            </div>
            <div className={styles.col}>
              <div className={styles.colHead}>
                <span className={styles.tag}>
                  <span className={`${styles.tagDot} ${styles.tagDotOss}`} />
                  Open source
                </span>
                <span className={styles.count}>
                  {ossItems.length} project{ossItems.length === 1 ? '' : 's'}
                </span>
              </div>
              <Timeline compact>
                {ossItems.map(t => (
                  <TimelineItem key={`${t.date}-${t.role}`} {...t} />
                ))}
              </Timeline>
            </div>
          </div>
        </section>

        <section aria-labelledby="skills-head">
          <SectionHead id="skills-head" title="Technical skills" meta="// grouped" />
          <dl className={styles.kvList}>
            {SKILL_GROUPS.map(s => [
              <dt key={`${s.key}-k`}>{s.key}</dt>,
              <dd key={`${s.key}-v`}>{s.value}</dd>,
            ])}
          </dl>
        </section>
      </div>
    </>
  );
};

export { About };
export default About;
