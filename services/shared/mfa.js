/**
 * @file mfa.js
 * @description Multi-Factor Authentication (MFA) Implementation
 * 
 * Supports:
 * - TOTP (Time-based One-Time Password) - Google Authenticator, Authy
 * - SMS-based OTP
 * - Email-based OTP
 * 
 * Compliance: Enhances security for GDPR, PCI DSS requirements
 */

const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Generate MFA secret for TOTP
 * @param {string} userEmail - User's email
 * @param {string} issuer - Service name (e.g., 'CloudRetail')
 * @returns {object} Secret and QR code data
 */
async function generateTOTPSecret(userEmail, issuer = 'CloudRetail') {
  const secret = speakeasy.generateSecret({
    name: `${issuer} (${userEmail})`,
    issuer: issuer,
    length: 32
  });

  // Generate QR code for easy setup
  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode: qrCodeDataUrl,
    manualEntryKey: secret.base32
  };
}

/**
 * Verify TOTP code
 * @param {string} token - 6-digit code from authenticator app
 * @param {string} secret - User's TOTP secret
 * @returns {boolean} Whether code is valid
 */
function verifyTOTP(token, secret) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps (60 seconds) for clock drift
  });
}

/**
 * Generate SMS/Email OTP (6-digit code)
 * @param {number} length - Code length (default: 6)
 * @returns {string} OTP code
 */
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

/**
 * Generate and store OTP with expiration
 * @param {object} pool - Database pool
 * @param {number} userId - User ID
 * @param {string} channel - Delivery channel ('sms' or 'email')
 * @returns {Promise<string>} Generated OTP
 */
async function generateAndStoreOTP(pool, userId, channel = 'email') {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Store OTP in database
    await pool.query(
      `INSERT INTO mfa_codes (user_id, code, channel, expires_at, attempts, created_at)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [userId, otp, channel, expiresAt]
    );

    console.log(`[MFA] Generated ${channel} OTP for user ${userId}`);
    return otp;
  } catch (error) {
    console.error('[MFA] Error storing OTP:', error.message);
    throw new Error('Failed to generate OTP');
  }
}

/**
 * Verify OTP code
 * @param {object} pool - Database pool
 * @param {number} userId - User ID
 * @param {string} code - OTP code to verify
 * @param {string} channel - Delivery channel
 * @returns {Promise<boolean>} Whether code is valid
 */
async function verifyOTP(pool, userId, code, channel = 'email') {
  try {
    // Get the most recent OTP for this user/channel
    const [rows] = await pool.query(
      `SELECT id, code, expires_at, attempts 
       FROM mfa_codes 
       WHERE user_id = ? AND channel = ? AND verified = 0
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId, channel]
    );

    if (rows.length === 0) {
      console.log('[MFA] No pending OTP found');
      return false;
    }

    const otpRecord = rows[0];

    // Check expiration
    if (new Date() > new Date(otpRecord.expires_at)) {
      console.log('[MFA] OTP expired');
      await pool.query('UPDATE mfa_codes SET verified = -1 WHERE id = ?', [otpRecord.id]);
      return false;
    }

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      console.log('[MFA] Too many attempts');
      await pool.query('UPDATE mfa_codes SET verified = -1 WHERE id = ?', [otpRecord.id]);
      return false;
    }

    // Increment attempts
    await pool.query(
      'UPDATE mfa_codes SET attempts = attempts + 1 WHERE id = ?',
      [otpRecord.id]
    );

    // Verify code
    if (otpRecord.code === code) {
      console.log('[MFA] OTP verified successfully');
      await pool.query(
        'UPDATE mfa_codes SET verified = 1, verified_at = NOW() WHERE id = ?',
        [otpRecord.id]
      );
      return true;
    }

    console.log('[MFA] Invalid OTP code');
    return false;
  } catch (error) {
    console.error('[MFA] Error verifying OTP:', error.message);
    return false;
  }
}

/**
 * Enable TOTP for user
 * @param {object} pool - Database pool
 * @param {number} userId - User ID
 * @param {string} secret - TOTP secret
 */
async function enableTOTP(pool, userId, secret) {
  try {
    await pool.query(
      `INSERT INTO user_mfa (user_id, mfa_type, mfa_secret, enabled, created_at)
       VALUES (?, 'totp', ?, 1, NOW())
       ON DUPLICATE KEY UPDATE 
         mfa_secret = VALUES(mfa_secret),
         enabled = 1,
         updated_at = NOW()`,
      [userId, secret]
    );

    console.log(`[MFA] TOTP enabled for user ${userId}`);
  } catch (error) {
    console.error('[MFA] Error enabling TOTP:', error.message);
    throw error;
  }
}

