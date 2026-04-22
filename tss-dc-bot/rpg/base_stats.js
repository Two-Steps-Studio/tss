// ============================================================================
// TWO STEPS VALLEY - PODSTAWOWE STATYSTYKI (BASE STATS)
// ============================================================================
// Plik ten definiuje podstawowe statystyki początkowe gracza.
// Każdy stat ma:
//   - name: nazwa statystyki
//   - baseValue: wartość początkowa
//   - growth: mnożnik wzrostu
//   - description: opis statystyki
// ============================================================================

module.exports = {
    // ── PODSTAWOWE STATYSTYKI (Base Stats) ───────────────────────────────
    baseStats: {
        hp: {
            name: 'HP',
            baseValue: 100,
            growth: 1.15,
            description: 'Maksymalne punkty życia.',
        },
        atk: {
            name: 'ATK',
            baseValue: 10,
            growth: 1.08,
            description: 'Maksymalna siła ataku.',
        },
        def: {
            name: 'DEF',
            baseValue: 5,
            growth: 1.10,
            description: 'Maksymalna obrona.',
        },
        mana: {
            name: 'Mana',
            baseValue: 50,
            growth: 1.10,
            description: 'Maksymalna ilość maną.',
        },
        luck: {
            name: 'Szczęście',
            baseValue: 10,
            growth: 1.12,
            description: 'Szansa na rzucane kości.',
        },
    },

    // ── STARTOWY EKWIPUNEK (Starter Equipment) ──────────────────────────
    starterEquipment: {
        weapon: {
            name: 'Kostny Kij',
            emoji: '🥢',
            atk: 5,
            def: 0,
            hp: 0,
            xpValue: 0,
        },
        helmet: {
            name: 'Kask Skórny',
            emoji: '🪶',
            atk: 0,
            def: 3,
            hp: 10,
            xpValue: 0,
        },
        chest: {
            name: 'Kamizelka',
            emoji: '🦴',
            atk: 0,
            def: 5,
            hp: 15,
            xpValue: 0,
        },
        pants: {
            name: 'Szkoty',
            emoji: '🧦',
            atk: 0,
            def: 4,
            hp: 10,
            xpValue: 0,
        },
        boots: {
            name: 'Trzewiki',
            emoji: '👢',
            atk: 0,
            def: 3,
            hp: 5,
            xpValue: 0,
        },
        shield: {
            name: 'Tarcza',
            emoji: '🛡️',
            atk: 0,
            def: 8,
            hp: 0,
            xpValue: 0,
        },
        ring: {
            name: 'Pierścień',
            emoji: '💍',
            atk: 0,
            def: 0,
            hp: 0,
            xpValue: 0,
        },
    },

    // ── STARTOWE POZYCJE (Starter Jobs) ─────────────────────────────────
    starterJobs: {
        woodcutting: {
            name: 'Lesniczy',
            emoji: '🪓',
            level: 1,
            cost: 50,
            profit: { wood: 0.5 },
        },
        fishing: {
            name: 'Rybak',
            emoji: '🎣',
            level: 1,
            cost: 60,
            profit: { trout: 0.4, bass: 0.3 },
        },
        mining: {
            name: 'Kopalnik',
            emoji: '⛏️',
            level: 1,
            cost: 100,
            profit: { stone: 0.8 },
        },
    },

    // ── STARTOWE SUROWCE (Starter Resources) ──────────────────────────────
    starterResources: [
        'wood',
        'stone',
    ],

    // ── STARTOWE PASYWNE (Starter Passive) ───────────────────────────────
    starterPassives: {
        passive_income: {
            name: 'Przychod Passywny',
            emoji: '💰',
            baseIncome: 10,
            description: 'Przychód z pasywnych źródeł.',
        },
    },

    // ── STARTOWE SKLEP (Starter Shop) ─────────────────────────────────
    starterShop: {
        potions: {
            strength: { price: 50, effect: 'atk' },
            heal: { price: 40, effect: 'heal' },
            bread: { price: 20, effect: 'mana' },
        },
        materials: {
            wood: { price: 15 },
            stone: { price: 10 },
        },
    },
};
