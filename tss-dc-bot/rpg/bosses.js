// ============================================================================
// TWO STEPS VALLEY - BOSSY (BOSS ENEMIES)
// ============================================================================
// Plik ten definiuje wszystkich bossów gry.
// Każdy boss ma:
//   - name: nazwa bossa (PL)
//   - emoji: ikonka do wyświetlania
//   - hp: punkty życia
//   - atk: siła ataku
//   - def: obrona
//   - xp: XP do zdobycia
//   - coins: monety do zdobycia
//   - level: wymagany poziom gracza
//   - tier: kategoria (boss, legendary_boss)
//   - loot: przedmiot po pokonaniu
//   - weakTo: typy obrażeń do których jest wrażliwy
//   - abilities: listy umiejętności bossa
//   - phase: lista faz walki
//   - dropTable: tabela padl
// ============================================================================

module.exports = {
    // === FIZYCZNI BOSSY ===
    wolf_king: {
        name: 'Król Wilków',
        emoji: '👑🐺',
        hp: 800,
        maxHp: 800,
        atk: 35,
        def: 20,
        xp: 500,
        coins: 800,
        level: 5,
        tier: 'boss',
        loot: 'legendarna_bron',
        weakTo: ['ice'],
        abilities: [
            {
                name: 'Zawrzenie',
                damage: 30,
                cooldown: 30,
                description: 'Wilk gryzie w 200 obrażeń',
                icon: '🦷',
            },
            {
                name: 'Pierścienie',
                damage: 40,
                cooldown: 20,
                description: 'Rytmiczny atak wilków',
                icon: '🔁',
            },
        ],
        phase: [
            { name: 'Początkowa', hpPercent: 100, abilities: [0] },
            { name: 'Wrzenie', hpPercent: 70, abilities: [0, 1] },
            { name: 'Ostateczna', hpPercent: 40, abilities: [0, 1] },
        ],
        dropTable: {
            weapon: { name: 'Zęby Króla Wilków', rarity: 'legendarna', atk: 25 },
            material: { name: 'Wilczy Skór', rarity: 'epicka', def: 15 },
            coin: { name: 'Wilcze Oczy', rarity: 'epicka', value: 200 },
        },
    },
    spider_mother: {
        name: 'Pajęcza Matka',
        emoji: '👑🕷️',
        hp: 1200,
        maxHp: 1200,
        atk: 50,
        def: 40,
        xp: 800,
        coins: 1500,
        level: 8,
        tier: 'boss',
        loot: 'legendarna_zbroja',
        weakTo: ['fire'],
        abilities: [
            {
                name: 'Jad',
                damage: 40,
                cooldown: 20,
                description: 'Pajęcza matka chłoszcze jadującym ogonem',
                icon: '☠️',
            },
            {
                name: 'Poczekalnia',
                damage: 50,
                cooldown: 30,
                description: 'Wszystkie pająki atakują jednoczesie',
                icon: '🕸️',
            },
            {
                name: 'Web',
                damage: 35,
                cooldown: 25,
                description: 'Tworzy pajączą sieć',
                icon: '🕸️',
            },
        ],
        phase: [
            { name: 'Początkowa', hpPercent: 100, abilities: [0] },
            { name: 'Poczekalnia', hpPercent: 65, abilities: [0, 1] },
            { name: 'Ostateczna', hpPercent: 35, abilities: [0, 1, 2] },
        ],
        dropTable: {
            armor: { name: 'Pajęcza Pancerz', rarity: 'legendarna', def: 25 },
            material: { name: 'Pajęczy Ją', rarity: 'epicka', value: 150 },
            coin: { name: 'Pajęcze Oczy', rarity: 'epicka', value: 300 },
        },
    },

    // === LEGENDARNE BOSSY ===
    dragon_lord: {
        name: 'Władca Smoków',
        emoji: '👑🐉',
        hp: 3000,
        maxHp: 3000,
        atk: 90,
        def: 60,
        xp: 1500,
        coins: 2500,
        level: 12,
        tier: 'legendary_boss',
        loot: 'legendarna_zbroja_smoka',
        weakTo: ['ice', 'holy'],
        abilities: [
            {
                name: 'Ognisty Oddech',
                damage: 60,
                cooldown: 35,
                description: 'Smok wydycha ogień',
                icon: '🔥',
            },
            {
                name: 'Skrzydła',
                damage: 50,
                cooldown: 25,
                description: 'Smok atakuje ze sfer',
                icon: '🌪️',
            },
            {
                name: 'Skok',
                damage: 45,
                cooldown: 30,
                description: 'Smok spada na gracza',
                icon: '📉',
            },
            {
                name: 'Ogon',
                damage: 40,
                cooldown: 40,
                description: 'Smok chłoszcze ogonem',
                icon: '🐉',
            },
        ],
        phase: [
            { name: 'Początkowa', hpPercent: 100, abilities: [0, 3] },
            { name: 'Ogon', hpPercent: 75, abilities: [0, 1, 3] },
            { name: 'Skrzydła', hpPercent: 50, abilities: [0, 1, 3] },
            { name: 'Ostateczna', hpPercent: 25, abilities: [0, 1, 2, 3] },
        ],
        dropTable: {
            weapon: { name: 'Kłów Władcy Smoków', rarity: 'legendarna', atk: 45 },
            armor: { name: 'Skrzydła Smoka', rarity: 'legendarna', def: 35 },
            material: { name: 'Smoczy Serce', rarity: 'legendarna', value: 1000 },
            coin: { name: 'Złoto Smoka', rarity: 'legendarna', value: 500 },
        },
    },
    void_emperor: {
        name: 'Czarodziej Pustki',
        emoji: '👑🌑',
        hp: 4000,
        maxHp: 4000,
        atk: 100,
        def: 80,
        xp: 2000,
        coins: 3000,
        level: 15,
        tier: 'legendary_boss',
        loot: 'legendarna_bron_pustki',
        weakTo: ['light', 'holy'],
        abilities: [
            {
                name: 'Pustki',
                damage: 80,
                cooldown: 40,
                description: 'Tworzy czarną dze',
                icon: '⬛',
            },
            {
                name: 'Cień',
                damage: 70,
                cooldown: 30,
                description: 'Teleportacja i atak z cienia',
                icon: '👻',
            },
            {
                name: 'Absorb',
                damage: 60,
                cooldown: 35,
                description: 'Absorbuje energię',
                icon: '🔮',
            },
            {
                name: 'Pustki Miotacz',
                damage: 75,
                cooldown: 45,
                description: 'Miotacz z pustki',
                icon: '🔮',
            },
        ],
        phase: [
            { name: 'Początkowa', hpPercent: 100, abilities: [0] },
            { name: 'Absorb', hpPercent: 75, abilities: [0, 2] },
            { name: 'Cień', hpPercent: 50, abilities: [0, 1, 2] },
            { name: 'Ostateczna', hpPercent: 25, abilities: [0, 1, 2, 3] },
        ],
        dropTable: {
            weapon: { name: 'Miecz Pustki', rarity: 'legendarna', atk: 50 },
            armor: { name: 'Pancerz Pustki', rarity: 'legendarna', def: 40 },
            material: { name: 'Serce Pustki', rarity: 'legendarna', value: 1500 },
            coin: { name: 'Energia Pustki', rarity: 'legendarna', value: 600 },
        },
    },
    crystal_god: {
        name: 'Bóg Kryształu',
        emoji: '👑💎',
        hp: 5000,
        maxHp: 5000,
        atk: 110,
        def: 90,
        xp: 2500,
        coins: 4000,
        level: 20,
        tier: 'legendary_boss',
        loot: 'legendarna_zbroja_kryształu',
        weakTo: ['ice'],
        abilities: [
            {
                name: 'Kryształu',
                damage: 90,
                cooldown: 45,
                description: 'Bóg atakuje kryształem',
                icon: '💎',
            },
            {
                name: 'Oblak',
                damage: 85,
                cooldown: 35,
                description: 'Stwórz kryształy w powietrzu',
                icon: '☄️',
            },
            {
                name: 'Reflekcja',
                damage: 75,
                cooldown: 40,
                description: 'Odbija obrażenia',
                icon: '🪞',
            },
            {
                name: 'Kryształu Miotacz',
                damage: 80,
                cooldown: 50,
                description: 'Miotacz kryształów',
                icon: '🎯',
            },
        ],
        phase: [
            { name: 'Początkowa', hpPercent: 100, abilities: [0] },
            { name: 'Kryształu', hpPercent: 75, abilities: [0, 2] },
            { name: 'Oblak', hpPercent: 50, abilities: [0, 1, 2] },
            { name: 'Ostateczna', hpPercent: 25, abilities: [0, 1, 2, 3] },
        ],
        dropTable: {
            weapon: { name: 'Kryształowy Miecz', rarity: 'legendarna', atk: 55 },
            armor: { name: 'Kryształowa Zbroja', rarity: 'legendarna', def: 45 },
            material: { name: 'Kryształowe Serce', rarity: 'legendarna', value: 2000 },
            coin: { name: 'Energia Kryształu', rarity: 'legendarna', value: 800 },
        },
    },

    // === MITYCZNE BOSSY ===
    mythic_dragon: {
        name: 'Mityczny Smok',
        emoji: '🐉💫',
        hp: 8000,
        maxHp: 8000,
        atk: 150,
        def: 100,
        xp: 5000,
        coins: 8000,
        level: 25,
        tier: 'mythic_boss',
        loot: 'mityczna_zbroja',
        weakTo: ['ice', 'holy'],
        abilities: [
            {
                name: 'Ognisty Oddech',
                damage: 120,
                cooldown: 50,
                description: 'Potężny oddech ognisty',
                icon: '🔥',
            },
            {
                name: 'Mroźne Oddech',
                damage: 100,
                cooldown: 55,
                description: 'Oddech mroźnych pól',
                icon: '❄️',
            },
            {
                name: 'Hollow',
                damage: 110,
                cooldown: 45,
                description: 'Ogromna siła ataku',
                icon: '🔥',
            },
            {
                name: 'Krzyk',
                damage: 90,
                cooldown: 60,
                description: 'Zawrający krzyk',
                icon: '📢',
            },
            {
                name: 'Ogon',
                damage: 85,
                cooldown: 55,
                description: 'Potężny uderzenie ogonem',
                icon: '🐉',
            },
        ],
        phase: [
            { name: 'Początkowa', hpPercent: 100, abilities: [0, 3] },
            { name: 'Ognisty', hpPercent: 75, abilities: [0, 1, 3] },
            { name: 'Mroźne', hpPercent: 50, abilities: [1, 2, 3] },
            { name: 'Hollow', hpPercent: 25, abilities: [0, 1, 2, 3] },
            { name: 'Ogon', hpPercent: 15, abilities: [0, 1, 2, 3, 4] },
        ],
        dropTable: {
            weapon: { name: 'Mityczny Ogon', rarity: 'mythic', atk: 80 },
            armor: { name: 'Mityczne Skrzydła', rarity: 'mythic', def: 60 },
            material: { name: 'Mityczne Serce', rarity: 'mythic', value: 5000 },
            coin: { name: 'Złoto Mityczne', rarity: 'mythic', value: 2500 },
        },
    },
};
