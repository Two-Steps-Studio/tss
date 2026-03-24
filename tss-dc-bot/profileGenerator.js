const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

// Register Space Grotesk font
GlobalFonts.registerFromPath(path.join(__dirname, 'SpaceGrotesk-Bold.ttf'), 'Space Grotesk');
const fs = require('fs');

const ROLE_STYLES = {
    "〔 👑︱Owner 〕": { color: "#dc3545", label: "OWNER" },
    "〔 👑︱Owner Records 〕": { color: "#9b59b6", label: "OWNER RECORDS" },
    "〔 👑︱ Co-Owner Games 〕": { color: "#3cd5d3", label: "CO-OWNER GAMES" },
    "〔 🛡️︱Administrator 〕": { color: "#f6db6f", label: "ADMIN" },
    "〔 🌐︱Moderator 〕": { color: "#2da4f3", label: "MOD" },
    "〔 💜︱Server Booster 〕": { color: "#a61cb3", label: "BOOSTER" },

    // VIP
    "〔 🦣 ︱ MVIP〕": { color: "#ee1616", label: "MVIP" },
    "〔 🐄 ︱ SVIP〕": { color: "#cea009", label: "SVIP" },
    "〔 🐨 ︱ VIP〕": { color: "#a7b11a", label: "VIP" },

    // Records
    "〔 🎙️︱Wykonawca 〕": { color: "#c8a800", label: "EXEC" },
    "〔 💽︱Producent 〕": { color: "#e09000", label: "PROD" },

    // Marketing
    "〔 📢︱Główny Marketingowiec 〕": { color: "#e81313", label: "HEAD MKT" },
    "〔 📢︱Marketingowiec 〕": { color: "#e81313", label: "MKT" },

    // Programiści
    "〔 💻︱Główny Programista 〕": { color: "#00bcd4", label: "HEAD DEV" },
    "〔 💻︱Programista 〕": { color: "#2979ff", label: "DEV" },

    // Level Design
    "〔 🗺️︱Główny Projektantant Poziomów 〕": { color: "#43a047", label: "HEAD LD" },
    "〔 🗺️︱Projektantant Poziomów 〕": { color: "#43a047", label: "LD" },

    // Artyści 2D
    "〔 🎨︱Główny Artysta 2D 〕": { color: "#8d4e1a", label: "HEAD 2D" },
    "〔 🎨︱Artysta 2D 〕": { color: "#e07820", label: "2D" },

    // Artyści 3D
    "〔 🧱︱ Główny Artysta 3D 〕": { color: "#8d4e1a", label: "HEAD 3D" },
    "〔 🧱︱Artysta 3D 〕": { color: "#e07820", label: "3D" },

    // VFX
    "〔✨︱Główny Artysta Efektów 〕": { color: "#d4c400", label: "HEAD VFX" },
    "〔✨︱Artysta Efektów 〕": { color: "#d4c400", label: "VFX" },

    // Dźwiękowcy
    "〔 🎧︱Główny Dzwiękowiec 〕": { color: "#9e9e9e", label: "HEAD SFX" },
    "〔 🎧︱Dzwiękowiec 〕": { color: "#9e9e9e", label: "SFX" },

    // Animatorzy
    "〔 🕺︱Główny Animator  〕": { color: "#1565c0", label: "HEAD ANIM" },
    "〔 🕺︱ Animator  〕": { color: "#2979ff", label: "ANIM" },

    // Testerzy
    "〔 🎮︱ Główny Tester  〕": { color: "#9c27b0", label: "HEAD QA" },
    "〔 🎮︱Tester  〕": { color: "#ce93d8", label: "QA" },

    // E-Sport
    "〔 💀︱ Call Of Duty 〕": { color: "#607d8b", label: "COD" },

    // Levele
    "〔 📊︱Level 100 〕": { color: "#23d160", label: "LVL 100" },
    "〔 📊︱Level 90 〕":  { color: "#23d160", label: "LVL 90" },
    "〔 📊︱Level 80 〕":  { color: "#23d160", label: "LVL 80" },
    "〔 📊︱Level 70 〕":  { color: "#23d160", label: "LVL 70" },
    "〔 📊︱Level 60 〕":  { color: "#23d160", label: "LVL 60" },
    "〔 📊︱Level 50 〕":  { color: "#23d160", label: "LVL 50" },
    "〔 📊︱Level 40 〕":  { color: "#23d160", label: "LVL 40" },
    "〔 📊︱Level 30 〕":  { color: "#23d160", label: "LVL 30" },
    "〔 📊︱Level 20 〕":  { color: "#23d160", label: "LVL 20" },
    "〔 📊︱Level 10 〕":  { color: "#23d160", label: "LVL 10" },
    "〔 📊︱Level 5 〕":   { color: "#23d160", label: "LVL 5" },
    "〔 📊︱Level 4 〕":   { color: "#23d160", label: "LVL 4" },
    "〔 📊︱Level 3 〕":   { color: "#23d160", label: "LVL 3" },
    "〔 📊︱Level 2 〕":   { color: "#23d160", label: "LVL 2" },
    "〔 📊︱Level 1 〕":   { color: "#23d160", label: "LVL 1" },
};

const ROLE_ORDER = Object.keys(ROLE_STYLES);

/**
 * Creates a profile card image buffer.
 * @param {Object} userData
 * @param {string} userData.username
 * @param {number} userData.level
 * @param {string} [userData.avatarURL]
 */
