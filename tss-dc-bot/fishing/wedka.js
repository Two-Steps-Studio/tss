// fishing/wedka.js – komenda /wedka (przeglądanie + kupowanie sprzętu)
// Sprzęt trzymany w osobnej tabeli Supabase: fishing_gear
//
// Schemat tabeli (wykonaj w Supabase SQL Editor):
// ─────────────────────────────────────────────────────────────
// CREATE TABLE IF NOT EXISTS fishing_gear (
//     user_id      TEXT PRIMARY KEY,
//     zylka        INTEGER NOT NULL DEFAULT 0,
//     kolowrotek   INTEGER NOT NULL DEFAULT 0,
//     haczyk       INTEGER NOT NULL DEFAULT 0,
//     przynet      INTEGER NOT NULL DEFAULT 0,
//     updated_at   TIMESTAMPTZ DEFAULT NOW()
// );
// ─────────────────────────────────────────────────────────────

const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const { GEAR, getGearStats, getGearLevel } = require('./gear.config');

const COIN = '<:CoinTSS:1486049846132605042>';
const GEAR_KEYS = ['zylka', 'kolowrotek', 'haczyk', 'przynet'];

// ── Pobierz (lub utwórz) wiersz sprzętu z Supabase ──────────
async function fetchGearRow(supabase, userId) {
    const { data, error } = await supabase
        .from('fishing_gear')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) console.error('[GEAR] fetchGearRow error:', error.message);

    if (!data) {
        // Utwórz domyślny wiersz (wszystko poziom 0)
        const { data: newRow, error: insertErr } = await supabase
            .from('fishing_gear')
            .upsert({ user_id: userId }, { onConflict: 'user_id' })
            .select()
            .single();

        if (insertErr) console.error('[GEAR] insert error:', insertErr.message);
        return newRow ?? { user_id: userId, zylka: 0, kolowrotek: 0, haczyk: 0, przynet: 0 };
    }

    return data;
}

// Konwertuj wiersz tabeli → obiekt { zylka: N, kolowrotek: N, … }
function rowToGearObj(row) {
    return {
        zylka:      row?.zylka      ?? 0,
        kolowrotek: row?.kolowrotek ?? 0,
        haczyk:     row?.haczyk     ?? 0,
        przynet:    row?.przynet    ?? 0,
    };
}

// ── Buduj embed ekwipunku ────────────────────────────────────
function buildGearEmbed(gearObj = {}, money = 0) {
    const stats = getGearStats(gearObj);

    const embed = new EmbedBuilder()
        .setTitle('🎣 Twój Sprzęt Wędkarski')
        .setColor('#1bbdbd')
        .setDescription(
            `Portfel: **${money} ${COIN}**\n` +
            `Wybierz część sprzętu z menu poniżej, żeby ją ulepszyć.\n\u200b`
        );

    for (const key of GEAR_KEYS) {
        const part    = GEAR[key];
        const lvl     = getGearLevel(gearObj, key);
        const current = part.levels[lvl];
        const next    = part.levels[lvl + 1];

        const currentLabel = `${part.emoji} **${current.label}** (poz. ${lvl}/5)`;
        const nextLabel    = next
            ? `➡️ Następny: **${next.label}** za **${next.price.toLocaleString('pl-PL')} ${COIN}**`
            : `✅ Maksymalny poziom!`;

        embed.addFields({
            name:  `${part.emoji} ${part.name}`,
            value: `${currentLabel}\n${nextLabel}`,
        });
    }

    embed.addFields({
        name: '\u200b',
        value:
            `📊 **Aktywne bonusy:**\n` +
            `🪢 Wartość ryb: **+${Math.round(stats.valueBonus * 100)}%**\n` +
            `🎡 Cooldown: **-${stats.cooldownReduction}s**\n` +
            `🪝 Rzadkość: **+${Math.round(stats.rarityBonus * 100)}%** szansy\n` +
            `🪱 Przynęta: **-${stats.baitDiscount}$** kosztu`,
    });

    return embed;
}

