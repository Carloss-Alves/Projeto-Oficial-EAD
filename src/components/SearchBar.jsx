export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-md">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pesquisar nota técnica..."
        className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-300 shadow-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-400/15 dark:border-white/10 dark:bg-ink-700/40 dark:text-white dark:placeholder:text-ink-300"
      />
    </div>
  );
}
