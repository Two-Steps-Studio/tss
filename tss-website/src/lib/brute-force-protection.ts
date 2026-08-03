import redis from './redis';
import type { Redis } from 'ioredis';

/**
 * Brute force protection configuration
 */
export interface BruteForceConfig {
  maxAttempts: number;
  lockoutDurationMinutes: number;
  windowMinutes: number;
  cooldownMinutes: number;
  thresholdForLockout: number; // attempts in window to trigger lockout
}

export const DEFAULT_BRUTE_FORCE_CONFIG: BruteForceConfig = {
  maxAttempts: 10,
  lockoutDurationMinutes: 30,
  windowMinutes: 10,
  cooldownMinutes: 5,
  thresholdForLockout: 5,
};

/**
 * Check if IP is under brute force attack
 */
export const isUnderAttack = async (ip: string, config: BruteForceConfig = DEFAULT_BRUTE_FORCE_CONFIG): Promise<{
  isUnderAttack: boolean;
  attempts: number;
}> => {
  try {
    const key = `${BRUTE_FORCE_PREFIX}window:${ip}`;
    const windowSeconds = config.windowMinutes * 60;

    // Clean old entries
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Get recent attempts in the window
    const allKeys = await redis.keys(`${BRUTE_FORCE_PREFIX}attempt:${ip}:*`);
    const recentAttempts: number[] = [];

    for (const k of allKeys) {
      const createdAt = parseInt(k.split(':')[5]) as number;
      if (createdAt > windowStart) {
        recentAttempts.push(createdAt);
      }
    }

    const attempts = recentAttempts.length;
    const isUnderAttack = attempts >= config.thresholdForLockout;

    return { isUnderAttack, attempts };
  } catch (error) {
    console.error('[BruteForce] Check failed:', error);
    return { isUnderAttack: false, attempts: 0 };
  }
};

/**
 * Record an authentication attempt
 */
export const recordAttempt = async (
  ip: string,
  userId: string | null,
  config: BruteForceConfig = DEFAULT_BRUTE_FORCE_CONFIG
): Promise<{ success: boolean }> => {
  try {
    const key = `${BRUTE_FORCE_PREFIX}attempt:${ip}:${Date.now()}`;
    await redis.setEx(key, config.windowMinutes * 60, Date.now().toString());

    return { success: true };
  } catch (error) {
    console.error('[BruteForce] Record failed:', error);
    return { success: false };
  }
};

/**
 * Apply brute force protection
 */
