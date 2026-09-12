const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// Lightweight health check — starts no DB connection; tests route wiring only.
// Run with: npm test

test('health endpoint returns ok status', async (t) => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-for-health-check';

    const app = require('../server');
    const server = app.listen(0);
    const { port } = server.address();

    t.after(() => new Promise((resolve) => server.close(resolve)));

    const body = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/health`, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', reject);
    });

    assert.equal(body.status, 200);
    const json = JSON.parse(body.data);
    assert.equal(json.status, 'ok');
    assert.ok(json.timestamp);
});
