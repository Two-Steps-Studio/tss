// ============================================================================
// TWO STEPS VALLEY - SKLEP (SHOP CONFIGURATION)
// ============================================================================
// Plik ten definiuje konfigurację sklepu.
// Każdy shop ma:
//   - id: unikalne identyfikator
//   - name: nazwa sklepu (PL)
//   - emoji: ikonka do wyświetlania
//   - type: typ sklepu (potion, food, equipment, material, cosmetic, etc.)
//   - position: pozycja w UI
//   - isOpen: czy sklep jest otwarty
//   - hours: godziny otwarcia
//   - shopItems: lista przedmiotów do sprzedaży
// ============================================================================

module.exports = {
    // ── SKLEPY (Shops) ──────────────────────────────────────────────────
    shops: {
        potion_shop: {
            id: 'potion_shop',
            name: 'Sklep z Mikstur',
            emoji: '🧪',
            type: 'potion',
            position: 1,
            isOpen: true,
            hours: { start: '00:00', end: '23:59' },
            items: ['potion_strength', 'potion_luck', 'potion_heal', 'potion_rarity', 'legendary_potion'],
        },
        food_shop: {
            id: 'food_shop',
            name: 'Sklep Spożywczy',
            emoji: '🍕',
            type: 'food',
            position: 2,
            isOpen: true,
            hours: { start: '06:00', end: '22:00' },
            items: ['bread', 'apple', 'steak', 'soup', 'pizza', 'salmon'],
        },
        equipment_shop: {
            id: 'equipment_shop',
            name: 'Sklep z Ekwipunkiem',
            emoji: '🛡️',
            type: 'equipment',
            position: 3,
            isOpen: true,
            hours: { start: '08:00', end: '20:00' },
            items: ['beginner_sword', 'iron_helm', 'iron_chest', 'iron_pants', 'iron_boots', 'iron_shield', 'iron_ring'],
        },
        material_shop: {
            id: 'material_shop',
            name: 'Sklep z Materiałami',
            emoji: '⛏️',
            type: 'material',
            position: 4,
            isOpen: true,
            hours: { start: '00:00', end: '23:59' },
            items: ['wood', 'stone', 'coal', 'iron', 'gold', 'diamond', 'ruby', 'sapphire'],
        },
        cosmetic_shop: {
            id: 'cosmetic_shop',
            name: 'Sklep z Kosmetykami',
            emoji: '✨',
            type: 'cosmetic',
            position: 5,
            isOpen: true,
            hours: { start: '10:00', end: '22:00' },
            items: ['bandana', 'hat', 'sword_skin', 'sword_skin_fire', 'sword_skin_water', 'sword_skin_nature', 'sword_skin_shadow'],
        },
        tool_shop: {
            id: 'tool_shop',
            name: 'Sklep z Narzędziami',
            emoji: '🔨',
            type: 'tool',
            position: 6,
            isOpen: true,
            hours: { start: '08:00', end: '18:00' },
            items: ['pickaxe', 'axe', 'fishing_rod', 'bow'],
        },
    },

    // ── KATEGORIE (Categories) ──────────────────────────────────────────────
    categories: {
        potions: {
            id: 'potions',
            name: 'Mikstury',
            emoji: '🧪',
            type: 'potion',
        },
        food: {
            id: 'food',
            name: 'Jedzenie',
            emoji: '🍕',
            type: 'food',
        },
        equipment: {
            id: 'equipment',
            name: 'Ekwipunek',
            emoji: '🛡️',
            type: 'equipment',
        },
        materials: {
            id: 'materials',
            name: 'Materiały',
            emoji: '⛏️',
            type: 'material',
        },
        cosmetics: {
            id: 'cosmetics',
            name: 'Kosmetyki',
            emoji: '✨',
            type: 'cosmetic',
        },
        tools: {
            id: 'tools',
            name: 'Narzędzia',
            emoji: '🔨',
            type: 'tool',
        },
    },

    // ── USTAWIENIA SKLEPU (Shop Settings) ───────────────────────────────────
    settings: {
        currency: 'coin',
        currencyName: 'Moneta',
        currencySymbol: '💰',
        maxItemsPerTransaction: 10,
        bulkDiscount: {
            enabled: true,
            thresholds: [
                { quantity: 5, discount: 0.1 },
                { quantity: 10, discount: 0.2 },
                { quantity: 25, discount: 0.3 },
                { quantity: 50, discount: 0.4 },
            ],
        },
        taxes: {
            enabled: false,
            rate: 0.1,
        },
    },

    // ── POSIENIOWANIE SKLEPU (Shop Layout) ────────────────────────────────
    layout: {
        rows: 5,
        columns: 6,
        grid: [
            ['potion_shop', 'food_shop', 'equipment_shop', 'material_shop', 'cosmetic_shop', 'tool_shop'],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
        ],
    },

    // ── USTAWIENIA SKLEPU (Shop Preferences) ────────────────────────────────
    preferences: {
        showPrices: true,
        showDescriptions: true,
        showRarity: true,
        showCategories: true,
        sortBy: 'price', // 'price', 'name', 'rarity', 'type'
        sortOrder: 'asc', // 'asc', 'desc'
        autoFilter: false,
    },
};
