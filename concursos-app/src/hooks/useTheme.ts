import { useEffect, useState } from "react";

export type Tema = "light" | "dark";

const STORAGE_KEY = "aprovamais:tema";

function temaSistema(): Tema {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function lerTemaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo === "light" || salvo === "dark") return salvo;
  } catch {
    // ignora
  }
  return temaSistema();
}

export function useTheme() {
  const [tema, setTema] = useState<Tema>(() => lerTemaInicial());

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    try {
      localStorage.setItem(STORAGE_KEY, tema);
    } catch {
      // ignora
    }
  }, [tema]);

  function alternar() {
    setTema((atual) => (atual === "dark" ? "light" : "dark"));
  }

  return { tema, alternar };
}
