"use strict";

/* ==========================================================
   IDLE HUNTER — RPG idle estilo Tibia
   Todo o jogo roda no navegador, sem servidor. O personagem
   ataca sozinho a cada segundo; o jogador só acompanha,
   compra equipamentos e escolhe áreas de caça.
   ========================================================== */

const SAVE_KEY = "idle-hunter-save-v1";
const TICK_MS = 1000;

const AREAS = [
  {
    id: "sewers",
    name: "Esgotos Sombrios",
    minLevel: 1,
    monsters: [
      { name: "Rato Gigante", emoji: "🐀", hp: 15, attack: 3, defense: 0, xp: 5, goldMin: 1, goldMax: 5 },
      { name: "Aranha do Esgoto", emoji: "🕷️", hp: 25, attack: 5, defense: 1, xp: 10, goldMin: 2, goldMax: 8 },
      { name: "Morcego Sujo", emoji: "🦇", hp: 20, attack: 6, defense: 0, xp: 8, goldMin: 2, goldMax: 6 },
    ],
  },
  {
    id: "forest",
    name: "Floresta Selvagem",
    minLevel: 8,
    monsters: [
      { name: "Lobo Cinzento", emoji: "🐺", hp: 45, attack: 9, defense: 2, xp: 20, goldMin: 5, goldMax: 15 },
      { name: "Orc Guerreiro", emoji: "👺", hp: 60, attack: 12, defense: 3, xp: 30, goldMin: 10, goldMax: 25 },
      { name: "Urso Selvagem", emoji: "🐻", hp: 80, attack: 14, defense: 4, xp: 40, goldMin: 15, goldMax: 30 },
    ],
  },
  {
    id: "cave",
    name: "Caverna Amaldiçoada",
    minLevel: 18,
    monsters: [
      { name: "Troll da Caverna", emoji: "🧌", hp: 120, attack: 20, defense: 6, xp: 70, goldMin: 25, goldMax: 50 },
      { name: "Esqueleto Guerreiro", emoji: "💀", hp: 140, attack: 24, defense: 10, xp: 90, goldMin: 35, goldMax: 70 },
      { name: "Ciclope", emoji: "👁️", hp: 160, attack: 26, defense: 8, xp: 100, goldMin: 40, goldMax: 80 },
    ],
  },
  {
    id: "dragonlair",
    name: "Covil do Dragão",
    minLevel: 35,
    monsters: [
      { name: "Demônio Menor", emoji: "👹", hp: 300, attack: 50, defense: 12, xp: 220, goldMin: 90, goldMax: 180 },
      { name: "Dragão Jovem", emoji: "🐉", hp: 350, attack: 45, defense: 15, xp: 250, goldMin: 100, goldMax: 200 },
      { name: "Dragão Ancião", emoji: "🐲", hp: 600, attack: 70, defense: 25, xp: 500, goldMin: 200, goldMax: 400 },
    ],
  },
];

const WEAPON_TIERS = [
  { name: "Espada de Madeira", bonus: 0, cost: 0 },
  { name: "Espada de Ferro", bonus: 5, cost: 100 },
  { name: "Espada de Aço", bonus: 12, cost: 500 },
  { name: "Machado Élfico", bonus: 25, cost: 2000 },
  { name: "Espada Flamejante", bonus: 50, cost: 8000 },
  { name: "Lâmina do Dragão", bonus: 90, cost: 25000 },
];

const ARMOR_TIERS = [
  { name: "Roupas Simples", bonus: 0, cost: 0 },
  { name: "Armadura de Couro", bonus: 4, cost: 100 },
  { name: "Armadura de Ferro", bonus: 10, cost: 500 },
  { name: "Armadura de Cavaleiro", bonus: 20, cost: 2000 },
  { name: "Armadura Dracônica", bonus: 40, cost: 8000 },
  { name: "Placa Celestial", bonus: 75, cost: 25000 },
];

