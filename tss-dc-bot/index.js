require('dotenv').config();
const { Client, GatewayIntentBits, AttachmentBuilder, REST, Routes, SlashCommandBuilder, EmbedBuilder, Collection } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const { createProfileCard } = require('./profileGenerator');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

// Daily stats
let messagesTodayCount = 0;
let lastDay = new Date().getDate();

// Level calculation helper
function getLevelFromXP(xp) {
    if (xp < 100) return 0;
    return Math.floor(0.1 * Math.sqrt(xp));
}

// Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('profilowe')
        .setDescription('Twoja karta profilowa Two Steps Studio'),
    new SlashCommandBuilder()
        .setName('bal') // Portfel
        .setDescription('Sprawdź stan swojego konta i banku'),
    new SlashCommandBuilder()
        .setName('topmoney')
        .setDescription('Ranking najbogatszych graczy'),
    new SlashCommandBuilder()
        .setName('toplevel')
        .setDescription('Ranking najwyższych poziomów'),
    new SlashCommandBuilder()
        .setName('praca') // Praca
        .setDescription('Zarób trochę monet pracując dla studia'),
    new SlashCommandBuilder()
        .setName('lowienie') // Łowienie ryb
        .setDescription('Spróbuj złowić coś cennego'),
    new SlashCommandBuilder()
        .setName('sklep') // Sklep
        .setDescription('Kup ozdoby i tła'),
].map(command => command.toJSON());

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

// Helpers
async function getProfile(userId, username, roles = []) {
    // Search by ID (Snowflake) or discord_id (Linked Account)
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq."${userId}",discord_id.eq."${userId}"`)
        .maybeSingle();

    if (!profile) {
        // Create new Discord-only profile
        const { data } = await supabase.from('profiles').upsert({
            id: userId,
            username: username,
            xp: 0,
            level: 0,
            money: 50,
            bank: 0,
            discord_roles: roles
        }).select().maybeSingle();
        return data;
    }

    // Sync roles if provided and changed
    if (roles.length > 0) {
        await supabase.from('profiles').update({
            discord_roles: roles,
            username: username // Keep username synced
        }).eq('id', profile.id);
    }

    return profile;
}

client.once('ready', async () => {
    console.log(`Bot ${client.user.tag} stands ready!`);
    await registerCommands();
    updateDiscordStats();
    setInterval(updateDiscordStats, 60 * 1000); // Odświeżaj bazę co minutę
});

// Update database with server stats
async function updateDiscordStats() {
    try {
        // Używamy wszystkich serwerów, do których należy bot (zazwyczaj jeden)
        const guilds = await client.guilds.fetch();
        if (guilds.size === 0) {
            console.error('[STATS] Bot nie jest na żadnym serwerze!');
            return;
        }

        const guildBase = guilds.first();
        const guild = await guildBase.fetch();

        const members = await guild.members.fetch();
        const humans = members.filter(m => !m.user.bot).size;
        const onlineCount = members.filter(m => m.presence?.status === 'online' || m.presence?.status === 'dnd').size;
        const channels = guild.channels.cache.size;

        // Reset liczników codziennie
        const currentDay = new Date().getDate();
        if (currentDay !== lastDay) {
            messagesTodayCount = 0;
            lastDay = currentDay;
        }

        console.log(`[STATS] Próba zapisu: ${onlineCount} online, ${humans} members, ${messagesTodayCount} msgs.`);

        const { error } = await supabase.from('discord_stats').insert({
            online_users: onlineCount || 0,
            active_channels: channels || 0,
            member_count: humans || 0,
            messages_today: messagesTodayCount || 0,
            recorded_at: new Date().toISOString()
        });

        if (error) {
            console.error('[STATS] Błąd zapisu do Supabase:', error.message);
            // Próba zapisu bez member_count (jeśli użytkownik nie dodał kolumny w SQL)
            if (error.message.includes('column "member_count" does not exist')) {
                console.warn('[STATS] Kolumna member_count nie istnieje, pomijam...');
                await supabase.from('discord_stats').insert({
                    online_users: onlineCount || 0,
                    active_channels: channels || 0,
                    messages_today: humans, // Fallback do starej kolumny
                    recorded_at: new Date().toISOString()
                });
            }
        } else {
            console.log('[STATS] Synchronizacja zakończona sukcesem.');
        }

    } catch (e) {
        console.error('[STATS] Krytyczny błąd synchronizacji:', e.message);
    }
}

// INTERACTIONS (Commands)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const profile = await getProfile(interaction.user.id, interaction.user.username);

    if (interaction.commandName === 'profilowe') {
        await interaction.deferReply();
        try {
            const buffer = await createProfileCard({
                username: interaction.member?.displayName || interaction.user.username,
                level: profile?.level || 0,
                money: profile?.money || 0,
                xp: profile?.xp || 0,
                roles: interaction.member?.roles.cache.map(r => r.name) || [],
                avatarURL: interaction.user.displayAvatarURL({ extension: 'png', size: 256 })
            });

            const attachment = new AttachmentBuilder(buffer, { name: 'profile.png' });
            await interaction.editReply({ files: [attachment] });
        } catch (error) {
            console.error('[CC] Error:', error);
            await interaction.editReply('Błąd generowania karty.');
        }
    }

    if (interaction.commandName === 'bal') {
        const embed = new EmbedBuilder()
            .setTitle(`💰 Portfel: ${interaction.user.username}`)
            .setColor('#1bbdbd')
            .addFields(
                { name: '💵 Gotówka', value: `${profile?.money || 0} TSS`, inline: true },
                { name: '🏦 Bank', value: `${profile?.bank || 0} TSS`, inline: true }
            )
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'topmoney') {
        const { data: topPlayers } = await supabase
            .from('profiles')
            .select('*')
            .order('money', { ascending: false })
            .limit(10);

        const list = topPlayers?.map((p, i) => `**#${i + 1}** ${p.username} - **${p.money || 0} TSS** 💸`).join('\n') || 'Brak danych.';

        const embed = new EmbedBuilder()
            .setTitle('💰 Najbogatsi w Studiu')
            .setColor('#22FF00')
            .setDescription(list);
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'toplevel') {
        const { data: topPlayers } = await supabase
            .from('profiles')
            .select('*')
            .order('xp', { ascending: false })
            .limit(10);

        const list = topPlayers?.map((p, i) => `**#${i + 1}** ${p.username} - Lvl ${p.level || 0} (${p.xp || 0} XP) 🏆`).join('\n') || 'Brak danych.';

        const embed = new EmbedBuilder()
            .setTitle('🏆 Top Level w Studiu')
            .setColor('#ffcB2f')
            .setDescription(list);
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'praca') {
        const lastWork = profile?.last_work ? new Date(profile.last_work) : 0;
        const now = new Date();
        const diff = now - lastWork;

        if (diff < 3600000) { // 1 hour cooldown
            const minsLeft = Math.ceil((3600000 - diff) / 60000);
            return interaction.reply(`⏳ Jesteś zmęczony! Odpocznij jeszcze **${minsLeft} min** before next work.`);
        }

        const earnings = Math.floor(Math.random() * 80) + 20;
        await supabase.from('profiles').update({
            money: (profile.money || 0) + earnings,
            last_work: now.toISOString()
        }).eq('id', profile.id);

        await interaction.reply(`⛏️ Zapracowałeś ciężko w Studiu i otrzymałeś **${earnings} monet!**`);
    }

    if (interaction.commandName === 'lowienie') {
        const cost = 10;
        if ((profile.money || 0) < cost) return interaction.reply('❌ Nie stać Cię na przynętę (koszt 10 monet).');

        const chance = Math.random();
        let msg = '';
        let win = 0;

        if (chance > 0.95) { msg = '📦 Znalazłeś Złotą Skrzynię! (+200 monet)'; win = 200; }
        else if (chance > 0.6) { msg = '🐟 Złowiłeś Pstrąga! (Wymiana na 40 monet)'; win = 40; }
        else if (chance > 0.3) { msg = '👞 Wyciągnąłeś stary but... (+5 monet)'; win = 5; }
        else { msg = '🌊 Nic nie złowiłeś.'; win = 0; }

        await supabase.from('profiles').update({
            money: (profile.money || 0) - cost + win
        }).eq('id', profile.id);

        await interaction.reply(msg);
    }
});

