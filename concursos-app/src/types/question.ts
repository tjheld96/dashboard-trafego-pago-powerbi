export type Letra = "A" | "B" | "C" | "D" | "E";

export interface Alternativa {
  letra: Letra;
  texto: string;
}

export interface AlternativaComentada {
  letra: Letra;
  texto: string[];
}

export interface TabelaResumo {
  colunas: string[];
  linhas: string[][];
}

export interface Resolucao {
  /** A ideia-chave para destravar a questão, geralmente ligada ao verbo do enunciado */
  chave: string;
  /** Parágrafos explicando por que a alternativa correta é a correta */
  porqueCorreta: string[];
  /** Explicação de cada alternativa incorreta, na ordem das alternativas */
  porqueErradas: AlternativaComentada[];
  /** Tabela-resumo opcional (ex: momento do ciclo x conceito) */
  tabela?: TabelaResumo;
  /** Dica final de como resolver questões parecidas */
  dicaFinal?: string[];
}

export interface Estatisticas {
  totalRespostas: number;
  acertos: number;
}

export interface Question {
  codigo: string;
  ano: number;
  banca: string;
  orgao: string;
  cargo: string;
  area: string;
  prova: string;
  tema: string;
  assunto: string;
  palavrasChave: string[];
  enunciado: string;
  alternativas: Alternativa[];
  gabarito: Letra;
  resolucao: Resolucao;
  estatisticas: Estatisticas;
}
