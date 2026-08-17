/* ============================================================
   items.js — shared helpers for lost / found items
   ------------------------------------------------------------
   Everything the report form, the browse page, the dashboard
   and the match page need in common:
     - the fixed option lists (categories, colours, campus zones)
     - the item card HTML (with the status lifecycle badge)
     - the weighted match score (maximum 10) + match strength
     - the smart claim-verification helpers
   ============================================================ */

// Fixed option lists — used by the post form AND the browse
// filters, so every page always offers exactly the same choices.
const CATEGORIES = ['Electronics', 'Books & Notes', 'Bags & Backpacks', 'Clothing & Accessories', 'ID Cards & Documents', 'Keys', 'Bottles & Lunchboxes', 'Other'];
const COLORS = ['Black', 'White', 'Grey', 'Blue', 'Red', 'Green', 'Yellow', 'Orange', 'Pink', 'Brown', 'Multi-colour'];

// Campus zones — a fixed dropdown (instead of free text), so that
// matching and filtering always compare exactly the same zone names.
const LOCATIONS = ['Main Gate', 'Library', 'Academic Block', 'Lecture Halls', 'Canteen', 'Hostel', 'Sports Complex', 'Parking', 'Labs', 'Other'];

/* ---------- Shared inline SVG icons ---------- */

// One consistent stroke style used across the whole UI (nav, cards,
// tables, empty states). Kept in one place so every page looks the same.
const ICON = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  category: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
  color: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  arrowLR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  xCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  fileText: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  userX: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 8 5 5"/><path d="m22 8-5 5"/></svg>',
  userCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
};

/* ---------- Item status lifecycle (feature #5) ---------- */

// Every report moves through the same stages:
//   open (Lost/Found) -> match-found -> claim-requested
//                       -> verified -> returned
const STATUS_LABELS = {
  'open': 'Open',
  'match-found': 'Match Found',
  'claim-requested': 'Claim Requested',
  'verified': 'Verified',
  'returned': 'Returned'
};

// A report is "resolved" once it has been verified or returned,
// so it should not be offered as a new match suggestion anymore.
function isResolved(item) {
  return item.status === 'verified' || item.status === 'returned';
}

// Badge showing the current lifecycle status on a card.
// The initial "open" stage is already shown by the LOST / FOUND badge.
function statusBadgeHTML(item) {
  const status = item.status || 'open';
  if (status === 'open') return '';
  const label = STATUS_LABELS[status] || status;
  return '<span class="badge badge-status badge-status-' + status + '">' + label + '</span>';
}

// Plain-text status label (used in the "My Reports" table).
function statusLabel(item) {
  return STATUS_LABELS[item.status || 'open'];
}

/* ---------- Small display helpers ---------- */

// Turn <, >, & etc. into safe text so a description can't break the page.
function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

// "2026-08-08" -> "Aug 8, 2026"
function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString + 'T00:00:00'); // treat it as a local date
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Fill a <select> with the options from one of the lists above.
// placeholder becomes the first, empty option (e.g. "Select a category").
function fillSelect(selectId, options, placeholder) {
  const select = document.getElementById(selectId);
  let html = '<option value="">' + placeholder + '</option>';
  options.forEach(function (option) {
    html += '<option value="' + option + '">' + option + '</option>';
  });
  select.innerHTML = html;
}

/* ---------- Item card (used on Browse + Dashboard) ---------- */

// Returns the HTML for one item, with its LOST / FOUND badge and
// its current lifecycle status badge (features #5 and #7).
// The private verification detail is NEVER rendered here.
function itemCardHTML(item) {
  const isLost = item.type === 'lost';
  return (
    '<article class="item-card' + (isResolved(item) ? ' item-resolved' : '') + '">' +
      '<div class="item-card-top">' +
        '<span class="badge ' + (isLost ? 'badge-lost' : 'badge-found') + '">' + (isLost ? 'LOST' : 'FOUND') + '</span>' +
        statusBadgeHTML(item) +
        '<span class="item-date">' + ICON.calendar + ' ' + formatDate(item.date) + '</span>' +
      '</div>' +
      '<h3 class="item-name">' + escapeHTML(item.itemName) + '</h3>' +
      '<ul class="item-meta">' +
        '<li>' + ICON.category + escapeHTML(item.category) + '</li>' +
        '<li>' + ICON.color + escapeHTML(item.color) + '</li>' +
        '<li>' + ICON.pin + escapeHTML(item.location) + '</li>' +
      '</ul>' +
      '<p class="item-desc">' + escapeHTML(item.description) + '</p>' +
      '<p class="item-posted-by">Reported by ' + escapeHTML(item.postedBy ? item.postedBy.name : 'Unknown') + '</p>' +
    '</article>'
  );
}

