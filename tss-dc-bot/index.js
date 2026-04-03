require('dotenv').config();
const { Client, GatewayIntentBits, AttachmentBuilder, REST, Routes, SlashCommandBuilder, EmbedBuilder, Collection } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const { createProfileCard, availableBackgrounds, refreshBackgrounds } = require('./profileGenerator');
const { handleFishing, handleFishInventory, handleFishTop } = require('./fishing/fishing');
const { handleShop, handleShopInteraction } = require('./shop');
const { handleWedka, handleGearInteraction } = require('./fishing/wedka');
const { handleAfkFishing, handleAfkStop } = require('./fishing/afk_fishing');
const { handleEventCreate, handleEventList, handleEventJoin, handleEventDelete } = require('./events/events');
const {
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
} = require('./rpg');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const COIN = '<:CoinTSS:1486049846132605042>';
const ALLOWED_CHANNEL_ID = '1360920823258550353';

// ── Rangi Levelowe ───────────────────────────────────────────
const LEVEL_ROLES = [
    { minLevel: 100, name: '〔 📊︱Level 100 〕' },
    { minLevel: 90,  name: '〔 📊︱Level 90 〕'  },
    { minLevel: 80,  name: '〔 📊︱Level 80 〕'  },
    { minLevel: 70,  name: '〔 📊︱Level 70 〕'  },
    { minLevel: 60,  name: '〔 📊︱Level 60 〕'  },
    { minLevel: 50,  name: '〔 📊︱Level 50 〕'  },
    { minLevel: 40,  name: '〔 📊︱Level 40 〕'  },
    { minLevel: 30,  name: '〔 📊︱Level 30 〕'  },
    { minLevel: 20,  name: '〔 📊︱Level 20 〕'  },
    { minLevel: 10,  name: '〔 📊︱Level 10 〕'  },
    { minLevel: 5,   name: '〔 📊︱Level 5 〕'   },
    { minLevel: 4,   name: '〔 📊︱Level 4 〕'   },
    { minLevel: 3,   name: '〔 📊︱Level 3 〕'   },
    { minLevel: 2,   name: '〔 📊︱Level 2 〕'   },
    { minLevel: 1,   name: '〔 📊︱Level 1 〕'   },
];

const ALL_LEVEL_ROLE_NAMES = new Set(LEVEL_ROLES.map(r => r.name));

function getExpectedRoleName(level) {
    for (const entry of LEVEL_ROLES) {
        if (level >= entry.minLevel) return entry.name;
    }
    return null;
}

async function syncLevelRole(member, newLevel) {
    try {
        const guild        = member.guild;
        const expectedName = getExpectedRoleName(newLevel);

        const levelRolesOnServer = guild.roles.cache.filter(r => ALL_LEVEL_ROLE_NAMES.has(r.name));
        const memberLevelRoles   = member.roles.cache.filter(r => ALL_LEVEL_ROLE_NAMES.has(r.name));
        const expectedRole       = expectedName
            ? guild.roles.cache.find(r => r.name === expectedName)
            : null;

        if (
            expectedRole &&
            memberLevelRoles.size === 1 &&
            memberLevelRoles.has(expectedRole.id)
        ) return;

        const toRemove = memberLevelRoles.map(r => r.id);
        if (toRemove.length > 0) {
            await member.roles.remove(toRemove).catch(e =>
                console.error('[LEVEL ROLE] Błąd zdejmowania rang:', e.message)
            );
        }

        if (expectedRole) {
            await member.roles.add(expectedRole).catch(e =>
                console.error('[LEVEL ROLE] Błąd nadawania rangi:', e.message)
            );
        }
    } catch (e) {
        console.error('[LEVEL ROLE] syncLevelRole error:', e.message);
    }
}

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
const cooldowns = new Map();
let messagesTodayCount = 0;
let lastDay = new Date().getDate();

