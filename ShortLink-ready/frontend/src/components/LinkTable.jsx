import { Link as RouterLink } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, relativeTime, truncate } from '../utils/format.js';
import {
  CopyIcon,
  TrashIcon,
  QrIcon,
  ChartIcon,
  ExternalIcon,
  LinkIcon,
} from './icons.jsx';

function Row({ link, onDelete, onShowQr }) {
  const toast = useToast();

  async function copy() {
    await navigator.clipboard.writeText(link.shortUrl);
    toast.success('Copied to clipboard');
  }

  return (
    <tr className="border-t border-gray-100 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            /{link.shortCode}
          </a>
          <button onClick={copy} className="text-gray-400 transition hover:text-brand-600" title="Copy">
            <CopyIcon width={15} height={15} />
          </button>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 dark:text-neutral-500">
          <ExternalIcon width={12} height={12} />
          {truncate(link.originalUrl, 44)}
        </div>
      </td>
      <td className="px-4 py-3 text-center font-semibold tabular-nums">{link.totalClicks}</td>
      <td className="hidden px-4 py-3 text-sm text-gray-500 dark:text-neutral-400 md:table-cell">
        {relativeTime(link.lastClickedAt)}
      </td>
      <td className="hidden px-4 py-3 text-sm text-gray-500 dark:text-neutral-400 lg:table-cell">
        {formatDate(link.createdAt)}
      </td>
      <td className="hidden px-4 py-3 text-sm text-gray-500 dark:text-neutral-400 lg:table-cell">
        {link.expiresAt ? formatDate(link.expiresAt) : 'Never'}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={link.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onShowQr(link)} className="btn-ghost p-2" title="QR code">
            <QrIcon width={16} height={16} />
          </button>
          <RouterLink to={`/analytics/${link.id}`} className="btn-ghost p-2" title="Analytics">
            <ChartIcon width={16} height={16} />
          </RouterLink>
          <button
            onClick={() => onDelete(link)}
            className="btn-ghost p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Delete"
          >
            <TrashIcon width={16} height={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function LinkTable({ links, onDelete, onShowQr }) {
  if (!links.length) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-neutral-800">
          <LinkIcon width={22} height={22} />
        </div>
        <div>
          <p className="font-medium">No links found</p>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Create your first short link to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-neutral-900/60 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Short link</th>
              <th className="px-4 py-3 text-center font-medium">Clicks</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Last click</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Created</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <Row key={link.id} link={link} onDelete={onDelete} onShowQr={onShowQr} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
