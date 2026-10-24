const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');

test('Backend Health & Core Routing', async (t) => {
  await t.test('GET / should return 200 with API welcome info', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /Campus Lost & Found/);
  });

  await t.test('GET /api/health should return 200 with JSON health status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.message, 'string');
    assert.equal(typeof res.body.timestamp, 'string');
    assert.equal(typeof res.body.uptime, 'string');
  });

  await t.test('GET /api/undefined-route should return 404 with structured JSON', async () => {
    const res = await request(app).get('/api/undefined-route');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Route not found/);
  });
});
