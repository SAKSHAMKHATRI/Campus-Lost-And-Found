const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

test('User Authentication API Routes & Controller (Isolated & Safe)', async (t) => {
  const mockUserId = '507f1f77bcf86cd799439022';
  const plainPassword = 'securePassword123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const mockUserDoc = {
    _id: mockUserId,
    name: 'Rahul Sharma',
    email: 'rahul@college.edu',
    password: hashedPassword,
    role: 'user',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comparePassword: async (candidate) => candidate === plainPassword,
    toJSON: () => ({
      id: mockUserId,
      name: 'Rahul Sharma',
      email: 'rahul@college.edu',
      role: 'user',
      active: true
    })
  };

  await t.test('POST /api/auth/register - should return 201 with token and user on valid registration', async () => {
    t.mock.method(User, 'findOne', async () => null);
    t.mock.method(User, 'create', async (data) => ({
      _id: mockUserId,
      name: data.name,
      email: data.email,
      role: 'user',
      active: true,
      createdAt: new Date().toISOString()
    }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rahul Sharma',
        email: 'rahul@college.edu',
        password: 'securePassword123'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'User registered successfully');
    assert.ok(res.body.token, 'Response must include JWT token');
    assert.equal(res.body.data.name, 'Rahul Sharma');
    assert.equal(res.body.data.email, 'rahul@college.edu');
    assert.equal(res.body.data.password, undefined, 'Password must not be returned');
    assert.equal(res.body.data.passwordHash, undefined, 'Password hash must not be returned');
  });

  await t.test('POST /api/auth/register - should return 400 when email is already registered', async () => {
    t.mock.method(User, 'findOne', async () => mockUserDoc);

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rahul Sharma',
        email: 'rahul@college.edu',
        password: 'securePassword123'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already registered/i);
  });

  await t.test('POST /api/auth/register - should return 400 when missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'rahul@college.edu'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Name, email, and password are required/i);
  });

  await t.test('POST /api/auth/register - should return 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rahul',
        email: 'invalid-email-address',
        password: 'password123'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /valid email address/i);
  });

  await t.test('POST /api/auth/register - should return 400 when password is under 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rahul',
        email: 'rahul@college.edu',
        password: '123'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /at least 6 characters/i);
  });

  await t.test('POST /api/auth/login - should return 200 with token on valid credentials', async () => {
    t.mock.method(User, 'findOne', async () => mockUserDoc);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rahul@college.edu',
        password: 'securePassword123'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Login successful');
    assert.ok(res.body.token, 'Login must return token');
    assert.equal(res.body.data.email, 'rahul@college.edu');
    assert.equal(res.body.data.password, undefined, 'Password must not be returned');
    assert.equal(res.body.data.passwordHash, undefined, 'Password hash must not be returned');
  });

  await t.test('POST /api/auth/login - should return 401 generic error on non-existent email', async () => {
    t.mock.method(User, 'findOne', async () => null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@college.edu',
        password: 'somePassword'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid email or password/i);
  });

  await t.test('POST /api/auth/login - should return 401 generic error on incorrect password', async () => {
    t.mock.method(User, 'findOne', async () => mockUserDoc);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rahul@college.edu',
        password: 'wrongPasswordHere'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid email or password/i);
  });

  await t.test('POST /api/auth/login - should return 400 when missing email or password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rahul@college.edu'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Please enter your email and password/i);
  });

  await t.test('POST /api/auth/login - should return 403 when account is deactivated', async () => {
    const inactiveUser = {
      ...mockUserDoc,
      active: false
    };
    t.mock.method(User, 'findOne', async () => inactiveUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'deactivated@college.edu',
        password: 'securePassword123'
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /deactivated/i);
  });

  await t.test('GET /api/auth/me - should return 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /token missing/i);
  });

  await t.test('GET /api/auth/me - should return 200 with profile when valid Bearer token provided', async () => {
    const token = jwt.sign(
      { id: mockUserId, email: 'rahul@college.edu', role: 'user' },
      process.env.JWT_SECRET || 'campus-lost-found-dev-secret-key-2026',
      { expiresIn: '1h' }
    );

    t.mock.method(User, 'findById', () => ({
      select: async () => ({
        _id: mockUserId,
        name: 'Rahul Sharma',
        email: 'rahul@college.edu',
        role: 'user',
        active: true
      })
    }));

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Rahul Sharma');
    assert.equal(res.body.data.email, 'rahul@college.edu');
    assert.equal(res.body.data.role, 'user');
    assert.equal(res.body.data.password, undefined, 'Password must not be returned');
    assert.equal(res.body.data.passwordHash, undefined, 'Password hash must not be returned');
  });

  await t.test('POST /api/auth/register - client cannot elevate privilege by sending role: "admin"', async () => {
    let capturedCreateData = null;
    t.mock.method(User, 'findOne', async () => null);
    t.mock.method(User, 'create', async (data) => {
      capturedCreateData = data;
      return {
        _id: mockUserId,
        name: data.name,
        email: data.email,
        role: data.role,
        active: true,
        createdAt: new Date().toISOString()
      };
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sneaky User',
        email: 'sneaky@college.edu',
        password: 'securePassword123',
        role: 'admin' // Attempted privilege escalation
      });

    assert.equal(res.status, 201);
    assert.equal(capturedCreateData.role, 'user', 'Server must strictly enforce role: "user"');
    assert.equal(res.body.data.role, 'user', 'Response must reflect role: "user"');
  });

  await t.test('JWT Policy - getJwtSecret throws fatal error in production if JWT_SECRET is missing or insecure', () => {
    const { getJwtSecret } = require('../config/jwt');
    const prevNodeEnv = process.env.NODE_ENV;
    const prevSecret = process.env.JWT_SECRET;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;

      assert.throws(
        () => getJwtSecret(),
        /FATAL: JWT_SECRET environment variable is missing, empty, or insecure in production/
      );

      process.env.JWT_SECRET = 'short';
      assert.throws(
        () => getJwtSecret(),
        /FATAL: JWT_SECRET environment variable is missing, empty, or insecure in production/
      );
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      if (prevSecret) process.env.JWT_SECRET = prevSecret;
      else delete process.env.JWT_SECRET;
    }
  });

  await t.test('GET /api/auth/me - rejects malformed, expired, and wrong-secret tokens with 401', async () => {
    // 1. Malformed token
    const malformedRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer totally-invalid-malformed-token');
    assert.equal(malformedRes.status, 401);
    assert.match(malformedRes.body.message, /token invalid or expired/i);

    // 2. Expired token
    const expiredToken = jwt.sign(
      { id: mockUserId, email: 'rahul@college.edu', role: 'user' },
      process.env.JWT_SECRET || 'campus-lost-found-dev-secret-key-2026',
      { expiresIn: '-10s' }
    );
    const expiredRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    assert.equal(expiredRes.status, 401);
    assert.match(expiredRes.body.message, /token invalid or expired/i);

    // 3. Token signed with wrong secret
    const fakeSecretToken = jwt.sign(
      { id: mockUserId, email: 'rahul@college.edu', role: 'user' },
      'completely-wrong-unauthorized-secret',
      { expiresIn: '1h' }
    );
    const fakeSecretRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${fakeSecretToken}`);
    assert.equal(fakeSecretRes.status, 401);
    assert.match(fakeSecretRes.body.message, /token invalid or expired/i);
  });
});