// ── Buduj komponenty (dropdown + przycisk odśwież) ───────────
function buildGearComponents(gearObj = {}, money = 0) {
    const options = GEAR_KEYS.map(key => {
        const part  = GEAR[key];
        const lvl   = getGearLevel(gearObj, key);
        const next  = part.levels[lvl + 1];
        const maxed = !next;

        return {
            label: `${part.name} (poz. ${lvl}/5)` +
                   (maxed ? ' — MAX' : ` — ${next.price.toLocaleString('pl-PL')}$`),
            value:       key,
            description: part.description.slice(0, 100),
            emoji:       maxed ? '✅' : (money >= (next?.price ?? Infinity) ? '💰' : '❌'),
        };
    });

    const select = new StringSelectMenuBuilder()
        .setCustomId('gear_upgrade_select')
        .setPlaceholder('Wybierz część do ulepszenia')
        .addOptions(options);

    const refreshBtn = new ButtonBuilder()
        .setCustomId('gear_refresh')
        .setLabel('🔄 Odśwież')
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder().addComponents(select),
        new ActionRowBuilder().addComponents(refreshBtn),
    ];
}

// ── /wedka – główny handler komendy ─────────────────────────
async function handleWedka(interaction, supabase, profile) {
    await interaction.deferReply();

    const gearRow = await fetchGearRow(supabase, interaction.user.id);
    const gearObj = rowToGearObj(gearRow);
    const money   = profile.money ?? 0;

    await interaction.editReply({
        embeds:     [buildGearEmbed(gearObj, money)],
        components: buildGearComponents(gearObj, money),
    });
}

// ── Obsługa interakcji sklepu wędki (dropdown + przycisk) ────
async function handleGearInteraction(interaction, supabase) {
    const id     = interaction.customId;
    const userId = interaction.user.id;

    // Pobierz świeże dane
    const [{ data: profile }, gearRow] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        fetchGearRow(supabase, userId),
    ]);

    if (!profile) {
        return interaction.reply({ content: '❌ Nie masz profilu.', ephemeral: true });
    }

    const gearObj = rowToGearObj(gearRow);
    const money   = profile.money ?? 0;

    // ── Odśwież widok ────────────────────────────────────────
    if (id === 'gear_refresh') {
        return interaction.update({
            embeds:     [buildGearEmbed(gearObj, money)],
            components: buildGearComponents(gearObj, money),
        });
    }

    // ── Zakup ulepszenia ─────────────────────────────────────
    if (id === 'gear_upgrade_select') {
        const partKey = interaction.values?.[0];
        if (!partKey || !GEAR[partKey]) {
            return interaction.reply({ content: '❌ Nieznana część.', ephemeral: true });
        }

        const part    = GEAR[partKey];
        const lvl     = getGearLevel(gearObj, partKey);
        const nextLvl = part.levels[lvl + 1];

        if (!nextLvl) {
            return interaction.reply({
                content: `✅ Twój **${part.name}** jest już na **maksymalnym poziomie**!`,
                ephemeral: true,
            });
        }

        if (money < nextLvl.price) {
            return interaction.reply({
                content:
                    `❌ Brakuje Ci monet!\n` +
                    `Potrzebujesz **${nextLvl.price.toLocaleString('pl-PL')} ${COIN}**, ` +
                    `masz **${money} ${COIN}**.`,
                ephemeral: true,
            });
        }

        // Transakcja: odejmij monety z profiles + zaktualizuj fishing_gear
        const newMoney = money - nextLvl.price;

        const [moneyResult, gearResult] = await Promise.all([
            supabase.from('profiles')
                .update({ money: newMoney })
                .eq('id', userId),
            supabase.from('fishing_gear')
                .update({ [partKey]: lvl + 1, updated_at: new Date().toISOString() })
                .eq('user_id', userId),
        ]);

        if (moneyResult.error || gearResult.error) {
            console.error('[GEAR] Update error:', moneyResult.error || gearResult.error);
            return interaction.reply({ content: '❌ Błąd zapisu. Spróbuj ponownie.', ephemeral: true });
        }

        const newGearObj = { ...gearObj, [partKey]: lvl + 1 };

        // Odśwież embed z nowym stanem
        await interaction.update({
            embeds:     [buildGearEmbed(newGearObj, newMoney)],
            components: buildGearComponents(newGearObj, newMoney),
        });

        await interaction.followUp({
            content:
                `✅ Ulepszyłeś **${part.emoji} ${part.name}** ` +
                `do poziomu **${lvl + 1}/5** (${nextLvl.label}) ` +
                `za **${nextLvl.price.toLocaleString('pl-PL')} ${COIN}**!`,
            ephemeral: true,
        });
    }
}

module.exports = { handleWedka, handleGearInteraction, fetchGearRow, rowToGearObj };
