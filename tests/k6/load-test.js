import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const productDetailDuration = new Trend('product_detail_duration');

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '5m', target: 1000 },
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  let res = http.get(`${BASE_URL}/`);
  check(res, { 'homepage status 200': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(1);

  res = http.get(`${BASE_URL}/products`);
  check(res, {
    'products status 200': (r) => r.status === 200,
    'products count > 0': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
    }
  }) || errorRate.add(1);
  sleep(1);

  const startTime = new Date();
  res = http.get(`${BASE_URL}/products/1`);
  productDetailDuration.add(new Date() - startTime);
  check(res, { 'detail status 200': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(2);
}
