import { useCallback, useEffect, useState } from "react";
import type { Letra } from "../types/question";

export interface ProgressoQuestao {
  respondida: boolean;
  letraEscolhida: Letra | null;
  acertou: boolean;
}

type ProgressoMap = Record<string, ProgressoQuestao>;

const STORAGE_KEY = "aprovamais:progresso-questoes";

function lerStorage(): ProgressoMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressoMap) : {};
  } catch {
    return {};
  }
}

function gravarStorage(mapa: ProgressoMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapa));
  } catch {
    // localStorage indisponível (modo privado, quota etc.) — segue apenas em memória
  }
}

export function useQuestionProgress() {
  const [progresso, setProgresso] = useState<ProgressoMap>(() => lerStorage());

  useEffect(() => {
    gravarStorage(progresso);
  }, [progresso]);

  const responder = useCallback(
    (codigo: string, letraEscolhida: Letra, gabarito: Letra) => {
      setProgresso((atual) => {
        if (atual[codigo]?.respondida) return atual;
        return {
          ...atual,
          [codigo]: {
            respondida: true,
            letraEscolhida,
            acertou: letraEscolhida === gabarito,
          },
        };
      });
    },
    [],
  );

  const obterProgresso = useCallback(
    (codigo: string): ProgressoQuestao | undefined => progresso[codigo],
    [progresso],
  );

  return { obterProgresso, responder };
}