function getLevelFromXP(xp) {
    if (!xp || xp < 100) return 0;
    return Math.floor(0.1 * Math.sqrt(xp));
}

// Constants
const DEFAULT_STARTING_MONEY = 50;
const MESSAGE_XP_REWARD = 2;
const MESSAGE_MONEY_REWARD = 1;
const VOICE_XP_REWARD = 3;
const VOICE_MONEY_REWARD = 2;

// ── Slash Commands Definition ────────────────────────────────
const commands = [
    new SlashCommandBuilder()
        .setName('profilowe')
        .setDescription('Wyświetl kartę profilową Two Steps Studio')
        .addUserOption(option =>
            option
                .setName('uzytkownik')
                .setDescription('Użytkownik do wyświetlenia (opcjonalnie, domyślnie twój profil)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('ustawienia')
        .setDescription('Zarządzaj ustawieniami twojego profilu')
        .addStringOption(option =>
            option.setName('tlo')
                .setDescription('Zmień tło swojej karty profilowej')
                .setRequired(false)
                .setAutocomplete(true)
        ),
    new SlashCommandBuilder()
        .setName('tla')
        .setDescription('Pokaż wszystkie dostępne tła'),
    new SlashCommandBuilder()
        .setName('bal')
        .setDescription('Sprawdź stan swojego konta i banku'),
    new SlashCommandBuilder()
        .setName('wplac')
        .setDescription('Wpłać monety do banku')
        .addIntegerOption(option =>
            option.setName('ilosc')
                .setDescription('Ile monet chcesz wpłacić (0 = wszystko)')
                .setRequired(true)
                .setMinValue(0)
        ),
    new SlashCommandBuilder()
        .setName('wyplac')
        .setDescription('Wypłać monety z banku')
        .addIntegerOption(option =>
            option.setName('ilosc')
                .setDescription('Ile monet chcesz wypłacić (0 = wszystko)')
                .setRequired(true)
                .setMinValue(0)
        ),
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
        .setDescription('Zarzuć wędkę i złap coś cennego!'),
    new SlashCommandBuilder()
        .setName('ryby')
        .setDescription('Zobacz swoje ostatnie połowy i statystyki'),
    new SlashCommandBuilder()
        .setName('topfish')
        .setDescription('Ranking najlepszych wędkarzy'),
    new SlashCommandBuilder()
        .setName('wedka')
        .setDescription('Ulepsz swój sprzęt wędkarski (żyłka, kołowrotek, haczyk, przynęta)'),
    new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Zarządzaj sesją AFK - zacznij lub zakończ wędkowanie')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Rozpocznij sesję AFK przy jeziorze')
                .addIntegerOption(opt =>
                    opt.setName('czas')
                        .setDescription('Jak długo chcesz siedzieć przy jeziorze?')
                        .setRequired(false)
                        .addChoices(
                            { name: '15 minut',  value: 15  },
                            { name: '30 minut',  value: 30  },
                            { name: '1 godzina', value: 60  },
                            { name: '2 godziny', value: 120 },
                            { name: '4 godziny', value: 240 },
                        )
                )
        )
        .addSubcommand(sub =>
            sub.setName('stop')
                .setDescription('Zakończ sesję AFK i odbierz podsumowanie połowów')
        ),

    // ── Eventy ───────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('event_create')
        .setDescription('Utwórz nowy event e-sportowy')
        .addStringOption(opt =>
            opt.setName('nazwa')
                .setDescription('Nazwa eventu')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('data')
                .setDescription('Data w formacie DD.MM.YYYY HH:MM, np. 25.12.2025 18:00')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('opis')
                .setDescription('Opis eventu (opcjonalnie)')
                .setRequired(false)
        )
        .addIntegerOption(opt =>
            opt.setName('max_uczestnikow')
                .setDescription('Maksymalna liczba uczestników (opcjonalnie)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('event_list')
        .setDescription('Lista nadchodzących eventów e-sportowych'),
    new SlashCommandBuilder()
        .setName('event_join')
        .setDescription('Sprawdź szczegóły eventu i dołącz')
        .addIntegerOption(opt =>
            opt.setName('id')
                .setDescription('ID eventu z /event_list')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('event_delete')
        .setDescription('Usuń event (tylko admin)')
        .addIntegerOption(opt =>
            opt.setName('id')
                .setDescription('ID eventu do usunięcia')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('go')
        .setDescription('Przejdź do lokacji')
        .addStringOption(option =>
            option.setName('lokacja')
                .setDescription('Do jakiej lokacji chcesz pójść?')
                .setRequired(true)
                .addChoices(
                    { name: 'Kopalnia', value: 'kopalnia' },
                    { name: 'Staw', value: 'staw' },
                    { name: 'Dungeon', value: 'dungeon' },
                    { name: 'Miasto', value: 'miasto' },
                )
        ),
    new SlashCommandBuilder()
        .setName('rpg_profile')
        .setDescription('Pokaż statystyki RPG'),
    new SlashCommandBuilder()
        .setName('rpg_equipment')
        .setDescription('Pokaż ekwipunek RPG'),
    new SlashCommandBuilder()
        .setName('rpg_inventory')
        .setDescription('Pokaż inwentarz RPG'),
    new SlashCommandBuilder()
        .setName('rpg_sell')
        .setDescription('Sprzedaj przedmioty RPG'),
    new SlashCommandBuilder()
        .setName('rpg_heal')
        .setDescription('Wylecz postać w RPG'),
    new SlashCommandBuilder()
        .setName('rpg_upgrade')
        .setDescription('Ulepsz przedmioty w kowalu'),
    new SlashCommandBuilder()
        .setName('rpg_shop')
        .setDescription('Sklep z przedmiotami RPG'),
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

// ── Pobieranie/Tworzenie Profilu ─────────────────────────────
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
                    discord_roles: roles,
                    background: 'default'
                }, { onConflict: 'id' })
                .select()
                .single();

            if (insertError) throw insertError;
            return newProfile;
        }

        const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ username, discord_roles: roles })
            .eq('id', userId)
            .select()
            .single();

        return updatedProfile || profile;
    } catch (err) {
        console.error('[DB ERROR] getProfile:', err.message);
        return {
            id: userId,
            username,
            xp: 0,
            level: 0,
            money: 0,
            bank: 0,
            discord_roles: roles,
            background: 'default'
        };
    }
}

