import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../utils/format.js';
import { LogoutIcon } from '../components/icons.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    toast.info('Signed out');
    navigate('/login');
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400">
        ← Back to dashboard
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">Profile</h1>

      <div className="card">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-16 w-16 rounded-full" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-semibold text-white">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-100 text-sm dark:divide-neutral-800 dark:border-neutral-800">
          <div className="flex justify-between py-3">
            <dt className="text-gray-500 dark:text-neutral-400">Full name</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500 dark:text-neutral-400">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500 dark:text-neutral-400">Member since</dt>
            <dd className="font-medium">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>

        <button onClick={handleLogout} className="btn-danger mt-6">
          <LogoutIcon width={16} height={16} /> Sign out
        </button>
      </div>
    </div>
  );
}