async function createProfileCard(userData) {
    const canvas = createCanvas(1000, 500);
    const ctx = canvas.getContext('2d');

    // Załaduj monetę (coin)
    let coinImage = null;
    try {
        coinImage = await loadImage(path.join(__dirname, 'assets', 'discord', 'Coin_TSS.png'));
    } catch (e) {
        console.warn('[PROFILE] Nie znaleziono Coin_TSS.png w assets/', e.message);
    }

    // Helper do rysowania monety obok tekstu
    function drawCoin(x, y, size = 36) {
        if (coinImage) {
            ctx.drawImage(coinImage, x, y - size * 0.75, size, size);
        }
    }

    // 1. Background (Vibrant Green)
    ctx.fillStyle = '#22FF00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function drawRoundedRect(x, y, w, h, r, fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
    }

    // 2. Main Containers
    drawRoundedRect(250, 190, 720, 85, 20, '#0F5400');  // Roles box
    drawRoundedRect(20, 310, 960, 170, 25, '#0F5400');  // Bottom Section

    // 3. Avatar Section
    const avatarX = 135;
    const avatarY = 145;
    const avatarSize = 230;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, (avatarSize / 2) + 8, 0, Math.PI * 2);
    ctx.fill();

    if (userData.avatarURL) {
        try {
            const avatar = await loadImage(userData.avatarURL);
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
            ctx.restore();
        } catch (e) {
            ctx.fillStyle = '#9FEFFF';
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillStyle = '#9FEFFF';
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. Badges (Top right)
    const badgeRadius = 24;
    const startX = 720;
    const startY = 55;
    const gapX = 70;
    const gapY = 70;

    ctx.fillStyle = '#FFFFFF';
    for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
            ctx.beginPath();
            ctx.arc(startX + c * gapX, startY + r * gapY, badgeRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 5. Texts
    ctx.fillStyle = '#000000';

    // Nickname
    ctx.textAlign = 'left';
    ctx.font = 'bold 85px "Space Grotesk"';
    ctx.fillText(userData.username, 265, 170);

    // Roles Label
    ctx.font = 'bold 35px "Space Grotesk"';
    ctx.fillText('ROLES:', 265, 248);

    // Draw Role Badges
    if (userData.roles && userData.roles.length > 0) {
        const sortedRoles = userData.roles
            .filter(r => ROLE_STYLES[r])
            .sort((a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b));

        let currentX = 410;
        // Slice(0, 5) zapobiega wyjściu rang poza box
        sortedRoles.slice(0, 5).forEach(roleName => {
            const style = ROLE_STYLES[roleName];
            ctx.font = 'bold 22px "Space Grotesk"';
            const textWidth = ctx.measureText(style.label).width;
            const badgeWidth = textWidth + 30;

            drawRoundedRect(currentX, 215, badgeWidth, 40, 15, style.color);
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(style.label, currentX + badgeWidth / 2, 243);

            currentX += badgeWidth + 10;
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'left';
        });
    }

    // LEVEL Section
    ctx.textAlign = 'left';
    ctx.font = 'bold 35px "Space Grotesk"';
    ctx.fillStyle = '#03b8ffff';
    ctx.fillText(`LEVEL ${userData.level}`, 35, 385);

    // XP Text
    ctx.textAlign = 'right';
    ctx.font = 'bold 25px "Space Grotesk"';
    ctx.fillStyle = '#000000';
    ctx.fillText(`${userData.xp} XP`, 485, 385);

    // Progress Bar Background
    drawRoundedRect(35, 415, 450, 45, 22, '#0F3400');

    // Calculate Progress
    const currentLevelStartXP = Math.pow(userData.level / 0.1, 2);
    const nextLevelStartXP = Math.pow((userData.level + 1) / 0.1, 2);
    const neededXP = nextLevelStartXP - currentLevelStartXP;
    const currentProgressXP = userData.xp - currentLevelStartXP;
    const progressPercent = Math.min(Math.max(currentProgressXP / neededXP, 0), 1);

    if (progressPercent > 0) {
        const barWidth = Math.max(8, 450 * progressPercent);
        const dynamicRadius = Math.min(22, barWidth / 2);

        drawRoundedRect(35, 415, barWidth, 45, dynamicRadius, '#22FF00');
    }

// ── MONEY Section ────────────────────────────────────────
    const coinSize = 38;
    const moneyX  = 580;

// Nagłówek MONEY
    ctx.textAlign = 'right';
    ctx.font = 'bold 70px "Space Grotesk"';
    ctx.fillStyle = '#000000';
    ctx.fillText('MONEY', 940, 385);

// BANK: wartość [coin]
    ctx.textAlign = 'left';
    ctx.font = 'bold 35px "Space Grotesk"';
    ctx.fillStyle = '#000000';

    ctx.fillText('BANK:', moneyX, 435);
    const bankValue = userData.bank || 0;
    const bankText  = `${bankValue}`;
    const bankLabelWidth = ctx.measureText('BANK: ').width;
    ctx.fillText(bankText, moneyX + bankLabelWidth, 435);
    const bankTextWidth = ctx.measureText(bankText).width;
    drawCoin(moneyX + bankLabelWidth + bankTextWidth + 5, 435, coinSize);


// WALET: wartość [coin]
    ctx.fillText('WALET:', moneyX, 472);

    const waletValue = userData.money || 0;
    const waletText  = `${waletValue}`;
    const waletLabelWidth = ctx.measureText('WALET: ').width;
    ctx.fillText(waletText, moneyX + waletLabelWidth, 472);
    const waletTextWidth = ctx.measureText(waletText).width;
    drawCoin(moneyX + waletLabelWidth + waletTextWidth + 5, 472, coinSize);

    return canvas.toBuffer('image/png');
}

module.exports = { createProfileCard };
if (require.main === module) {
    const test = async () => {
        const buffer = await createProfileCard({ username: 'Nick', level: 5, xp: 2500, money: 150, bank: 500 });
        fs.writeFileSync('profile_test.png', buffer);
    };
    test();
}