import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE = __ENV.API_URL || 'https://3g3cvz53y9.execute-api.us-east-1.amazonaws.com';

export default function () {
  const res = http.get(`${BASE}/inventory`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body not empty': (r) => r.body && r.body.length > 2,
  });
  sleep(1);
}
