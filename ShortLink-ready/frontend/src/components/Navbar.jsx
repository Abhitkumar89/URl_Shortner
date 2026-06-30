import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { SunIcon, MoonIcon, LogoutIcon, LinkIcon } from './icons.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.info('Signed out');
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-[#0a0a0a]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <LinkIcon width={18} height={18} />
          </span>
          <span className="text-lg">ShortLink</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="btn-ghost p-2"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {user && (
            <>
              <Link to="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-7 w-7 rounded-full" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
                <span className="hidden text-sm font-medium sm:block">{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost p-2" title="Logout" aria-label="Logout">
                <LogoutIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
