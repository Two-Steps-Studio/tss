require('dotenv').config();
const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
} = require('discord.js');

// ── RYNEK (Items) ──────────────────────────────────────────────────────
const ITEMS = {
    // Broni i zbroje
    weapon: [
        { name: 'Kostny kij', emoji: '🥢', minDmg: 1, maxDmg: 3, level: 1 },
        { name: 'Dębowy miecz', emoji: '🔪', minDmg: 5, maxDmg: 10, level: 2 },
        { name: 'Żelazny topór', emoji: '⚒️', minDmg: 15, maxDmg: 25, level: 3 },
        { name: 'Staliowy miecz', emoji: '⚔️', minDmg: 35, maxDmg: 50, level: 4 },
        { name: 'Miecz czarnoksiężnika', emoji: '🧙‍♂️', minDmg: 60, maxDmg: 90, level: 5 },
        { name: 'Miecz smokowбивий', emoji: '🐉', minDmg: 120, maxDmg: 180, level: 6 },
    ],
    helmet: [
        { name: 'Szczelina z skóry', emoji: '🪶', minDef: 1, maxDef: 3, level: 1 },
        { name: 'Szczelinna drewniana', emoji: '🪵', minDef: 5, maxDef: 8, level: 2 },
        { name: 'Kask żelazny', emoji: '⛓️', minDef: 15, maxDef: 22, level: 3 },
        { name: 'Kask stalowy', emoji: '🖤', minDef: 35, maxDef: 50, level: 4 },
        { name: 'Kask czarnoksiężnika', emoji: '🧙‍♂️', minDef: 60, maxDef: 85, level: 5 },
        { name: 'Kask smoczy', emoji: '🐉', minDef: 120, maxDef: 160, level: 6 },
    ],
    chest: [
        { name: 'Kostny kamizelka', emoji: '🦴', minDef: 3, maxDef: 6, level: 1 },
        { name: 'Dębiana zbroja', emoji: '🪵', minDef: 10, maxDef: 18, level: 2 },
        { name: 'Żelazna zbroja', emoji: '⛓️', minDef: 25, maxDef: 40, level: 3 },
        { name: 'Stalowa zbroja', emoji: '🖤', minDef: 55, maxDef: 80, level: 4 },
        { name: 'Zbroja czarnoksiężnika', emoji: '🧙‍♂️', minDef: 90, maxDef: 130, level: 5 },
        { name: 'Zbroja smoka', emoji: '🐉', minDef: 180, maxDef: 250, level: 6 },
    ],
    pants: [
        { name: 'Szkoty z miękkiej skóry', emoji: '🧦', minDef: 2, maxDef: 5, level: 1 },
        { name: 'Szkoty z skóry', emoji: '👖', minDef: 8, maxDef: 15, level: 2 },
        { name: 'Żelazne spodnie', emoji: '⛓️', minDef: 20, maxDef: 32, level: 3 },
        { name: 'Stalowe spodnie', emoji: '🖤', minDef: 45, maxDef: 70, level: 4 },
        { name: 'Spodnie czarnoksiężnika', emoji: '🧙‍♂️', minDef: 75, maxDef: 110, level: 5 },
        { name: 'Spodnie smoka', emoji: '🐉', minDef: 150, maxDef: 200, level: 6 },
    ],
    boots: [
        { name: 'Miękkie trzewiki', emoji: '🧦', minDef: 2, maxDef: 5, level: 1 },
        { name: 'Czapelki z skóry', emoji: '👢', minDef: 8, maxDef: 14, level: 2 },
        { name: 'Żelazne czapraki', emoji: '⛓️', minDef: 20, maxDef: 32, level: 3 },
        { name: 'Stalowe czapraki', emoji: '🖤', minDef: 45, maxDef: 70, level: 4 },
        { name: 'Czapki czarnoksiężnika', emoji: '🧙‍♂️', minDef: 75, maxDef: 110, level: 5 },
        { name: 'Buty smoka', emoji: '🐉', minDef: 150, maxDef: 200, level: 6 },
    ],
    shield: [
        { name: 'Skórzana tarcza', emoji: '🛡️', minDef: 2, maxDef: 5, level: 1 },
        { name: 'Drewniana tarcza', emoji: '🪵', minDef: 6, maxDef: 12, level: 2 },
        { name: 'Żelazna tarcza', emoji: '⛓️', minDef: 18, maxDef: 30, level: 3 },
        { name: 'Stalowa tarcza', emoji: '🖤', minDef: 40, maxDef: 65, level: 4 },
        { name: 'Tarcza czarnoksiężnika', emoji: '🧙‍♂️', minDef: 65, maxDef: 100, level: 5 },
        { name: 'Tarcza smoka', emoji: '🐉', minDef: 130, maxDef: 180, level: 6 },
    ],
    ring: [
        { name: 'Prosty pierścionek', emoji: '💍', minStat: 2, level: 1 },
        { name: 'Pierścionek magika', emoji: '🔮', minStat: 8, level: 2 },
        { name: 'Pierścionek stalowy', emoji: '⛓️', minStat: 20, level: 3 },
        { name: 'Pierścionek z diamentem', emoji: '💎', minStat: 45, level: 4 },
        { name: 'Pierścionek czarnoksiężnika', emoji: '🧙‍♂️', minStat: 75, level: 5 },
        { name: 'Pierścionek smoka', emoji: '🐉', minStat: 150, level: 6 },
    ],
    // Potulce
    potions: [
        { name: 'Eksperymentalny napój siły', emoji: '🧪', type: 'potion', effect: 'atk', value: 20, price: 100 },
        { name: 'Eksperymentalny napój życia', emoji: '💉', type: 'potion', effect: 'heal', value: 100, price: 80 },
        { name: 'Eksperymentalny napój magii', emoji: '🔮', type: 'potion', effect: 'crit', value: 10, price: 120 },
    ],
    // Przedmioty użytkowe
    keys: [
        { name: 'Zwykły klucz', emoji: '🔑', type: 'key', slot: 1, price: 50 },
        { name: 'Złoty klucz', emoji: '🗝️', type: 'key', slot: 2, price: 200 },
        { name: 'Klucz smoka', emoji: '🐲', type: 'key', slot: 3, price: 1000 },
    ],
    // Rudy
    ores: [
        { name: 'Rudnik', emoji: '🔴', value: 10, level: 1 },
        { name: 'Rudnik', emoji: '🟠', value: 25, level: 2 },
        { name: 'Ruda żelaza', emoji: '⚙️', value: 60, level: 3 },
        { name: 'Ruda stali', emoji: '⛓️', value: 150, level: 4 },
        { name: 'Ruda diamentu', emoji: '💎', value: 400, level: 5 },
        { name: 'Ruda smoka', emoji: '🐉', value: 1000, level: 6 },
    ],
};

