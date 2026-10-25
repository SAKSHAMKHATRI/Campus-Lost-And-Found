// ==========================================
// Central API Configuration & Endpoints
// ==========================================
const API_BASE_URL = window.API_BASE_URL || 'https://campus-lost-and-found-r1d3.onrender.com/api';

// The "keys" (names) under which we store our data in LocalStorage
const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const ITEMS_KEY = 'items';
const CLAIMS_KEY = 'claims';
const ACTIVITY_KEY = 'adminActivity';

/**
 * Normalizes an item object returned from MongoDB / API
 * ensuring backward-compatible field names (id, itemName, title).
 */
function normalizeItem(raw) {
  if (!raw) return null;
  const item = { ...raw };
  item.id = item._id || item.id;
  item.itemName = item.itemName || item.title || 'Untitled Item';
  item.title = item.title || item.itemName;
  if (item.date && typeof item.date === 'string' && item.date.includes('T')) {
    item.date = item.date.split('T')[0];
  }
  return item;
}

/**
 * Fetch all items from the deployed backend API (MongoDB)
 * @param {string} [type] - Optional filter ('lost' or 'found')
 * @returns {Promise<Array>} List of normalized items
 */
async function fetchItemsAPI(type) {
  const url = type
    ? `${API_BASE_URL}/items?type=${encodeURIComponent(type)}`
    : `${API_BASE_URL}/items`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch items (HTTP ${response.status})`);
  }

  const result = await response.json();
  const items = Array.isArray(result.data) ? result.data.map(normalizeItem) : [];

  // Update local storage cache with live backend data
  if (!type && items.length > 0) {
    saveItems(items);
  }
  return items;
}

/**
 * Create a new lost/found item report on the deployed backend API (MongoDB)
 * @param {Object} itemData - Item form data
 * @returns {Promise<Object>} Created and normalized item
 */
async function createItemAPI(itemData) {
  const payload = {
    title: itemData.itemName || itemData.title,
    itemName: itemData.itemName || itemData.title,
    type: itemData.type,
    category: itemData.category,
    description: itemData.description,
    location: itemData.location,
    date: itemData.date,
    color: itemData.color || '',
    verificationDetail: itemData.verificationDetail || '',
    postedBy: itemData.postedBy || { id: Date.now(), name: 'Student' }
  };

  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || `Failed to create report (HTTP ${response.status})`);
  }

  const createdItem = normalizeItem(result.data);
  // Also store in local cache
  addItem(createdItem);
  return createdItem;
}

/**
 * Update an existing report on the deployed backend API (MongoDB)
 * @param {string} id - Item ID
 * @param {Object} updateData - Updated fields
 * @returns {Promise<Object>} Updated item
 */
async function updateItemAPI(id, updateData) {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(updateData)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || `Failed to update report (HTTP ${response.status})`);
  }
  return normalizeItem(result.data);
}

/**
 * Delete a report from the deployed backend API (MongoDB)
 * @param {string} id - Item ID
 * @returns {Promise<boolean>}
 */
async function deleteItemAPI(id) {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || `Failed to delete report (HTTP ${response.status})`);
  }
  return true;
}

/* ---------- Local Cache & Storage Fallbacks ---------- */

// Get the list of registered users.
function getUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save the list of users back into LocalStorage (as text).
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ---------- Current user (the "session") ---------- */

// Get the user who is currently logged in, or null if nobody is logged in.
function getCurrentUser() {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Save the logged-in user — this is what "logging in" means in Phase 1.
function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// Remove the logged-in user — this is what "logging out" means.
function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Get all posted items (both lost and found in one list).
function getItems() {
  const stored = localStorage.getItem(ITEMS_KEY);
  return stored ? JSON.parse(stored).map(normalizeItem) : [];
}

// Save all items back into LocalStorage.
function saveItems(items) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

// Add one new item (lost or found) to the stored list.
function addItem(item) {
  const items = getItems();
  items.unshift(normalizeItem(item));
  saveItems(items);
}

// A claim links one LOST item (the claimant) to one FOUND item.
function getClaims() {
  const stored = localStorage.getItem(CLAIMS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveClaims(claims) {
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
}

// Add a new claim to the stored list.
function addClaim(claim) {
  const claims = getClaims();
  claims.push(claim);
  saveClaims(claims);
}

// A simple history of the admin's actions, shown on the admin dashboard.
function getActivityLog() {
  const stored = localStorage.getItem(ACTIVITY_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveActivityLog(log) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log));
}

// Add one entry { action, details, timestamp } — newest first, max 50.
function addActivityLog(action, details) {
  const log = getActivityLog();
  log.unshift({ id: Date.now() + Math.floor(Math.random() * 1000), action: action, details: details, timestamp: Date.now() });
  if (log.length > 50) log.length = 50;
  saveActivityLog(log);
}

function ensureAdminAccount() {
  const users = getUsers();
  let changed = false;

  // Every user needs a role and an active flag.
  users.forEach(function (u) {
    if (!u.role) { u.role = 'user'; changed = true; }
    if (u.active === undefined) { u.active = true; changed = true; }
  });

  // If there is no admin yet, create the demo admin account.
  const adminExists = users.some(u => u.role === 'admin');
  if (!adminExists) {
    users.push({
      id: Date.now(),
      name: 'Campus Admin',
      email: 'admin@campus.edu',
      password: 'admin123',
      role: 'admin',
      active: true,
      createdAt: Date.now()
    });
    changed = true;
  }

  if (changed) saveUsers(users);
}

// Run once on every page load (this file is loaded everywhere).
ensureAdminAccount();