// ── Globalna obsługa błędów ───────────────────────────────────
client.on('error', (error) => {
    console.error('[CLIENT ERROR]', error.message);
});

process.on('unhandledRejection', (error) => {
    console.error('[UNHANDLED REJECTION]', error?.message || error);
});

client.once('clientReady', async () => {
    console.log(`Bot ${client.user.tag} stands ready!`);
    await registerCommands();
    updateDiscordStats();
    setInterval(updateDiscordStats, 60 * 1000);
});

async function updateDiscordStats() {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        const members  = await guild.members.fetch();
        const humans   = members.filter(m => !m.user.bot).size;
        const online   = members.filter(m => m.presence?.status === 'online' || m.presence?.status === 'dnd').size;
        const channels = guild.channels.cache.size;

        const currentDay = new Date().getDate();
        if (currentDay !== lastDay) { messagesTodayCount = 0; lastDay = currentDay; }

        await supabase.from('discord_stats').insert({
            online_users:    online    || 0,
            active_channels: channels  || 0,
            member_count:    humans    || 0,
            messages_today:  messagesTodayCount || 0,
            recorded_at:     new Date().toISOString(),
        });
    } catch (e) {
        console.error('[STATS] Błąd:', e.message);
    }
}

// ── Pomocnik do bezpiecznej odpowiedzi ───────────────────────
// Używa editReply jeśli już zdeferowane, reply w przeciwnym razie
async function safeReply(interaction, options) {
    try {
        if (interaction.deferred || interaction.replied) {
            return await interaction.editReply(options);
        }
        return await interaction.reply(options);
    } catch (e) {
        console.error('[SAFE REPLY] Błąd odpowiedzi:', e.message);
    }
}

