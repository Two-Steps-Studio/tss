const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

// ── Definicja przedmiotów sklepu ─────────────────────────────
const SHOP_ITEMS = [
    {
        name: 'MVIP',
        label: '🥤 MVIP',
        price: 100,
        description: 'MVIP',
        roleId:1448017207501000908,
    },
    {
        name: 'SVIP',
        label: '🐄 ︱ SVIP',
        price: 1000,
        description: 'SVIP',
        type: 'role',
        roleId: 1448017195790635099,
    },
    {
        name: 'VIP',
        label: '🐨 ︱ VIP',
        price: 1000,
        description: 'VIP',
        type: 'role',
        roleId: 1448013683526467756,
    },
    {
        name: 'X3',
        label: '✖️ ︱X3',
        price: 2000,
        description: 'X3',
        type: 'role',
        roleId: 1362307473804886168,
    },
    {
        name: 'X2',
        label: '✖️ ︱X2',
        price: 2500,
        description: 'X2',
        type: 'role',
        roleId: 1362307366372114582,
    },

];

const ITEMS_PER_PAGE = 10;
const COIN = '<:Coin_TSS:1486049517072814270>';

// ── Budowanie embed sklepu ───────────────────────────────────
function buildShopEmbed(page, money) {
    const totalPages = Math.ceil(SHOP_ITEMS.length / ITEMS_PER_PAGE);
    const start = page * ITEMS_PER_PAGE;
    const pageItems = SHOP_ITEMS.slice(start, start + ITEMS_PER_PAGE);

    const embed = new EmbedBuilder()
        .setTitle('🛒 Sklep serwera')
        .setColor('#1bbdbd')
        .setDescription(
            `Masz **${money} ${COIN}** w swoim portfelu.\nKup przedmiot za pomocą komendy \`/sklep\`.\n\u200b`
        )
        .setFooter({ text: `Strona ${page + 1}/${totalPages}` });

    for (const item of pageItems) {
        embed.addFields({
            name: `${item.price.toLocaleString('pl-PL')}$ - ${item.label}`,
            value: item.description,
        });
    }

    return embed;
}

// ── Budowanie komponentów (przyciski + dropdown) ─────────────
function buildShopComponents(page, money) {
    const totalPages = Math.ceil(SHOP_ITEMS.length / ITEMS_PER_PAGE);
    const start = page * ITEMS_PER_PAGE;
    const pageItems = SHOP_ITEMS.slice(start, start + ITEMS_PER_PAGE);

    // Dropdown z przedmiotami aktualnej strony
    const select = new StringSelectMenuBuilder()
        .setCustomId(`shop_buy_${page}`)
        .setPlaceholder('Kup przedmiot')
        .addOptions(
            pageItems.map(item => ({
                label: `${item.label} — ${item.price.toLocaleString('pl-PL')}$`,
                value: item.name,
                description: item.description.slice(0, 100),
                emoji: money >= item.price ? '✅' : '❌',
            }))
        );

    // Przyciski paginacji
    const prevBtn = new ButtonBuilder()
        .setCustomId(`shop_page_${page - 1}`)
        .setLabel('◀ Poprzednia Strona')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0);

    const nextBtn = new ButtonBuilder()
        .setCustomId(`shop_page_${page + 1}`)
        .setLabel('▶ Następna Strona')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page >= totalPages - 1);

    return [
        new ActionRowBuilder().addComponents(prevBtn, nextBtn),
        new ActionRowBuilder().addComponents(select),
    ];
}

// ── Handler komendy /sklep ───────────────────────────────────
async function handleShop(interaction, supabase, profile, COIN_EMOJI) {
    await interaction.deferReply({ ephemeral: false });

    const money = profile?.money || 0;
    const embed = buildShopEmbed(0, money);
    const components = buildShopComponents(0, money);

    await interaction.editReply({ embeds: [embed], components });
}

// ── Handler interakcji sklepu (przyciski + dropdown) ─────────
async function handleShopInteraction(interaction, supabase) {
    const id = interaction.customId;

    // Paginacja
    if (id.startsWith('shop_page_')) {
        const page = parseInt(id.split('_')[2]);
        const userId = interaction.user.id;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .or(`id.eq."${userId}",discord_id.eq."${userId}"`)
            .maybeSingle();

        const money = profile?.money || 0;
        const embed = buildShopEmbed(page, money);
        const components = buildShopComponents(page, money);

        return interaction.update({ embeds: [embed], components });
    }

    // Zakup
    if (id.startsWith('shop_buy_')) {
        const itemName = interaction.values?.[0];
        if (!itemName) return;

        const item = SHOP_ITEMS.find(i => i.name === itemName);
        if (!item) return interaction.reply({ content: '❌ Nie znaleziono przedmiotu.', ephemeral: true });

        const userId = interaction.user.id;
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .or(`id.eq."${userId}",discord_id.eq."${userId}"`)
            .maybeSingle();

        if (!profile) return interaction.reply({ content: '❌ Nie masz profilu.', ephemeral: true });

        const money = profile.money || 0;
        if (money < item.price) {
            return interaction.reply({
                content: `❌ Nie masz wystarczająco monet! Potrzebujesz **${item.price.toLocaleString('pl-PL')} ${COIN}**, masz **${money} ${COIN}**.`,
                ephemeral: true,
            });
        }

        // Odejmij monety
        const newMoney = money - item.price;
        await supabase.from('profiles').update({ money: newMoney }).eq('id', profile.id);

        // Nadaj rolę jeśli to rola
        if (item.type === 'role' && item.roleId) {
            try {
                const member = await interaction.guild.members.fetch(userId);
                await member.roles.add(item.roleId);
            } catch (e) {
                console.error('[SHOP] Błąd nadawania roli:', e);
            }
        }

        return interaction.reply({
            content: `✅ Kupiłeś **${item.label}** za **${item.price.toLocaleString('pl-PL')} ${COIN}**! Pozostało: **${newMoney} ${COIN}**.`,
            ephemeral: true,
        });
    }
}

module.exports = { handleShop, handleShopInteraction, SHOP_ITEMS };
