const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

test('User Model & Schema Validation (Offline / In-Memory)', async (t) => {
  await t.test('Valid User passes schema validation', () => {
    const validUser = new User({
      name: 'Aditi Verma',
      email: 'aditi@campus.edu',
      password: 'strongpassword123',
      role: 'user'
    });

    const error = validUser.validateSync();
    assert.equal(error, undefined, 'Valid user should not produce validation errors');
    assert.equal(validUser.role, 'user', 'Default role should be "user"');
    assert.equal(validUser.active, true, 'Default active status should be true');
  });

  await t.test('Missing required fields should fail validation', () => {
    const emptyUser = new User({});
    const error = emptyUser.validateSync();

    assert.ok(error, 'Validation error expected');
    assert.ok(error.errors.name, 'Name should be required');
    assert.ok(error.errors.email, 'Email should be required');
    assert.ok(error.errors.password, 'Password should be required');
  });

  await t.test('Invalid email format should fail validation', () => {
    const invalidEmailUser = new User({
      name: 'Test Student',
      email: 'not-an-email',
      password: 'password123'
    });

    const error = invalidEmailUser.validateSync();
    assert.ok(error, 'Validation error expected');
    assert.ok(error.errors.email, 'Email format error expected');
    assert.match(error.errors.email.message, /valid email address/i);
  });

  await t.test('Short password (< 6 chars) should fail validation', () => {
    const shortPasswordUser = new User({
      name: 'Test Student',
      email: 'test@college.edu',
      password: '123'
    });

    const error = shortPasswordUser.validateSync();
    assert.ok(error, 'Validation error expected');
    assert.ok(error.errors.password, 'Password length error expected');
    assert.match(error.errors.password.message, /at least 6 characters/i);
  });

  await t.test('Invalid role should be rejected by enum validator', () => {
    const invalidRoleUser = new User({
      name: 'Hacker User',
      email: 'hacker@college.edu',
      password: 'password123',
      role: 'superadmin'
    });

    const error = invalidRoleUser.validateSync();
    assert.ok(error, 'Validation error expected');
    assert.ok(error.errors.role, 'Role enum error expected');
    assert.match(error.errors.role.message, /Role must be either "user" or "admin"/);
  });

  await t.test('toJSON transformation and toSafeObject must strip password hash', () => {
    const user = new User({
      name: 'Aditi Verma',
      email: 'aditi@campus.edu',
      password: 'hashedSecretPasswordValue',
      role: 'user'
    });

    const json = user.toJSON();
    assert.equal(json.password, undefined, 'password must not be present in toJSON');
    assert.equal(json.__v, undefined, '__v must not be present in toJSON');
    assert.ok(json.id, 'virtual id should be present in toJSON');

    const safeObj = user.toSafeObject();
    assert.equal(safeObj.password, undefined, 'password must not be present in toSafeObject');
    assert.equal(safeObj.name, 'Aditi Verma');
    assert.equal(safeObj.email, 'aditi@campus.edu');
  });

  await t.test('comparePassword method compares correctly with bcrypt hash', async () => {
    const plain = 'mySecretPass123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plain, salt);

    const user = new User({
      name: 'Secure User',
      email: 'secure@campus.edu',
      password: hash
    });

    const isMatch = await user.comparePassword(plain);
    assert.equal(isMatch, true, 'Correct password must match hash');

    const isMismatch = await user.comparePassword('wrongPassword');
    assert.equal(isMismatch, false, 'Incorrect password must not match hash');
  });
});
