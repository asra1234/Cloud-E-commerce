import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE = __ENV.API_URL || 'https://3g3cvz53y9.execute-api.us-east-1.amazonaws.com';

const params = { headers: { 'Content-Type': 'application/json' } };

export function setup() {
  // create a test user (unique by timestamp) so login will succeed
  const email = __ENV.TEST_EMAIL || `k6-user-${Date.now()}@example.com`;
  const password = __ENV.TEST_PASS || 'pass';
  const name = 'k6user';
  const reg = http.post(`${BASE}/auth/register`, JSON.stringify({ name, email, password }), params);
  // ignore non-201/200 responses from register (user may already exist), we'll attempt login in default
  return { email, password };
}

export default function (data) {
  const loginPayload = JSON.stringify({ email: data.email, password: data.password });
  const res = http.post(`${BASE}/auth/login`, loginPayload, params);
  check(res, {
    'login 200': (r) => r.status === 200,
    'has token': (r) => {
      try {
        const b = JSON.parse(r.body);
        return !!b.token;
      } catch (e) { return false; }
    }
  });
  sleep(1);
}
