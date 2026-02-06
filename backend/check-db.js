const pool = require('./db');

async function run() {
  try {
    console.log('Attempting to connect to DB using env:');
    console.log('DB_HOST=', process.env.DB_HOST);
    console.log('DB_USER=', process.env.DB_USER);
    console.log('DB_NAME=', process.env.DB_NAME);

    // call the helper if available
    if (typeof pool.waitForDb === 'function') {
      console.log('Using pool.waitForDb() to verify connectivity with retries...');
      await pool.waitForDb({ retries: 3, delay: 2000 });
      console.log('DB reachable (via waitForDb)');
      process.exit(0);
    }

    const [rows] = await pool.query('SELECT 1 as ok');
    console.log('Query result:', rows);
    console.log('DB reachable');
    process.exit(0);
  } catch (err) {
    console.error('DB check failed:', err && err.code ? err.code : err.message || err);
    process.exit(2);
  }
}

run();
