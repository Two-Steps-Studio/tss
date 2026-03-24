const GEAR = {

    // ── ŻYŁKA – zwiększa wartość złowionych ryb ─────────────
    zylka: {
        name: 'Żyłka',
        emoji: '🪢',
        description: 'Mocniejsza żyłka → wyższe ceny sprzedawanych ryb.',
        stat: 'valueBonus',       // bonus do wartości (mnożnik addytywny, np. 0.10 = +10%)
        levels: [
            { level: 0, label: 'Brak',        price: 0,    stat: 0.00 },
            { level: 1, label: 'Nylonowa',    price: 150,  stat: 0.10 },
            { level: 2, label: 'Fluorocarbon',price: 400,  stat: 0.22 },
            { level: 3, label: 'Plecionka',   price: 900,  stat: 0.38 },
            { level: 4, label: 'Kevlarowa',   price: 2000, stat: 0.58 },
            { level: 5, label: 'Monomolekuł. 🌟', price: 5000, stat: 0.85 },
        ],
    },

    // ── KOŁOWROTEK – skraca cooldown wędkowania ──────────────
    kolowrotek: {
        name: 'Kołowrotek',
        emoji: '🎡',
        description: 'Szybszy kołowrotek → krótszy czas oczekiwania.',
        stat: 'cooldownReduction', // odejmowane sekundy od FISHING_COOLDOWN
        levels: [
            { level: 0, label: 'Brak',          price: 0,    stat: 0  },
            { level: 1, label: 'Spinningowy',   price: 200,  stat: 4  },
            { level: 2, label: 'Bezinercyjny',  price: 550,  stat: 9  },
            { level: 3, label: 'Karpowy',       price: 1200, stat: 15 },
            { level: 4, label: 'Morski',        price: 2800, stat: 20 },
            { level: 5, label: 'Turbo Pro 🌟',  price: 6000, stat: 24 },
        ],
    },

    // ── HACZYK – zwiększa szansę na rzadkie ryby ─────────────
    haczyk: {
        name: 'Haczyk',
        emoji: '🪝',
        description: 'Lepszy haczyk → wyższa szansa na rzadkie i epickie ryby.',
        stat: 'rarityBonus',  // mnożnik który zwiększa chance rzadkich (np. 0.20 = +20% ich chance)
        levels: [
            { level: 0, label: 'Brak',        price: 0,    stat: 0.00 },
            { level: 1, label: 'Okrągły',     price: 120,  stat: 0.10 },
            { level: 2, label: 'Semi-circular',price: 350, stat: 0.22 },
            { level: 3, label: 'Jig',         price: 800,  stat: 0.38 },
            { level: 4, label: 'Treble Hook', price: 1800, stat: 0.58 },
            { level: 5, label: 'Złoty Haczyk 🌟', price: 4500, stat: 0.80 },
        ],
    },

    // ── PRZYNĘTA – zmniejsza koszt przynęty ─────────────────
    przynet: {
        name: 'Przynęta',
        emoji: '🪱',
        description: 'Lepsza przynęta → mniejszy koszt za każde zarzucenie.',
        stat: 'baitDiscount',  // odejmowane monety od kosztu (max do 0)
        levels: [
            { level: 0, label: 'Brak',          price: 0,    stat: 0 },
            { level: 1, label: 'Dżdżownica',    price: 100,  stat: 2 },
            { level: 2, label: 'Kukurydza',     price: 300,  stat: 4 },
            { level: 3, label: 'Sztuczna mucha',price: 700,  stat: 6 },
            { level: 4, label: 'Wobler',        price: 1600, stat: 8 },
            { level: 5, label: 'Mega Błystka 🌟', price: 4000, stat: 10 },
        ],
    },
};

// Skrótowy dostęp do poziomu danej części z obiektu fishing_gear
function getGearLevel(gearObj, part) {
    return gearObj?.[part] ?? 0;
}

// Pobiera statystyki ze sprzętu gracza (obiekt fishing_gear z Supabase)
function getGearStats(gearObj = {}) {
    let valueBonus = 0;
    let cooldownReduction = 0;
    let rarityBonus = 0;
    let baitDiscount = 0;

    for (const [partKey, partDef] of Object.entries(GEAR)) {
        const lvl = getGearLevel(gearObj, partKey);
        if (lvl === 0) continue;
        const levelDef = partDef.levels[lvl];
        if (!levelDef) continue;
        switch (partDef.stat) {
            case 'valueBonus':        valueBonus        += levelDef.stat; break;
            case 'cooldownReduction': cooldownReduction += levelDef.stat; break;
            case 'rarityBonus':       rarityBonus       += levelDef.stat; break;
            case 'baitDiscount':      baitDiscount      += levelDef.stat; break;
        }
    }

    return { valueBonus, cooldownReduction, rarityBonus, baitDiscount };
}

module.exports = { GEAR, getGearStats, getGearLevel };
