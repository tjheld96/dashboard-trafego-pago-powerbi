export interface FiltrosState {
  ano: string;
  banca: string;
  tema: string;
  assunto: string;
  busca: string;
}

interface FiltersProps {
  filtros: FiltrosState;
  onChange: (novo: FiltrosState) => void;
  opcoes: {
    anos: number[];
    bancas: string[];
    temas: string[];
    assuntos: string[];
  };
  totalResultados: number;
}

export function Filters({ filtros, onChange, opcoes, totalResultados }: FiltersProps) {
  function set<K extends keyof FiltrosState>(campo: K, valor: FiltrosState[K]) {
    onChange({ ...filtros, [campo]: valor });
  }

  const temFiltroAtivo =
    filtros.ano || filtros.banca || filtros.tema || filtros.assunto || filtros.busca;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="col-span-2 sm:col-span-1">
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => set("busca", e.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-lg border border-border-subtle bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand-500"
          />
        </div>
        <Select
          label="Ano"
          value={filtros.ano}
          onChange={(v) => set("ano", v)}
          options={opcoes.anos.map((a) => String(a))}
        />
        <Select label="Banca" value={filtros.banca} onChange={(v) => set("banca", v)} options={opcoes.bancas} />
        <Select label="Tema" value={filtros.tema} onChange={(v) => set("tema", v)} options={opcoes.temas} />
        <Select
          label="Assunto"
          value={filtros.assunto}
          onChange={(v) => set("assunto", v)}
          options={opcoes.assuntos}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-ink-faint">
        <span>
          {totalResultados} {totalResultados === 1 ? "questão encontrada" : "questões encontradas"}
        </span>
        {temFiltroAtivo ? (
          <button
            type="button"
            onClick={() => onChange({ ano: "", banca: "", tema: "", assunto: "", busca: "" })}
            className="font-medium text-brand-500 hover:underline"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="w-full rounded-lg border border-border-subtle bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-brand-500"
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
