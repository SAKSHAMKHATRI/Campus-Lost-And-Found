const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const Item = require('../models/Item');

test('Item CRUD API Routes & Controller (Isolated & Safe)', async (t) => {
  const validMongoId = '507f1f77bcf86cd799439011';
  const notFoundMongoId = '507f1f77bcf86cd799439099';

  const mockItem = {
    _id: validMongoId,
    title: 'Blue Water Bottle',
    type: 'lost',
    category: 'Bottles & Lunchboxes',
    description: 'Stainless steel bottle left in the library',
    location: 'Library',
    date: new Date('2026-10-24').toISOString(),
    color: 'Blue',
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await t.test('POST /api/items - should return 201 on valid item creation', async () => {
    t.mock.method(Item, 'create', async (data) => ({
      ...mockItem,
      ...data,
      _id: validMongoId
    }));

    const res = await request(app)
      .post('/api/items')
      .send({
        title: 'Blue Water Bottle',
        type: 'lost',
        category: 'Bottles & Lunchboxes',
        description: 'Stainless steel bottle left in the library',
        location: 'Library',
        date: '2026-10-24',
        color: 'Blue'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Blue Water Bottle');
    assert.equal(res.body.data.type, 'lost');
  });

  await t.test('POST /api/items - should return 400 when body is empty', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({});

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Request body is required/);
  });

  await t.test('POST /api/items - should return 400 on Mongoose validation error', async () => {
    t.mock.method(Item, 'create', async () => {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = {
        title: { message: 'Item title is required' }
      };
      throw err;
    });

    const res = await request(app)
      .post('/api/items')
      .send({
        type: 'lost',
        category: 'Electronics'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Item title is required/);
  });

  await t.test('GET /api/items - should return 200 with list of items', async () => {
    t.mock.method(Item, 'find', () => ({
      sort: () => Promise.resolve([mockItem])
    }));

    const res = await request(app).get('/api/items');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data[0].title, 'Blue Water Bottle');
  });

  await t.test('GET /api/items?type=lost - should filter by valid type', async () => {
    t.mock.method(Item, 'find', (filter) => {
      assert.equal(filter.type, 'lost');
      return {
        sort: () => Promise.resolve([mockItem])
      };
    });

    const res = await request(app).get('/api/items?type=lost');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  await t.test('GET /api/items?type=invalid - should return 400 for invalid type filter', async () => {
    const res = await request(app).get('/api/items?type=stolen');

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid type filter/);
  });

  await t.test('GET /api/items/:id - should return 400 for invalid ObjectId format', async () => {
    const res = await request(app).get('/api/items/invalid-id-123');

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid item ID format/);
  });

  await t.test('GET /api/items/:id - should return 404 when item is not found', async () => {
    t.mock.method(Item, 'findById', async () => null);

    const res = await request(app).get(`/api/items/${notFoundMongoId}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Item not found/);
  });

  await t.test('GET /api/items/:id - should return 200 with item details', async () => {
    t.mock.method(Item, 'findById', async () => mockItem);

    const res = await request(app).get(`/api/items/${validMongoId}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data._id, validMongoId);
  });

  await t.test('PUT /api/items/:id - should return 400 for invalid ID format', async () => {
    const res = await request(app)
      .put('/api/items/bad-id')
      .send({ title: 'Updated Title' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('PUT /api/items/:id - should return 400 for empty body', async () => {
    const res = await request(app)
      .put(`/api/items/${validMongoId}`)
      .send({});

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Request body cannot be empty/);
  });

  await t.test('PUT /api/items/:id - should return 400 for invalid type update', async () => {
    const res = await request(app)
      .put(`/api/items/${validMongoId}`)
      .send({ type: 'misplaced' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Type must be either "lost" or "found"/);
  });

  await t.test('PUT /api/items/:id - should return 404 if item does not exist', async () => {
    t.mock.method(Item, 'findByIdAndUpdate', async () => null);

    const res = await request(app)
      .put(`/api/items/${notFoundMongoId}`)
      .send({ title: 'New Title' });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Item not found/);
  });

  await t.test('PUT /api/items/:id - should return 200 on successful update', async () => {
    const updated = { ...mockItem, title: 'Updated Bottle Title' };
    t.mock.method(Item, 'findByIdAndUpdate', async () => updated);

    const res = await request(app)
      .put(`/api/items/${validMongoId}`)
      .send({ title: 'Updated Bottle Title' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Updated Bottle Title');
  });

  await t.test('DELETE /api/items/:id - should return 400 for invalid ID format', async () => {
    const res = await request(app).delete('/api/items/not-a-mongo-id');

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('DELETE /api/items/:id - should return 404 if item does not exist', async () => {
    t.mock.method(Item, 'findByIdAndDelete', async () => null);

    const res = await request(app).delete(`/api/items/${notFoundMongoId}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Item not found/);
  });

  await t.test('DELETE /api/items/:id - should return 200 on successful deletion', async () => {
    t.mock.method(Item, 'findByIdAndDelete', async () => mockItem);

    const res = await request(app).delete(`/api/items/${validMongoId}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, validMongoId);
  });
});
