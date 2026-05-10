import { createHash } from 'crypto';
import type { AuthError } from '@supabase/supabase-js';
import { redis, EMAIL_VERIFY_PREFIX, MFA_PREFIX } from './redis';

/**
 * TOTP implementation for MFA
 */
interface TOTPConfig {
  algorithm: string;
  digits: number;
  period: number;
  issuer: string;
}

const DEFAULT_TOTP_CONFIG: TOTPConfig = {
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  issuer: 'TSS',
};

/**
 * Generate a TOTP secret key (Base32 encoded)
 */
export const generateTOTPSecret = (): string => {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
};

/**
 * Verify a TOTP code
 */
export const verifyTOTPCode = async (
  userId: string,
  code: string,
  config: TOTPConfig = DEFAULT_TOTP_CONFIG
): Promise<{ isValid: boolean; backupCodesRemaining: number }> => {
  try {
    const secret = await redis.get(`${MFA_PREFIX}secret:${userId}`) as string | null;
    if (!secret) {
      return { isValid: false, backupCodesRemaining: 0 };
    }

    const expectedCode = generateTOTPCode(secret, config);
    // Also check previous/next window for drift tolerance
    const codes = [
      generateTOTPCode(secret, { ...config, period: config.period - 1 }),
      generateTOTPCode(secret, config),
      generateTOTPCode(secret, { ...config, period: config.period + 1 }),
    ];

    if (codes.includes(code)) {
      // Use up a backup code slot (conservative approach)
      await incrementBackupUsage(userId);
      return { isValid: true, backupCodesRemaining: 8 - (await getBackupUsage(userId)) };
    }

    return { isValid: false, backupCodesRemaining: 8 };
  } catch (error) {
    console.error('[MFA] Verify TOTP failed:', error);
    return { isValid: false, backupCodesRemaining: 8 };
  }
};

/**
 * Generate a TOTP code for testing
 */
const generateTOTPCode = (secret: string, config: TOTPConfig): string => {
  const timestamp = Math.floor(Date.now() / 1000 / config.period);
  const hmac = hotp(secret, (timestamp - 59) * config.period).slice(0, config.digits);
  return hmac.padStart(config.digits, '0');
};

/**
 * Generate HOTP code using RFC 4226
 */
const hotp = (secret: string, counter: number): string => {
  const key = Buffer.from(secret, 'base32');
  const hmac = crypto.createHmac('SHA1', key);
  hmac.update(Buffer.from(counter.toString('binary')));
  const hash = hmac.digest('hex');
  const bytes = Buffer.from(hash, 'hex');
  const offset = bytes.length - 1;
  const offsetByte = (bytes[offset] & 15) + (offset & 15) * 256;
  const slicedBytes = bytes.slice(0, offsetByte);
  const code = slicedBytes.readUInt32LE(0) & 0x7fffffff;
  return (code % 1000000).toString().padStart(6, '0');
};

/**
 * Initialize MFA for user (generate secret and backup codes)
 */
