# Idle Hunter — RPG Idle estilo Tibia

Mini-RPG idle inspirado em Tibia, feito em HTML/CSS/JS puro (sem dependências ou build). Seu personagem caça monstros automaticamente a cada segundo: você só acompanha a batalha, sobe de nível, ganha ouro e compra equipamentos.

## Como jogar

Basta abrir `index.html` em qualquer navegador (ou servir a pasta com um servidor estático, ex: `python3 -m http.server`).

## Funcionalidades

- Combate automático (1 turno por segundo) contra monstros da área selecionada.
- Sistema de níveis, HP, mana, ataque e defesa.
- 4 áreas de caça com dificuldade crescente, desbloqueadas por nível (Esgotos, Floresta, Caverna, Covil do Dragão).
- Ferreiro com armas e armaduras compráveis em ouro.
- Morte do personagem: perde parte do ouro e se recupera no "Templo" antes de voltar a caçar.
- Progresso salvo automaticamente no navegador (`localStorage`).
- Recompensas por tempo offline ao reabrir a aba.
