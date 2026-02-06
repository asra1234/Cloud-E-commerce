const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

let cache = {};

async function getSecret(secretArn) {
  if (!secretArn) return null;
  if (cache[secretArn]) return cache[secretArn];

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1' });
  const cmd = new GetSecretValueCommand({ SecretId: secretArn });
  const res = await client.send(cmd);
  const secretString = res.SecretString || '{}';
  try { const parsed = JSON.parse(secretString); cache[secretArn] = parsed; return parsed; } catch (err) {
    cache[secretArn] = { raw: secretString };
    return cache[secretArn];
  }
}

module.exports = { getSecret };