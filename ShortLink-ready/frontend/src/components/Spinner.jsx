export default function Spinner({ size = 20, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-brand-600 dark:text-brand-400">
      <Spinner size={36} />
      <p className="text-sm text-gray-500 dark:text-neutral-400">{label}</p>
    </div>
  );
}