export const initializeMFA = async (userId: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> => {
  try {
    const secret = generateTOTPSecret();
    const backupCodes = Array.from({ length: 8 }, () => generateBackupCode());

    await redis.setEx(
      `${MFA_PREFIX}secret:${userId}`,
      2592000, // 30 days
      secret
    );

    await redis.setEx(
      `${MFA_PREFIX}backup:${userId}`,
      2592000,
      JSON.stringify({
        codes: backupCodes,
        usedCount: 0,
      })
    );

    // Generate QR code data for Google Authenticator
    const qrData = `otpauth://totp/${DEFAULT_TOTP_CONFIG.issuer}:${userId}?secret=${secret}&issuer=${encodeURIComponent(
      DEFAULT_TOTP_CONFIG.issuer
    )}&algorithm=${DEFAULT_TOTP_CONFIG.algorithm}&digits=${DEFAULT_TOTP_CONFIG.digits}&period=${DEFAULT_TOTP_CONFIG.period}`;

    return {
      secret,
      qrCodeUrl: generateQRCodeImage(qrData),
      backupCodes,
    };
  } catch (error) {
    console.error('[MFA] Initialize failed:', error);
    throw error;
  }
};

/**
 * Configure MFA (add backup codes)
 */
export const configureMFA = async (userId: string): Promise<{
  qrCodeUrl: string;
  backupCodes: string[];
}> => {
  const secret = await redis.get(`${MFA_PREFIX}secret:${userId}`) as string | null;
  if (!secret) {
    throw new Error('MFA not configured');
  }

  return initializeMFA(userId);
};

/**
 * Generate backup code
 */
const generateBackupCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate backup code
 */
export const validateBackupCode = async (userId: string, code: string): Promise<{
  isValid: boolean;
  backupCodesRemaining: number;
}> => {
  try {
    const backupData = await redis.get(`${MFA_PREFIX}backup:${userId}`) as string | null;
    if (!backupData) {
      return { isValid: false, backupCodesRemaining: 0 };
    }

    const { codes, usedCount } = JSON.parse(backupData);
    const unusedCodes = codes.filter((c: string) => c !== code);

    if (unusedCodes.includes(code)) {
      const newUsedCount = unusedCodes.length;
      await redis.setEx(
        `${MFA_PREFIX}backup:${userId}`,
        2592000,
        JSON.stringify({ codes: unusedCodes, usedCount: newUsedCount })
      );

      await incrementBackupUsage(userId);
      return { isValid: true, backupCodesRemaining: unusedCodes.length };
    }

    return { isValid: false, backupCodesRemaining: codes.length - usedCount };
  } catch (error) {
    console.error('[MFA] Validate backup code failed:', error);
    return { isValid: false, backupCodesRemaining: 0 };
  }
};

/**
 * Generate QR code image URL (placeholder - use a service like qrserver)
 */
const generateQRCodeImage = (otpAuthUrl: string): string => {
  // In production, use a QR code library or service
  // For now, return the OTP Auth URL which can be scanned directly
  return otpAuthUrl;
};

/**
 * Email verification service
 */
interface EmailVerificationConfig {
  tokenLength: number;
  expirationMinutes: number;
  maxAttempts: number;
  cooldownSeconds: number;
}

const DEFAULT_EMAIL_CONFIG: EmailVerificationConfig = {
  tokenLength: 6,
  expirationMinutes: 10,
  maxAttempts: 3,
  cooldownSeconds: 30,
};

/**
 * Generate verification token
 */
export const generateVerificationToken = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create email verification request
 */
export const createEmailVerification = async (
  email: string,
  config: EmailVerificationConfig = DEFAULT_EMAIL_CONFIG
): Promise<{ token: string; key: string }> => {
  const token = generateVerificationToken();
  const key = `${EMAIL_VERIFY_PREFIX}${email}`;

  const now = Date.now();
  const expiration = now + config.expirationMinutes * 60 * 1000;

  await redis.setEx(
    key,
    config.expirationMinutes * 60,
    JSON.stringify({
      token,
      attempts: 0,
      expiresAt: expiration,
    })
  );

  // Store for email template
  await redis.setEx(
    `${key}:token`,
    config.expirationMinutes * 60,
    token
  );

  return { token, key };
};

/**
 * Verify email code
 */
export const verifyEmailCode = async (
  email: string,
  code: string,
  config: EmailVerificationConfig = DEFAULT_EMAIL_CONFIG
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const key = `${EMAIL_VERIFY_PREFIX}${email}`;
    const data = await redis.get(key) as string | null;

    if (!data) {
      return { isValid: false, error: 'Verification code not found' };
    }

    const { token, attempts, expiresAt } = JSON.parse(data);
    const now = Date.now();

    // Check expiration
    if (now > expiresAt) {
      await redis.del(key);
      return { isValid: false, error: 'Verification code expired' };
    }

    // Check attempts
    if (attempts >= config.maxAttempts) {
      await redis.del(key);
      return { isValid: false, error: 'Too many failed attempts. Please request a new code.' };
    }

    if (token !== code) {
      const newAttempts = attempts + 1;
      await redis.setEx(
        key,
        config.expirationMinutes * 60 - Math.ceil((now - expiresAt) / 1000) * 60,
        JSON.stringify({
          token,
          attempts: newAttempts,
          expiresAt,
        })
      );

      if (newAttempts >= config.maxAttempts) {
        await redis.del(key);
      }

      return {
        isValid: false,
        error: `Incorrect code. You have ${config.maxAttempts - newAttempts} attempt(s) remaining.`,
      };
    }

    // Success - cleanup
    await redis.del(key);
    await redis.del(`${key}:token`);

    return { isValid: true };
  } catch (error) {
    console.error('[MFA] Verify email code failed:', error);
    return { isValid: false, error: (error as Error).message };
  }
};

/**
 * Get remaining attempts for email verification
 */
export const getEmailVerificationStatus = async (
  email: string,
  config: EmailVerificationConfig = DEFAULT_EMAIL_CONFIG
): Promise<{ attempts: number; expiresAt: number; isValid: boolean }> => {
  try {
    const key = `${EMAIL_VERIFY_PREFIX}${email}`;
    const data = await redis.get(key) as string | null;

    if (!data) {
      return { attempts: 0, expiresAt: 0, isValid: false };
    }

    const { attempts, expiresAt } = JSON.parse(data);
    return {
      attempts,
      expiresAt,
      isValid: attempts < config.maxAttempts,
    };
  } catch (error) {
    console.error('[MFA] Get email verification status failed:', error);
    return { attempts: 0, expiresAt: 0, isValid: false };
  }
};

/**
 * Increment backup usage
 */
const incrementBackupUsage = async (userId: string): Promise<void> => {
  try {
    const backupKey = `${MFA_PREFIX}backup:${userId}`;
    const backupData = await redis.get(backupKey) as string | null;

    if (backupData) {
      const { codes, usedCount } = JSON.parse(backupData);
      await redis.setEx(
        backupKey,
        2592000,
        JSON.stringify({ codes, usedCount: usedCount + 1 })
      );
    }
  } catch (error) {
    console.error('[MFA] Increment backup usage failed:', error);
  }
};

/**
 * Get backup usage
 */
const getBackupUsage = async (userId: string): Promise<number> => {
  try {
    const backupKey = `${MFA_PREFIX}backup:${userId}`;
    const backupData = await redis.get(backupKey) as string | null;

    if (backupData) {
      const { usedCount } = JSON.parse(backupData);
      return usedCount;
    }
  } catch (error) {
    console.error('[MFA] Get backup usage failed:', error);
  }

  return 0;
};

/**
 * Encode bytes to Base32
 */
const base32Encode = (bytes: Uint8Array): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let i = 0;

  while (i < bytes.length) {
    const byte1 = bytes[i];
    const byte2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const byte3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const quad1 = (byte1 >> 2) & 0x3f;
    const quad2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
    const quad3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
    const quad4 = byte3 & 0x3f;

    result += alphabet[quad1] + alphabet[quad2] + alphabet[quad3] + alphabet[quad4];
    i += 3;
  }

  return result.toUpperCase();
};

export default {
  generateTOTPSecret,
  verifyTOTPCode,
  initializeMFA,
  configureMFA,
  validateBackupCode,
  generateVerificationToken,
  createEmailVerification,
  verifyEmailCode,
  getEmailVerificationStatus,
};
