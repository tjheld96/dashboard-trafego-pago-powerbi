import { useMemo, useState } from "react";
import { questions } from "./data/questions";
import { Filters, type FiltrosState } from "./components/Filters";
import { QuestionCard } from "./components/QuestionCard";
import { ThemeToggle } from "./components/ThemeToggle";
import { useQuestionProgress } from "./hooks/useQuestionProgress";
import { useTheme } from "./hooks/useTheme";

const FILTROS_VAZIOS: FiltrosState = { ano: "", banca: "", tema: "", assunto: "", busca: "" };

export default function App() {
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_VAZIOS);
  const { obterProgresso, responder } = useQuestionProgress();
  const { tema, alternar } = useTheme();

  const resumo = useMemo(() => {
    let acertos = 0;
    let erros = 0;
    for (const q of questions) {
      const p = obterProgresso(q.codigo);
      if (p?.respondida) {
        if (p.acertou) acertos++;
        else erros++;
      }
    }
    return { total: questions.length, acertos, erros, naoRespondidas: questions.length - acertos - erros };
  }, [obterProgresso]);

  const opcoes = useMemo(() => {
    const anos = new Set<number>();
    const bancas = new Set<string>();
    const temas = new Set<string>();
    const assuntos = new Set<string>();
    for (const q of questions) {
      anos.add(q.ano);
      bancas.add(q.banca);
      temas.add(q.tema);
      assuntos.add(q.assunto);
    }
    return {
      anos: [...anos].sort((a, b) => b - a),
      bancas: [...bancas].sort(),
      temas: [...temas].sort(),
      assuntos: [...assuntos].sort(),
    };
  }, []);

  const questoesFiltradas = useMemo(() => {
    const busca = filtros.busca.trim().toLowerCase();
    return questions.filter((q) => {
      if (filtros.ano && String(q.ano) !== filtros.ano) return false;
      if (filtros.banca && q.banca !== filtros.banca) return false;
      if (filtros.tema && q.tema !== filtros.tema) return false;
      if (filtros.assunto && q.assunto !== filtros.assunto) return false;
      if (busca) {
        const alvo = [
          q.enunciado,
          q.assunto,
          q.tema,
          q.codigo,
          ...q.palavrasChave,
        ]
          .join(" ")
          .toLowerCase();
        if (!alvo.includes(busca)) return false;
      }
      return true;
    });
  }, [filtros]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
        <Header totalQuestoes={questions.length} tema={tema} onToggleTema={alternar} />

        <div className="mt-5">
          <ProgressSummary resumo={resumo} />
        </div>

        <div className="mt-5">
          <Filters
            filtros={filtros}
            onChange={setFiltros}
            opcoes={opcoes}
            totalResultados={questoesFiltradas.length}
          />
        </div>

        <div className="mt-5 space-y-4">
          {questoesFiltradas.length === 0 ? (
            <EstadoVazio />
          ) : (
            questoesFiltradas.map((questao) => (
              <QuestionCard
                key={questao.codigo}
                questao={questao}
                progresso={obterProgresso(questao.codigo)}
                onResponder={responder}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Header({
  totalQuestoes,
  tema,
  onToggleTema,
}: {
  totalQuestoes: number;
  tema: "light" | "dark";
  onToggleTema: () => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border-subtle pb-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Aprova<span className="text-brand-500">+</span>
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          {totalQuestoes} {totalQuestoes === 1 ? "questão disponível" : "questões disponíveis"}
        </p>
      </div>
      <ThemeToggle tema={tema} onToggle={onToggleTema} />
    </header>
  );
}

interface Resumo {
  total: number;
  acertos: number;
  erros: number;
  naoRespondidas: number;
}

function ProgressSummary({ resumo }: { resumo: Resumo }) {
  const { total, acertos, erros, naoRespondidas } = resumo;
  const respondidas = acertos + erros;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-ink-faint">
        <span>Seu progresso</span>
        <span>
          {respondidas} de {total} respondidas
        </span>
      </div>

      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
        {acertos > 0 && <div className="h-full bg-ok-500" style={{ width: `${pct(acertos)}%` }} />}
        {erros > 0 && <div className="h-full bg-danger-500" style={{ width: `${pct(erros)}%` }} />}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <Stat label="Acertos" value={acertos} className="text-ok-500" />
        <Stat label="Erros" value={erros} className="text-danger-500" />
        <Stat label="Não respondidas" value={naoRespondidas} className="text-ink-faint" />
      </div>
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`font-semibold ${className}`}>{value}</span>
      <span className="text-ink-faint">{label}</span>
    </div>
  );
}

function EstadoVazio() {
  return (
    <div className="rounded-xl border border-dashed border-border-subtle px-6 py-16 text-center text-sm text-ink-faint">
      Nenhuma questão encontrada com esses filtros. Tente ajustar os critérios de busca.
    </div>
  );
}