/* ---------- Match score (maximum 10) ---------- */

// How many days apart two dates are (always a positive number).
function daysBetween(dateA, dateB) {
  const a = new Date(dateA + 'T00:00:00');
  const b = new Date(dateB + 'T00:00:00');
  return Math.abs((a - b) / (1000 * 60 * 60 * 24));
}

// Split text into meaningful lowercase words (ignores short & common words).
function textToWords(text) {
  const stopWords = ['the', 'and', 'for', 'with', 'was', 'my', 'its', 'it', 'in', 'on', 'at', 'to', 'a', 'of', 'is', 'are', 'this', 'that', 'i', 'have', 'has', 'had', 'found', 'lost', 'item', 'there', 'be', 'by', 'an', 'as'];
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(function (word) { return word.length > 3 && stopWords.indexOf(word) === -1; });
}

// Words that appear in BOTH texts (meaningful words only).
function sharedWords(textA, textB) {
  const wordsA = new Set(textToWords(textA));
  const wordsB = textToWords(textB);
  return wordsB.filter(word => wordsA.has(word));
}

// True when the two descriptions share at least one meaningful word.
function hasSharedKeyword(descriptionA, descriptionB) {
  return sharedWords(descriptionA, descriptionB).length > 0;
}

// Score one LOST item against one FOUND item (feature #2).
// Returns { score, max, reasons } — max is always 10.
// Each reason includes the points, so the "why" is shown clearly:
//   Same category            = +3
//   Same colour              = +2
//   Same campus zone         = +2
//   Dates within 3 days      = +2
//   Shared description word  = +1
function getMatchScore(lostItem, foundItem) {
  let score = 0;
  const reasons = [];

  // 1) Same category = +3
  if (lostItem.category === foundItem.category) {
    score += 3;
    reasons.push('Same category +3');
  }

  // 2) Same colour = +2
  if (lostItem.color === foundItem.color) {
    score += 2;
    reasons.push('Same colour +2');
  }

  // 3) Same campus zone = +2
  if (lostItem.location === foundItem.location) {
    score += 2;
    reasons.push('Same campus zone +2');
  }

  // 4) Dates within 3 days of each other = +2
  if (daysBetween(lostItem.date, foundItem.date) <= 3) {
    score += 2;
    reasons.push('Dates within 3 days +2');
  }

  // 5) At least one shared description keyword = +1
  if (hasSharedKeyword(lostItem.description, foundItem.description)) {
    score += 1;
    reasons.push('Shared description keyword +1');
  }

  return { score: score, max: 10, reasons: reasons };
}

// Turn a score into a strength label (feature #3).
//   8-10 = Strong Match, 5-7 = Possible Match, 1-4 = Weak Match
function matchStrength(score) {
  if (score >= 8) return { label: 'Strong Match', className: 'strength-strong' };
  if (score >= 5) return { label: 'Possible Match', className: 'strength-possible' };
  return { label: 'Weak Match', className: 'strength-weak' };
}

/* ---------- Smart claim verification (feature #4) ---------- */

// Compare a claimant's answer against the finder's private detail.
// Returns { ok, message } — "ok: true" means the claim is VERIFIED.
// Rule: the answer must share at least one meaningful keyword with
// the private detail the finder recorded when posting the item.
function verifyClaim(foundItem, claimantAnswer) {
  const detail = String(foundItem.verificationDetail || '').trim();
  const answer = String(claimantAnswer || '').trim();

  // No private detail was recorded -> nothing to compare, accept the claim.
  if (detail === '') {
    return { ok: true, message: 'The finder did not record a private detail, so the claim was accepted.' };
  }
  if (answer === '') {
    return { ok: false, message: 'Please describe an identifying detail first.' };
  }

  const shared = sharedWords(detail, answer);
  if (shared.length > 0) {
    return { ok: true, message: 'Verified! Your answer matches the private detail the finder recorded.' };
  }
  return { ok: false, message: 'Verification failed. Your answer did not match the private detail the finder recorded.' };
}

// "Mark as returned" — resolves a verified report and its matched pair.
// Only a VERIFIED report can be marked as returned.
function markItemReturned(itemId) {
  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (!item || item.status !== 'verified') return false;

  item.status = 'returned';
  if (item.matchedWithId) {
    const other = items.find(i => i.id === item.matchedWithId);
    if (other && other.status !== 'returned') {
      other.status = 'returned';
    }
  }
  saveItems(items);
  return true;
}
