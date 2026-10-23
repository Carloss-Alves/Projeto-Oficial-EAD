import SearchBar from "./SearchBar";

export default function Navbar({ search, onSearchChange }) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="dossie-clip flex h-10 w-10 items-center justify-center bg-primary-500 text-sm font-bold text-accent-300">
            NT
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold tracking-tight text-ink-900">
              Treinamento
            </p>
            <p className="text-xs text-ink-300">Notas Técnicas</p>
          </div>
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          <SearchBar value={search} onChange={onSearchChange} />
        </div>
      </div>
    </header>
  );
}
