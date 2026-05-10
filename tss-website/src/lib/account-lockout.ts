import redis from './redis';
import type { Redis } from 'ioredis';

export interface LockoutConfig {
  maxAttempts: number;
  lockoutDurationMinutes: number;
  cooldownDurationMinutes: number;
}

export interface LockoutRecord {
  attempts: number;
  lockedUntil: number; // timestamp
  lastAttemptAt: number;
}

/**
 * Default lockout configuration
 */
export const DEFAULT_LOCKOUT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  lockoutDurationMinutes: 15,
  cooldownDurationMinutes: 5,
};

/**
 * Check if account is locked out
 */
export const isLockedOut = async (userId: string): Promise<{ isLocked: boolean; unlockAt: number | null }> => {
  try {
    const key = `${LOCKOUT_PREFIX}${userId}`;
    const record = await redis.get(key) as string | null;

    if (!record) {
      return { isLocked: false, unlockAt: null };
    }

    const data = JSON.parse(record) as LockoutRecord;
    const now = Date.now();

    // If still locked
    if (now < data.lockedUntil) {
      const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
      return { isLocked: true, unlockAt: data.lockedUntil };
    }

    // Lockout expired - reset
    await redis.del(key);
    return { isLocked: false, unlockAt: null };
  } catch (error) {
    console.error('[AccountLockout] Check failed:', error);
    return { isLocked: false, unlockAt: null };
  }
};

/**
 * Record a failed login attempt
 */
export const recordFailedAttempt = async (
  userId: string,
  ip: string,
  config: LockoutConfig = DEFAULT_LOCKOUT_CONFIG
): Promise<{ locked: boolean; attemptCount: number }> => {
  try {
    const key = `${LOCKOUT_PREFIX}${userId}`;

    // Check if already locked
    const currentRecord = await redis.get(key) as string | null;

    if (currentRecord) {
      const data = JSON.parse(currentRecord) as LockoutRecord;
      const now = Date.now();

      // If already locked, increment attempts (up to max)
      if (now < data.lockedUntil) {
        const newAttempts = Math.min(data.attempts + 1, config.maxAttempts);
        await redis.setEx(key, Math.ceil((data.lockedUntil - now) / 1000) + config.cooldownDurationMinutes * 60, JSON.stringify({
          attempts: newAttempts,
          lockedUntil: data.lockedUntil,
          lastAttemptAt: now,
        }));

        return { locked: true, attemptCount: newAttempts };
      }
    }

    // Initialize or increment attempts
    const record: LockoutRecord = {
      attempts: 1,
      lockedUntil: 0,
      lastAttemptAt: Date.now(),
    };

    const expireSeconds = config.cooldownDurationMinutes * 60;

    if (config.maxAttempts === record.attempts) {
      record.lockedUntil = Date.now() + config.lockoutDurationMinutes * 60 * 1000;
    }

    await redis.setEx(key, expireSeconds, JSON.stringify(record));

    return { locked: config.maxAttempts === record.attempts, attemptCount: record.attempts };
  } catch (error) {
    console.error('[AccountLockout] Record failed:', error);
    return { locked: false, attemptCount: 0 };
  }
};

/**
 * Reset lockout (admin action)
 */
export const resetLockout = async (userId: string): Promise<void> => {
  try {
    await redis.del(`${LOCKOUT_PREFIX}${userId}`);
  } catch (error) {
    console.error('[AccountLockout] Reset failed:', error);
  }
};

/**
 * Get lockout status for display
 */
export const getLockoutStatus = async (userId: string, ip: string): Promise<{
  isLocked: boolean;
  attempts: number;
  resetTime: string;
  cooldownUntil: string;
}> => {
  const lockResult = await isLockedOut(userId);
  let lockStatus: { isLocked: boolean; attempts: number; resetTime: string } = {
    isLocked: false,
    attempts: 0,
    resetTime: '',
  };

  if (lockResult.isLocked) {
    const lockKey = `${LOCKOUT_PREFIX}${userId}`;
    const lockData = await redis.get(lockKey) as string | null;
    if (lockData) {
      const data = JSON.parse(lockData) as LockoutRecord;
      lockStatus = {
        isLocked: true,
        attempts: data.attempts,
        resetTime: new Date(data.lockedUntil).toLocaleTimeString(),
      };
    }
  }

  const cooldownUntil = lockResult.isLocked
    ? new Date(lockResult.unlockAt!).toLocaleTimeString()
    : '';

  return {
    ...lockStatus,
    cooldownUntil,
  };
};

export default {
  isLockedOut,
  recordFailedAttempt,
  resetLockout,
  getLockoutStatus,
  DEFAULT_LOCKOUT_CONFIG,
};
