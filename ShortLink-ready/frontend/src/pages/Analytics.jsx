import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { linksApi } from '../api/links.js';
import { useToast } from '../context/ToastContext.jsx';
import { FullPageSpinner } from '../components/Spinner.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDateTime, relativeTime } from '../utils/format.js';
import {
  ClickIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  CopyIcon,
  DownloadIcon,
  ExternalIcon,
} from '../components/icons.jsx';

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    linksApi
      .analytics(id)
      .then((res) => active && setData(res.analytics))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Link not found');
        navigate('/');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, navigate, toast]);

  if (loading) return <FullPageSpinner label="Loading analytics…" />;
  if (!data) return null;

  async function copy() {
    await navigator.clipboard.writeText(data.shortUrl);
    toast.success('Short URL copied');
  }

  function downloadQr() {
    const a = document.createElement('a');
    a.href = data.qrCode;
    a.download = `shortlink-${data.shortCode}.png`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400">
        ← Back to dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            /{data.shortCode}
            <StatusBadge status={data.status} />
          </h1>
          <a
            href={data.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 dark:text-neutral-400"
          >
            <ExternalIcon width={14} height={14} />
            {data.originalUrl}
          </a>
        </div>
        <a href={data.shortUrl} target="_blank" rel="noreferrer" className="btn-secondary">
          <ExternalIcon width={16} height={16} /> Visit link
        </a>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Clicks" value={data.totalClicks} icon={<ClickIcon />} accent="brand" />
        <StatCard
          label="Last Click"
          value={relativeTime(data.lastClickedAt)}
          icon={<ClockIcon />}
          accent="emerald"
        />
        <StatCard
          label="Created"
          value={new Date(data.createdAt).toLocaleDateString()}
          icon={<CalendarIcon />}
          accent="amber"
        />
        <StatCard
          label="Status"
          value={data.status === 'active' ? 'Active' : 'Expired'}
          icon={<CheckCircleIcon />}
          accent="brand"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Link details</h2>
          <dl className="divide-y divide-gray-100 text-sm dark:divide-neutral-800">
            <Detail label="Short URL">
              <div className="flex items-center gap-2">
                <span className="font-medium text-brand-600 dark:text-brand-400">{data.shortUrl}</span>
                <button onClick={copy} className="btn-ghost p-1" title="Copy">
                  <CopyIcon width={15} height={15} />
                </button>
              </div>
            </Detail>
            <Detail label="Destination">
              <span className="break-all text-gray-600 dark:text-neutral-300">{data.originalUrl}</span>
            </Detail>
            <Detail label="Custom alias">{data.customAlias || '—'}</Detail>
            <Detail label="Total clicks">{data.totalClicks}</Detail>
            <Detail label="Last clicked">{formatDateTime(data.lastClickedAt)}</Detail>
            <Detail label="Created at">{formatDateTime(data.createdAt)}</Detail>
            <Detail label="Expires at">
              {data.expiresAt ? formatDateTime(data.expiresAt) : 'Never'}
            </Detail>
          </dl>
        </div>

        {/* QR */}
        <div className="card flex flex-col items-center">
          <h2 className="mb-4 self-start text-lg font-semibold">QR code</h2>
          <div className="rounded-xl border border-gray-100 bg-white p-3 dark:border-neutral-800">
            <img src={data.qrCode} alt={`QR for ${data.shortUrl}`} className="h-44 w-44" />
          </div>
          <button onClick={downloadQr} className="btn-primary mt-4 w-full">
            <DownloadIcon width={16} height={16} /> Download QR
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-gray-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
