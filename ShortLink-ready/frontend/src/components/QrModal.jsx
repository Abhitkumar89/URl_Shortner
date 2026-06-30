import { useEffect, useState } from 'react';
import { linksApi } from '../api/links.js';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from './Spinner.jsx';
import { CloseIcon, DownloadIcon, CopyIcon } from './icons.jsx';

export default function QrModal({ link, onClose }) {
  const toast = useToast();
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    linksApi
      .qr(link.id)
      .then((data) => {
        if (active) setQr(data.qrCode);
      })
      .catch(() => toast.error('Could not load QR code'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [link.id, toast]);

  function download() {
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr;
    a.download = `shortlink-${link.shortCode}.png`;
    a.click();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link.shortUrl);
    toast.success('Short URL copied');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">QR Code</h3>
          <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="flex aspect-square items-center justify-center rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800">
          {loading ? (
            <Spinner size={32} className="text-brand-600" />
          ) : (
            <img src={qr} alt={`QR code for ${link.shortUrl}`} className="h-full w-full" />
          )}
        </div>

        <p className="mt-4 truncate text-center text-sm text-gray-500 dark:text-neutral-400">
          {link.shortUrl}
        </p>

        <div className="mt-4 flex gap-2">
          <button onClick={copyLink} className="btn-secondary flex-1">
            <CopyIcon /> Copy
          </button>
          <button onClick={download} className="btn-primary flex-1" disabled={!qr}>
            <DownloadIcon /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
