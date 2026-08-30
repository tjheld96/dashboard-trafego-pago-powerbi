# Tibia Idle Online

Um jogo idle multiplayer inspirado no Tibia: crie um caçador, escolha sua vocação, distribua pontos de atributo, evolua suas skills e mande-o caçar automaticamente em diferentes áreas — mesmo com o navegador fechado. Ranking global, contador de jogadores online e chat em tempo real via WebSocket.

> Todo o visual (sprites do personagem e dos monstros) é arte original feita em CSS/SVG — não usa nenhum asset do jogo Tibia (CipSoft), apenas o conceito de vocações/skills/hunts como inspiração.

## Funcionalidades

- **Conta e personagem**: registro/login com e-mail e senha (JWT), um personagem por conta.
- **Vocações**: Cavaleiro, Paladino, Sorcerer e Druida, cada uma com atributo primário e estilo de combate diferente.
- **Atributos**: Força, Destreza, Inteligência e Vitalidade — ganhe pontos a cada level up e distribua onde quiser.
- **Skills passivas**: Combate Corpo a Corpo, Combate à Distância, Nível Mágico e Escudo, que sobem com o uso durante as caçadas.
- **Hunts (caça automática)**: escolha uma área de caça (desbloqueada por nível) e o personagem luta sozinho contra os monstros da região, ganhando XP, ouro e troféus.
- **Progresso offline**: feche o navegador com a caçada ativa e, ao voltar, o servidor calcula tudo o que aconteceu enquanto você esteve fora (limitado a 12h).
- **Animações**: cena de caça com sprites originais animados (idle, ataque, dano recebido, morte do monstro, level up) e números de dano flutuantes.
- **Multiplayer real**: contador de jogadores online, ranking global por nível/experiência e chat global — tudo via Socket.IO.

## Arquitetura

Monorepo com npm workspaces:

```
packages/
  shared/   # tipos, dados do jogo (vocações, monstros, áreas de caça) e fórmulas — usados por client e server
  server/   # Node.js + Express + Socket.IO + Prisma (SQLite) — autoritativo: todo o combate roda no servidor
  client/   # React + Vite + TypeScript — interface e animações
```

O servidor é **autoritativo**: toda a simulação de combate (dano, XP, level up, morte) acontece no back-end, em um loop de "ticks" a cada 2 segundos por caçada ativa. O cliente apenas exibe o que o servidor envia via WebSocket. Isso é o que permite o progresso offline e o ranking confiável.

## Rodando localmente

Pré-requisitos: Node.js 18+.

```bash
# na raiz de tibia-idle-game/
npm install

# build do pacote compartilhado (necessário antes do server)
npm run build -w packages/shared
```

### Servidor

```bash
cd packages/server
cp .env.example .env
npx prisma migrate dev --name init   # cria o banco SQLite local
npm run dev                          # http://localhost:4000
```

### Cliente

Em outro terminal:

```bash
cd packages/client
cp .env.example .env
npm run dev                          # http://localhost:5173
```

Abra `http://localhost:5173`, crie uma conta, escolha uma vocação e comece a caçar.

## Build de produção

```bash
npm run build   # builda shared, server e client, na raiz do monorepo
```

- `packages/server`: rode com `npm start -w packages/server` (usa `dist/index.js`). Configure `DATABASE_URL` para um Postgres/SQLite de produção, `JWT_SECRET` forte e `CLIENT_ORIGIN` com a URL do front-end.
- `packages/client`: `npm run build -w packages/client` gera arquivos estáticos em `packages/client/dist`, prontos para qualquer hospedagem estática (Vercel, Netlify, etc). Configure `VITE_API_URL` apontando para o servidor.

## Próximos passos (fora do escopo desta versão)

- Sistema de inventário/equipamentos (hoje o loot vira ouro/troféus automaticamente).
- Custo de mana para feitiços dos vocações mágicas.
- Guildas e chat privado.
- Múltiplos personagens por conta.
