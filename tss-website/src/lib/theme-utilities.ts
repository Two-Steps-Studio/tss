import { useTheme } from 'next-themes';

/**
 * Gets the appropriate unselected/secondary button class based on theme.
 * @param isDark Whether the current theme is dark mode
 * @returns Tailwind class string
 */
export const getThemeUnselectedClass = (isDark: boolean) =>
  isDark ? 'bg-[var(--bg)]/50 border-[var(--border-color)]' : 'bg-[var(--bg)]/50 border-[var(--border-color)]';

/**
 * Gets the appropriate selected/primary button class.
 */
export const getThemeSelectedClass = () =>
  'bg-[var(--color-general)]/10 border-[var(--color-general)]';
