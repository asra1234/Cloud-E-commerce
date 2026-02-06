# Tests — Integration and Load

This folder contains integration tests (Jest + axios) and k6 load tests.

Running integration tests

1. Install test dependencies (from `tests` folder):

```bash
cd tests
npm install
```

2. Start the backend locally (example):

```bash
# from repository root
# ensure backend is running (default port 3000)
cd backend
npm install
npm start
```

3. Run integration tests (uses `BASE_URL` env var if set):

```bash
# from repository root
cd tests
BASE_URL=http://localhost:3000 npm test
```

Running k6 load test

Requires `k6` installed on your machine.

```bash
# run from repo root or tests/k6
k6 run tests/k6/load-test.js --env BASE_URL=http://localhost:3000
```

Stress test (Artillery YAML)

Requires `artillery` installed globally or in your environment.

```bash
# install globally: npm i -g artillery
artillery run tests/k6/stress-test.yml
```

Notes
- Tests are basic, non-destructive, and meant as a starting point. Extend payloads and assertions for full coverage.
- To run Newman/Postman collections, add your collection JSON and run `newman run <collection.json>`.
Test artifacts and how to run them

1. Validate OpenAPI

- Install swagger-cli globally or locally:
  npm install -g @apidevtools/swagger-cli
- Validate:
  swagger-cli validate docs/openapi.yaml

2. Run Postman collection (recommended for integration tests)

- Install newman:
  npm install -g newman
- Run:
  newman run tests/postman/CloudRetail.postman_collection.json -e tests/postman/env.json --delay-request 1000

3. Run k6 load test (performance)

- Install k6 (https://k6.io/docs/getting-started/installation/)
- Run:
  BASE_URL=https://3g3cvz53y9.execute-api.us-east-1.amazonaws.com k6 run tests/k6/products-load.js

4. Optional: validate OpenAPI against live server with swagger-ui or editor.swagger.io

Notes:

- Replace `{{base_url}}` in Postman environment or pass env file.
- For authenticated endpoints include an Authorization header: `Bearer <token>`.
