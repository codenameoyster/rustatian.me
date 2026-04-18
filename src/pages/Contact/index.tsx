import { Helmet } from 'react-helmet-async';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHead } from '@/components/ui/SectionHead';
import { SocialLink } from '@/components/ui/SocialLink';
import { HERO, SOCIALS } from '@/data/profile';
import { useGitHubUser } from '@/hooks/useGitHub';
import styles from './Contact.module.css';

const Contact = () => {
  const { data: user } = useGitHubUser();

  return (
    <>
      <Helmet>
        <title>Contact · {HERO.name}</title>
        <meta
          name="description"
          content={`Get in touch with ${HERO.name} — GitHub, LinkedIn, email and more.`}
        />
      </Helmet>

      <PageHeader
        eyebrow="contact"
        title="Get in touch"
        tagline="Open-source collaboration, speaking invites, or just to say hi — pick a channel."
        avatarUrl={user?.avatar_url}
        avatarAlt={user?.name ?? HERO.name}
      />

      <section aria-labelledby="channels-head">
        <SectionHead id="channels-head" eyebrow="channels" title="Where to find me" />
        <div className={styles.grid}>
          {SOCIALS.map(social => (
            <SocialLink key={social.label} link={social} />
          ))}
        </div>
      </section>

      <blockquote className={styles.quote}>
        Fastest response is usually on GitHub. I try to keep email for longer conversations.
      </blockquote>
    </>
  );
};

export { Contact };
export default Contact;
