// ============================================================================
// TWO STEPS VALLEY - ROZWÓJ (INVENTORY SIZE)
// ============================================================================
// Plik ten definiuje rozmiar ekwipunku na każdym poziomie.
// Każdy level ma:
//   - level: poziom
//   - size: rozmiar ekwipunku
//   - xpNeeded: XP potrzebne do następnego rozszerzenia
// ============================================================================

module.exports = {
    // ── ROZWÓJ EKWIPUNKU (Inventory Growth) ─────────────────────────────────
    growth: {
        1:  { size: 10, xpNeeded: 10 },
        5:  { size: 20, xpNeeded: 50 },
        10: { size: 40, xpNeeded: 100 },
        15: { size: 60, xpNeeded: 150 },
        20: { size: 80, xpNeeded: 200 },
        25: { size: 100, xpNeeded: 250 },
        30: { size: 120, xpNeeded: 300 },
        35: { size: 140, xpNeeded: 350 },
        40: { size: 160, xpNeeded: 400 },
        45: { size: 180, xpNeeded: 450 },
        50: { size: 200, xpNeeded: 500 },
        55: { size: 220, xpNeeded: 550 },
        60: { size: 240, xpNeeded: 600 },
        65: { size: 260, xpNeeded: 650 },
        70: { size: 280, xpNeeded: 700 },
        75: { size: 300, xpNeeded: 750 },
        80: { size: 320, xpNeeded: 800 },
        85: { size: 340, xpNeeded: 850 },
        90: { size: 360, xpNeeded: 900 },
        95: { size: 380, xpNeeded: 950 },
        100: { size: 400, xpNeeded: 1000 },
    },

    // ── ROZMIAR EKWIPUNKU (Inventory Size by Level) ────────────────────────
    sizeByLevel: (level) => {
        const growth = Object.keys(this.growth).find(key => parseInt(key) >= level);
        return growth ? this.growth[growth].size : this.growth[1].size;
    },

    // ── ROZMIAR EKWIPUNKU (Get Size for Level) ─────────────────────────────
    getSize: (level) => {
        if (level <= 1) return 10;
        if (level >= 100) return 400;

        const tiers = [
            { level: 1, size: 10, xpNeeded: 10 },
            { level: 5, size: 20, xpNeeded: 50 },
            { level: 10, size: 40, xpNeeded: 100 },
            { level: 15, size: 60, xpNeeded: 150 },
            { level: 20, size: 80, xpNeeded: 200 },
            { level: 25, size: 100, xpNeeded: 250 },
            { level: 30, size: 120, xpNeeded: 300 },
            { level: 35, size: 140, xpNeeded: 350 },
            { level: 40, size: 160, xpNeeded: 400 },
            { level: 45, size: 180, xpNeeded: 450 },
            { level: 50, size: 200, xpNeeded: 500 },
            { level: 55, size: 220, xpNeeded: 550 },
            { level: 60, size: 240, xpNeeded: 600 },
            { level: 65, size: 260, xpNeeded: 650 },
            { level: 70, size: 280, xpNeeded: 700 },
            { level: 75, size: 300, xpNeeded: 750 },
            { level: 80, size: 320, xpNeeded: 800 },
            { level: 85, size: 340, xpNeeded: 850 },
            { level: 90, size: 360, xpNeeded: 900 },
            { level: 95, size: 380, xpNeeded: 950 },
            { level: 100, size: 400, xpNeeded: 1000 },
        ];

        return tiers.find(t => level >= t.level) || tiers[0].size;
    },

    // ── ROZMIAR EKWIPUNKU (Get XP Needed for Level Up) ─────────────────────
    getXpNeeded: (level) => {
        return this.getSize(level + 1) - this.getSize(level);
    },

    // ── ROZMIAR EKWIPUNKU (Is Current Level Reached) ───────────────────────
    isLevelReached: (currentLevel, targetLevel) => {
        return currentLevel >= targetLevel;
    },

    // ── ROZMIAR EKWIPUNKU (Get Max Size) ─────────────────────────────────
    getMaxSize: () => 400,
};
