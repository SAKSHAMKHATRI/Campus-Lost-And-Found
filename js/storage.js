/* ============================================================
   storage.js — LocalStorage helpers
   ------------------------------------------------------------
   This file contains all the small functions that read and
   write data in the browser's LocalStorage.
   Every other script uses these helpers, so we always work
   with LocalStorage in the same safe way.

   LocalStorage can only store TEXT, so before saving we use
   JSON.stringify() (object -> text) and after reading we use
   JSON.parse() (text -> object).
   ============================================================ */

// The "keys" (names) under which we store our data in LocalStorage
const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const ITEMS_KEY = 'items';
const CLAIMS_KEY = 'claims';
const ACTIVITY_KEY = 'adminActivity';

/* ---------- Registered users ---------- */

// Get the list of registered users.
// If nothing is stored yet, return an empty array (the || [] trick).
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

/* ---------- Lost / found items ---------- */

// Get all posted items (both lost and found in one list).
// Every item has a "type" field: 'lost' or 'found'.
function getItems() {
  const stored = localStorage.getItem(ITEMS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save all items back into LocalStorage.
function saveItems(items) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

// Add one new item (lost or found) to the stored list.
function addItem(item) {
  const items = getItems();
  items.push(item);
  saveItems(items);
}

/* ---------- Claims (admin panel feature) ---------- */

// A claim links one LOST item (the claimant) to one FOUND item.
// Status: 'pending' (waiting for the admin) -> 'approved' or 'rejected'.
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

/* ---------- Admin activity log ---------- */

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

/* ---------- Demo admin account (Phase 1 only) ---------- */

// Creates the demo admin account on first run and makes sure every user
// has the new "role" and "active" fields (legacy users get sensible defaults).
// NOTE: this is Phase 1 / demo-only security. Phase 2 will replace this
// with a real backend (Node.js) and JWT-based authorization.
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
