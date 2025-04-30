import { useLocation } from 'preact-iso';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useContext } from 'preact/hooks';
import { ThemeContext } from '../state/AppContext/ThemeContext';

export function Header() {
	const { url } = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

	return (
		<header>
			<nav>
				<a href="/" class={url == '/' && 'active'}>
					Home
				</a>
			</nav>

      <ThemeSwitcher
        themeToggler={toggleTheme}
        themeName={theme.palette.mode}
      />
		</header>
	);
}
