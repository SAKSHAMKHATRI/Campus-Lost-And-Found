const mongoose = require('mongoose');
const Item = require('../models/Item');

/**
 * Validates whether a given string is a valid 24-character hexadecimal MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * @desc    Create a new lost or found item report
 * @route   POST /api/items
 * @access  Public
 */
const createItem = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required to create an item report'
      });
    }

    // Support frontend property 'itemName' as fallback for 'title'
    if (req.body.itemName && !req.body.title) {
      req.body.title = req.body.itemName;
    }

    const item = await Item.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Item report created successfully',
      data: item
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        errors: messages
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all items, with optional filter by ?type=lost or ?type=found
 * @route   GET /api/items
 * @access  Public
 */
const getItems = async (req, res, next) => {
  try {
    const filter = {};

    // Validate and apply 'type' query filter if provided
    if (req.query.type) {
      const normalizedType = req.query.type.toLowerCase().trim();
      if (!['lost', 'found'].includes(normalizedType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type filter. Type query parameter must be either "lost" or "found"'
        });
      }
      filter.type = normalizedType;
    }

    // Optional category filter
    if (req.query.category) {
      filter.category = req.query.category.trim();
    }

    // Optional location filter
    if (req.query.location) {
      filter.location = req.query.location.trim();
    }

    // Optional status filter
    if (req.query.status) {
      filter.status = req.query.status.trim();
    }

    // Optional text search across title and description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Execute query sorted by newest first
    let query = Item.find(filter);
    if (query && typeof query.sort === 'function') {
      query = query.sort({ createdAt: -1 });
    }
    const items = await query;

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single item report by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid item ID format: '${id}'. Must be a 24-character hexadecimal string.`
      });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item not found with ID: '${id}'`
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing item report
 * @route   PUT /api/items/:id
 * @access  Public
 */
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid item ID format: '${id}'. Must be a 24-character hexadecimal string.`
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body cannot be empty for an update'
      });
    }

    // Validate type if updating type
    if (req.body.type && !['lost', 'found'].includes(req.body.type.toLowerCase().trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Type must be either "lost" or "found"'
      });
    }

    // Support frontend property 'itemName'
    if (req.body.itemName && !req.body.title) {
      req.body.title = req.body.itemName;
    }

    const updatedItem = await Item.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: `Item not found with ID: '${id}'`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item report updated successfully',
      data: updatedItem
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        errors: messages
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete an item report
 * @route   DELETE /api/items/:id
 * @access  Public
 */
const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid item ID format: '${id}'. Must be a 24-character hexadecimal string.`
      });
    }

    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item not found with ID: '${id}'`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item report deleted successfully',
      data: { id: id }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  isValidObjectId
};