// ── Interactions ─────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
    // Blokada kanału
    if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
        if (interaction.isChatInputCommand() || interaction.isButton() || interaction.isStringSelectMenu()) {
            if (interaction.replied || interaction.deferred) return;
            return interaction.reply({
                content: `❌ Komend i funkcji bota można używać wyłącznie na kanale <#${ALLOWED_CHANNEL_ID}>!`,
                flags: 1 << 6,
            });
        }
        return;
    }

    // Przyciski i select menu
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith('shop_page_') || interaction.customId.startsWith('shop_buy_')) {
            await handleShopInteraction(interaction, supabase);
            return;
        }
        if (interaction.customId === 'gear_upgrade_select' || interaction.customId === 'gear_refresh') {
            await handleGearInteraction(interaction, supabase);
            return;
        }
        if (interaction.customId.startsWith('dungeon_')) {
            const profile = await getRpgProfile(interaction.user.id, supabase);
            const level = profile.level || 1;
            await handleDungeonButton(interaction, supabase, profile, level);
            return;
        }
        if (interaction.customId === 'city_shop' || interaction.customId.startsWith('shop_') || interaction.customId === 'city_heal' || interaction.customId === 'city_forge' || interaction.customId === 'city_bank') {
            await handleCityButton(interaction, supabase, profile);
            return;
        }
    }

    // Autocomplete
    if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'ustawienia') {
            const focused = interaction.options.getFocused();
            const choices = availableBackgrounds
                .filter(bg => bg.toLowerCase().includes(focused.toLowerCase()))
                .slice(0, 25)
                .map(bg => ({ name: bg, value: bg }));
            return interaction.respond(choices);
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    // ── NATYCHMIASTOWY DEFER ─────────────────────────────────
    // Komendy które NIE potrzebują defer (odpowiadają natychmiastowo prostym tekstem)
    const NO_DEFER_COMMANDS = [];

    if (!NO_DEFER_COMMANDS.includes(interaction.commandName)) {
        try {
            await interaction.deferReply();
        } catch (e) {
            // Interakcja wygasła zanim zdążyliśmy odpowiedzieć — porzuć
            console.error('[DEFER] Nie udało się zdeferować interakcji:', e.message);
            return;
        }
    }

    if (!interaction.isChatInputCommand()) return;

    const roles   = interaction.member?.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name) || [];
    const profile = await getProfile(interaction.user.id, interaction.user.username, roles);

    switch (interaction.commandName) {

        case 'profilowe': {
            // Pobierz opcjonalnego użytkownika (domyślnie autor komendy)
            const targetUser = interaction.options.getUser('uzytkownik') || interaction.user;
            const isOtherUser = targetUser.id !== interaction.user.id;

            // Jeśli sprawdzamy innego użytkownika, pobierz jego profile i role
            let targetProfile = profile;
            let targetRoles = roles;
            if (isOtherUser) {
                const member = await interaction.guild?.members.fetch(targetUser.id).catch(() => null);
                targetRoles = member?.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name) || [];
                targetProfile = await getProfile(targetUser.id, targetUser.username, targetRoles);
            }

            try {
                const calculatedLevel = getLevelFromXP(targetProfile.xp ?? 0);
                const buffer = await createProfileCard({
                    username:  interaction.guild?.members.cache.get(targetUser.id)?.displayName || targetUser.username,
                    level:     calculatedLevel,
                    money:     targetProfile.money  ?? 0,
                    xp:        targetProfile.xp     ?? 0,
                    bank:      targetProfile.bank   ?? 0,
                    background: targetProfile.background,
                    roles:     targetRoles,
                    avatarURL: targetUser.displayAvatarURL({ extension: 'png', size: 256 }),
                });
                const attachment = new AttachmentBuilder(buffer, { name: 'profile.png' });
                await interaction.editReply({ files: [attachment] });
            } catch (error) {
                console.error('[CC] Error:', error);
                await interaction.editReply('Błąd generowania karty.');
            }
            break;
        }

        case 'ustawienia': {
            const backgroundName = interaction.options.getString('tlo');

            if (!backgroundName) {
                // Jeśli nie podano żadnych ustawień, pokaż obecne
                return await interaction.editReply({
                    content: `📋 Twoje ustawienia:\n• Tło profilu: \`${profile.background || 'default'}\`\n\nUżyj \`/ustawienia tlo:bg_nazwa\` aby zmienić tło.`,
                    ephemeral: true
                });
            }

            if (!availableBackgrounds.includes(backgroundName)) {
                return await interaction.editReply({
                    content: `❌ Tło "${backgroundName}" nie istnieje. Dostępne tła: \`${availableBackgrounds.join(', ')}\``,
                    ephemeral: true
                });
            }

            try {
                await supabase
                    .from('profiles')
                    .update({ background: backgroundName })
                    .eq('id', interaction.user.id);

                await interaction.editReply({
                    content: `✅ Ustawiono tło profilu na: **${backgroundName}**`,
                    ephemeral: true
                });
            } catch (err) {
                console.error('[BACKGROUND] Błąd zapisu:', err.message);
                await interaction.editReply({
                    content: '❌ Wystąpił błąd podczas ustawiania tła.',
                    ephemeral: true
                });
            }
            break;
        }

        case 'tla': {
            // Odśwież listę tła przed wyświetleniem
            const backgrounds = refreshBackgrounds();

            // Formatowanie listy tła w postaci kolumn
            const itemsPerRow = 4;
            const rows = [];

            for (let i = 0; i < backgrounds.length; i += itemsPerRow) {
                const row = backgrounds.slice(i, i + itemsPerRow);
                rows.push(row.join(' | '));
            }

            const embed = new EmbedBuilder()
                .setTitle('🖼️ Dostępne tła')
                .setDescription(`Możesz zmienić tło komendą \`/ustawienia tlo:<nazwa>\`\n\n${rows.join('\n')}`)
                .setColor('#22FF00')
                .addFields(
                    { name: '📌 Instrukcja', value: 'Aby dodać nowe tło:\n1. Skopiuj plik do folderu `C:\\tss\\tss-dc-bot\\assets\\discord\\backgrounds`\n2. Zaczekaj 30 sekund lub użyj komendy `/tla` ponownie' }
                )
                .setFooter({ text: `Dostępnych tła: ${backgrounds.length}` });

            await interaction.editReply({ embeds: [embed] });
            break;
        }

        case 'bal': {
            const embed = new EmbedBuilder()
                .setTitle(`💰 Portfel: ${interaction.user.username}`)
                .setColor('#1bbdbd')
                .addFields(
                    { name: '💵 Gotówka', value: `${profile.money ?? 0} ${COIN}`, inline: true },
                    { name: '🏦 Bank',    value: `${profile.bank  ?? 0} ${COIN}`, inline: true },
                )
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            break;
        }

        case 'wplac': {
            let amountInput = interaction.options.getInteger('ilosc');
            const currentMoney = profile.money ?? 0;
            const amount = amountInput === 0 ? currentMoney : amountInput;

            if (amount <= 0 || currentMoney <= 0) {
                return await interaction.editReply({ content: '❌ Nie masz monet do wpłaty.', ephemeral: true });
            }
            if (currentMoney < amount) {
                return await interaction.editReply({ content: `❌ Masz tylko **${currentMoney}** ${COIN} w portfelu.`, ephemeral: true });
            }

            const newMoney = currentMoney - amount;
            const newBank = (profile.bank ?? 0) + amount;

            await supabase.from('profiles').update({ money: newMoney, bank: newBank }).eq('id', profile.id);

            await interaction.editReply({
                content: `✅ Wpłaciłeś **${amount}** ${COIN} do banku!\n💵 Portfel: **${newMoney}** ${COIN}\n🏦 Bank: **${newBank}** ${COIN}`,
                ephemeral: true
            });
            break;
        }

        case 'wyplac': {
            let amountInput = interaction.options.getInteger('ilosc');
            const currentBank = profile.bank ?? 0;
            const amount = amountInput === 0 ? currentBank : amountInput;

            if (amount <= 0 || currentBank <= 0) {
                return await interaction.editReply({ content: '❌ Nie masz monet w banku do wypłaty.', ephemeral: true });
            }
            if (currentBank < amount) {
                return await interaction.editReply({ content: `❌ Masz tylko **${currentBank}** ${COIN} w banku.`, ephemeral: true });
            }

            const newBank = currentBank - amount;
            const newMoney = (profile.money ?? 0) + amount;

            await supabase.from('profiles').update({ money: newMoney, bank: newBank }).eq('id', profile.id);

            await interaction.editReply({
                content: `✅ Wypłaciłeś **${amount}** ${COIN} z banku!\n💵 Portfel: **${newMoney}** ${COIN}\n🏦 Bank: **${newBank}** ${COIN}`,
                ephemeral: true
            });
            break;
        }

        case 'topmoney': {
            const { data: top } = await supabase
                .from('profiles').select('*')
                .order('money', { ascending: false }).limit(10);
            const list = top?.map((p, i) =>
                `**#${i + 1}** ${p.username} - **${p.money || 0} ${COIN}**`
            ).join('\n') || 'Brak danych.';
            await interaction.editReply({ embeds: [
                    new EmbedBuilder().setTitle('💰 Najbogatsi w Studiu').setColor('#22FF00').setDescription(list),
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
            await interaction.editReply({ embeds: [
                    new EmbedBuilder().setTitle('🏆 Top Level w Studiu').setColor('#ffcB2f').setDescription(list),
                ]});
            break;
        }

        case 'praca': {
            const lastWork = profile.last_work ? new Date(profile.last_work) : 0;
            const diff     = Date.now() - lastWork;
            if (diff < 3600000) {
                const minsLeft = Math.ceil((3600000 - diff) / 60000);
                return await interaction.editReply(`⏳ Jesteś zmęczony! Odpocznij jeszcze **${minsLeft} min**.`);
            }
            const earnings = Math.floor(Math.random() * 80) + 20;
            await supabase.from('profiles').update({
                money:     (profile.money || 0) + earnings,
                last_work: new Date().toISOString(),
            }).eq('id', profile.id);
            await interaction.editReply(`⛏️ Zapracowałeś ciężko w Studiu i otrzymałeś **${earnings} ${COIN}!**`);
            break;
        }

        case 'lowienie':
            await handleFishing(interaction, supabase, profile, COIN);
            break;

        case 'ryby':
            await handleFishInventory(interaction, supabase, COIN);
            break;

        case 'topfish':
            await handleFishTop(interaction, supabase, COIN);
            break;

        case 'sklep':
            await handleShop(interaction, supabase, profile, COIN);
            break;

        case 'wedka':
            await handleWedka(interaction, supabase, profile);
            break;

        case 'afk': {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'start') {
                await handleAfkFishing(interaction, supabase, profile, COIN);
            } else if (subcommand === 'stop') {
                await handleAfkStop(interaction, COIN);
            }
            break;
        }

        // ── Eventy ───────────────────────────────────────────
        case 'event_create':
            await handleEventCreate(interaction, supabase);
            break;

        case 'event_list':
            await handleEventList(interaction, supabase);
            break;

        case 'event_join':
            await handleEventJoin(interaction, supabase);
            break;

        case 'event_delete':
            await handleEventDelete(interaction, supabase);
            break;

        case 'go': {
            const location = interaction.options.getString('lokacja');
            const profile = await getRpgProfile(interaction.user.id, supabase);

            if (location === 'kopalnia') {
                await handleMine(interaction, supabase, profile);
            } else if (location === 'staw') {
                await handleStaw(interaction, supabase, profile);
            } else if (location === 'dungeon') {
                const stats = calculateStats(profile);
                const level = profile.level || 1;
                await handleDungeon(interaction, supabase, profile, level);
            } else if (location === 'miasto') {
                await handleCity(interaction, supabase, profile);
            } else {
                return interaction.reply({ content: '❌ Nieznana lokacja. Użyj: /go lokacja:kopalnia|staw|dungeon|miasto', ephemeral: true });
            }
            break;
        }

        case 'rpg_profile': {
            const stats = calculateStats(profile);
            const level = profile.level || 1;

            const embed = new EmbedBuilder()
                .setTitle(`📊 Profil RPG: ${profile.username}`)
                .setColor('#22FF00')
                .setDescription(
                    `**Poziom:** ${level}\n` +
                    `**XP:** ${profile.xp || 0}\n\n` +
                    `**Lokalizacja:** ${profile.rpg?.location || 'Miasto'}`
                )
                .addFields(
                    { name: '🩸 HP', value: `${stats?.hp || profile.rpg?.hp || 120}`, inline: true },
                    { name: '⚔️ ATK', value: `${stats?.atk || profile.rpg?.atk || 12}`, inline: true },
                    { name: '🛡️ DEF', value: `${stats?.def || profile.rpg?.def || 10}`, inline: true },
                    { name: '🎯 CRIT', value: `${stats?.crit || profile.rpg?.crit || 5}%`, inline: true },
                    { name: '🍀 LUCK', value: `${stats?.luck || profile.rpg?.luck || 10}`, inline: true },
                    { name: '💰 Money', value: `${profile.money || 0} ${COIN}`, inline: true },
                    { name: '🏦 Bank', value: `${profile.bank || 0} ${COIN}`, inline: true },
                );

            if (profile.rpg?.equipment) {
                const eq = profile.rpg.equipment;
                const equipped = [];
                if (eq.weapon) equipped.push(`⚔️ Bron: ${eq.weapon}`);
                if (eq.helmet) equipped.push(`🪖 Hełm: ${eq.helmet}`);
                if (eq.chest) equipped.push(`🧥 Zbroja: ${eq.chest}`);
                if (eq.pants) equipped.push(`👖 Spodnie: ${eq.pants}`);
                if (eq.boots) equipped.push(`👢 Buty: ${eq.boots}`);
                if (eq.shield) equipped.push(`🛡️ Tarcza: ${eq.shield}`);
                if (eq.ring) equipped.push(`💍 Pierścień: ${eq.ring}`);

                if (equipped.length > 0) {
                    embed.addFields({ name: '🛡️ Ekwipunek:', value: equipped.join('\n'), inline: false });
                }
            }

            await interaction.reply({ embeds: [embed] });
            break;
        }

        case 'rpg_equipment':
            await handleEquipment(interaction, supabase, profile);
            break;

        case 'rpg_inventory':
            await handleInventory(interaction, supabase, profile);
            break;

        case 'rpg_sell': {
            const money = profile.money || 0;
            const items = profile.rpg?.ore || [];

            const embed = new EmbedBuilder()
                .setTitle('💰 Skup przedmiotów RPG')
                .setColor('#1bbdbd')
                .setDescription(
                    `**Znaleziono rud:** ${items.length}\n\n` +
                    `Domyślna cena: 100 ${COIN}/rudy\n\n` +
                    `Otrzymasz za sprzedaż:`
                );

            const totalValue = items.reduce((sum, item) => sum + (item.value || 100), 0);
            embed.addFields({ name: '💰 Łączna wartość', value: `${totalValue} ${COIN}`, inline: false });

            if (items.length > 0) {
                embed.addFields({ name: '📦 Lista:', value: items.map(i => `${i.emoji || '•'} **${i.name}**`).join('\n'), inline: false });
            }

            await interaction.reply({ embeds: [embed] });
            break;
        }

        case 'rpg_heal': {
            const stats = calculateStats(profile);

            if (!stats) return interaction.reply({ content: '❌ Nie udało się pobrać statystyk.', ephemeral: true });

            await handleCityHeal(interaction, supabase, profile);
            break;
        }

        case 'rpg_upgrade': {
            await handleCityForge(interaction, supabase, profile);
            break;
        }

        case 'rpg_shop': {
            await handleCityShop(interaction, supabase, profile);
            break;
        }
    }
});

