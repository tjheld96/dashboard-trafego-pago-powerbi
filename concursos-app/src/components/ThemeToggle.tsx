import type { Tema } from "../hooks/useTheme";

interface ThemeToggleProps {
  tema: Tema;
  onToggle: () => void;
}

export function ThemeToggle({ tema, onToggle }: ThemeToggleProps) {
  const escuro = tema === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
      title={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-ink-muted transition-colors hover:text-ink hover:border-ink-faint"
    >
      {escuro ? <IconSun /> : <IconMoon />}
    </button>
  );
}

function IconSun() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.2" />
        <path d="M12 19.3v2.2" />
        <path d="M4.2 4.2l1.6 1.6" />
        <path d="M18.2 18.2l1.6 1.6" />
        <path d="M2.5 12h2.2" />
        <path d="M19.3 12h2.2" />
        <path d="M4.2 19.8l1.6-1.6" />
        <path d="M18.2 5.8l1.6-1.6" />
      </g>
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 14.5a8.5 8.5 0 1 1-9-11 6.8 6.8 0 0 0 9 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
