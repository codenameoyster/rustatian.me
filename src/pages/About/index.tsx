import { Helmet } from 'react-helmet-async';
import { SectionHead } from '@/components/ui/SectionHead';
import { Timeline, TimelineItem } from '@/components/ui/TimelineItem';
import { EDUCATION, LANGUAGES, SKILL_GROUPS, TIMELINE } from '@/data/profile';
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

        <section aria-labelledby="edu-head">
          <SectionHead id="edu-head" title="Education & languages" meta="// basics" />
          <div className={styles.twoCol}>
            <div>
              <div className="label" style="margin-bottom: var(--s-3)">
                Education
              </div>
              {EDUCATION.map(e => (
                <div key={e.name} className={styles.edu}>
                  <div className={styles.eduDate}>{e.date}</div>
                  <div className={styles.eduName}>{e.name}</div>
                  <div className={styles.eduDetail}>{e.detail}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="label" style="margin-bottom: var(--s-3)">
                Languages
              </div>
              <dl className={`${styles.kvList} ${styles.kvListNarrow}`}>
                {LANGUAGES.map(l => [
                  <dt key={`${l.key}-k`}>{l.key}</dt>,
                  <dd key={`${l.key}-v`}>{l.value}</dd>,
                ])}
              </dl>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export { About };
export default About;
