const test = require('node:test');
const assert = require('node:assert/strict');
const Item = require('../models/Item');

test('Item Model & Schema Validation (Offline / In-Memory)', async (t) => {
  await t.test('Valid Item passes schema validation', () => {
    const validItem = new Item({
      title: 'Blue Water Bottle',
      type: 'lost',
      category: 'Bottles & Lunchboxes',
      description: 'Milton stainless steel bottle left in library',
      location: 'Library',
      date: new Date('2026-10-24'),
      color: 'Blue'
    });

    const error = validItem.validateSync();
    assert.equal(error, undefined, 'Valid item should not return validation errors');
    assert.equal(validItem.status, 'open', 'Default status should be "open"');
    assert.equal(validItem.imageUrl, '', 'Default imageUrl should be empty string');
  });

  await t.test('Missing required fields should fail validation', () => {
    const emptyItem = new Item({});
    const error = emptyItem.validateSync();

    assert.ok(error, 'Should produce a validation error');
    assert.ok(error.errors.title, 'Title should be required');
    assert.ok(error.errors.type, 'Type should be required');
    assert.ok(error.errors.category, 'Category should be required');
    assert.ok(error.errors.description, 'Description should be required');
    assert.ok(error.errors.location, 'Location should be required');
    assert.ok(error.errors.date, 'Date should be required');
  });

  await t.test('Invalid type should be rejected by enum validation', () => {
    const invalidTypeItem = new Item({
      title: 'Smart Watch',
      type: 'stolen', // Invalid: must be 'lost' or 'found'
      category: 'Electronics',
      description: 'Black smartwatch',
      location: 'Main Gate',
      date: new Date()
    });

    const error = invalidTypeItem.validateSync();
    assert.ok(error, 'Validation error expected');
    assert.ok(error.errors.type, 'Type error expected');
    assert.match(error.errors.type.message, /Type must be either "lost" or "found"/);
  });

  await t.test('Allowed types "lost" and "found" should both pass', () => {
    const lostItem = new Item({
      title: 'Calculus Textbook',
      type: 'lost',
      category: 'Books & Notes',
      description: 'Stewart Calculus 8th edition',
      location: 'Academic Block',
      date: new Date()
    });
    assert.equal(lostItem.validateSync(), undefined);

    const foundItem = new Item({
      title: 'Student ID Card',
      type: 'found',
      category: 'ID Cards & Documents',
      description: 'Found on stairs of Canteen',
      location: 'Canteen',
      date: new Date()
    });
    assert.equal(foundItem.validateSync(), undefined);
  });

  await t.test('Fallback for frontend property "itemName" into "title"', () => {
    const frontendFormattedItem = new Item({
      itemName: 'Scientific Calculator fx-991EX',
      type: 'found',
      category: 'Electronics',
      description: 'Casio calculator left on desk 402',
      location: 'Lecture Halls',
      date: new Date()
    });

    const error = frontendFormattedItem.validateSync();
    assert.equal(error, undefined, 'Item with itemName should validate successfully');
    assert.equal(frontendFormattedItem.title, 'Scientific Calculator fx-991EX');
  });

  await t.test('Invalid status value should be rejected', () => {
    const item = new Item({
      title: 'Keys',
      type: 'lost',
      category: 'Keys',
      description: 'Ring of 3 keys with red tag',
      location: 'Hostel',
      date: new Date(),
      status: 'destroyed' // Invalid status
    });

    const error = item.validateSync();
    assert.ok(error && error.errors.status, 'Invalid status must be rejected');
  });
});
