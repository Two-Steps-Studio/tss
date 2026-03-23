const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

// Register Space Grotesk font
GlobalFonts.registerFromPath(path.join(__dirname, 'SpaceGrotesk-Bold.ttf'), 'Space Grotesk');
const fs = require('fs');

const ROLE_STYLES = {
    "Admin": { color: "#ff4d4d", label: "ADM" },
    "Właściciel": { color: "#ffd700", label: "OWNER" },
    "Moderator": { color: "#4d94ff", label: "MOD" },
    "Developer": { color: "#ffcb2f", label: "DEV" },
    // Dodaj tutaj kolejne role: "Nazwa z Discorda": { color: "kolor", label: "skrót" }
};

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
    // Roles box (Dark green)
    drawRoundedRect(250, 190, 720, 85, 20, '#0F5400');

    // Bottom Section
    drawRoundedRect(20, 310, 960, 170, 25, '#0F5400');

    // 3. Avatar Section
    const avatarX = 135;
    const avatarY = 145;
    const avatarSize = 230;

    // Outer white glow/border
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, (avatarSize / 2) + 8, 0, Math.PI * 2);
    ctx.fill();

    // Actual Avatar
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
            console.error("Failed to load avatar, using placeholder", e);
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
    ctx.fillText(userData.username, 265, 170); // Removed .toUpperCase()

    // Roles Label
    ctx.font = 'bold 35px "Space Grotesk"';
    ctx.fillText('ROLES:', 265, 248);

    // Draw Role Badges
    if (userData.roles && userData.roles.length > 0) {
        let currentX = 410;
        userData.roles.forEach(roleName => {
            const style = ROLE_STYLES[roleName];
            if (style) {
                const label = style.label;
                ctx.font = 'bold 22px "Space Grotesk"';
                const textWidth = ctx.measureText(label).width;
                const badgeWidth = textWidth + 30;
                
                drawRoundedRect(currentX, 215, badgeWidth, 40, 15, style.color);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'center';
                ctx.fillText(label, currentX + badgeWidth / 2, 243);
                
                currentX += badgeWidth + 10;
                ctx.fillStyle = '#000000'; // Reset for next loop or text
                ctx.textAlign = 'left';
            }
        });
    }

    // LEVEL Section (Progress Bar)
    ctx.textAlign = 'left';
    ctx.font = 'bold 35px "Space Grotesk"';
    ctx.fillStyle = '#03b8ffff';
    ctx.fillText(`LEVEL ${userData.level}`, 35, 385);

    // XP Text (mini)
    ctx.textAlign = 'right';
    ctx.font = '25px "Space Grotesk"';
    ctx.fillText(`${userData.xp} XP`, 485, 385);

    // Progress Bar Background
    drawRoundedRect(35, 415, 450, 45, 22, '#0F3400'); // Darker track

    // Calculate Progress (%)
    // Formula: level = 0.1 * sqrt(xp) => xp = (level/0.1)^2
    const currentLevelStartXP = Math.pow(userData.level / 0.1, 2);
    const nextLevelStartXP = Math.pow((userData.level + 1) / 0.1, 2);
    const neededXP = nextLevelStartXP - currentLevelStartXP;
    const currentProgressXP = userData.xp - currentLevelStartXP;
    const progressPercent = Math.min(Math.max(currentProgressXP / neededXP, 0), 1);

    // Progress Bar Fill (Neon Green)
    if (progressPercent > 0) {
        drawRoundedRect(35, 415, 450 * progressPercent, 45, 22, '#22FF00');
    }

    // MONEY Section
    ctx.textAlign = 'right';
    ctx.font = 'bold 70px "Space Grotesk"';
    ctx.fillStyle = '#000000';
    ctx.fillText('MONEY', 940, 385);

    ctx.textAlign = 'left';
    ctx.font = 'bold 35px "Space Grotesk"';
    ctx.fillText('BANK:', 580, 435);
    ctx.fillText(`WALET: ${userData.money || 0}`, 580, 472);

    return canvas.toBuffer('image/png');
}

module.exports = { createProfileCard };
if (require.main === module) {
    const test = async () => {
        const buffer = await createProfileCard({ username: 'Nick', level: 0 });
        fs.writeFileSync('profile_test.png', buffer);
    };
    test();
}
