const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

async function loadSecrets() {
  if (!process.env.SECRET_ARN) return;

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
  const cmd = new GetSecretValueCommand({ SecretId: process.env.SECRET_ARN });

  try {
    const out = await client.send(cmd);
    let secret = out.SecretString || '';
    // try parse JSON, otherwise treat as KEY=VALUE lines
    let parsed = {};
    try {
      parsed = JSON.parse(secret);
    } catch (e) {
      // fallback to parse lines
      secret.split(/\r?\n/).forEach((line) => {
        const idx = line.indexOf('=');
        if (idx > 0) {
          const k = line.slice(0, idx).trim();
          const v = line.slice(idx + 1).trim();
          if (k) parsed[k] = v;
        }
      });
    }

    // map common keys
    process.env.DB_HOST = parsed.host || parsed.HOST || parsed.hostname || parsed.host_name || process.env.DB_HOST;
    process.env.DB_USER = parsed.username || parsed.user || parsed.USER || process.env.DB_USER;
    process.env.DB_PASSWORD = parsed.password || parsed.pass || parsed.PASSWORD || process.env.DB_PASSWORD;
    process.env.DB_NAME = parsed.dbname || parsed.database || parsed.DB_NAME || process.env.DB_NAME;

    console.log('Loaded DB credentials from Secrets Manager');
  } catch (err) {
    console.error('Failed to load secret:', err && err.name ? err.name : err);
    throw err;
  }
}

module.exports = { loadSecrets };
