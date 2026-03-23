// ============================================================
//   KONFIGURACJA RYB – dodaj nową rybę tutaj!
//   Skopiuj dowolny wpis i zmień wartości.
// ============================================================

const FISH = {
    // ── POSPOLITE (common) ──────────────────────────────────
    karp: {
        name: "Karp",
        emoji: "🐟",
        rarity: "common",        // common | uncommon | rare | epic | legendary
        chance: 25,              // % szansa na złapanie (suma wszystkich = 100)
        minWeight: 0.5,          // kg
        maxWeight: 8.0,
        baseValue: 10,           // monety za sztukę
        xp: 5,
    },
    płoć: {
        name: "Płoć",
        emoji: "🐠",
        rarity: "common",
        chance: 20,
        minWeight: 0.1,
        maxWeight: 1.5,
        baseValue: 8,
        xp: 4,
    },
    leszcz: {
        name: "Leszcz",
        emoji: "🐡",
        rarity: "common",
        chance: 15,
        minWeight: 0.3,
        maxWeight: 4.0,
        baseValue: 12,
        xp: 5,
    },

    // ── NIEPOSPOLITE (uncommon) ─────────────────────────────
    szczupak: {
        name: "Szczupak",
        emoji: "🦈",
        rarity: "uncommon",
        chance: 14,
        minWeight: 1.0,
        maxWeight: 15.0,
        baseValue: 40,
        xp: 15,
    },
    okoń: {
        name: "Okoń",
        emoji: "🐟",
        rarity: "uncommon",
        chance: 10,
        minWeight: 0.2,
        maxWeight: 3.0,
        baseValue: 30,
        xp: 12,
    },

    // ── RZADKIE (rare) ──────────────────────────────────────
    sum: {
        name: "Sum",
        emoji: "🐬",
        rarity: "rare",
        chance: 7,
        minWeight: 5.0,
        maxWeight: 50.0,
        baseValue: 100,
        xp: 40,
    },
    pstrąg: {
        name: "Pstrąg",
        emoji: "🐟",
        rarity: "rare",
        chance: 5,
        minWeight: 0.5,
        maxWeight: 5.0,
        baseValue: 120,
        xp: 45,
    },

    // ── EPICKIE (epic) ──────────────────────────────────────
    łosoś: {
        name: "Łosoś",
        emoji: "🐡",
        rarity: "epic",
        chance: 3,
        minWeight: 3.0,
        maxWeight: 20.0,
        baseValue: 350,
        xp: 100,
    },
    jesiotr: {
        name: "Jesiotr",
        emoji: "🐋",
        rarity: "epic",
        chance: 0.7,
        minWeight: 10.0,
        maxWeight: 80.0,
        baseValue: 800,
        xp: 200,
    },

    // ── LEGENDARNE (legendary) ──────────────────────────────
    złota_rybka: {
        name: "Złota Rybka",
        emoji: "✨🐠✨",
        rarity: "legendary",
        chance: 0.25,
        minWeight: 0.01,
        maxWeight: 0.1,
        baseValue: 5000,
        xp: 500,
    },
    smok_wodny: {
        name: "Smok Wodny",
        emoji: "🐉",
        rarity: "legendary",
        chance: 0.05,
        minWeight: 100.0,
        maxWeight: 500.0,
        baseValue: 20000,
        xp: 1000,
    },

    // ── ŚMIECI (brak ryby) ──────────────────────────────────
    but: {
        name: "Stary But",
        emoji: "👟",
        rarity: "trash",
        chance: 0,               // sterowane osobno w logice
        minWeight: 0.1,
        maxWeight: 0.5,
        baseValue: 0,
        xp: 1,
    },
    opona: {
        name: "Opona",
        emoji: "⭕",
        rarity: "trash",
        chance: 0,
        minWeight: 2.0,
        maxWeight: 8.0,
        baseValue: 0,
        xp: 1,
    },
};

// Wygląd rzadkości (kolor embeda i etykieta)
const RARITY_STYLES = {
    trash:     { label: "Śmieci",    color: 0x808080, emoji: "🗑️" },
    common:    { label: "Pospolita", color: 0x95a5a6, emoji: "⚪" },
    uncommon:  { label: "Niepospolita", color: 0x2ecc71, emoji: "🟢" },
    rare:      { label: "Rzadka",    color: 0x3498db, emoji: "🔵" },
    epic:      { label: "Epicka",    color: 0x9b59b6, emoji: "🟣" },
    legendary: { label: "Legendarna",color: 0xf1c40f, emoji: "🌟" },
};

// Cooldown w sekundach
const FISHING_COOLDOWN = 30;

// Szansa na wyciągnięcie śmieci (zamiast ryby)
const TRASH_CHANCE = 5; // %

module.exports = { FISH, RARITY_STYLES, FISHING_COOLDOWN, TRASH_CHANCE };