// TEXT LEVELING (+2 XP, +1 Money)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // Track stats
    messagesTodayCount++;

    try {
        const roles = message.member?.roles.cache
            .filter(r => r.name !== '@everyone')
            .map(r => r.name) || [];

        const profile = await getProfile(message.author.id, message.author.username, roles);
        const newXp = (profile.xp || 0) + 2;
        const newMoney = (profile.money || 0) + 1;
        const newLevel = getLevelFromXP(newXp);

        if (newLevel > (profile.level || 0)) {
            await message.channel.send(`🎉 Gratulacje <@${message.author.id}>! Awans na poziom **${newLevel}**!`);
        }

        await supabase.from('profiles').update({
            xp: newXp,
            money: newMoney,
            level: newLevel,
            updated_at: new Date().toISOString()
        }).eq('id', profile.id);
    } catch (e) {
        console.error('Text leveling error:', e);
    }
});

// VOICE LEVELING (+3 XP, +2 Money per min)
client.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.id;

    // Joined VC
    if (!oldState.channelId && newState.channelId) {
        if (!newState.member.user.bot) {
            voiceSessions.set(userId, Date.now());
        }
    }

    // Left VC
    if (oldState.channelId && !newState.channelId) {
        const startTime = voiceSessions.get(userId);
        if (startTime) {
            const timeSpent = Date.now() - startTime;
            const minutes = Math.floor(timeSpent / 60000);
            voiceSessions.delete(userId);

            if (minutes > 0) {
                syncVoiceRewards(userId, minutes, newState.member.user.username);
            }
        }
    }
});

async function syncVoiceRewards(userId, minutes, username) {
    try {
        const profile = await getProfile(userId, username);
        const addedXp = minutes * 3;
        const addedMoney = minutes * 2;
        const newXp = (profile.xp || 0) + addedXp;
        const newMoney = (profile.money || 0) + addedMoney;
        const newLevel = getLevelFromXP(newXp);

        await supabase.from('profiles').update({
            xp: newXp,
            money: newMoney,
            level: newLevel,
            updated_at: new Date().toISOString()
        }).eq('id', profile.id);

        console.log(`[VC] Syced rewards for ${username}: ${addedXp} XP, ${addedMoney} Money.`);
    } catch (e) {
        console.error('[VC] Reward sync error:', e);
    }
}

// WELCOME MESSAGES
client.on('guildMemberAdd', member => {
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name.includes('powitania') || ch.name.includes('welcome'));
    if (welcomeChannel) {
        const embed = new EmbedBuilder()
            .setTitle('👋 Witaj w Two Steps Studio!')
            .setDescription(`Witaj <@${member.id}>! Cieszymy się, że do nas dołączyłeś. `)
            .setColor('#1bbdbd')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields({ name: 'Twoje ID', value: member.id });
        welcomeChannel.send({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
