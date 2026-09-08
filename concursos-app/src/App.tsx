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

        <div className="mt-6">
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

function EstadoVazio() {
  return (
    <div className="rounded-xl border border-dashed border-border-subtle px-6 py-16 text-center text-sm text-ink-faint">
      Nenhuma questão encontrada com esses filtros. Tente ajustar os critérios de busca.
    </div>
  );
}
