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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => set("busca", e.target.value)}
            placeholder="Buscar por palavra-chave, enunciado ou assunto..."
            className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
          />
        </div>
        {temFiltroAtivo ? (
          <button
            type="button"
            onClick={() => onChange({ ano: "", banca: "", tema: "", assunto: "", busca: "" })}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      <p className="text-xs text-white/50">
        {totalResultados} {totalResultados === 1 ? "questão encontrada" : "questões encontradas"}
      </p>
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
    <label className="flex flex-col gap-1 text-xs text-white/50">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/10 bg-[#1a1030] px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
