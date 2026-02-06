const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { loadSecrets } = require('./load-secrets');

async function main() {
	try {
		if (process.env.SECRET_ARN) {
			console.log('SECRET_ARN present, loading secrets from Secrets Manager...');
			await loadSecrets();
		}

		const authRoutes = require('./routes/auth');
		const productRoutes = require('./routes/products');
		const orderRoutes = require('./routes/orders');
		const pool = require('./db');

		// wait for DB to be reachable before starting server
		if (typeof pool.waitForDb === 'function') {
			console.log('Waiting for database to become reachable...');
			await pool.waitForDb({ retries: 6, delay: 3000 });
		}

		const app = express();
		app.use(cors());
		app.use(bodyParser.json());

		app.use('/api/auth', authRoutes);
		app.use('/api/products', productRoutes);
		app.use('/api/orders', orderRoutes);

		// Health endpoint to verify app and DB connectivity
		app.get('/api/health', async (req, res) => {
			try {
				try {
					await pool.query('SELECT 1');
					return res.json({ status: 'ok', db: 'reachable' });
				} catch (dbErr) {
					console.error('Health DB check failed', dbErr && dbErr.code ? dbErr.code : dbErr);
					return res.status(503).json({ status: 'unhealthy', db: 'unreachable', error: dbErr && dbErr.code ? dbErr.code : dbErr.message });
				}
			} catch (err) {
				console.error('Health check error', err);
				res.status(500).json({ status: 'error' });
			}
		});

		app.get('/', (req, res) => res.json({ message: 'CloudRetail API' }));

		const PORT = process.env.PORT || 5000;
		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	} catch (err) {
		console.error('Failed to start server:', err);
		process.exit(1);
	}
}

main();
