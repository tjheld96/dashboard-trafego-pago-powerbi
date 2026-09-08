# Aprova+ — Banco de Questões de Concursos

MVP de uma plataforma de questões de concursos públicos, com foco em interface jovem e intuitiva. Primeira etapa: banco de questões com resolução comentada.

## Funcionalidades

- **Banco de questões** com código único, ano, banca, órgão, cargo, área, prova, tema e assunto.
- **Filtros**: ano, banca, tema, assunto e busca livre por palavra-chave/enunciado.
- **Resolução interativa**: alternativas selecionáveis, feedback imediato de certo/errado e gabarito comentado (explicação da alternativa correta, por que cada alternativa errada não serve, tabela-resumo e dica final).
- **Estatística de acerto por questão** (`% de acertos dos usuários`), atualizada em tempo real conforme os usuários respondem (persistida no navegador via `localStorage` — pronta para ser trocada por um backend real quando o cadastro/assinatura for implementado).

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4

## Rodando localmente

```bash
npm install
npm run dev
```

## Estrutura

- `src/types/question.ts` — modelo de dados de uma questão.
- `src/data/questions.ts` — banco de questões (adicionar novas questões aqui).
- `src/components/Filters.tsx` — barra de filtros.
- `src/components/QuestionCard.tsx` — card de questão com alternativas e resolução.
- `src/hooks/useQuestionProgress.ts` — controla a resposta do usuário e persiste no `localStorage`.

## Próximos passos sugeridos

- Backend real para armazenar respostas e agregar estatísticas entre todos os usuários.
- Autenticação e área de assinatura (acesso completo x gratuito).
- Paginação / carregamento incremental conforme o banco de questões crescer.
- Filtro por disciplina e por cargo, além dos já existentes.