// Wrapper do obsługi błędów komend
async function handleCommandWithErrors(interaction, fn) {
    try {
        await fn();
    } catch (e) {
        console.error(`[COMMAND ERROR] /${interaction.commandName}:`, e.message);
        try {
            const errMsg = { content: '❌ Wystąpił błąd podczas wykonywania komendy.' };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errMsg);
            } else {
                await interaction.reply({ ...errMsg, flags: 1 << 6 });
            }
        } catch (_) { /* ignoruj jeśli nie można odpowiedzieć */ }
    }
}

// ── Text Leveling ────────────────────────────────────────────
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    messagesTodayCount++;

    // Rate limiting per user (3 seconds)
    const userCooldownKey = `msg_${message.author.id}`;
    if (cooldowns.has(userCooldownKey)) {
        const remaining = cooldowns.get(userCooldownKey) - Date.now();
        if (remaining > 0) return;
    }
    cooldowns.set(userCooldownKey, Date.now() + 3000);

    try {
        const roles   = message.member?.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name) || [];
        const profile = await getProfile(message.author.id, message.author.username, roles);
        if (!profile) return;

        const currentLevel = profile.level ?? 0;
        const newXp        = (profile.xp ?? 0) + MESSAGE_XP_REWARD;
        const newMoney     = (profile.money ?? 0) + MESSAGE_MONEY_REWARD;
        const newLevel     = getLevelFromXP(newXp);

        const { error: updateError } = await supabase.from('profiles').update({
            xp: newXp, money: newMoney, level: newLevel, updated_at: new Date().toISOString(),
        }).eq('id', profile.id);

        if (updateError) {
            console.error('[DB ERROR] Failed to update profile:', updateError.message);
            return;
        }

        if (newLevel > currentLevel) {
            await message.channel.send(
                `🎉 Gratulacje <@${message.author.id}>! Awans na poziom **${newLevel}**! 🏆`
            );
            if (message.member) {
                await syncLevelRole(message.member, newLevel);
            }
        }
    } catch (e) {
        console.error('[LEVELING] Text leveling error:', e.message);
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
            if (minutes > 0) syncVoiceRewards(userId, minutes, newState.member, newState.member?.user.username || 'Unknown');
        }
    }
});

async function syncVoiceRewards(userId, minutes, member, username) {
    try {
        const profile      = await getProfile(userId, username);
        const currentLevel = profile.level ?? 0;
        const newXp        = (profile.xp    || 0) + minutes * 3;
        const newMoney     = (profile.money || 0) + minutes * 2;
        const newLevel     = getLevelFromXP(newXp);

        await supabase.from('profiles').update({
            xp: newXp, money: newMoney, level: newLevel, updated_at: new Date().toISOString(),
        }).eq('id', profile.id);

        if (newLevel > currentLevel && member) {
            await syncLevelRole(member, newLevel);
        }
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
                    .addFields({ name: 'Twoje ID', value: member.id }),
            ]});
    }
});

client.login(process.env.DISCORD_TOKEN);