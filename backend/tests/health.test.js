const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');

test('Backend Health & Core Routing', async (t) => {
  await t.test('GET / should return 200 with HTML frontend login page', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /text\/html/);
    assert.match(res.text, /Login — Campus Lost & Found/);
    assert.match(res.text, /Campus.*Lost &amp; Found/);
  });

  await t.test('GET /api should return 200 with API welcome info', async () => {
    const res = await request(app).get('/api');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /Campus Lost & Found/);
    assert.ok(res.body.endpoints);
    assert.equal(res.body.endpoints.health, '/api/health');
    assert.equal(res.body.endpoints.items, '/api/items');
    assert.equal(res.body.endpoints.auth, '/api/auth');
  });

  await t.test('GET /index.html and /signup.html should serve static HTML pages', async () => {
    const resIndex = await request(app).get('/index.html');
    assert.equal(resIndex.status, 200);
    assert.match(resIndex.headers['content-type'], /text\/html/);
    assert.match(resIndex.text, /Login — Campus Lost & Found/);

    const resSignup = await request(app).get('/signup.html');
    assert.equal(resSignup.status, 200);
    assert.match(resSignup.headers['content-type'], /text\/html/);
    assert.match(resSignup.text, /Create an account/);
  });

  await t.test('GET /css/style.css and /js/storage.js should serve static assets', async () => {
    const resCss = await request(app).get('/css/style.css');
    assert.equal(resCss.status, 200);
    assert.match(resCss.headers['content-type'], /text\/css/);

    const resJs = await request(app).get('/js/storage.js');
    assert.equal(resJs.status, 200);
    assert.match(resJs.headers['content-type'], /javascript/);
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