/**
 * Disable MFA for user
 * @param {object} pool - Database pool
 * @param {number} userId - User ID
 */
async function disableMFA(pool, userId) {
  try {
    await pool.query(
      'UPDATE user_mfa SET enabled = 0, updated_at = NOW() WHERE user_id = ?',
      [userId]
    );

    console.log(`[MFA] MFA disabled for user ${userId}`);
  } catch (error) {
    console.error('[MFA] Error disabling MFA:', error.message);
    throw error;
  }
}

/**
 * Check if user has MFA enabled
 * @param {object} pool - Database pool
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} MFA configuration or null
 */
async function getUserMFAConfig(pool, userId) {
  try {
    const [rows] = await pool.query(
      'SELECT mfa_type, mfa_secret, enabled FROM user_mfa WHERE user_id = ? AND enabled = 1',
      [userId]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.warn('[MFA] MFA table not available');
    return null;
  }
}

/**
 * Generate backup codes (for account recovery)
 * @param {number} count - Number of codes to generate
 * @returns {string[]} Array of backup codes
 */
function generateBackupCodes(count = 10) {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Store backup codes for user
 * @param {object} pool - Database pool
 * @param {number} userId - User ID
 * @param {string[]} codes - Backup codes
 */
async function storeBackupCodes(pool, userId, codes) {
  try {
    // Hash backup codes before storing
    const hashedCodes = codes.map(code => ({
      hash: crypto.createHash('sha256').update(code).digest('hex')
    }));

    for (const { hash } of hashedCodes) {
      await pool.query(
        'INSERT INTO mfa_backup_codes (user_id, code_hash, used, created_at) VALUES (?, ?, 0, NOW())',
        [userId, hash]
      );
    }

    console.log(`[MFA] Stored ${codes.length} backup codes for user ${userId}`);
  } catch (error) {
    console.error('[MFA] Error storing backup codes:', error.message);
    throw error;
  }
}

/**
 * Verify backup code
 * @param {object} pool - Database pool
 * @param {number} userId - User ID
 * @param {string} code - Backup code
 * @returns {Promise<boolean>} Whether code is valid
 */
async function verifyBackupCode(pool, userId, code) {
  try {
    const hash = crypto.createHash('sha256').update(code).digest('hex');

    const [rows] = await pool.query(
      'SELECT id FROM mfa_backup_codes WHERE user_id = ? AND code_hash = ? AND used = 0',
      [userId, hash]
    );

    if (rows.length === 0) {
      return false;
    }

    // Mark code as used
    await pool.query(
      'UPDATE mfa_backup_codes SET used = 1, used_at = NOW() WHERE id = ?',
      [rows[0].id]
    );

    console.log(`[MFA] Backup code used for user ${userId}`);
    return true;
  } catch (error) {
    console.error('[MFA] Error verifying backup code:', error.message);
    return false;
  }
}

/**
 * Send OTP via email (placeholder - integrate with SES)
 * @param {string} email - User email
 * @param {string} code - OTP code
 */
async function sendEmailOTP(email, code) {
  // TODO: Integrate with AWS SES
  console.log(`[MFA] Email OTP for ${email}: ${code}`);
  console.log(`[MFA] In production, send via AWS SES`);
  
  // For development/testing, just log the code
  return true;
}

/**
 * Send OTP via SMS (placeholder - integrate with SNS)
 * @param {string} phone - User phone number
 * @param {string} code - OTP code
 */
async function sendSMSOTP(phone, code) {
  // TODO: Integrate with AWS SNS
  console.log(`[MFA] SMS OTP for ${phone}: ${code}`);
  console.log(`[MFA] In production, send via AWS SNS`);
  
  // For development/testing, just log the code
  return true;
}

module.exports = {
  generateTOTPSecret,
  verifyTOTP,
  generateOTP,
  generateAndStoreOTP,
  verifyOTP,
  enableTOTP,
  disableMFA,
  getUserMFAConfig,
  generateBackupCodes,
  storeBackupCodes,
  verifyBackupCode,
  sendEmailOTP,
  sendSMSOTP
};
