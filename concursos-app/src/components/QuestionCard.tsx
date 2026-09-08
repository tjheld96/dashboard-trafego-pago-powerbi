import { useMemo, useState } from "react";
import type { Letra, Question } from "../types/question";
import type { ProgressoQuestao } from "../hooks/useQuestionProgress";

interface QuestionCardProps {
  questao: Question;
  progresso: ProgressoQuestao | undefined;
  onResponder: (codigo: string, letra: Letra, gabarito: Letra) => void;
}

export function QuestionCard({ questao, progresso, onResponder }: QuestionCardProps) {
  const [selecionada, setSelecionada] = useState<Letra | null>(
    progresso?.letraEscolhida ?? null,
  );
  const [mostrarResolucao, setMostrarResolucao] = useState(false);

  const respondida = Boolean(progresso?.respondida);

  const { totalRespostas, percentual } = useMemo(() => {
    const total = questao.estatisticas.totalRespostas + (respondida ? 1 : 0);
    const certos = questao.estatisticas.acertos + (progresso?.acertou ? 1 : 0);
    return {
      totalRespostas: total,
      acertos: certos,
      percentual: total > 0 ? Math.round((certos / total) * 100) : 0,
    };
  }, [questao, respondida, progresso]);

  function confirmarResposta() {
    if (!selecionada || respondida) return;
    onResponder(questao.codigo, selecionada, questao.gabarito);
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-xl shadow-black/20 overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-brand-500/20 text-brand-200 px-3 py-1 font-mono tracking-wide">
            {questao.codigo}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">{questao.ano}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">{questao.banca}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">{questao.orgao}</span>
          <span className="rounded-full bg-accent-500/20 text-accent-400 px-3 py-1">
            {questao.tema}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>{questao.prova}</span>
        </div>
      </header>

      <div className="px-5 py-5 space-y-5">
        <p className="text-[15px] leading-relaxed text-white/90">{questao.enunciado}</p>

        <div className="space-y-2.5">
          {questao.alternativas.map((alt) => {
            const isSelecionada = selecionada === alt.letra;
            const isGabarito = alt.letra === questao.gabarito;

            let estilo =
              "border-white/10 bg-white/[0.02] hover:border-brand-400/60 hover:bg-brand-500/10";
            if (respondida) {
              if (isGabarito) {
                estilo = "border-ok-500/70 bg-ok-500/10";
              } else if (isSelecionada) {
                estilo = "border-danger-500/70 bg-danger-500/10";
              } else {
                estilo = "border-white/10 bg-white/[0.02] opacity-60";
              }
            } else if (isSelecionada) {
              estilo = "border-brand-400 bg-brand-500/15";
            }

            return (
              <button
                key={alt.letra}
                type="button"
                disabled={respondida}
                onClick={() => setSelecionada(alt.letra)}
                className={`w-full flex items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${estilo}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    respondida && isGabarito
                      ? "bg-ok-500 text-black"
                      : respondida && isSelecionada
                        ? "bg-danger-500 text-white"
                        : isSelecionada
                          ? "bg-brand-400 text-black"
                          : "bg-white/10 text-white/70"
                  }`}
                >
                  {alt.letra}
                </span>
                <span className="text-white/90 pt-0.5">{alt.texto}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!respondida ? (
            <button
              type="button"
              onClick={confirmarResposta}
              disabled={!selecionada}
              className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Responder
            </button>
          ) : (
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                progresso?.acertou
                  ? "bg-ok-500/15 text-ok-500"
                  : "bg-danger-500/15 text-danger-500"
              }`}
            >
              {progresso?.acertou ? "Você acertou! 🎉" : `Você errou. Gabarito: ${questao.gabarito}`}
            </span>
          )}

          {respondida && (
            <button
              type="button"
              onClick={() => setMostrarResolucao((v) => !v)}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              {mostrarResolucao ? "Ocultar comentário" : "Ver comentário do professor"}
            </button>
          )}

          <div className="ml-auto flex items-center gap-2 text-xs text-white/60">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-500 to-brand-400"
                style={{ width: `${percentual}%` }}
              />
            </div>
            <span>
              {percentual}% de acerto <span className="text-white/40">({totalRespostas} respostas)</span>
            </span>
          </div>
        </div>

        {respondida && mostrarResolucao && <Resolucao questao={questao} />}

        <div className="flex flex-wrap gap-1.5 pt-1">
          {questao.palavrasChave.map((palavra) => (
            <span
              key={palavra}
              className="rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-white/50"
            >
              #{palavra}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Resolucao({ questao }: { questao: Question }) {
  const { resolucao } = questao;
  return (
    <div className="space-y-4 rounded-2xl border border-brand-400/20 bg-brand-500/[0.06] p-4 text-sm leading-relaxed text-white/85">
      <p className="italic text-white/70">{resolucao.chave}</p>

      <div>
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-ok-500">
          Por que {questao.gabarito}
        </h4>
        {resolucao.porqueCorreta.map((p, i) => (
          <p key={i} className="mb-2 last:mb-0">
            {p}
          </p>
        ))}
      </div>

      <div>
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-danger-500">
          Por que as demais não servem
        </h4>
        <div className="space-y-3">
          {resolucao.porqueErradas.map((item) => (
            <div key={item.letra}>
              <span className="font-semibold text-white/90">{item.letra} — </span>
              {item.texto.map((p, i) => (
                <p key={i} className="inline">
                  {p}{" "}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {resolucao.tabela && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-xl text-xs">
            <thead>
              <tr className="bg-white/10 text-left text-white/70">
                {resolucao.tabela.colunas.map((col) => (
                  <th key={col} className="px-3 py-2 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resolucao.tabela.linhas.map((linha, i) => (
                <tr key={i} className="border-t border-white/10">
                  {linha.map((cel, j) => (
                    <td key={j} className="px-3 py-2 text-white/80">
                      {cel}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resolucao.dicaFinal && (
        <div className="rounded-xl bg-accent-500/10 px-3 py-2 text-accent-400">
          {resolucao.dicaFinal.map((p, i) => (
            <p key={i} className="mb-1 last:mb-0">
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
