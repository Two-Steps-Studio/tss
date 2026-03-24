// fishing/fishing.js – zintegrowane z Supabase (bez osobnej bazy SQLite)
const { EmbedBuilder } = require('discord.js');
const { FISH, RARITY_STYLES, FISHING_COOLDOWN, TRASH_CHANCE } = require('./fish.config');

const cooldowns = new Map();

function rollFish() {
    if (Math.random() * 100 < TRASH_CHANCE) {
        const trash = Object.values(FISH).filter(f => f.rarity === 'trash');
        return trash[Math.floor(Math.random() * trash.length)];
    }
    const pool  = Object.values(FISH).filter(f => f.chance > 0);
    const total = pool.reduce((s, f) => s + f.chance, 0);
    let roll    = Math.random() * total;
    for (const fish of pool) {
        roll -= fish.chance;
        if (roll <= 0) return fish;
    }
    return pool[pool.length - 1];
}

function rollWeight(fish) {
    const w = fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight);
    return Math.round(w * 100) / 100;
}

function calcValue(fish, weight) {
    const ratio = (weight - fish.minWeight) / ((fish.maxWeight - fish.minWeight) || 1);
    return Math.round(fish.baseValue + ratio * fish.baseValue * 0.5);
}

function getLevelFromXP(xp) {
    if (xp < 100) return 0;
    return Math.floor(0.1 * Math.sqrt(xp));
}

// ── /lowienie ────────────────────────────────────────────────
async function handleFishing(interaction, supabase, profile, COIN = '<:CoinTSS:1485751590530060378>') {
    const userId = interaction.user.id;

    if (cooldowns.has(userId)) {
        const remaining = Math.ceil((cooldowns.get(userId) - Date.now()) / 1000);
        if (remaining > 0) {
            return interaction.reply({
                content: `⏳ Poczekaj jeszcze **${remaining}s** zanim znowu zarzucisz wędkę!`,
                ephemeral: true
            });
        }
    }

    const BAIT_COST = 10;
    if ((profile.money || 0) < BAIT_COST) {
        return interaction.reply({
            content: `❌ Nie stać Cię na przynętę! Potrzebujesz **${BAIT_COST} ${COIN}**.`,
            ephemeral: true
        });
    }

    cooldowns.set(userId, Date.now() + FISHING_COOLDOWN * 1000);
    setTimeout(() => cooldowns.delete(userId), FISHING_COOLDOWN * 1000);

    await interaction.reply({ content: '🎣 Zarzucasz wędkę...' });
    await new Promise(r => setTimeout(r, 2000));

    const fish    = rollFish();
    const weight  = rollWeight(fish);
    const value   = calcValue(fish, weight);
    const style   = RARITY_STYLES[fish.rarity];
    const isTrash = fish.rarity === 'trash';

    const newMoney = Math.max(0, (profile.money || 0) - BAIT_COST + value);
    const newXp    = (profile.xp || 0) + (isTrash ? 1 : fish.xp);
    const newLevel = getLevelFromXP(newXp);

    await supabase.from('profiles').update({
        money:      newMoney,
        xp:         newXp,
        level:      newLevel,
        updated_at: new Date().toISOString()
    }).eq('id', profile.id);

    if (!isTrash) {
        try {
            await supabase.from('fishing_catches').insert({
                user_id:   userId,
                fish_name: fish.name,
                rarity:    fish.rarity,
                weight:    weight,
                value:     value,
            });
        } catch (_) {} // ignore – tabela może nie istnieć
    }
    
    const embed = new EmbedBuilder()
        .setColor(style.color)
        .setTitle(isTrash
            ? `${fish.emoji} Wyciągnąłeś... śmieci`
            : `${fish.emoji} Złapałeś ${fish.name}!`)
        .addFields(
            { name: '📦 Rzadkość', value: `${style.emoji} ${style.label}`, inline: true },
            { name: '⚖️ Waga',     value: `${weight} kg`,                  inline: true },
            { name: '💰 Zysk', value: isTrash
                    ? `Strata przynęty (-${BAIT_COST} ${COIN})`
                    : ` ${value - BAIT_COST >= 0 ? '+' : ''}${value - BAIT_COST} ${COIN}`, inline: true },
        );

    if (!isTrash) {
        embed.addFields(
            { name: '✨ XP',      value: `+${fish.xp} XP`,  inline: true },
            { name: '💵 Gotówka', value: `${COIN} ${newMoney}`, inline: true }, // <--- tutaj emotka
        );
    }

    embed.setFooter({ text: `Cooldown: ${FISHING_COOLDOWN}s | Koszt przynęty: ${BAIT_COST}` });
    await interaction.editReply({ content: null, embeds: [embed] });
}

// ── /ryby ────────────────────────────────────────────────────
async function handleFishInventory(interaction, supabase, COIN = '<:CoinTSS:1485751590530060378>') {
    const userId = interaction.user.id;

    const { data: catches } = await supabase
        .from('fishing_catches')
        .select('*')
        .eq('user_id', userId)
        .order('caught_at', { ascending: false })
        .limit(10);

    if (!catches || catches.length === 0) {
        return interaction.reply({
            content: '🎣 Nie masz jeszcze żadnych ryb! Użyj `/lowienie` żeby zacząć.',
            ephemeral: true
        });
    }

    const list = catches.map(c => {
        const s = RARITY_STYLES[c.rarity || 'common'];
        return `${s.emoji} **${c.fish_name}** – ${c.weight}kg – ${c.value} ${COIN}`;
    }).join('\n');

    const { data: stats } = await supabase
        .from('fishing_catches')
        .select('value, weight, fish_name')
        .eq('user_id', userId);

    const totalCaught = stats?.length || 0;
    const totalEarned = stats?.reduce((s, c) => s + (c.value || 0), 0) || 0;
    const biggest     = stats?.reduce((max, c) => c.weight > (max?.weight || 0) ? c : max, null);

    const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`🎣 Ostatnie połowy – ${interaction.user.username}`)
        .setDescription(list)
        .addFields(
            { name: '🐟 Złapano', value: `${totalCaught}`, inline: true },
            { name: '💰 Zarobiono łącznie', value: `${COIN} ${totalEarned}`, inline: true },
            { name: '🏆 Rekord', value: biggest ? `${biggest.fish_name} (${biggest.weight}kg)` : '—', inline: true },
        );

    interaction.reply({ embeds: [embed] });
}

// ── /fishtop ─────────────────────────────────────────────────
async function handleFishTop(interaction, supabase, COIN = '<:CoinTSS:1485751590530060378>') {
    const { data: rows } = await supabase
        .from('fishing_catches')
        .select('user_id, value');

    if (!rows || rows.length === 0) {
        return interaction.reply({ content: 'Brak danych.', ephemeral: true });
    }

    const grouped = {};
    for (const row of rows) {
        if (!grouped[row.user_id]) grouped[row.user_id] = { total: 0, count: 0 };
        grouped[row.user_id].total += row.value || 0;
        grouped[row.user_id].count += 1;
    }

    const list = Object.entries(grouped)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 10)
        .map(([uid, d], i) => `**${i + 1}.** <@${uid}> – ${d.count} ryb, ${d.total} ${COIN}`)
        .join('\n');

    const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle('🏆 Top Wędkarze')
        .setDescription(list);

    interaction.reply({ embeds: [embed] });
}

module.exports = { handleFishing, handleFishInventory, handleFishTop };