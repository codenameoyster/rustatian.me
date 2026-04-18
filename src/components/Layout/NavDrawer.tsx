import { useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import type { GitHubUser } from '@/api/githubRequests';
import { Badge } from '@/components/ui/Badge';
import { ACHIEVEMENTS, SKILLS } from '@/data/profile';
import styles from './NavDrawer.module.css';

const ROUTES = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
] as const;

interface NavDrawerProps {
  user: GitHubUser | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const UserInfo = ({ user }: { user: GitHubUser | undefined }) => (
  <div className={styles.userCard}>
    {user?.avatar_url ? (
      <img
        className={styles.avatar}
        src={user.avatar_url}
        alt={user.name ?? user.login}
        width={88}
        height={88}
        loading="eager"
      />
    ) : (
      <div className={styles.avatarPlaceholder} aria-hidden>
        R
      </div>
    )}
    <div>
      <p className={styles.name}>{user?.name ?? 'Valery Piashchynski'}</p>
      <p className={styles.handle}>@{user?.login ?? 'rustatian'}</p>
    </div>
  </div>
);

const NavList = ({ onNavigate }: { onNavigate: (href: string) => void }) => {
  const { path } = useLocation();
  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      {ROUTES.map(route => {
        const isActive = path === route.href || (route.href !== '/' && path.startsWith(route.href));
        return (
          <a
            key={route.href}
            href={route.href}
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            onClick={event => {
              if (event.metaKey || event.ctrlKey || event.shiftKey) return;
              event.preventDefault();
              onNavigate(route.href);
            }}
          >
            {route.label}
          </a>
        );
      })}
    </nav>
  );
};

const TierClass = ['', styles.tier1, styles.tier2, styles.tier3, styles.tier4] as const;

export const NavDrawer = ({ user, isOpen, onClose }: NavDrawerProps) => {
  const { route } = useLocation();

  const handleNavigate = useCallback(
    (href: string) => {
      route(href);
      onClose();
    },
    [route, onClose],
  );

  return (
    <aside aria-hidden={!isOpen}>
      <UserInfo user={user} />
      <NavList onNavigate={handleNavigate} />
      <hr className={styles.divider} />

      <p className={styles.subtitle}>Tech stack</p>
      <div className={styles.skills}>
        {SKILLS.map(skill => (
          <Badge key={skill.name} variant={skill.variant}>
            {skill.name}
          </Badge>
        ))}
      </div>
      <hr className={styles.divider} />

      <p className={styles.subtitle}>Achievements</p>
      <div className={styles.achievements}>
        {ACHIEVEMENTS.map(a => (
          <div key={a.title} className={styles.achievement}>
            <span className={`${styles.tierDot} ${TierClass[a.tier]}`} />
            <span className={styles.achievementText}>
              <span className={styles.achievementTitle}>{a.title}</span>
              {a.detail ? <span className={styles.achievementDetail}>{a.detail}</span> : null}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
};
