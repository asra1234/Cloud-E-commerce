const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

let cache = {};

async function getSecret(secretArn) {
  if (!secretArn) return null;
  if (cache[secretArn]) return cache[secretArn];

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1' });
  const cmd = new GetSecretValueCommand({ SecretId: secretArn });
  const res = await client.send(cmd);
  const secretString = res.SecretString || '{}';
  console.log('secrets: fetched secret string length', (secretString || '').length);
  try {
    const parsed = JSON.parse(secretString);
    console.log('secrets: parsed JSON keys', Object.keys(parsed));
    cache[secretArn] = parsed;
    return parsed;
  } catch (err) {
    console.warn('secrets: failed to parse JSON, attempting key:value fallback');
    try {
      const s = (secretString || '').replace(/^\{|\}$/g, '');
      const obj = {};
      const re = /(\w+)\s*:\s*([^,}]+)/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        let k = m[1];
        let v = m[2].trim();
        v = v.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
        obj[k] = v;
      }
      if (Object.keys(obj).length) {
        cache[secretArn] = obj;
        return obj;
      }
    } catch (e) {
      console.warn('secrets: fallback parsing failed', e && e.message);
    }
    cache[secretArn] = { raw: secretString };
    return cache[secretArn];
  }
}

module.exports = { getSecret };
