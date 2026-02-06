/**
 * @file compliance.js
 * @description GDPR and PCI DSS compliance utilities
 * 
 * Features:
 * - Data subject rights (access, erasure, portability)
 * - Consent management
 * - Audit logging
 * - Data retention policies
 * - PII detection and masking
 */

const { getPool } = require('./db');
const { encryptField, decryptField, maskField } = require('./encryption');

/**
 * GDPR: Right to Access (Article 15)
 * Export all user data in machine-readable format
 * @param {number} userId - User ID
 * @returns {Promise<object>} Complete user data export
 */
async function exportUserData(userId) {
  const pool = await getPool();
  
  try {
    // User profile
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (!users.length) {
      throw new Error('User not found');
    }
    
    // User orders
    const [orders] = await pool.query(
      'SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ?',
      [userId]
    );
    
    // Order items for all user orders
    let orderItems = [];
    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const placeholders = orderIds.map(() => '?').join(',');
      const [items] = await pool.query(
        `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name as product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id IN (${placeholders})`,
        orderIds
      );
      orderItems = items;
    }
    
    // Audit logs (if available)
    const [auditLogs] = await pool.query(
      'SELECT action, timestamp, ip_address FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100',
      [userId]
    ).catch(() => [[]]);
    
    return {
      export_timestamp: new Date().toISOString(),
      export_type: 'GDPR_DATA_SUBJECT_ACCESS_REQUEST',
      user: users[0],
      orders: orders.map(order => ({
        ...order,
        items: orderItems.filter(item => item.order_id === order.id)
      })),
      audit_logs: auditLogs,
      rights_notice: 'You have the right to request correction, deletion, or restriction of processing of this data. Contact: privacy@cloudretail.com'
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}

/**
 * GDPR: Right to Erasure (Article 17) - "Right to be Forgotten"
 * Soft delete user and anonymize data
 * @param {number} userId - User ID
 * @param {string} reason - Reason for deletion
 * @returns {Promise<object>} Deletion confirmation
 */
async function deleteUserData(userId, reason = 'user_request') {
  const pool = await getPool();
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // 1. Get user data for audit log
    const [users] = await conn.query('SELECT email FROM users WHERE id = ?', [userId]);
    if (!users.length) {
      throw new Error('User not found');
    }
    
    // 2. Anonymize user data (soft delete)
    const anonymizedEmail = `deleted_${userId}_${Date.now()}@anonymized.local`;
    await conn.query(
      `UPDATE users 
       SET email = ?, 
           name = 'Deleted User', 
           password = 'DELETED',
           role = 'deleted',
           deleted_at = NOW()
       WHERE id = ?`,
      [anonymizedEmail, userId]
    );
    
    // 3. Anonymize order data (keep for financial records, but remove PII)
    await conn.query(
      'UPDATE orders SET user_id = 0 WHERE user_id = ?',
      [userId]
    );
    
    // 4. Log the deletion (audit trail)
    await conn.query(
      `INSERT INTO audit_logs (user_id, action, details, timestamp)
       VALUES (?, 'GDPR_DATA_DELETION', ?, NOW())`,
      [userId, JSON.stringify({ reason, original_email: users[0].email })]
    ).catch(() => {
      console.warn('Audit log table not available');
    });
    
    await conn.commit();
    
    return {
      status: 'success',
      user_id: userId,
      deletion_timestamp: new Date().toISOString(),
      message: 'User data has been anonymized in compliance with GDPR'
    };
  } catch (error) {
    await conn.rollback();
    console.error('Error deleting user data:', error);
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * GDPR: Data Portability (Article 20)
 * Export user data in JSON format for transfer to another service
 * @param {number} userId - User ID
 * @returns {Promise<object>} Portable data in JSON format
 */
async function exportPortableData(userId) {
  const fullExport = await exportUserData(userId);
  
  return {
    format: 'application/json',
    version: '1.0',
    exported_at: new Date().toISOString(),
    data: fullExport
  };
}

/**
 * PCI DSS: Mask payment card data
 * @param {string} cardNumber - Card number
 * @returns {string} Masked card number (e.g., **** **** **** 1234)
 */
function maskCardNumber(cardNumber) {
  if (!cardNumber) return null;
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 13) return maskField(cleaned, 0);
  
  const lastFour = cleaned.slice(-4);
  return `**** **** **** ${lastFour}`;
}

/**
 * PCI DSS: Validate PCI compliance for data retention
 * @param {Date} transactionDate - Transaction date
 * @returns {boolean} Whether data should be retained
 */
function shouldRetainTransactionData(transactionDate) {
  // PCI DSS: Retain transaction data for 3 years minimum
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  return new Date(transactionDate) >= threeYearsAgo;
}

/**
 * Detect PII (Personally Identifiable Information) in text
 * @param {string} text - Text to analyze
 * @returns {object} PII detection results
 */
function detectPII(text) {
  if (!text) return { hasPII: false, types: [] };
  
  const patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g
  };
  
  const detected = [];
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      detected.push(type);
    }
  }
  
  return {
    hasPII: detected.length > 0,
    types: detected
  };
}

/**
 * Log audit event for compliance
 * @param {object} event - Audit event details
 */
async function logAuditEvent(event) {
  const {
    user_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    user_agent,
    status,
    details
  } = event;
  
  const pool = await getPool();
  
  try {
    await pool.query(
      `INSERT INTO audit_logs 
       (user_id, action, resource_type, resource_id, ip_address, user_agent, status, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id || null,
        action,
        resource_type || null,
        resource_id || null,
        ip_address || null,
        user_agent || null,
        status || 'success',
        JSON.stringify(details || {})
      ]
    );
  } catch (error) {
    // If audit_logs table doesn't exist, log to console (fallback)
    console.log('AUDIT_LOG:', {
      timestamp: new Date().toISOString(),
      ...event
    });
  }
}

/**
 * Check user consent status
 * @param {number} userId - User ID
 * @param {string} consentType - Type of consent (e.g., 'marketing', 'analytics')
 * @returns {Promise<boolean>} Consent status
 */
async function checkConsent(userId, consentType) {
  const pool = await getPool();
  
  try {
    const [rows] = await pool.query(
      'SELECT consent_given FROM user_consents WHERE user_id = ? AND consent_type = ? AND is_active = 1',
      [userId, consentType]
    );
    
    return rows.length > 0 && rows[0].consent_given === 1;
  } catch (error) {
    console.warn('Consent table not available, defaulting to false');
    return false;
  }
}

/**
 * Record user consent
 * @param {number} userId - User ID
 * @param {string} consentType - Type of consent
 * @param {boolean} consentGiven - Whether consent was given
 */
async function recordConsent(userId, consentType, consentGiven) {
  const pool = await getPool();
  
  try {
    await pool.query(
      `INSERT INTO user_consents (user_id, consent_type, consent_given, given_at, is_active)
       VALUES (?, ?, ?, NOW(), 1)
       ON DUPLICATE KEY UPDATE 
         consent_given = VALUES(consent_given),
         given_at = NOW()`,
      [userId, consentType, consentGiven ? 1 : 0]
    );
    
    await logAuditEvent({
      user_id: userId,
      action: 'CONSENT_UPDATED',
      details: { consent_type: consentType, consent_given: consentGiven }
    });
  } catch (error) {
    console.error('Error recording consent:', error);
    throw error;
  }
}

module.exports = {
  exportUserData,
  deleteUserData,
  exportPortableData,
  maskCardNumber,
  shouldRetainTransactionData,
  detectPII,
  logAuditEvent,
  checkConsent,
  recordConsent
};
