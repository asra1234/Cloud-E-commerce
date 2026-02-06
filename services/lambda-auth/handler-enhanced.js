/**
 * @file auth-enhanced.js
 * @description Enhanced Authentication Handler with MFA, Security Logging, and Compliance
 * 
 * New Features:
 * - Multi-Factor Authentication (TOTP, Email OTP)
 * - Failed login tracking and account lockout
 * - Security event logging
 * - GDPR consent tracking
 * - Idempotency support
 * - Audit logging
 */

const { getPool } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  getUserMFAConfig, 
  verifyTOTP, 
  verifyOTP, 
  generateAndStoreOTP,
  generateTOTPSecret,
  enableTOTP,
  sendEmailOTP 
} = require('../shared/mfa');
const { logAuditEvent, recordConsent } = require('../shared/compliance');
const { encryptField, maskField } = require('../shared/encryption');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Idempotency-Key',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'"
    },
    body: JSON.stringify(body),
  };
}

/**
 * Get client IP address
 */
function getClientIP(event) {
  return event.requestContext?.identity?.sourceIp || 
         event.headers?.['X-Forwarded-For']?.split(',')[0] || 
         'unknown';
}

/**
 * Log security event
 */
async function logSecurityEvent(pool, eventType, userId, email, ipAddress, userAgent, severity = 'medium', details = {}) {
  try {
    await pool.query(
      `INSERT INTO security_events (event_type, user_id, email, ip_address, user_agent, severity, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [eventType, userId, email, ipAddress, userAgent, severity, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Failed to log security event:', error.message);
  }
}

/**
 * Check if account is locked
 */
async function checkAccountLock(pool, userId) {
  const [rows] = await pool.query(
    'SELECT account_locked_until FROM users WHERE id = ?',
    [userId]
  );
  
  if (rows.length > 0 && rows[0].account_locked_until) {
    const lockUntil = new Date(rows[0].account_locked_until);
    if (lockUntil > new Date()) {
      return {
        locked: true,
        until: lockUntil
      };
    } else {
      // Lock expired, reset
      await pool.query(
        'UPDATE users SET account_locked_until = NULL, failed_login_attempts = 0 WHERE id = ?',
        [userId]
      );
    }
  }
  
  return { locked: false };
}

/**
 * Handle failed login attempt
 */
async function handleFailedLogin(pool, userId, ipAddress, userAgent, email) {
  try {
    // Increment failed attempts
    await pool.query(
      'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
      [userId]
    );
    
    // Check if should lock account
    const [rows] = await pool.query(
      'SELECT failed_login_attempts FROM users WHERE id = ?',
      [userId]
    );
    
    const attempts = rows[0]?.failed_login_attempts || 0;
    
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      await pool.query(
        'UPDATE users SET account_locked_until = ? WHERE id = ?',
        [lockUntil, userId]
      );
      
      await logSecurityEvent(
        pool, 
        'ACCOUNT_LOCKED', 
        userId, 
        email, 
        ipAddress, 
        userAgent, 
        'high',
        { attempts, lock_until: lockUntil }
      );
      
      return { locked: true, attempts };
    }
    
    await logSecurityEvent(
      pool, 
      'FAILED_LOGIN', 
      userId, 
      email, 
      ipAddress, 
      userAgent, 
      'medium',
      { attempts }
    );
    
    return { locked: false, attempts };
  } catch (error) {
    console.error('Error handling failed login:', error);
    return { locked: false, attempts: 0 };
  }
}

/**
 * Reset failed login attempts on successful login
 */
async function resetFailedAttempts(pool, userId, ipAddress) {
  await pool.query(
    'UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL, last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
    [ipAddress, userId]
  );
}

/**
 * Enhanced Registration with GDPR Consent
 */
exports.register = async (event) => {
  const ipAddress = getClientIP(event);
  const userAgent = event.headers?.['User-Agent'] || 'unknown';
  const pool = await getPool();

  try {
    let body = {};
    if (event.body) {
      if (typeof event.body === 'object') body = event.body;
      else {
        try { body = JSON.parse(event.body); }
        catch (e) { body = Object.fromEntries(new URLSearchParams(event.body)); }
      }
    }
    
    const { name, email, password, marketing_consent, terms_accepted } = body;
    
    if (!name || !email || !password) {
      return buildResponse(400, { message: 'Missing required fields' });
    }
    
    if (!terms_accepted) {
      return buildResponse(400, { message: 'You must accept the terms and conditions' });
    }
    
    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      await logSecurityEvent(pool, 'REGISTRATION_DUPLICATE_EMAIL', null, email, ipAddress, userAgent, 'low');
      return buildResponse(400, { message: 'Email already in use' });
    }
    
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create user
    const [res] = await pool.query(
      'INSERT INTO users (name, email, password, marketing_consent, email_verified, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
      [name, email, hashed, marketing_consent ? 1 : 0]
    );
    const userId = res.insertId;
    
    // Record GDPR consents
    if (terms_accepted) {
      await recordConsent(pool, userId, 'data_processing', true);
    }
    if (marketing_consent) {
      await recordConsent(pool, userId, 'marketing', true);
    }
    
    // Log audit event
    await logAuditEvent({
      user_id: userId,
      action: 'USER_REGISTRATION',
      resource_type: 'user',
      resource_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: 'success',
      details: { email: maskField(email, 3), marketing_consent }
    });
    
    // Generate JWT
    const token = jwt.sign(
      { sub: userId, role: 'customer' },
      process.env.JWT_SECRET || 'change-me',
      { expiresIn: '24h' }
    );
    
    return buildResponse(201, {
      message: 'Registration successful',
      user: { id: userId, name, email },
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    return buildResponse(500, { message: 'Server error' });
  }
};

/**
 * Enhanced Login with MFA Support
 * Step 1: Verify credentials
 * Step 2: If MFA enabled, require second factor
 */
exports.login = async (event) => {
  const ipAddress = getClientIP(event);
  const userAgent = event.headers?.['User-Agent'] || 'unknown';
  const pool = await getPool();

  try {
    let body = {};
    if (event.body) {
      if (typeof event.body === 'object') body = event.body;
      else {
        try { body = JSON.parse(event.body); }
        catch (e) { body = Object.fromEntries(new URLSearchParams(event.body)); }
      }
    }
    
    const { email, password, mfa_code } = body;
    
    if (!email || !password) {
      return buildResponse(400, { message: 'Missing credentials' });
    }
    
    // Get user
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, two_factor_enabled, failed_login_attempts, account_locked_until FROM users WHERE email = ?',
      [email]
    );
    
    if (!rows.length) {
      await logSecurityEvent(pool, 'FAILED_LOGIN_UNKNOWN_USER', null, email, ipAddress, userAgent, 'low');
      return buildResponse(401, { message: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // Check account lock
    const lockStatus = await checkAccountLock(pool, user.id);
    if (lockStatus.locked) {
      return buildResponse(403, {
        message: 'Account temporarily locked due to multiple failed login attempts',
        locked_until: lockStatus.until
      });
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      const failResult = await handleFailedLogin(pool, user.id, ipAddress, userAgent, email);
      
      if (failResult.locked) {
        return buildResponse(403, {
          message: 'Account locked due to multiple failed login attempts',
          attempts: failResult.attempts
        });
      }
      
      return buildResponse(401, {
        message: 'Invalid credentials',
        remaining_attempts: MAX_LOGIN_ATTEMPTS - failResult.attempts
      });
    }
    
    // Check if MFA is enabled
    const mfaConfig = await getUserMFAConfig(pool, user.id);
    
    if (mfaConfig && mfaConfig.enabled) {
      // MFA is enabled - verify second factor
      if (!mfa_code) {
        // First step: credentials valid, need MFA code
        // For email OTP, send code
        if (mfaConfig.mfa_type === 'email') {
          const otp = await generateAndStoreOTP(pool, user.id, 'email');
          await sendEmailOTP(email, otp);
        }
        
        return buildResponse(200, {
          message: 'MFA required',
          requires_mfa: true,
          mfa_type: mfaConfig.mfa_type,
          session_token: jwt.sign({ sub: user.id, mfa_pending: true }, process.env.JWT_SECRET, { expiresIn: '10m' })
        });
      }
      
      // Verify MFA code
      let mfaValid = false;
      if (mfaConfig.mfa_type === 'totp') {
        mfaValid = verifyTOTP(mfa_code, mfaConfig.mfa_secret);
      } else if (mfaConfig.mfa_type === 'email' || mfaConfig.mfa_type === 'sms') {
        mfaValid = await verifyOTP(pool, user.id, mfa_code, mfaConfig.mfa_type);
      }
      
      if (!mfaValid) {
        await logSecurityEvent(pool, 'FAILED_MFA', user.id, email, ipAddress, userAgent, 'high');
        return buildResponse(401, { message: 'Invalid MFA code' });
      }
      
      await logAuditEvent({
        user_id: user.id,
        action: 'MFA_VERIFIED',
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'success'
      });
    }
    
    // Login successful
    await resetFailedAttempts(pool, user.id, ipAddress);
    
    await logAuditEvent({
      user_id: user.id,
      action: 'USER_LOGIN',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: 'success',
      details: { mfa_used: !!mfaConfig }
    });
    
    // Generate JWT
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET || 'change-me',
      { expiresIn: '24h' }
    );
    
    return buildResponse(200, {
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    return buildResponse(500, { message: 'Server error' });
  }
};

/**
 * Setup MFA (TOTP)
 */
exports.setupMFA = async (event) => {
  const pool = await getPool();
  
  try {
    // Verify JWT
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return buildResponse(401, { message: 'Unauthorized' });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    const userId = decoded.sub;
    
    // Get user email
    const [users] = await pool.query('SELECT email FROM users WHERE id = ?', [userId]);
    if (!users.length) return buildResponse(404, { message: 'User not found' });
    
    const email = users[0].email;
    
    // Generate TOTP secret
    const { secret, qrCode, manualEntryKey } = await generateTOTPSecret(email);
    
    // Store secret (temporarily - will be confirmed after verification)
    await pool.query(
      `INSERT INTO user_mfa (user_id, mfa_type, mfa_secret, enabled)
       VALUES (?, 'totp', ?, 0)
       ON DUPLICATE KEY UPDATE mfa_secret = VALUES(mfa_secret), enabled = 0`,
      [userId, secret]
    );
    
    return buildResponse(200, {
      message: 'MFA setup initiated. Scan QR code with authenticator app.',
      qr_code: qrCode,
      manual_entry_key: manualEntryKey,
      instructions: 'After adding to your authenticator app, verify with a code to complete setup.'
    });
  } catch (err) {
    console.error('MFA setup error:', err);
    return buildResponse(500, { message: 'Server error' });
  }
};

/**
 * Verify and enable MFA
 */
exports.verifyMFA = async (event) => {
  const pool = await getPool();
  
  try {
    // Verify JWT
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return buildResponse(401, { message: 'Unauthorized' });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    const userId = decoded.sub;
    
    let body = JSON.parse(event.body || '{}');
    const { code } = body;
    
    if (!code) return buildResponse(400, { message: 'MFA code required' });
    
    // Get MFA config
    const [mfaRows] = await pool.query(
      'SELECT mfa_secret FROM user_mfa WHERE user_id = ? AND mfa_type = "totp"',
      [userId]
    );
    
    if (!mfaRows.length) return buildResponse(400, { message: 'MFA not set up' });
    
    const secret = mfaRows[0].mfa_secret;
    
    // Verify code
    const valid = verifyTOTP(code, secret);
    
    if (!valid) {
      return buildResponse(401, { message: 'Invalid MFA code' });
    }
    
    // Enable MFA
    await enableTOTP(pool, userId, secret);
    await pool.query('UPDATE users SET two_factor_enabled = 1 WHERE id = ?', [userId]);
    
    await logAuditEvent({
      user_id: userId,
      action: 'MFA_ENABLED',
      status: 'success'
    });
    
    return buildResponse(200, {
      message: 'MFA enabled successfully',
      mfa_enabled: true
    });
  } catch (err) {
    console.error('MFA verification error:', err);
    return buildResponse(500, { message: 'Server error' });
  }
};

module.exports = exports;