// ── Baza statystyk gracza (dynamiczne) ────────────────────────────────
const BASE_STATS = {
    hp:      100,
    atk:      10,
    def:      5,
    crit:     5,
    luck:     10,
};

// ── Base stat bonuses per level ──────────────────────────────────────
const LEVEL_STATS = {
    hp:      { level: 1, bonus: 20 },
    atk:     { level: 1, bonus: 2 },
    def:     { level: 1, bonus: 1 },
    crit:    { level: 1, bonus: 2 },
    luck:    { level: 1, bonus: 1 },
};

// ── Dungeon Enemies ───────────────────────────────────────────────────
const DUNGEON_ENEMIES = {
    lvl1: { name: 'Kamikazę', hp: 50, atk: 8, def: 2, xp: 15, coins: 20, emoji: '🤡' },
    lvl2: { name: 'Skorpion', hp: 120, atk: 15, def: 5, xp: 35, coins: 50, emoji: '🦂' },
    lvl3: { name: 'Goblin', hp: 200, atk: 25, def: 10, xp: 60, coins: 100, emoji: '👺' },
    lvl4: { name: 'Ork', hp: 350, atk: 40, def: 20, xp: 100, coins: 200, emoji: '👹' },
    lvl5: { name: 'Ogre', hp: 600, atk: 60, def: 35, xp: 180, coins: 400, emoji: '👹' },
    lvl6: { name: 'Smok', hp: 1500, atk: 100, def: 80, xp: 500, coins: 1000, emoji: '🐉' },
};

// ── Loot Tabela (drop rates) ──────────────────────────────────────────
const LOOT_TABLE = {
    common:  { pool: ['zwykły_skrzyn', 'zwykly_klucz', 'lowy_potek'], chance: 50 },
    uncommon: { pool: ['srebrny_klucz', 'zwykly_lek', 'rud'], chance: 30 },
    rare:    { pool: ['zloty_klucz', 'magiczny_lek', 'ruda_zlota', 'ruda_srebra'], chance: 15 },
    epic:    { pool: ['klucz_smoka', 'epicki_lek', 'diament', 'perla'], chance: 4 },
    legendary: { pool: ['legendarna_zbroja', 'legendarna_bron', 'smokowe_ego'], chance: 1 },
};