function xpToNext(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newGameState() {
  return {
    name: "Aventureiro",
    level: 1,
    xp: 0,
    hp: 50,
    maxHp: 50,
    mana: 20,
    maxMana: 20,
    baseAttack: 8,
    baseDefense: 3,
    gold: 0,
    deaths: 0,
    weaponTier: 0,
    armorTier: 0,
    areaId: "sewers",
    monster: null, // { name, emoji, hp, maxHp, attack, defense, xp, goldMin, goldMax }
    recovering: false,
    recoverTicksLeft: 0,
    lastSeen: Date.now(),
  };
}

let state = loadGame();
let logEntries = [];

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return newGameState();
    const parsed = JSON.parse(raw);
    return Object.assign(newGameState(), parsed);
  } catch (e) {
    return newGameState();
  }
}

function saveGame() {
  state.lastSeen = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function getAttack() {
  return state.baseAttack + WEAPON_TIERS[state.weaponTier].bonus;
}

function getDefense() {
  return state.baseDefense + ARMOR_TIERS[state.armorTier].bonus;
}

function getArea() {
  return AREAS.find((a) => a.id === state.areaId) || AREAS[0];
}

function log(message, cls) {
  const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  logEntries.push({ time, message, cls });
  if (logEntries.length > 150) logEntries.shift();
  renderLog();
}

function calcDamage(attack, defense) {
  const base = Math.max(1, attack - defense);
  const variance = base * 0.3;
  return Math.max(1, Math.round(base + rand(-variance, variance)));
}

function spawnMonster() {
  const area = getArea();
  const template = area.monsters[rand(0, area.monsters.length - 1)];
  state.monster = {
    name: template.name,
    emoji: template.emoji,
    hp: template.hp,
    maxHp: template.hp,
    attack: template.attack,
    defense: template.defense,
    xp: template.xp,
    goldMin: template.goldMin,
    goldMax: template.goldMax,
  };
  log(`Um(a) ${template.name} ${template.emoji} apareceu!`);
}

function gainXp(amount) {
  state.xp += amount;
  let leveledUp = false;
  while (state.xp >= xpToNext(state.level)) {
    state.xp -= xpToNext(state.level);
    state.level += 1;
    state.maxHp += 12;
    state.maxMana += 6;
    state.baseAttack += 2;
    state.baseDefense += 1;
    state.hp = state.maxHp;
    state.mana = state.maxMana;
    leveledUp = true;
  }
  if (leveledUp) {
    log(`🎉 ${state.name} subiu para o nível ${state.level}!`, "log-levelup");
  }
}

function onMonsterDeath() {
  const m = state.monster;
  const goldReward = rand(m.goldMin, m.goldMax);
  state.gold += goldReward;
  log(`Você derrotou ${m.name} ${m.emoji}! +${m.xp} XP, +${goldReward} de ouro.`, "log-gold");
  gainXp(m.xp);
  state.monster = null;
}

function onPlayerDeath() {
  const lost = Math.floor(state.gold * 0.1);
  state.gold -= lost;
  log(`💀 Você foi derrotado por ${state.monster.name}! Perdeu ${lost} de ouro e foi levado ao Templo.`, "log-danger");
  state.deaths += 1;
  state.monster = null;
  state.hp = state.maxHp;
  state.mana = state.maxMana;
  state.recovering = true;
  state.recoverTicksLeft = 3;
}

function tick() {
  if (state.recovering) {
    state.recoverTicksLeft -= 1;
    if (state.recoverTicksLeft <= 0) {
      state.recovering = false;
      log("Você está pronto para voltar à caçada.");
    }
    render();
    return;
  }

  if (!state.monster) {
    spawnMonster();
    render();
    return;
  }

  const attack = getAttack();
  const defense = getDefense();
  const m = state.monster;

  const dmgToMonster = calcDamage(attack, m.defense);
  m.hp -= dmgToMonster;
  log(`Você ataca ${m.name} causando ${dmgToMonster} de dano.`);

  if (m.hp <= 0) {
    onMonsterDeath();
    render();
    saveGame();
    return;
  }

  const dmgToPlayer = calcDamage(m.attack, defense);
  state.hp -= dmgToPlayer;
  log(`${m.name} ataca você causando ${dmgToPlayer} de dano.`);

  if (state.hp <= 0) {
    onPlayerDeath();
  }

  render();
  saveGame();
}

function selectArea(areaId) {
  const area = AREAS.find((a) => a.id === areaId);
  if (!area || state.level < area.minLevel) return;
  if (state.areaId === areaId) return;
  state.areaId = areaId;
  state.monster = null;
  log(`Você foi caçar em: ${area.name}.`);
  render();
  saveGame();
}

function buyWeapon() {
  const next = state.weaponTier + 1;
  if (next >= WEAPON_TIERS.length) return;
  const item = WEAPON_TIERS[next];
  if (state.gold < item.cost) return;
  state.gold -= item.cost;
  state.weaponTier = next;
  log(`🗡️ Você comprou ${item.name}! Ataque +${item.bonus}.`, "log-gold");
  render();
  saveGame();
}

function buyArmor() {
  const next = state.armorTier + 1;
  if (next >= ARMOR_TIERS.length) return;
  const item = ARMOR_TIERS[next];
  if (state.gold < item.cost) return;
  state.gold -= item.cost;
  state.armorTier = next;
  log(`🛡️ Você comprou ${item.name}! Defesa +${item.bonus}.`, "log-gold");
  render();
  saveGame();
}

function resetGame() {
  if (!confirm("Tem certeza que deseja reiniciar todo o seu progresso?")) return;
  localStorage.removeItem(SAVE_KEY);
  state = newGameState();
  logEntries = [];
  log("Uma nova jornada começou!");
  render();
  saveGame();
}

/* ---------- Progresso offline ---------- */
function applyOfflineProgress() {
  const elapsedMs = Date.now() - (state.lastSeen || Date.now());
  const elapsedSec = Math.floor(elapsedMs / 1000);
  if (elapsedSec < 30) return;

  const cappedSec = Math.min(elapsedSec, 4 * 60 * 60); // limite de 4h
  const area = getArea();
  const avgMonster = area.monsters.reduce(
    (acc, m) => ({
      hp: acc.hp + m.hp / area.monsters.length,
      xp: acc.xp + m.xp / area.monsters.length,
      gold: acc.gold + (m.goldMin + m.goldMax) / 2 / area.monsters.length,
    }),
    { hp: 0, xp: 0, gold: 0 }
  );

  const attack = getAttack();
  const hitsToKill = Math.max(1, Math.ceil(avgMonster.hp / Math.max(1, attack - 2)));
  const secondsPerKill = hitsToKill * (TICK_MS / 1000);
  const efficiency = 0.5; // caçada offline é menos eficiente que online
  const kills = Math.floor((cappedSec / secondsPerKill) * efficiency);

  if (kills > 0) {
    const gained = kills * avgMonster.gold;
    const xpGained = kills * avgMonster.xp;
    state.gold += Math.round(gained);
    gainXp(Math.round(xpGained));
    log(
      `🕒 Enquanto você esteve fora, seu personagem derrotou aproximadamente ${kills} monstro(s), ganhando ${Math.round(
        gained
      )} de ouro e ${Math.round(xpGained)} de XP.`,
      "log-gold"
    );
  }
}

/* ---------- Renderização ---------- */
function render() {
  document.getElementById("playerLevel").textContent = state.level;
  document.getElementById("hpFill").style.width = `${(state.hp / state.maxHp) * 100}%`;
  document.getElementById("hpText").textContent = `${Math.max(0, state.hp)}/${state.maxHp}`;
  document.getElementById("mpFill").style.width = `${(state.mana / state.maxMana) * 100}%`;
  document.getElementById("mpText").textContent = `${state.mana}/${state.maxMana}`;
  const need = xpToNext(state.level);
  document.getElementById("xpFill").style.width = `${Math.min(100, (state.xp / need) * 100)}%`;
  document.getElementById("xpText").textContent = `${state.xp}/${need}`;

  document.getElementById("statAttack").textContent = getAttack();
  document.getElementById("statDefense").textContent = getDefense();
  document.getElementById("statGold").textContent = state.gold;
  document.getElementById("statDeaths").textContent = state.deaths;

  document.getElementById("areaName").textContent = getArea().name;
  document.getElementById("playerMiniHp").style.width = `${(state.hp / state.maxHp) * 100}%`;

  const recoveryNotice = document.getElementById("recoveryNotice");
  if (state.recovering) {
    recoveryNotice.classList.remove("hidden");
    document.getElementById("monsterSprite").textContent = "⛪";
    document.getElementById("monsterName").textContent = "Recuperando forças...";
    document.getElementById("monsterMiniHp").style.width = "0%";
  } else {
    recoveryNotice.classList.add("hidden");
    if (state.monster) {
      document.getElementById("monsterSprite").textContent = state.monster.emoji;
      document.getElementById("monsterName").textContent = `${state.monster.name} (${Math.max(0, state.monster.hp)}/${state.monster.maxHp} HP)`;
      document.getElementById("monsterMiniHp").style.width = `${Math.max(0, (state.monster.hp / state.monster.maxHp) * 100)}%`;
    } else {
      document.getElementById("monsterSprite").textContent = "💤";
      document.getElementById("monsterName").textContent = "Procurando alvo...";
      document.getElementById("monsterMiniHp").style.width = "0%";
    }
  }

  renderAreas();
  renderShop();
}

function renderAreas() {
  const container = document.getElementById("areaList");
  container.innerHTML = "";
  AREAS.forEach((area) => {
    const locked = state.level < area.minLevel;
    const div = document.createElement("div");
    div.className = "area-card" + (locked ? " locked" : "") + (area.id === state.areaId ? " active" : "");
    div.innerHTML = `
      <div class="area-title">${area.name}</div>
      <div class="area-sub">${locked ? `🔒 Requer nível ${area.minLevel}` : `Monstros: ${area.monsters.map((m) => m.emoji).join(" ")}`}</div>
    `;
    if (!locked) div.addEventListener("click", () => selectArea(area.id));
    container.appendChild(div);
  });
}

function renderShop() {
  const container = document.getElementById("shopList");
  container.innerHTML = "";

  const weaponNext = WEAPON_TIERS[state.weaponTier + 1];
  const weaponCard = document.createElement("div");
  weaponCard.className = "shop-card";
  if (weaponNext) {
    weaponCard.innerHTML = `
      <div class="shop-title">🗡️ ${weaponNext.name}</div>
      <div class="shop-sub">Ataque +${weaponNext.bonus} · Custo: ${weaponNext.cost} ouro</div>
      <button class="buy-btn" ${state.gold < weaponNext.cost ? "disabled" : ""}>Comprar</button>
    `;
    weaponCard.querySelector("button").addEventListener("click", buyWeapon);
  } else {
    weaponCard.innerHTML = `<div class="shop-title">🗡️ ${WEAPON_TIERS[state.weaponTier].name}</div><div class="shop-sub">Arma máxima alcançada!</div>`;
  }
  container.appendChild(weaponCard);

  const armorNext = ARMOR_TIERS[state.armorTier + 1];
  const armorCard = document.createElement("div");
  armorCard.className = "shop-card";
  if (armorNext) {
    armorCard.innerHTML = `
      <div class="shop-title">🛡️ ${armorNext.name}</div>
      <div class="shop-sub">Defesa +${armorNext.bonus} · Custo: ${armorNext.cost} ouro</div>
      <button class="buy-btn" ${state.gold < armorNext.cost ? "disabled" : ""}>Comprar</button>
    `;
    armorCard.querySelector("button").addEventListener("click", buyArmor);
  } else {
    armorCard.innerHTML = `<div class="shop-title">🛡️ ${ARMOR_TIERS[state.armorTier].name}</div><div class="shop-sub">Armadura máxima alcançada!</div>`;
  }
  container.appendChild(armorCard);
}

function renderLog() {
  const box = document.getElementById("combatLog");
  box.innerHTML = logEntries
    .slice()
    .reverse()
    .map((e) => `<div class="${e.cls || ""}">[${e.time}] ${e.message}</div>`)
    .join("");
}

/* ---------- Inicialização ---------- */
function init() {
  document.getElementById("playerName").value = state.name;
  document.getElementById("playerName").addEventListener("change", (e) => {
    state.name = e.target.value.trim() || "Aventureiro";
    saveGame();
  });
  document.getElementById("resetBtn").addEventListener("click", resetGame);

  applyOfflineProgress();
  render();
  saveGame();
  setInterval(tick, TICK_MS);
  setInterval(saveGame, 5000);
}

init();
