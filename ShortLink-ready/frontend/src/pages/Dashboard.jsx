import { useCallback, useEffect, useState } from 'react';
import { linksApi } from '../api/links.js';
import { useToast } from '../context/ToastContext.jsx';
import useDebounce from '../hooks/useDebounce.js';
import StatCard from '../components/StatCard.jsx';
import CreateLinkForm from '../components/CreateLinkForm.jsx';
import LinkTable from '../components/LinkTable.jsx';
import QrModal from '../components/QrModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';
import { LinkIcon, ClickIcon, CheckCircleIcon, SearchIcon } from '../components/icons.jsx';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expired', label: 'Expired' },
];

export default function Dashboard() {
  const toast = useToast();
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, activeLinks: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const debouncedSearch = useDebounce(search, 350);

  const [qrLink, setQrLink] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await linksApi.list({ search: debouncedSearch, status });
      setLinks(data.links);
      setStats(data.stats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load links');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, toast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function confirmDelete() {
    const link = pendingDelete;
    setPendingDelete(null);
    try {
      await linksApi.remove(link.id);
      toast.success('Link deleted');
      fetchLinks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete link');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Create, manage, and track your short links.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Links" value={stats.totalLinks} icon={<LinkIcon />} accent="brand" />
        <StatCard label="Total Clicks" value={stats.totalClicks} icon={<ClickIcon />} accent="emerald" />
        <StatCard label="Active Links" value={stats.activeLinks} icon={<CheckCircleIcon />} accent="amber" />
      </div>

      {/* Create */}
      <div className="mb-6">
        <CreateLinkForm onCreated={fetchLinks} />
      </div>

      {/* Search + filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon width={16} height={16} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links…"
            className="input pl-9"
          />
        </div>

        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                status === f.key
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card flex justify-center py-16 text-brand-600">
          <Spinner size={32} />
        </div>
      ) : (
        <LinkTable links={links} onDelete={setPendingDelete} onShowQr={setQrLink} />
      )}

      {qrLink && <QrModal link={qrLink} onClose={() => setQrLink(null)} />}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete link?"
          message={`This will permanently delete /${pendingDelete.shortCode} and its analytics. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
