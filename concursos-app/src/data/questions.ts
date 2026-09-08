import type { Question } from "../types/question";

export const questions: Question[] = [
  {
    codigo: "VUNESP-DPESP-RP-2023-001",
    ano: 2023,
    banca: "VUNESP",
    orgao: "DPE-SP",
    cargo: "Agente de Defensoria",
    area: "Relações Públicas",
    prova: "VUNESP - DPE SP - Agente - Área: Relações Públicas - 2023",
    tema: "Relações Governamentais",
    assunto: "Advocacy e tomada de decisão",
    palavrasChave: [
      "relações governamentais",
      "advocacy",
      "políticas públicas",
      "astroturfing",
      "grassroots",
      "accountability",
      "transparência",
    ],
    enunciado:
      "Na área de relações governamentais uma característica da atividade é o estabelecimento de diálogos para construção de relacionamentos com as autoridades governamentais na elaboração e implementação de políticas públicas que afetam seus interesses para que diferentes setores da sociedade tenham suas vozes e interesses representados junto ao governo. Isto é uma característica de influência em",
    alternativas: [
      { letra: "A", texto: "accountability." },
      { letra: "B", texto: "transparência." },
      { letra: "C", texto: "tomada de decisões." },
      { letra: "D", texto: "astroturfing." },
      { letra: "E", texto: "contexto político." },
    ],
    gabarito: "C",
    resolucao: {
      chave:
        "A chave está no verbo do enunciado: influência. A pergunta não é \"o que é relações governamentais\", mas sobre o que essa atividade influi.",
      porqueCorreta: [
        "O texto descreve exatamente o ciclo decisório: diálogo com autoridades na elaboração e implementação de políticas públicas, para que diferentes setores tenham suas vozes representadas. Elaborar e implementar política pública é decidir. A atividade atua sobre o processo pelo qual o governo escolhe caminhos — antes da escolha, não depois dela.",
        "É a definição funcional do advocacy e do relacionamento institucional com o poder público: levar informação, dados e perspectivas setoriais para dentro do processo decisório, de forma pública e regulada.",
      ],
      porqueErradas: [
        {
          letra: "A",
          texto: [
            "Accountability é prestação de contas: o dever do agente público de responder por seus atos e o direito da sociedade de cobrar. Opera depois da decisão, como controle e responsabilização. O enunciado fala de participação durante a formulação, o que é outro momento do ciclo.",
          ],
        },
        {
          letra: "B",
          texto: [
            "Transparência diz respeito ao acesso à informação: publicidade dos atos, dados abertos, visibilidade dos processos. É condição para que o diálogo seja legítimo, mas não é o objeto influenciado. A transparência viabiliza a relação; a decisão é o que ela busca afetar.",
            "Accountability e transparência são o par clássico de distratores nessas questões, porque ambos pertencem ao vocabulário da governança pública e soam adequados. Mas os dois se referem a controle e visibilidade, não a participação na formulação.",
          ],
        },
        {
          letra: "D",
          texto: [
            "Astroturfing não é apenas incorreta, é o oposto ético do que o enunciado descreve. É a fabricação de apoio popular artificial — mobilização simulada que se apresenta como espontânea, mas foi criada e financiada por um interesse organizado. O termo vem de AstroTurf, marca de grama sintética, em contraste com grassroots, o movimento de base autêntico. O enunciado descreve representação legítima e declarada de interesses; astroturfing é o disfarce dela.",
          ],
        },
        {
          letra: "E",
          texto: [
            "Contexto político é cenário, não objeto de influência. As relações governamentais operam dentro de um contexto político; não é isso que elas modificam.",
          ],
        },
      ],
      tabela: {
        colunas: ["Momento", "Conceito"],
        linhas: [
          ["Antes / durante a formulação", "Tomada de decisões, advocacy, participação"],
          ["Ao longo de todo o processo", "Transparência, acesso à informação"],
          ["Depois da execução", "Accountability, prestação de contas, controle"],
        ],
      },
      dicaFinal: [
        "Para resolver questões assim, identifique em que ponto do ciclo a atividade descrita atua, usando a tabela acima como referência.",
        "E memorize o par que a banca gosta de opor: grassroots (mobilização autêntica de base) x astroturfing (apoio fabricado que simula ser espontâneo).",
      ],
    },
    estatisticas: {
      totalRespostas: 128,
      acertos: 79,
    },
  },
];
