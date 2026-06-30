import { useState } from 'react';
import { linksApi } from '../api/links.js';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from './Spinner.jsx';
import { LinkIcon } from './icons.jsx';

export default function CreateLinkForm({ onCreated }) {
  const toast = useToast();
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!originalUrl.trim()) return;

    setSubmitting(true);
    try {
      const payload = { originalUrl: originalUrl.trim() };
      if (customAlias.trim()) payload.customAlias = customAlias.trim();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();

      const { link } = await linksApi.create(payload);
      toast.success('Short link created');
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setShowAdvanced(false);
      onCreated?.(link);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create link');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <LinkIcon />
          </span>
          <input
            type="url"
            required
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/your-very-long-url"
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary sm:w-auto" disabled={submitting}>
          {submitting ? <Spinner size={16} /> : null}
          {submitting ? 'Shortening…' : 'Shorten'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((s) => !s)}
        className="mt-3 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        {showAdvanced ? '− Hide options' : '+ Custom alias & expiry'}
      </button>

      {showAdvanced && (
        <div className="mt-3 grid animate-fade-in gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              Custom alias
            </label>
            <input
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="my-link"
              className="input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              Expiry date
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="input"
            />
          </div>
        </div>
      )}
    </form>
  );
}
