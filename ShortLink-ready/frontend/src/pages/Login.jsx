import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { LinkIcon, ChartIcon, QrIcon } from '../components/icons.jsx';

const features = [
  { icon: <LinkIcon />, title: 'Custom short links', desc: 'Branded aliases & instant redirects.' },
  { icon: <ChartIcon />, title: 'Click analytics', desc: 'Track clicks, last visit & status.' },
  { icon: <QrIcon />, title: 'QR codes', desc: 'Auto-generated, downloadable QR for every link.' },
];

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const hasClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  async function handleSuccess(credentialResponse) {
    setBusy(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Welcome to ShortLink');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand / marketing panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <LinkIcon width={20} height={20} />
          </span>
          ShortLink
        </div>

        <div>
          <h1 className="text-4xl font-extrabold leading-tight">
            Shorten, share, <br /> and track every link.
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            A fast, modern URL shortener with analytics, QR codes, custom aliases, and expiry —
            all in one clean dashboard.
          </p>

          <div className="mt-10 space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  {f.icon}
                </span>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-white/70">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/50">© {new Date().getFullYear()} ShortLink</p>
      </div>

      {/* Right — sign in */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center lg:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
              <LinkIcon width={24} height={24} />
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Sign in to ShortLink</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
            Continue with your Google account to manage your links.
          </p>

          <div className="mt-8 flex justify-center">
            {hasClientId ? (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => toast.error('Google sign-in failed')}
                theme="filled_black"
                shape="pill"
                text="continue_with"
                width="320"
              />
            ) : (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-left text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
                <p className="font-semibold">Google Client ID missing</p>
                <p className="mt-1">
                  Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code> to enable
                  Google sign-in.
                </p>
              </div>
            )}
          </div>

          {busy && <p className="mt-4 text-sm text-gray-400">Signing you in…</p>}

          <p className="mt-8 text-xs text-gray-400 dark:text-neutral-500">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
