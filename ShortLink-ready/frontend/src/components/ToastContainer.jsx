import { CheckCircleIcon, CloseIcon } from './icons.jsx';

const styles = {
  success: 'border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  error: 'border-red-500/30 bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300',
  info: 'border-brand-500/30 bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-300',
};

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex animate-slide-in items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur ${styles[t.type] || styles.info}`}
          role="alert"
        >
          <CheckCircleIcon width={18} height={18} className="mt-0.5 shrink-0" />
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 opacity-60 transition hover:opacity-100"
            aria-label="Dismiss"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
