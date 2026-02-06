/**
 * @file encryption.js
 * @description Field-level encryption for sensitive data (PII)
 * Compliance: GDPR, PCI DSS
 * 
 * Uses AES-256-GCM for field-level encryption of sensitive customer data
 * KMS integration for key management
 */

const crypto = require('crypto');
const { KMSClient, DecryptCommand, GenerateDataKeyCommand } = require('@aws-sdk/client-kms');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

let kmsClient;
let dataKeyCache = {};

/**
 * Get KMS client (lazy initialization)
 */
function getKMSClient() {
  if (!kmsClient) {
    kmsClient = new KMSClient({ 
      region: process.env.AWS_REGION || 'us-east-1' 
    });
  }
  return kmsClient;
}

/**
 * Generate data key from KMS (with caching)
 * @param {string} kmsKeyId - KMS key ARN or alias
 * @returns {Promise<Buffer>} Plaintext data key
 */
async function getDataKey(kmsKeyId) {
  const cacheKey = kmsKeyId || 'default';
  
  // Cache for 5 minutes
  if (dataKeyCache[cacheKey] && dataKeyCache[cacheKey].expiry > Date.now()) {
    return dataKeyCache[cacheKey].key;
  }

  const client = getKMSClient();
  const command = new GenerateDataKeyCommand({
    KeyId: kmsKeyId || process.env.KMS_KEY_ID,
    KeySpec: 'AES_256'
  });

  const response = await client.send(command);
  const plainKey = Buffer.from(response.Plaintext);

  // Cache for 5 minutes
  dataKeyCache[cacheKey] = {
    key: plainKey,
    expiry: Date.now() + (5 * 60 * 1000)
  };

  return plainKey;
}

/**
 * Encrypt sensitive field data
 * @param {string} plaintext - Data to encrypt
 * @param {string} kmsKeyId - Optional KMS key ID
 * @returns {Promise<string>} Base64 encoded: iv:authTag:encryptedData
 */
async function encryptField(plaintext, kmsKeyId = null) {
  if (!plaintext) return null;

  try {
    const dataKey = await getDataKey(kmsKeyId);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, dataKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    const result = `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt field');
  }
}

/**
 * Decrypt sensitive field data
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} kmsKeyId - Optional KMS key ID
 * @returns {Promise<string>} Decrypted plaintext
 */
async function decryptField(encryptedData, kmsKeyId = null) {
  if (!encryptedData) return null;

  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivBase64, authTagBase64, encrypted] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const dataKey = await getDataKey(kmsKeyId);

    const decipher = crypto.createDecipheriv(ALGORITHM, dataKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt field');
  }
}

/**
 * Hash sensitive data (one-way, for search/comparison)
 * @param {string} data - Data to hash
 * @returns {string} SHA-256 hash (hex)
 */
function hashField(data) {
  if (!data) return null;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Mask sensitive data for logging/display
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of characters to show
 * @returns {string} Masked data
 */
function maskField(data, visibleChars = 4) {
  if (!data) return null;
  if (data.length <= visibleChars) return '*'.repeat(data.length);
  return data.slice(0, visibleChars) + '*'.repeat(Math.max(data.length - visibleChars, 4));
}

/**
 * Encrypt multiple fields in an object
 * @param {object} data - Object with fields to encrypt
 * @param {string[]} fields - Field names to encrypt
 * @param {string} kmsKeyId - Optional KMS key ID
 * @returns {Promise<object>} Object with encrypted fields
 */
async function encryptFields(data, fields, kmsKeyId = null) {
  const result = { ...data };
  
  for (const field of fields) {
    if (result[field]) {
      result[field] = await encryptField(result[field], kmsKeyId);
    }
  }
  
  return result;
}

/**
 * Decrypt multiple fields in an object
 * @param {object} data - Object with encrypted fields
 * @param {string[]} fields - Field names to decrypt
 * @param {string} kmsKeyId - Optional KMS key ID
 * @returns {Promise<object>} Object with decrypted fields
 */
async function decryptFields(data, fields, kmsKeyId = null) {
  const result = { ...data };
  
  for (const field of fields) {
    if (result[field]) {
      result[field] = await decryptField(result[field], kmsKeyId);
    }
  }
  
  return result;
}

module.exports = {
  encryptField,
  decryptField,
  hashField,
  maskField,
  encryptFields,
  decryptFields
};
