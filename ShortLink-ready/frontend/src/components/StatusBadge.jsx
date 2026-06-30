export default function StatusBadge({ status }) {
  const active = status === 'active';
  return (
    <span
      className={`badge ${
        active
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
          : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`}
      />
      {active ? 'Active' : 'Expired'}
    </span>
  );
}
