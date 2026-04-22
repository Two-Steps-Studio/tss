// ============================================================================
// TWO STEPS VALLEY - SUROWCE (RESOURCES)
// ============================================================================
// Plik ten definiuje wszystkie surowce występujące w grze.
// Każdy resource ma:
//   - name: nazwa surowca (PL)
//   - emoji: ikonka do wyświetlania
//   - baseValue: wartość punktowa (wpływa na XP i monetę)
//   - miningLevel: poziomy wymagane do skopiowania
//   - farmLevel: poziomy wymagane do uprawiania
//   - type: typ surowca (stone, wood, ore, food, etc.)
//   - category: kategoria (budulce, metale, cenne kamienie, itp.)
// ============================================================================

module.exports = {
    // === BUDULCE ===
    stone: {
        name: 'Kamień',
        emoji: '🪨',
        baseValue: 10,
        miningLevel: 1,
        farmLevel: 1,
        type: 'stone',
        category: 'budulec',
        xpValue: 2,
        coinValue: 10,
    },

    // === DREWSINO ===
    wood: {
        name: 'Drewno',
        emoji: '🌲',
        baseValue: 15,
        miningLevel: 1,
        farmLevel: 1,
        type: 'wood',
        category: 'drewno',
        xpValue: 3,
        coinValue: 15,
    },

    // === WĘGIEL ===
    coal: {
        name: 'Węgiel',
        emoji: '⚫',
        baseValue: 30,
        miningLevel: 2,
        farmLevel: 2,
        type: 'ore',
        category: 'węgiel',
        xpValue: 6,
        coinValue: 30,
    },

    // === ŻELAZO ===
    iron: {
        name: 'Żelazo',
        emoji: '⛓️',
        baseValue: 50,
        miningLevel: 3,
        farmLevel: 3,
        type: 'ore',
        category: 'metale',
        xpValue: 10,
        coinValue: 50,
    },

    // === ZŁOTO ===
    gold: {
        name: 'Złoto',
        emoji: '🟡',
        baseValue: 100,
        miningLevel: 4,
        farmLevel: 4,
        type: 'ore',
        category: 'cenne_metale',
        xpValue: 20,
        coinValue: 100,
    },

    // === DIAMENT ===
    diamond: {
        name: 'Diament',
        emoji: '💎',
        baseValue: 300,
        miningLevel: 6,
        farmLevel: 6,
        type: 'ore',
        category: 'cenne_kamienie',
        xpValue: 50,
        coinValue: 300,
    },

    // === RUBIN ===
    ruby: {
        name: 'Rubin',
        emoji: '🔴',
        baseValue: 500,
        miningLevel: 7,
        farmLevel: 7,
        type: 'ore',
        category: 'cenne_kamienie',
        xpValue: 75,
        coinValue: 500,
    },

    // === SZAFIR ===
    sapphire: {
        name: 'Szafir',
        emoji: '🔷',
        baseValue: 400,
        miningLevel: 7,
        farmLevel: 7,
        type: 'ore',
        category: 'cenne_kamienie',
        xpValue: 60,
        coinValue: 400,
    },

    // === INNE MINERALY ===
    copper: {
        name: 'Miedź',
        emoji: '🟠',
        baseValue: 20,
        miningLevel: 2,
        farmLevel: 2,
        type: 'ore',
        category: 'metale',
        xpValue: 5,
        coinValue: 20,
    },

    tin: {
        name: 'Ołów',
        emoji: '🔈',
        baseValue: 18,
        miningLevel: 2,
        farmLevel: 2,
        type: 'ore',
        category: 'metale',
        xpValue: 5,
        coinValue: 18,
    },

    // === RZADKIE MINERALY ===
    emerald: {
        name: 'Smaragd',
        emoji: '💚',
        baseValue: 750,
        miningLevel: 8,
        farmLevel: 8,
        type: 'ore',
        category: 'rzadkie',
        xpValue: 120,
        coinValue: 750,
    },

    pearl: {
        name: 'Perła',
        emoji: '🦪',
        baseValue: 450,
        miningLevel: 6,
        farmLevel: 6,
        type: 'ore',
        category: 'rzadkie',
        xpValue: 90,
        coinValue: 450,
    },

    // === KAMIENIE MAGICKIE ===
    obsidian: {
        name: 'Obsydian',
        emoji: '⬛',
        baseValue: 250,
        miningLevel: 5,
        farmLevel: 5,
        type: 'ore',
        category: 'magickie',
        xpValue: 40,
        coinValue: 250,
    },

    quartz: {
        name: 'Kwarc',
        emoji: '⚪',
        baseValue: 120,
        miningLevel: 4,
        farmLevel: 4,
        type: 'ore',
        category: 'magickie',
        xpValue: 25,
        coinValue: 120,
    },

    // === SUROWCE DO GOSPODARSTWA ===
    flour: {
        name: 'Mąka',
        emoji: '🫓',
        baseValue: 5,
        farmingLevel: 1,
        type: 'food',
        category: 'materiały',
        xpValue: 1,
        coinValue: 5,
    },

    sugar: {
        name: 'Cukier',
        emoji: '🍬',
        baseValue: 8,
        farmingLevel: 2,
        type: 'food',
        category: 'słodkości',
        xpValue: 2,
        coinValue: 8,
    },

    // === DREWNE PRODUKTY ===
    plank: {
        name: 'Deska',
        emoji: '🪜',
        baseValue: 12,
        farmingLevel: 1,
        type: 'wood_product',
        category: 'drzewo',
        xpValue: 3,
        coinValue: 12,
    },

    log: {
        name: 'Pion',
        emoji: '🪵',
        baseValue: 20,
        farmingLevel: 1,
        type: 'wood_product',
        category: 'drzewo',
        xpValue: 5,
        coinValue: 20,
    },
};
