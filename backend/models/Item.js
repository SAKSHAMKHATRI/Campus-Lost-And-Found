const mongoose = require('mongoose');

/**
 * Valid item types allowed in the system
 */
const VALID_TYPES = ['lost', 'found'];

/**
 * Valid item status lifecycles
 */
const VALID_STATUSES = ['open', 'match-found', 'claim-requested', 'verified', 'returned'];

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long']
    },
    type: {
      type: String,
      required: [true, 'Item type is required'],
      enum: {
        values: VALID_TYPES,
        message: 'Type must be either "lost" or "found"'
      },
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters long']
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: 'Status must be one of: open, match-found, claim-requested, verified, returned'
      },
      default: 'open',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for frontend compatibility: maps 'itemName' to 'title'
itemSchema
  .virtual('itemName')
  .get(function () {
    return this.title;
  })
  .set(function (val) {
    this.title = val;
  });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