// ── Loot Items ─────────────────────────────────────────────────────────
const LOOT_ITEMS = {
    'zwykly_lek':     { name: 'Zwykły eliksir', emoji: '🧪', type: 'potion', effect: 'heal', value: 50 },
    'zwykly_klucz':   { name: 'Zwykły klucz', emoji: '🔑', type: 'key', slot: 1 },
    'srebrny_klucz':  { name: 'Srebrny klucz', emoji: '🗝️', type: 'key', slot: 2 },
    'zloty_klucz':    { name: 'Złoty klucz', emoji: '🗝️', type: 'key', slot: 3 },
    'klucz_smoka':    { name: 'Klucz smoka', emoji: '🐲', type: 'key', slot: 4 },
    'rudy':           { name: 'Rudy kawał', emoji: '🔴', type: 'ore' },
    'ruda_zlota':     { name: 'Ruda złota', emoji: '🟡', type: 'ore', value: 200 },
    'ruda_srebra':    { name: 'Ruda srebra', emoji: '🥈', type: 'ore', value: 150 },
    'diament':        { name: 'Diament', emoji: '💎', type: 'gem', value: 500 },
    'perla':          { name: 'Perła', emoji: '🪷', type: 'gem', value: 300 },
    'magiczny_lek':   { name: 'Magiczny eliksir', emoji: '🔮', type: 'potion', effect: 'stat', value: 20 },
    'epicki_lek':     { name: 'Epiczny eliksir', emoji: '🧬', type: 'potion', effect: 'heal', value: 200 },
    'legendarna_zbroja': { name: 'Legendarna zbroja', emoji: '🛡️', type: 'legendary', slot: 'chest' },
    'legendarna_bron': { name: 'Legendarna broń', emoji: '⚔️', type: 'legendary', slot: 'weapon' },
    'smokowe_ego':    { name: 'Obrża smoka', emoji: '🐲', type: 'legendary', slot: 'ring' },
};

