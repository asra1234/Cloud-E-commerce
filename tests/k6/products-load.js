import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

const BASE = __ENV.BASE_URL || 'https://3g3cvz53y9.execute-api.us-east-1.amazonaws.com';

export default function () {
  const res = http.get(`${BASE}/products`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
