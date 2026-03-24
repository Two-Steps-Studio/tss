require('dotenv').config();
const { Client, GatewayIntentBits, AttachmentBuilder, REST, Routes, SlashCommandBuilder, EmbedBuilder, Collection } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const { createProfileCard } = require('./profileGenerator');
const { handleFishing, handleFishInventory, handleFishTop } = require('./fishing/fishing');
const { handleShop, handleShopInteraction } = require('./shop');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Waluta ───────────────────────────────
const COIN = '<:CoinTSS:1486049846132605042>';
// ── Konfiguracja Kanału ──────────────────────────────────────
const ALLOWED_CHANNEL_ID = '1360920823258550353';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const voiceSessions = new Collection();
let messagesTodayCount = 0;
let lastDay = new Date().getDate();

function getLevelFromXP(xp) {
    if (!xp || xp < 100) return 0;
    return Math.floor(0.1 * Math.sqrt(xp));
}

// ── Slash Commands Definition ────────────────────────────────
const commands = [
    new SlashCommandBuilder()
        .setName('profilowe')
        .setDescription('Twoja karta profilowa Two Steps Studio'),
    new SlashCommandBuilder()
        .setName('bal')
        .setDescription('Sprawdź stan swojego konta i banku'),
    new SlashCommandBuilder()
        .setName('topmoney')
        .setDescription('Ranking najbogatszych graczy'),
    new SlashCommandBuilder()
        .setName('toplevel')
        .setDescription('Ranking najwyższych poziomów'),
    new SlashCommandBuilder()
        .setName('praca')
        .setDescription('Zarób trochę monet pracując dla studia'),
    new SlashCommandBuilder()
        .setName('sklep')
        .setDescription('Kup ozdoby, rangi i dodatki'),
    new SlashCommandBuilder()
        .setName('lowienie')
        .setDescription('Zarzuć wędkę i złap coś cennego! (koszt: 10 monet)'),
    new SlashCommandBuilder()
        .setName('ryby')
        .setDescription('Zobacz swoje ostatnie połowy i statystyki'),
    new SlashCommandBuilder()
        .setName('fishtop')
        .setDescription('Ranking najlepszych wędkarzy'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
    try {
        console.log('--- SYNCING SLASH COMMANDS ---');
        await rest.put(
            Routes.applicationCommands('1484253044421038261'),
            { body: commands },
        );
        console.log('--- SLASH COMMANDS SYNCED ---');
    } catch (error) {
        console.error('Failed sync:', error);
    }
}

// ── KLUCZOWA FUNKCJA: Pobieranie/Tworzenie Profilu ──────────
async function getProfile(userId, username, roles = []) {
    try {
        let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (!profile) {
            console.log(`[DB] Tworzenie nowego profilu dla: ${username} (${userId})`);
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    username: username || 'Nieznany',
                    xp: 0,
                    level: 0,
                    money: 50,
                    bank: 0,
                    discord_roles: roles
                }, { onConflict: 'id' })
                .select()
                .single();

            if (insertError) throw insertError;
            return newProfile;
        }

        const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({
                username: username,
                discord_roles: roles
            })
            .eq('id', userId)
            .select()
            .single();

        return updatedProfile || profile;
    } catch (err) {
        console.error('[DB ERROR] getProfile:', err.message);
        return { id: userId, username: username, xp: 0, level: 0, money: 0, bank: 0, discord_roles: roles };
    }
}

client.once('ready', async () => {
    console.log(`Bot ${client.user.tag} stands ready!`);
    await registerCommands();
    updateDiscordStats();
    setInterval(updateDiscordStats, 60 * 1000);
});

async function updateDiscordStats() {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        const members = await guild.members.fetch();
        const humans = members.filter(m => !m.user.bot).size;
        const online = members.filter(m => m.presence?.status === 'online' || m.presence?.status === 'dnd').size;
        const channels = guild.channels.cache.size;

        const currentDay = new Date().getDate();
        if (currentDay !== lastDay) { messagesTodayCount = 0; lastDay = currentDay; }

        await supabase.from('discord_stats').insert({
            online_users: online || 0,
            active_channels: channels || 0,
            member_count: humans || 0,
            messages_today: messagesTodayCount || 0,
            recorded_at: new Date().toISOString()
        });
    } catch (e) {
        console.error('[STATS] Błąd:', e.message);
    }
}

