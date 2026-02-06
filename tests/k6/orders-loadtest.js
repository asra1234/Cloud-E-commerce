import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<600'],
    'http_req_failed': ['rate<0.02'],
  },
};

const BASE = __ENV.API_URL || 'https://3g3cvz53y9.execute-api.us-east-1.amazonaws.com';

export function setup() {
  // ensure test user exists and obtain JWT to use for orders
  const email = __ENV.TEST_EMAIL || `k6-orderer-${Date.now()}@example.com`;
  const password = __ENV.TEST_PASS || 'pass';
  const name = 'k6order';
  // try register (may return 400 if already exists)
  http.post(`${BASE}/auth/register`, JSON.stringify({ name, email, password }), { headers: { 'Content-Type': 'application/json' } });
  // login to get token
  const login = http.post(`${BASE}/auth/login`, JSON.stringify({ email, password }), { headers: { 'Content-Type': 'application/json' } });
  let token = '';
  try {
    const b = login.json();
    token = b.token || '';
  } catch (e) { token = ''; }
  return { token };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  const payload = JSON.stringify({
    // orders endpoint uses authenticated user id from the token; no need to set user_id
    total_amount: 9.99,
    items: [{ product_id: 1, quantity: 1 }]
  });
  const res = http.post(`${BASE}/orders`, payload, { headers });
  check(res, {
    'order created 200': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);
}
