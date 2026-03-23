export const XP_PER_LEVEL = 1000;

export function calculateLevel(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function calculateProgress(xp: number) {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
}

export function xpForNextLevel(currentLevel: number) {
  return currentLevel * XP_PER_LEVEL;
}

export function getRankName(level: number) {
  if (level >= 50) return "Legend";
  if (level >= 40) return "Grandmaster";
  if (level >= 30) return "Master";
  if (level >= 20) return "Veteran";
  if (level >= 10) return "Advanced";
  return "Novice";
}
