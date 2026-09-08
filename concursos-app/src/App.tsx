import { useMemo, useState } from "react";
import { questions } from "./data/questions";
import { Filters, type FiltrosState } from "./components/Filters";
import { QuestionCard } from "./components/QuestionCard";
import { useQuestionProgress } from "./hooks/useQuestionProgress";

const FILTROS_VAZIOS: FiltrosState = { ano: "", banca: "", tema: "", assunto: "", busca: "" };

export default function App() {
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_VAZIOS);
  const { obterProgresso, responder } = useQuestionProgress();

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
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
        <Header totalQuestoes={questions.length} />

        <div className="mt-8">
          <Filters
            filtros={filtros}
            onChange={setFiltros}
            opcoes={opcoes}
            totalResultados={questoesFiltradas.length}
          />
        </div>

        <div className="mt-6 space-y-6">
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

function Header({ totalQuestoes }: { totalQuestoes: number }) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-200">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
          Banco de questões em construção
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Aprova<span className="text-brand-400">+</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/60">
          Resolva questões reais de concurso, veja o gabarito comentado e acompanhe o
          percentual de acerto da comunidade em cada questão.
        </p>
      </div>
      <div className="flex gap-3 self-start sm:self-auto">
        <StatPill valor={totalQuestoes} rotulo="questões" />
      </div>
    </header>
  );
}

function StatPill({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center">
      <div className="text-xl font-bold text-white">{valor}</div>
      <div className="text-[11px] uppercase tracking-wide text-white/50">{rotulo}</div>
    </div>
  );
}

function EstadoVazio() {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center text-white/50">
      Nenhuma questão encontrada com esses filtros. Tente ajustar os critérios de busca.
    </div>
  );
}