export const applyBruteForceProtection = async (
  ip: string,
  userId: string | null,
  config: BruteForceConfig = DEFAULT_BRUTE_FORCE_CONFIG
): Promise<{
  allowed: boolean;
  error?: string;
  retryAfter?: number;
  attempts?: number;
}> => {
  try {
    // Record the attempt
    await recordAttempt(ip, userId, config);

    // Check for attack
    const attackCheck = await isUnderAttack(ip, config);

    if (attackCheck.isUnderAttack) {
      // Check if user is locked out
      const lockResult = await isLockedOut(userId, config);

      if (lockResult.isLocked) {
        const retryAfter = Math.ceil((lockResult.unlockAt - Date.now()) / 1000);
        return {
          allowed: false,
          error: 'Account locked due to suspicious activity',
          retryAfter,
          attempts: lockResult.attempts,
        };
      }

      // IP threshold exceeded
      return {
        allowed: false,
        error: 'Too many failed attempts from this IP',
        retryAfter: config.lockoutDurationMinutes * 60,
        attempts: attackCheck.attempts,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('[BruteForce] Apply failed:', error);
    return { allowed: false, error: (error as Error).message };
  }
};

/**
 * Get lockout status for user
 */
export const isLockedOut = async (
  userId: string,
  config: BruteForceConfig = DEFAULT_BRUTE_FORCE_CONFIG
): Promise<{
  isLocked: boolean;
  unlockAt: number | null;
  attempts: number;
}> => {
  try {
    const key = `${BRUTE_FORCE_PREFIX}lock:${userId}`;
    const data = await redis.get(key) as string | null;

    if (!data) {
      return { isLocked: false, unlockAt: null, attempts: 0 };
    }

    const { attempts: attemptsCount, lockedUntil, lastAttemptAt } =
      JSON.parse(data) as {
        attempts: number;
        lockedUntil: number;
        lastAttemptAt: number;
      };

    const now = Date.now();

    if (now < lockedUntil) {
      const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
      return {
        isLocked: true,
        unlockAt: lockedUntil,
        attempts: attemptsCount,
      };
    }

    // Lockout expired
    await redis.del(key);
    return { isLocked: false, unlockAt: null, attempts: 0 };
  } catch (error) {
    console.error('[BruteForce] Get lockout status failed:', error);
    return { isLocked: false, unlockAt: null, attempts: 0 };
  }
};

/**
 * Reset user lockout (admin action)
 */
export const resetUserLockout = async (userId: string): Promise<void> => {
  try {
    await redis.del(`${BRUTE_FORCE_PREFIX}lock:${userId}`);
  } catch (error) {
    console.error('[BruteForce] Reset user lockout failed:', error);
  }
};

/**
 * Reset IP lockout (admin action)
 */
export const resetIPLockout = async (ip: string): Promise<void> => {
  try {
    // Remove all attempt keys for this IP
    const allKeys = await redis.keys(`${BRUTE_FORCE_PREFIX}attempt:${ip}:*`);
    for (const key of allKeys) {
      await redis.del(key);
    }

    await redis.del(`${BRUTE_FORCE_PREFIX}window:${ip}`);
    await redis.del(`${BRUTE_FORCE_PREFIX}lock:${ip}`);
  } catch (error) {
    console.error('[BruteForce] Reset IP lockout failed:', error);
  }
};

/**
 * Get brute force statistics
 */
export const getBruteForceStats = async (
  ip: string,
  userId: string | null,
  config: BruteForceConfig = DEFAULT_BRUTE_FORCE_CONFIG
): Promise<{
  attempts: number;
  isUnderAttack: boolean;
  lockoutUntil: string;
}> => {
  try {
    const windowSeconds = config.windowMinutes * 60;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Count attempts in window
    const allKeys = await redis.keys(`${BRUTE_FORCE_PREFIX}attempt:${ip}:*`);
    const recentAttempts = allKeys.filter((k) => {
      const createdAt = parseInt(k.split(':')[5]) as number;
      return createdAt > windowStart;
    }).length;

    const lockoutUntil = await redis.get(`${BRUTE_FORCE_PREFIX}lock:${userId}`)
      ? new Date(JSON.parse(await redis.get(`${BRUTE_FORCE_PREFIX}lock:${userId}`)!)!.lockedUntil).toLocaleTimeString()
      : '';

    return {
      attempts: recentAttempts,
      isUnderAttack: recentAttempts >= config.thresholdForLockout,
      lockoutUntil,
    };
  } catch (error) {
    console.error('[BruteForce] Get stats failed:', error);
    return { attempts: 0, isUnderAttack: false, lockoutUntil: '' };
  }
};

/**
 * Cleanup old brute force records
 */
export const cleanupOldRecords = async (): Promise<void> => {
  try {
    const now = Date.now();
    const windowMinutes = DEFAULT_BRUTE_FORCE_CONFIG.windowMinutes;
    const cutoff = now - windowMinutes * 60 * 1000;

    // Clean attempt records
    const allAttempts = await redis.keys(`${BRUTE_FORCE_PREFIX}attempt:*`);
    for (const key of allAttempts) {
      const createdAt = parseInt(key.split(':')[5]) as number;
      if (createdAt < cutoff) {
        await redis.del(key);
      }
    }

    // Clean window records
    const allWindows = await redis.keys(`${BRUTE_FORCE_PREFIX}window:*`);
    for (const key of allWindows) {
      const windowStart = parseInt(key.split(':')[4]) as number;
      if (windowStart < cutoff) {
        await redis.del(key);
      }
    }
  } catch (error) {
    console.error('[BruteForce] Cleanup failed:', error);
  }
};

/**
 * Cleanup interval (run every hour)
 */
export const scheduleCleanup = (): NodeJS.Timeout | null => {
  try {
    const interval = setInterval(cleanupOldRecords, 60 * 60 * 1000);
    // Clear after 24 hours
    setTimeout(() => {
      clearInterval(interval);
    }, 24 * 60 * 60 * 1000);
    return interval;
  } catch (error) {
    console.error('[BruteForce] Schedule cleanup failed:', error);
    return null;
  }
};

const bruteForceProtection = {
  isUnderAttack,
  recordAttempt,
  applyBruteForceProtection,
  isLockedOut,
  resetUserLockout,
  resetIPLockout,
  getBruteForceStats,
  cleanupOldRecords,
  scheduleCleanup,
};

export default bruteForceProtection;