// ── Interactions ─────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
    // BLOKADA KANAŁU
    if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
        // Pozwalamy tylko jeśli to nie jest interakcja z botem (opcjonalne zabezpieczenie)
        if (interaction.isChatInputCommand() || interaction.isButton() || interaction.isStringSelectMenu()) {
            return interaction.reply({
                content: `❌ Komend i funkcji bota można używać wyłącznie na kanale <#${ALLOWED_CHANNEL_ID}>!`,
                ephemeral: true
            });
        }
        return;
    }

    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith('shop_page_') || interaction.customId.startsWith('shop_buy_')) {
            await handleShopInteraction(interaction, supabase);
            return;
        }
    }

    if (!interaction.isChatInputCommand()) return;

    const roles = interaction.member?.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name) || [];
    const profile = await getProfile(interaction.user.id, interaction.user.username, roles);

    switch (interaction.commandName) {

        case 'profilowe': {
            await interaction.deferReply();
            try {
                const buffer = await createProfileCard({
                    username:  interaction.member?.displayName || interaction.user.username,
                    level:     profile.level ?? 0,
                    money:     profile.money ?? 0,
                    xp:        profile.xp ?? 0,
                    bank:      profile.bank ?? 0,
                    roles:     roles,
                    avatarURL: interaction.user.displayAvatarURL({ extension: 'png', size: 256 })
                });
                const attachment = new AttachmentBuilder(buffer, { name: 'profile.png' });
                await interaction.editReply({ files: [attachment] });
            } catch (error) {
                console.error('[CC] Error:', error);
                await interaction.editReply('Błąd generowania karty.');
            }
            break;
        }

        case 'bal': {
            const embed = new EmbedBuilder()
                .setTitle(`💰 Portfel: ${interaction.user.username}`)
                .setColor('#1bbdbd')
                .addFields(
                    { name: '💵 Gotówka', value: `${profile.money ?? 0} ${COIN}`, inline: true },
                    { name: '🏦 Bank',    value: `${profile.bank  ?? 0} ${COIN}`, inline: true }
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            break;
        }

        case 'topmoney': {
            const { data: top } = await supabase
                .from('profiles').select('*')
                .order('money', { ascending: false }).limit(10);
            const list = top?.map((p, i) =>
                `**#${i + 1}** ${p.username} - **${p.money || 0} ${COIN}**`
            ).join('\n') || 'Brak danych.';
            await interaction.reply({ embeds: [
                    new EmbedBuilder().setTitle('💰 Najbogatsi w Studiu').setColor('#22FF00').setDescription(list)
                ]});
            break;
        }

        case 'toplevel': {
            const { data: top } = await supabase
                .from('profiles').select('*')
                .order('xp', { ascending: false }).limit(10);
            const list = top?.map((p, i) =>
                `**#${i + 1}** ${p.username} - Lvl ${p.level || 0} (${p.xp || 0} XP) 🏆`
            ).join('\n') || 'Brak danych.';
            await interaction.reply({ embeds: [
                    new EmbedBuilder().setTitle('🏆 Top Level w Studiu').setColor('#ffcB2f').setDescription(list)
                ]});
            break;
        }

        case 'praca': {
            const lastWork = profile.last_work ? new Date(profile.last_work) : 0;
            const diff = Date.now() - lastWork;
            if (diff < 3600000) {
                const minsLeft = Math.ceil((3600000 - diff) / 60000);
                return interaction.reply(`⏳ Jesteś zmęczony! Odpocznij jeszcze **${minsLeft} min**.`);
            }
            const earnings = Math.floor(Math.random() * 80) + 20;
            await supabase.from('profiles').update({
                money: (profile.money || 0) + earnings,
                last_work: new Date().toISOString()
            }).eq('id', profile.id);
            await interaction.reply(`⛏️ Zapracowałeś ciężko w Studiu i otrzymałeś **${earnings} ${COIN}!**`);
            break;
        }

        case 'lowienie':
            await handleFishing(interaction, supabase, profile, COIN);
            break;

        case 'ryby':
            await handleFishInventory(interaction, supabase, COIN);
            break;

        case 'fishtop':
            await handleFishTop(interaction, supabase, COIN);
            break;

        case 'sklep':
            await handleShop(interaction, supabase, profile, COIN);
            break;
    }
});

// ── Text Leveling ────────────────────────────────────────────
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    messagesTodayCount++;
    try {
        const roles = message.member?.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name) || [];
        const profile = await getProfile(message.author.id, message.author.username, roles);

        if (!profile) return;

        const currentXP = profile.xp ?? 0;
        const currentLevel = profile.level ?? 0;
        const newXp = currentXP + 2;
        const newMoney = (profile.money ?? 0) + 1;
        const newLevel = getLevelFromXP(newXp);

        if (newLevel > currentLevel) {
            await message.channel.send(`🎉 Gratulacje <@${message.author.id}>! Awans na poziom **${newLevel}**!`);
        }

        await supabase.from('profiles').update({
            xp: newXp, money: newMoney, level: newLevel, updated_at: new Date().toISOString()
        }).eq('id', profile.id);
    } catch (e) {
        console.error('Text leveling error:', e.message);
    }
});

// ── Voice Leveling ───────────────────────────────────────────
client.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.id;
    if (!oldState.channelId && newState.channelId && !newState.member.user.bot) {
        voiceSessions.set(userId, Date.now());
    }
    if (oldState.channelId && !newState.channelId) {
        const startTime = voiceSessions.get(userId);
        if (startTime) {
            const minutes = Math.floor((Date.now() - startTime) / 60000);
            voiceSessions.delete(userId);
            if (minutes > 0) syncVoiceRewards(userId, minutes, newState.member?.user.username || 'Unknown');
        }
    }
});

async function syncVoiceRewards(userId, minutes, username) {
    try {
        const profile = await getProfile(userId, username);
        const newXp = (profile.xp || 0) + minutes * 3;
        const newMoney = (profile.money || 0) + minutes * 2;
        const newLevel = getLevelFromXP(newXp);
        await supabase.from('profiles').update({
            xp: newXp, money: newMoney, level: newLevel, updated_at: new Date().toISOString()
        }).eq('id', profile.id);
    } catch (e) { console.error('[VC] Reward sync error:', e); }
}

// ── Welcome ──────────────────────────────────────────────────
client.on('guildMemberAdd', member => {
    const ch = member.guild.channels.cache.find(c => c.name.includes('powitania') || c.name.includes('welcome'));
    if (ch) {
        ch.send({ embeds: [
                new EmbedBuilder()
                    .setTitle('👋 Witaj w Two Steps Studio!')
                    .setDescription(`Witaj <@${member.id}>! Cieszymy się, że do nas dołączyłeś.`)
                    .setColor('#1bbdbd')
                    .setThumbnail(member.user.displayAvatarURL())
                    .addFields({ name: 'Twoje ID', value: member.id })
            ]});
    }
});

client.login(process.env.DISCORD_TOKEN);