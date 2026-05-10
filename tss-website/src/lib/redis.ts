import Redis from 'ioredis';

/**
 * Redis Client for persistent rate limiting and security features
 * @deprecated Use @supabase/redis-granite-client in production
 */
export const redis = new Redis(process.env.REDIS_URL || process.env.SUPABASE_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryDelayOnFailover: 100,
  retryDelayOnMaxRetryReached: 1000,
  repeatFlushDbMaxTotalRetryTime: 5000,
});

// Ensure connection
redis.connect().catch(console.error);

/**
 * Rate limit key prefix
 */
export const RATE_LIMIT_PREFIX = 'ratelimit:';

/**
 * Lockout key prefix
 */
export const LOCKOUT_PREFIX = 'lockout:';

/**
 * Session key prefix
 */
export const SESSION_PREFIX = 'session:';

/**
 * MFA key prefix
 */
export const MFA_PREFIX = 'mfa:';

/**
 * Email verification key prefix
 */
export const EMAIL_VERIFY_PREFIX = 'email-verify:';

/**
 * CAPTCHA key prefix
 */
export const CAPTCHA_PREFIX = 'captcha:';

/**
 * Brute force protection key prefix
 */
export const BRUTE_FORCE_PREFIX = 'brute-force:';

/**
 * Health check for Redis connection
 */
export const redisHealth = async (): Promise<{ connected: boolean; error?: string }> => {
  try {
    await redis.ping();
    return { connected: true };
  } catch (error) {
    console.error('[Redis] Connection failed:', error);
    return { connected: false, error: (error as Error).message };
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  try {
    await redis.disconnect();
  } catch (error) {
    console.error('[Redis] Close error:', error);
  }
};

export default redis;
