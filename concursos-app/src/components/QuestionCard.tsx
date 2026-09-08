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
      percentual: total > 0 ? Math.round((certos / total) * 100) : 0,
    };
  }, [questao, respondida, progresso]);

  function confirmarResposta() {
    if (!selecionada || respondida) return;
    onResponder(questao.codigo, selecionada, questao.gabarito);
  }

  return (
    <article className="rounded-xl border border-border-subtle bg-surface">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border-subtle px-5 py-3">
        <h2 className="text-sm font-medium text-ink-muted">{questao.prova}</h2>
        <span className="font-mono text-xs text-ink-faint">{questao.codigo}</span>
      </header>

      <div className="px-5 py-5 space-y-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
          <span>{questao.ano}</span>
          <Ponto />
          <span>{questao.banca}</span>
          <Ponto />
          <span>{questao.orgao}</span>
          <Ponto />
          <span className="text-brand-500 font-medium">{questao.tema}</span>
        </div>

        <p className="text-[15px] leading-relaxed text-ink">{questao.enunciado}</p>

        <div className="space-y-2">
          {questao.alternativas.map((alt) => {
            const isSelecionada = selecionada === alt.letra;
            const isGabarito = alt.letra === questao.gabarito;

            let estilo = "border-border-subtle hover:border-ink-faint";
            if (respondida) {
              if (isGabarito) {
                estilo = "border-ok-500/60 bg-ok-500/[0.06]";
              } else if (isSelecionada) {
                estilo = "border-danger-500/60 bg-danger-500/[0.06]";
              } else {
                estilo = "border-border-subtle opacity-50";
              }
            } else if (isSelecionada) {
              estilo = "border-brand-500 bg-brand-500/[0.05]";
            }

            return (
              <button
                key={alt.letra}
                type="button"
                disabled={respondida}
                onClick={() => setSelecionada(alt.letra)}
                className={`w-full flex items-start gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${estilo}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                    respondida && isGabarito
                      ? "border-ok-500 text-ok-500"
                      : respondida && isSelecionada
                        ? "border-danger-500 text-danger-500"
                        : isSelecionada
                          ? "border-brand-500 text-brand-500"
                          : "border-border-subtle text-ink-faint"
                  }`}
                >
                  {alt.letra}
                </span>
                <span className="text-ink pt-0.5">{alt.texto}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {!respondida ? (
            <button
              type="button"
              onClick={confirmarResposta}
              disabled={!selecionada}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Responder
            </button>
          ) : (
            <span
              className={`text-sm font-medium ${
                progresso?.acertou ? "text-ok-500" : "text-danger-500"
              }`}
            >
              {progresso?.acertou ? "Resposta correta." : `Resposta incorreta. Gabarito: ${questao.gabarito}.`}
            </span>
          )}

          {respondida && (
            <button
              type="button"
              onClick={() => setMostrarResolucao((v) => !v)}
              className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-ink-muted transition hover:border-ink-faint hover:text-ink"
            >
              {mostrarResolucao ? "Ocultar resolução" : "Ver resolução"}
            </button>
          )}

          <div className="ml-auto flex items-center gap-2 text-xs text-ink-faint">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-border-subtle">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${percentual}%` }} />
            </div>
            <span>
              {percentual}% de acerto · {totalRespostas} respostas
            </span>
          </div>
        </div>

        {respondida && mostrarResolucao && <Resolucao questao={questao} />}

        {questao.palavrasChave.length > 0 && (
          <p className="text-xs text-ink-faint">
            <span className="text-ink-muted">Palavras-chave:</span> {questao.palavrasChave.join(", ")}
          </p>
        )}
      </div>
    </article>
  );
}

function Ponto() {
  return <span className="h-0.5 w-0.5 rounded-full bg-ink-faint" aria-hidden="true" />;
}

function Resolucao({ questao }: { questao: Question }) {
  const { resolucao } = questao;
  return (
    <div className="space-y-4 rounded-lg border border-border-subtle bg-canvas p-4 text-sm leading-relaxed text-ink-muted">
      <p className="italic text-ink-faint">{resolucao.chave}</p>

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ok-500">
          Por que {questao.gabarito}
        </h3>
        {resolucao.porqueCorreta.map((p, i) => (
          <p key={i} className="mb-2 text-ink last:mb-0">
            {p}
          </p>
        ))}
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-danger-500">
          Por que as demais não servem
        </h3>
        <div className="space-y-3">
          {resolucao.porqueErradas.map((item) => (
            <p key={item.letra} className="text-ink">
              <span className="font-semibold">{item.letra} — </span>
              {item.texto.join(" ")}
            </p>
          ))}
        </div>
      </div>

      {resolucao.tabela && (
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-surface-raised text-left text-ink-muted">
                {resolucao.tabela.colunas.map((col) => (
                  <th key={col} className="px-3 py-2 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resolucao.tabela.linhas.map((linha, i) => (
                <tr key={i} className="border-t border-border-subtle">
                  {linha.map((cel, j) => (
                    <td key={j} className="px-3 py-2 text-ink">
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
        <div className="border-l-2 border-brand-500 pl-3 text-ink-muted">
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