// ── Helper do generowania ID dla nowych items ────────────────────────
function generateItemId() {
    return `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// ── 1. PROFIL RAG (getProfile + calculateStats) ──────────────────────
async function getRpgProfile(userId, supabase) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (!profile) {
        // Nowy gracz - inicjalizacja z podst. wartościami
        return {
            id: userId,
            username: 'Nowy Bohater',
            level: 1,
            xp: 0,
            money: 50,
            bank: 0,
            // Dynamiczne staty (base + equipment + level bonus)
            rpg: {
                hp: BASE_STATS.hp + LEVEL_STATS.hp.bonus,
                atk: BASE_STATS.atk + LEVEL_STATS.atk.bonus,
                def: BASE_STATS.def + LEVEL_STATS.def.bonus,
                crit: BASE_STATS.crit + LEVEL_STATS.crit.bonus,
                luck: BASE_STATS.luck + LEVEL_STATS.luck.bonus,
                // Inventory
                inventory: [],      // przedmioty
                ore: [],            // rudy
                fish: [],           // ryby
                keys: [],           // klucze
                potions: [],        // napoje
                // Equipment (null = nie zał)
                equipment: {
                    helmet: null,
                    chest: null,
                    pants: null,
                    boots: null,
                    weapon: null,
                    shield: null,
                    ring: null,
                },
                // Current location
                location: 'Miasto',
            }
        };
    }

    // Sprawdź czy kolumna rpg istnieje, jeśli nie - dodaj
    const rpgCols = ['rpg'];
    const needsInit = rpgCols.some(col => !profile[col]);

    if (needsInit) {
        // Buduj profil RPG na podstawie danych z bazy
        const equipment = profile.equipment || {};
        const rpg = {
            hp: BASE_STATS.hp + LEVEL_STATS.hp.bonus,
            atk: BASE_STATS.atk + LEVEL_STATS.atk.bonus,
            def: BASE_STATS.def + LEVEL_STATS.def.bonus,
            crit: BASE_STATS.crit + LEVEL_STATS.crit.bonus,
            luck: BASE_STATS.luck + LEVEL_STATS.luck.bonus,
            inventory: profile.inventory || [],
            ore: profile.ore || [],
            fish: profile.fish || [],
            keys: profile.keys || [],
            potions: profile.potions || [],
            equipment: {
                helmet: equipment.helmet || null,
                chest: equipment.chest || null,
                pants: equipment.pants || null,
                boots: equipment.boots || null,
                weapon: equipment.weapon || null,
                shield: equipment.shield || null,
                ring: equipment.ring || null,
            },
            location: profile.location || 'Miasto',
        };

        await supabase.from('profiles').update({ rpg }).eq('id', profile.id);
        profile.rpg = rpg;
    }

    return profile;
}

// ── 2. Dynamiczne przeliczanie statystyk ─────────────────────────────
function calculateStats(rpgProfile) {
    if (!rpgProfile.rpg) return null;

    const { rpg, level } = rpgProfile;
    const baseHp = BASE_STATS.hp + (LEVEL_STATS.hp?.bonus || 0);
    const baseAtk = BASE_STATS.atk + (LEVEL_STATS.atk?.bonus || 0);
    const baseDef = BASE_STATS.def + (LEVEL_STATS.def?.bonus || 0);
    const baseCrit = BASE_STATS.crit + (LEVEL_STATS.crit?.bonus || 0);
    const baseLuck = BASE_STATS.luck + (LEVEL_STATS.luck?.bonus || 0);

    // Sumuj ze sprzętu
    let hp = baseHp, atk = baseAtk, def = baseDef, crit = baseCrit, luck = baseLuck;

    // Weapon adds ATK
    if (rpg.equipment?.weapon) {
        atk += rpg.equipment.weapon.atk || 0;
    }

    // Armor adds DEF (chest + pants + boots + shield)
    if (rpg.equipment?.helmet) hp += (rpg.equipment.helmet.def || 0);
    if (rpg.equipment?.chest) def += (rpg.equipment.chest.def || 0);
    if (rpg.equipment?.pants) def += (rpg.equipment.pants.def || 0);
    if (rpg.equipment?.boots) def += (rpg.equipment.boots.def || 0);
    if (rpg.equipment?.shield) def += (rpg.equipment.shield.def || 0);

    // Ring adds general stat (luck/stats)
    if (rpg.equipment?.ring) hp += (rpg.equipment.ring.hp || 0);

    return {
        ...rpg,
        stats: { hp, atk, def, crit, luck },
        power: Math.round((atk - def) * 10), // Moc = atk - def * 10
    };
}

// ── 3. Equipment Command ──────────────────────────────────────────────
async function handleEquipment(interaction, supabase, profile) {
    const stats = calculateStats(profile);

    if (!stats) return interaction.reply({ content: '❌ Nie udało się pobrać statystyk.', ephemeral: true });

    const { rpg } = profile;
    const equipment = rpg.equipment || {};

    const embed = new EmbedBuilder()
        .setTitle(`🛡️ Ekwipunek: ${profile.username} (Lvl ${profile.level})`)
        .setColor('#1bbdbd')
        .setDescription(
            `📊 **MOC POSTACI:** ${stats.power}\n\n` +
            `🩸 HP: **${stats.hp}**\n` +
            `⚔️ ATK: **${stats.atk}**\n` +
            `🛡️ DEF: **${stats.def}**\n` +
            `🎯 CRIT: **${stats.crit}%**\n` +
            `🍀 LUCK: **${stats.luck}**`
        );

    // Equipment slots
    const slots = [
        { key: 'weapon', label: '⚔️ Broń' },
        { key: 'helmet', label: '🪖 Hełm' },
        { key: 'chest', label: '🧥 Zbroja' },
        { key: 'pants', label: '👖 Spodnie' },
        { key: 'boots', label: '👢 Buty' },
        { key: 'shield', label: '🛡️ Tarcza' },
        { key: 'ring', label: '💍 Pierścień' },
    ];

    for (const slot of slots) {
        const item = equipment[slot.key];
        if (item) {
            const itemData = ITEMS[slot.key]?.find(i => i.name === item) || item;
            embed.addFields({
                name: `${slot.label}: ${itemData.emoji} ${itemData.name}`,
                value: `${itemData.minDmg ? `⚔️ ATK: ${itemData.minDmg}-${itemData.maxDmg}` : ''} ` +
                      `${itemData.minDef ? `🛡️ DEF: ${itemData.minDef}-${itemData.maxDef}` : ''} ` +
                      `${itemData.minStat ? `💎 STAT: +${itemData.minStat}` : ''}`,
                inline: true,
            });
        } else {
            embed.addFields({
                name: `${slot.label}: 🟰`,
                value: 'Pusto',
                inline: true,
            });
        }
    }

    await interaction.reply({ embeds: [embed] });
}

// ── 4. Inventory Command ──────────────────────────────────────────────
async function handleInventory(interaction, supabase, profile) {
    const { rpg } = profile;
    const stats = calculateStats(profile);

    const items = [];
    const ore = rpg?.ore || [];
    const fish = rpg?.fish || [];
    const keys = rpg?.keys || [];
    const potions = rpg?.potions || [];

    // Collect all inventory items
    const inventory = [...(rpg?.inventory || []), ...ore, ...fish, ...keys, ...potions];

    if (inventory.length === 0) {
        return interaction.reply({
            content: `🎒 **Inwentarz pusty**.\n\nPojemność: 20 slotów\nZajęte: 0/20`,
            ephemeral: true,
        });
    }

    const embed = new EmbedBuilder()
        .setTitle(`🎒 Inwentarz: ${profile.username}`)
        .setColor('#1bbdbd')
        .setDescription(`**Zajęte: ${inventory.length}/20 slotów**\n\n${inventory.map(i => `${i.emoji || '•'} **${i.name}**`).join('\n')}`);

    await interaction.reply({ embeds: [embed] });
}

// ── 5. Kopalnia ───────────────────────────────────────────────────────
async function handleMine(interaction, supabase, profile) {
    const userId = interaction.user.id;
    const { rpg } = profile;

    // 7 klików mechanika
    for (let i = 1; i <= 7; i++) {
        // Prosty delay symulujący klik
        await new Promise(r => setTimeout(r, 500));
    }

    // Drop mechanika
    const luck = rpg?.stats?.luck || 10;
    const critChance = (rpg?.stats?.crit || 5) / 100;

    const rand = Math.random() * 100;
    let dropType = 'common';
    if (rand > 98) dropType = 'legendary';
    else if (rand > 94) dropType = 'epic';
    else if (rand > 85) dropType = 'rare';
    else if (rand > 55) dropType = 'uncommon';

    const dropPool = LOOT_TABLE[dropType].pool;
    const lootId = dropPool[Math.floor(Math.random() * dropPool.length)];
    const loot = LOOT_ITEMS[lootId];

    if (!loot) {
        // Default drop - ruda
        const ores = ITEMS.ores.slice(0, Math.floor(luck / 5) + 1);
        const ore = ores[Math.floor(Math.random() * ores.length)];
        const oreName = ore.name === 'Rudy kawał' ? `Rudy kawał ${Math.floor(Math.random() * 5 + 1)}` : ore.name;
        await supabase.from('profiles').update({
            'rpg.ore': (profile.rpg?.ore || []).concat([{ id: generateItemId(), name: oreName, type: 'ore' }]),
        }).eq('id', profile.id);
        return interaction.editReply({
            content: `🔨 **Kopalnia** - ${i}/7 klików wykonanych!\n\n📦 Drop: **${oreName}** ${lore.emoji}\n💰 Wartość: +${lore.value || 0} ${COIN}`,
        });
    }

    // Zapisz drop
    await supabase.from('profiles').update({
        [loot.type]: (profile[loot.type] || []).concat([{ id: generateItemId(), ...loot }]),
    }).eq('id', profile.id);

    const value = loot.value || 0;
    const xpGain = Math.floor((loot.value || 10) / 5);

    // Zaktualizuj level i xp
    const newXp = (profile.xp || 0) + xpGain;
    const newLevel = Math.floor(0.1 * Math.sqrt(newXp));
    const newMoney = (profile.money || 0) + value;

    await supabase.from('profiles').update({
        xp: newXp,
        level: newLevel,
        money: newMoney,
        updated_at: new Date().toISOString(),
    }).eq('id', profile.id);

    return interaction.editReply({
        content: `🔨 **Kopalnia** - ${i}/7 klików wykonanych!\n\n📦 Drop: **${loot.name}** ${loot.emoji}\n💰 Wartość: +${value} ${COIN}\n✨ XP: +${xpGain}\n📈 Level: ${profile.level} → ${newLevel}`,
    });
}

// ── 6. Staw (Fishing location) ────────────────────────────────────────
async function handleStaw(interaction, supabase, profile) {
    // Prosty fishing mechanic dla stawu
    const fishPool = Object.values(ITEMS.fish || {}).slice(0, 5);
    const fish = fishPool[Math.floor(Math.random() * fishPool.length)];

    if (!fish) {
        return interaction.reply({
            content: '🎣 **Staw** jest pusty... Spróbuj ponownie później.',
            ephemeral: true,
        });
    }

    const fishName = fish.name === 'Zwykła ryba' ? `Zwykła ryba ${Math.floor(Math.random() * 10) + 1}cm` : fish.name;
    const fishValue = Math.floor(Math.random() * 20 + 10);
    const xpGain = Math.floor(fishValue / 3);

    // Zapisz rybę
    await supabase.from('profiles').update({
        fish: (profile.fish || []).concat([{ id: generateItemId(), name: fishName, type: 'fish', value: fishValue }]),
    }).eq('id', profile.id);

    const newMoney = (profile.money || 0) + fishValue;
    const newXp = (profile.xp || 0) + xpGain;
    const newLevel = Math.floor(0.1 * Math.sqrt(newXp));

    await supabase.from('profiles').update({
        money: newMoney,
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
    }).eq('id', profile.id);

    return interaction.reply({
        content: `🎣 **Staw**\n\n🐟 Złowiłeś: **${fishName}**\n💰 Sprzedaż: +${fishValue} ${COIN}\n✨ XP: +${xpGain}\n📈 Level: ${profile.level} → ${newLevel}`,
    });
}

// ── 7. Dungeon ─────────────────────────────────────────────────────────
async function handleDungeon(interaction, supabase, profile) {
    const userId = interaction.user.id;
    const { rpg, level } = profile;
    const stats = calculateStats(profile);

    if (!stats) return interaction.reply({ content: '❌ Błąd przy pobieraniu statystyk.', ephemeral: true });

    // Wybór poziomu (dla MVP - prosty wybór 1-6)
    const embed = new EmbedBuilder()
        .setTitle('🏰 Wybór poziomu Dungeon')
        .setColor('#dc3545')
        .setDescription(
            '**Wybierz poziom do wyprawy:**\n\n' +
            `1️⃣ **Kamikazę** (Lvl ${level}) - ${DUNGEON_ENEMIES.lvl1.emoji} HP: ${DUNGEON_ENEMIES.lvl1.hp}\n` +
            `2️⃣ **Skorpion** (Lvl ${level}) - ${DUNGEON_ENEMIES.lvl2.emoji} HP: ${DUNGEON_ENEMIES.lvl2.hp}\n` +
            `3️⃣ **Goblin** (Lvl ${level}) - ${DUNGEON_ENEMIES.lvl3.emoji} HP: ${DUNGEON_ENEMIES.lvl3.hp}\n` +
            `4️⃣ **Ork** (Lvl ${level}) - ${DUNGEON_ENEMIES.lvl4.emoji} HP: ${DUNGEON_ENEMIES.lvl4.hp}\n` +
            `5️⃣ **Ogre** (Lvl ${level}) - ${DUNGEON_ENEMIES.lvl5.emoji} HP: ${DUNGEON_ENEMIES.lvl5.hp}\n` +
            `6️⃣ **Smok** (Lvl ${level}) - ${DUNGEON_ENEMIES.lvl6.emoji} HP: ${DUNGEON_ENEMIES.lvl6.hp}`
        );

    const btn1 = new ButtonBuilder().setCustomId('dungeon_1').setLabel('🤡 Kamikazę').setStyle(ButtonStyle.Success).setEmoji('🤡');
    const btn2 = new ButtonBuilder().setCustomId('dungeon_2').setLabel('🦂 Skorpion').setStyle(ButtonStyle.Success).setEmoji('🦂');
    const btn3 = new ButtonBuilder().setCustomId('dungeon_3').setLabel('👺 Goblin').setStyle(ButtonStyle.Success).setEmoji('👺');
    const btn4 = new ButtonBuilder().setCustomId('dungeon_4').setLabel('👹 Ork').setStyle(ButtonStyle.Success).setEmoji('👹');
    const btn5 = new ButtonBuilder().setCustomId('dungeon_5').setLabel('👹 Ogre').setStyle(ButtonStyle.Success).setEmoji('👹');
    const btn6 = new ButtonBuilder().setCustomId('dungeon_6').setLabel('🐉 Smok').setStyle(ButtonStyle.Danger).setEmoji('🐉');

    embed.addFields({
        name: '⚔️ Twoja moc:',
        value: `HP: ${stats.hp} | ATK: ${stats.atk} | DEF: ${stats.def} | CRIT: ${stats.crit}%`,
        inline: false,
    });

    embed.addFields({
        name: '📊 Statystyki:',
        value: `💰 Money: ${(profile.money || 0).toLocaleString('pl-PL')} ${COIN}`,
        inline: true,
    });

    embed.addFields({
        name: '🎒 Inwentarz:',
        value: `(pojemność: 20 slotów)`,
        inline: true,
    });

    embed.setFooter({ text: 'Wybierz poziom do wyprawy!' });
    embed.setTimestamp();

    const components = [
        new ActionRowBuilder().addComponents(btn1, btn2),
        new ActionRowBuilder().addComponents(btn3, btn4),
        new ActionRowBuilder().addComponents(btn5, btn6),
    ];

    await interaction.reply({ embeds: [embed], components });
}

// ── Obsługa buttonów dungeon ─────────────────────────────────────────
async function handleDungeonButton(interaction, supabase, profile, level) {
    const selectedLevel = parseInt(interaction.customId.split('_')[1]);
    const enemy = DUNGEON_ENEMIES[`lvl${selectedLevel}`];

    if (!enemy) return;

    const stats = calculateStats(profile);
    const userId = interaction.user.id;

    // Prosta walka (niech statystyki decydują)
    // Gracz zadaje obrażenia: atk - def enemy + crit
    // Enemy zadaje: atk - def gracz

    const critRoll = Math.random() * 100 < (stats.crit || 5);
    const baseDmg = stats.atk - enemy.def;
    const finalDmg = critRoll ? Math.floor(baseDmg * 1.5) : baseDmg;

    const enemyDmg = Math.max(0, Math.floor((enemy.atk - stats.def) * (0.9 + Math.random() * 0.2)));

    if (finalDmg <= 0) {
        return interaction.reply({
            content: `❌ Twoja broń jest **za słaba**! Musisz ulepszyć swoją zbroję.`,
            ephemeral: true,
        });
    }

    // Prosty system walki - 1-3 rundy
    let combatRounds = Math.max(1, Math.floor(Math.random() * 3 + 1));
    let combatDmg = 0;
    let combatReceived = 0;

    for (let round = 1; round <= combatRounds; round++) {
        combatDmg += finalDmg;
        combatReceived += enemyDmg;
    }

    const newHp = Math.max(0, (stats.hp || 100) - combatReceived);

    if (newHp <= 0) {
        // Gracz przegrał - stracił coins
        const lostMoney = Math.floor(Math.random() * 30 + 10);
        const newMoney = (profile.money || 0) - lostMoney;

        await supabase.from('profiles').update({ money: newMoney }).eq('id', profile.id);

        return interaction.editReply({
            content: `💀 **PRZEGRANA!**\n\n👹 ${enemy.name} Cię zabił!\n⚔️ Otrzymałeś obrażeń: ${combatReceived}\n💸 Straciłeś: ${lostMoney} ${COIN}`,
            embeds: [
                new EmbedBuilder()
                    .setTitle('💀 Pokonany przez ' + enemy.name)
                    .setDescription(`⚔️ Obrażenia: ${combatReceived} HP`)
                    .setColor('#dc3545'),
            ],
        });
    }

    // Wygrana - loot + exp + coins
    const coins = Math.floor(Math.random() * enemy.coins * (1 + (stats.luck || 10) / 100));
    const xp = enemy.xp;
    const newLevel = Math.floor(0.1 * Math.sqrt((profile.xp || 0) + xp));
    const newMoney = (profile.money || 0) + coins;

    // Drop mechanika
    const rand = Math.random() * 100;
    let dropType = 'common';
    if (rand > 98) dropType = 'legendary';
    else if (rand > 94) dropType = 'epic';
    else if (rand > 85) dropType = 'rare';
    else if (rand > 55) dropType = 'uncommon';

    const dropPool = LOOT_TABLE[dropType].pool;
    const lootId = dropPool[Math.floor(Math.random() * dropPool.length)];
    const loot = LOOT_ITEMS[lootId] || { name: 'Słaby przedmiot', emoji: '📦', type: 'common' };

    // Zapisz loot
    await supabase.from('profiles').update({
        money: newMoney,
        xp: (profile.xp || 0) + xp,
        level: newLevel,
        updated_at: new Date().toISOString(),
        [loot.type]: (profile[loot.type] || []).concat([{ id: generateItemId(), ...loot }]),
    }).eq('id', profile.id);

    return interaction.editReply({
        content: `🎉 **WYGRANA!**\n\n👹 Pokonałeś: **${enemy.name}** (${enemy.emoji})\n💰 Zdobycz: ${coins} ${COIN}\n✨ XP: +${xp}\n📈 Level: ${profile.level} → ${newLevel}\n📦 Drop: **${loot.name}** ${loot.emoji}`,
        embeds: [
            new EmbedBuilder()
                .setTitle('🎉 Wygrana walka!')
                .setDescription(`💰 ${coins} ${COIN} | ✨ ${xp} XP | 📦 ${loot.name}`)
                .setColor('#22FF00'),
        ],
    });
}

// ── 8. Miasto ──────────────────────────────────────────────────────────
async function handleCity(interaction, supabase, profile) {
    const userId = interaction.user.id;
    const { rpg } = profile;
    const stats = calculateStats(profile);

    const embed = new EmbedBuilder()
        .setTitle('🏙️ Miasto')
        .setColor('#1bbdbd')
        .setDescription(
            '**Dostępne miejsca:**\n\n' +
            '🛒 **Sklep** - Kupuj przedmioty, eliksiry\n' +
            '🏥 **Szpital** - Leczenie za 50 coins\n' +
            '🔨 **Kowal** - Ulepszaj przedmioty\n' +
            '🏦 **Bank** - Zarządzaj pieniędzmi'
        );

    const btnShop = new ButtonBuilder().setCustomId('city_shop').setLabel('🛒 Sklep').setStyle(ButtonStyle.Primary).setEmoji('🛒');
    const btnHeal = new ButtonBuilder().setCustomId('city_heal').setLabel('🏥 Szpital').setStyle(ButtonStyle.Success).setEmoji('🏥');
    const btnForge = new ButtonBuilder().setCustomId('city_forge').setLabel('🔨 Kowal').setStyle(ButtonStyle.Secondary).setEmoji('🔨');
    const btnBank = new ButtonBuilder().setCustomId('city_bank').setLabel('🏦 Bank').setStyle(ButtonStyle.Secondary).setEmoji('🏦');

    const components = [
        new ActionRowBuilder().addComponents(btnShop, btnHeal),
        new ActionRowBuilder().addComponents(btnForge, btnBank),
    ];

    await interaction.reply({ embeds: [embed], components });
}

// ── Sklep (Miasto) ────────────────────────────────────────────────────
async function handleCityShop(interaction, supabase, profile) {
    const money = profile.money || 0;

    const shopItems = [
        { name: 'Eksperymentalny napój siły', emoji: '🧪', price: 100, effect: 'atk +20' },
        { name: 'Eksperymentalny napój życia', emoji: '💉', price: 80, effect: 'Heal 100 HP' },
        { name: 'Eksperymentalny napój magii', emoji: '🔮', price: 120, effect: 'Crit +10%' },
        { name: 'Zwykły klucz', emoji: '🔑', price: 50, type: 'key', slot: 1 },
        { name: 'Złoty klucz', emoji: '🗝️', price: 200, type: 'key', slot: 2 },
        { name: 'Klucz smoka', emoji: '🐲', price: 1000, type: 'key', slot: 3 },
    ];

    const embed = new EmbedBuilder()
        .setTitle('🛒 Sklep w Mieście')
        .setColor('#1bbdbd')
        .setDescription(
            `Portfel: **${money.toLocaleString('pl-PL')} ${COIN}**\n\n` +
            shopItems.map((item, i) => `${i + 1}. ${item.emoji} **${item.name}** - ${item.price} ${COIN} | ${item.effect}`).join('\n')
        );

    const btns = shopItems.map((item, i) => {
        const btn = new ButtonBuilder()
            .setCustomId(`shop_${i}`)
            .setLabel(`${item.name}`)
            .setEmoji(item.emoji)
            .setStyle(ButtonStyle.Success);

        if (money < item.price) {
            btn.setDisabled(true);
            btn.setEmoji('❌');
        }

        return btn;
    });

    const rows = [];
    for (let i = 0; i < btns.length; i += 2) {
        rows.push(new ActionRowBuilder().addComponents(btns[i], btns[i + 1]));
    }

    await interaction.reply({ embeds: [embed], components: rows });
}

// ── Szpital (Miasto) ──────────────────────────────────────────────────
async function handleCityHeal(interaction, supabase, profile) {
    const userId = interaction.user.id;
    const stats = calculateStats(profile);
    const healCost = 50;

    if (stats.hp >= 100) {
        return interaction.reply({
            content: '🩺 Twoja postać jest już w pełni wyleczona!',
            ephemeral: true,
        });
    }

    const money = profile.money || 0;

    if (money < healCost) {
        return interaction.reply({
            content: `❌ Nie masz wystarczająco monet! Potrzebujesz **${healCost} ${COIN}**.`,
            ephemeral: true,
        });
    }

    const newMoney = money - healCost;
    await supabase.from('profiles').update({ money: newMoney }).eq('id', profile.id);
    await supabase.from('profiles').update({ xp: stats.hp }).eq('id', profile.id);

    return interaction.reply({
        content: `🏥 **Szpital**\n\n✅ Wyleczono! HP: ${stats.hp} → 100\n💰 Koszt: ${healCost} ${COIN}\n💵 Pozostało: ${newMoney} ${COIN}`,
        ephemeral: true,
    });
}

// ── Kowal (Miasto) ────────────────────────────────────────────────────
async function handleCityForge(interaction, supabase, profile) {
    const stats = calculateStats(profile);
    const money = profile.money || 0;

    const upgrades = [
        { name: 'Ulepsz broń', price: 100, desc: '+5 ATK' },
        { name: 'Ulepsz hełm', price: 100, desc: '+3 DEF' },
        { name: 'Ulepsz zbroję', price: 200, desc: '+10 DEF' },
        { name: 'Ulepsz spodenie', price: 150, desc: '+7 DEF' },
        { name: 'Ulepsz buty', price: 150, desc: '+7 DEF' },
        { name: 'Ulepsz tarczę', price: 150, desc: '+10 DEF' },
        { name: 'Ulepsz pierścionek', price: 100, desc: '+5 stat' },
    ];

    const embed = new EmbedBuilder()
        .setTitle('🔨 Kowal')
        .setColor('#f6b41e')
        .setDescription(`Portfel: **${money.toLocaleString('pl-PL')} ${COIN}**\n\n${upgrades.map((u, i) => `${i + 1}. ${u.emoji} **${u.name}** - ${u.price} ${COIN} | ${u.desc}`).join('\n')}`);

    const btns = upgrades.map((upgrade, i) => {
        const btn = new ButtonBuilder()
            .setCustomId(`forge_${i}`)
            .setLabel(upgrade.name)
            .setEmoji(upgrade.emoji)
            .setStyle(ButtonStyle.Success);

        if (money < upgrade.price) {
            btn.setDisabled(true);
            btn.setEmoji('❌');
        }

        return btn;
    });

    const rows = [];
    for (let i = 0; i < btns.length; i += 2) {
        rows.push(new ActionRowBuilder().addComponents(btns[i], btns[i + 1]));
    }

    await interaction.reply({ embeds: [embed], components: rows });
}

// ── Obsługa buttonów miasta ───────────────────────────────────────────
async function handleCityButton(interaction, supabase, profile) {
    if (interaction.customId.startsWith('shop_')) {
        await handleCityShop(interaction, supabase, profile);
        return;
    }

    if (interaction.customId === 'city_heal') {
        await handleCityHeal(interaction, supabase, profile);
        return;
    }

    if (interaction.customId === 'city_forge') {
        await handleCityForge(interaction, supabase, profile);
        return;
    }

    if (interaction.customId === 'city_bank') {
        // Bank - podobnie jak w index.js
        return interaction.reply({
            content: '🏦 **Bank** - Użyj `/wplac` lub `/wyplac` do zarządzania pieniędzmi.',
            ephemeral: true,
        });
    }
}

// ── Exporty ───────────────────────────────────────────────────────────
module.exports = {
    getRpgProfile,
    calculateStats,
    handleEquipment,
    handleInventory,
    handleMine,
    handleStaw,
    handleDungeon,
    handleDungeonButton,
    handleCity,
    handleCityShop,
    handleCityHeal,
    handleCityForge,
    handleCityButton,
    ITEMS,
    DUNGEON_ENEMIES,
    LOOT_TABLE,
    LOOT_ITEMS,
    BASE_STATS,
    LEVEL_STATS,
};
