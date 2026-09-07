requireAdmin();



const ADMIN_TABS = ['dashboard', 'users', 'reports', 'claims', 'matches', 'data'];

function showTab(tab) {
  ADMIN_TABS.forEach(function (name) {
    const section = document.getElementById('tab' + name.charAt(0).toUpperCase() + name.slice(1));
    if (section) section.style.display = (name === tab) ? 'block' : 'none';
  });
  document.querySelectorAll('.admin-tab').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Render the right content for the tab.
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'users') renderUsers();
  if (tab === 'reports') renderReports();
  if (tab === 'claims') renderClaims();
  if (tab === 'matches') renderMatchesOverview();
  if (tab === 'data') renderDataSelects();
}

// Small helpers used across the tables.
function adminItemName(item) {
  return item ? escapeHTML(item.itemName) : '<em>item removed</em>';
}

// Safe "date (time ago)" text for a timestamp, never crashes on bad data.
function formatTimestamp(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '—';
  return formatDate(date.toISOString().slice(0, 10)) + ' (' + timeAgo(timestamp) + ')';
}

function timeAgo(timestamp) {
  if (!timestamp) return '—';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  return days + 'd ago';
}

/* ---------- DASHBOARD TAB ---------- */

function renderDashboard() {
  const users = getUsers();
  const items = getItems();
  const claims = getClaims();

  const lostItems = items.filter(i => i.type === 'lost');
  const foundItems = items.filter(i => i.type === 'found');
  const returned = items.filter(i => i.status === 'returned');
  const pendingClaims = claims.filter(c => c.status === 'pending');

  // Active matches = pairs with a score > 0 where neither item is returned.
  let activeMatches = 0;
  lostItems.forEach(function (lost) {
    foundItems.forEach(function (found) {
      if (lost.status !== 'returned' && found.status !== 'returned' && getMatchScore(lost, found).score > 0) {
        activeMatches++;
      }
    });
  });

  document.getElementById('statUsers').textContent = users.length;
  document.getElementById('statLost').textContent = lostItems.length;
  document.getElementById('statFound').textContent = foundItems.length;
  document.getElementById('statMatches').textContent = activeMatches;
  document.getElementById('statClaims').textContent = pendingClaims.length;
  document.getElementById('statReturned').textContent = returned.length;

  // Latest admin actions.
  const log = getActivityLog();
  const list = document.getElementById('activityList');
  const empty = document.getElementById('activityEmpty');

  if (log.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = log.slice(0, 8).map(function (entry) {
    const icon = {
      'User deleted': ICON.trash,
      'User deactivated': ICON.userX,
      'User activated': ICON.userCheck,
      'Report deleted': ICON.trash,
      'Report edited': ICON.edit,
      'Report marked returned': ICON.checkCircle,
      'Claim approved': ICON.checkCircle,
      'Claim rejected': ICON.xCircle,
      'Reports cleared': ICON.trash,
      'Users cleared': ICON.users,
      'Demo data reset': ICON.refresh
    }[entry.action] || ICON.fileText;
    return (
      '<li class="activity-item">' +
        '<span class="activity-icon">' + icon + '</span>' +
        '<div class="activity-text">' +
          '<strong>' + escapeHTML(entry.action) + '</strong>' +
          '<span>' + escapeHTML(entry.details) + '</span>' +
        '</div>' +
        '<span class="activity-time">' + timeAgo(entry.timestamp) + '</span>' +
      '</li>'
    );
  }).join('');
}

/* ---------- USERS TAB ---------- */

function renderUsers() {
  // Admins first, then everyone else sorted by name (simple and readable).
  const users = getUsers().slice().sort(function (a, b) {
    const aAdmin = getUserRole(a) === 'admin';
    const bAdmin = getUserRole(b) === 'admin';
    if (aAdmin && !bAdmin) return -1;
    if (bAdmin && !aAdmin) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });
  const currentUser = getCurrentUser();
  const body = document.getElementById('userTableBody');

  document.getElementById('userCount').textContent =
    users.length === 1 ? '1 user' : users.length + ' users';

  body.innerHTML = users.map(function (user) {
    const isSelf = currentUser && user.id === currentUser.id;
    const isAdminUser = getUserRole(user) === 'admin';
    const active = user.active !== false;

    let actions = '';
    if (isSelf) {
      actions = '<span class="match-note">(your account)</span>';
    } else {
      actions =
        '<button type="button" class="btn btn-small ' + (active ? 'btn-warn' : 'btn-success') + '" onclick="toggleUserActive(' + user.id + ')">' +
          (active ? 'Deactivate' : 'Activate') + '</button> ' +
        '<button type="button" class="btn btn-small btn-danger" onclick="askDeleteUser(' + user.id + ')">Delete</button>';
    }

    return (
      '<tr>' +
        '<td class="table-item"><strong>' + escapeHTML(user.name) + '</strong></td>' +
        '<td>' + escapeHTML(user.email) + '</td>' +
        '<td><span class="badge ' + (isAdminUser ? 'badge-role-admin' : 'badge-role-user') + '">' + (isAdminUser ? 'ADMIN' : 'USER') + '</span></td>' +
        '<td><span class="badge ' + (active ? 'badge-active' : 'badge-inactive') + '">' + (active ? 'Active' : 'Inactive') + '</span></td>' +
        '<td>' + actions + '</td>' +
      '</tr>'
    );
  }).join('');
}

// Activate / deactivate a user. Deactivated users cannot log in.
function toggleUserActive(userId) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  const currentUser = getCurrentUser();
  if (!user || !currentUser || user.id === currentUser.id) return; // never disable yourself

  user.active = (user.active === false);
  saveUsers(users);
  addActivityLog(user.active ? 'User activated' : 'User deactivated',
    user.name + ' (' + user.email + ')');
  renderUsers();
}

// Ask for confirmation before deleting a user.
function askDeleteUser(userId) {
  const user = getUsers().find(u => u.id === userId);
  if (!user) return;

  // Safety guard: the admin can never delete their own logged-in account.
  const currentUser = getCurrentUser();
  if (currentUser && user.id === currentUser.id) {
    showAlert('adminAlert', 'You cannot delete your own admin account.', 'error');
    return;
  }
  openConfirm(
    'Delete user?',
    'Delete "' + user.name + '" (' + user.email + ')? They will no longer be able to log in. ' +
    'Their reports stay in the system. This cannot be undone.',
    function () {
      const users = getUsers();
      saveUsers(users.filter(u => u.id !== userId));
      addActivityLog('User deleted', user.name + ' (' + user.email + ')');
      showAlert('adminAlert', 'User "' + user.name + '" deleted.', 'success');
      renderUsers();
      renderDashboard();
    }
  );
}

/* ---------- REPORTS TAB ---------- */

// Current filters for the reports table.
const adminReportFilters = { search: '', type: '', status: '' };

function renderReports() {
  const items = getItems().slice().sort((a, b) => b.createdAt - a.createdAt);
  const searchText = adminReportFilters.search;
  const body = document.getElementById('adminReportBody');

  const filtered = items.filter(function (item) {
    const haystack = (item.itemName + ' ' + item.category + ' ' + item.color + ' ' + item.location + ' ' +
      (item.postedBy ? item.postedBy.name : '') + ' ' + item.description).toLowerCase();
    const matchesSearch = searchText === '' || haystack.indexOf(searchText) !== -1;
    const matchesType = adminReportFilters.type === '' || item.type === adminReportFilters.type;
    const matchesStatus = adminReportFilters.status === '' || (item.status || 'open') === adminReportFilters.status;
    return matchesSearch && matchesType && matchesStatus;
  });

  document.getElementById('adminReportCount').textContent =
    filtered.length === 1 ? '1 report' : filtered.length + ' reports';

  if (filtered.length === 0) {
    body.innerHTML = '<tr><td colspan="8"><div class="empty-state">No reports match your filters.</div></td></tr>';
    return;
  }

  body.innerHTML = filtered.map(function (item) {
    const isLost = item.type === 'lost';
    return (
      '<tr>' +
        '<td class="table-item"><strong>' + escapeHTML(item.itemName) + '</strong></td>' +
        '<td><span class="badge ' + (isLost ? 'badge-lost' : 'badge-found') + '">' + (isLost ? 'LOST' : 'FOUND') + '</span></td>' +
        '<td>' + escapeHTML(item.category) + '</td>' +
        '<td>' + ICON.pin + ' ' + escapeHTML(item.location) + '</td>' +
        '<td>' + formatDate(item.date) + '</td>' +
        '<td>' + escapeHTML(item.postedBy ? item.postedBy.name : 'Unknown') + '</td>' +
        '<td><span class="badge badge-status badge-status-' + (item.status || 'open') + '">' + statusLabel(item) + '</span></td>' +
        '<td class="action-cell">' +
          '<button type="button" class="btn btn-small" onclick="openEditReport(' + item.id + ')">' + ICON.edit + ' Edit</button> ' +
          '<button type="button" class="btn btn-small btn-success" onclick="adminMarkReturned(' + item.id + ')">' + ICON.checkCircle + ' Return</button> ' +
          '<button type="button" class="btn btn-small btn-danger" onclick="askDeleteReport(' + item.id + ')">' + ICON.trash + ' Delete</button>' +
        '</td>' +
      '</tr>'
    );
  }).join('');
}

// Admin can force-mark any report (and its matched pair) as Returned.
function adminMarkReturned(itemId) {
  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  item.status = 'returned';
  const linkedIds = [itemId];
  if (item.matchedWithId) {
    linkedIds.push(item.matchedWithId);
    const other = items.find(i => i.id === item.matchedWithId);
    if (other && other.status !== 'returned') other.status = 'returned';
  }
  saveItems(items);

  // Close any pending claims that reference this item (it is resolved now).
  const claims = getClaims();
  let claimsChanged = false;
  claims.forEach(function (claim) {
    if (claim.status === 'pending' && linkedIds.indexOf(claim.lostItemId) !== -1) {
      claim.status = 'rejected';
      claim.decidedAt = Date.now();
      claim.decidedBy = getCurrentUser().name;
      claimsChanged = true;
    }
  });
  if (claimsChanged) saveClaims(claims);

  addActivityLog('Report marked returned', item.itemName + ' marked as returned by admin.');
  showAlert('adminAlert', '"' + item.itemName + '" marked as returned.', 'success');
  renderReports();
  renderClaims();
  renderDashboard();
}

// Ask for confirmation before deleting one report.
function askDeleteReport(itemId) {
  const item = getItems().find(i => i.id === itemId);
  if (!item) return;
  openConfirm(
    'Delete report?',
    'Delete the ' + item.type.toUpperCase() + ' report "' + item.itemName + '"? This cannot be undone.',
    function () {
      saveItems(getItems().filter(i => i.id !== itemId));
      addActivityLog('Report deleted', item.itemName + ' (' + item.type + ')');
      showAlert('adminAlert', 'Report "' + item.itemName + '" deleted.', 'success');
      renderReports();
      renderDashboard();
      renderDataSelects();
    }
  );
}

// Remove all verified / returned (resolved) reports.
function clearResolvedReports() {
  const resolved = getItems().filter(i => i.status === 'verified' || i.status === 'returned');
  if (resolved.length === 0) {
    showAlert('adminAlert', 'There are no resolved reports to remove.', 'error');
    return;
  }
  openConfirm(
    'Remove resolved reports?',
    'Delete all ' + resolved.length + ' verified / returned report(s)? This cannot be undone.',
    function () {
      saveItems(getItems().filter(i => i.status !== 'verified' && i.status !== 'returned'));
      addActivityLog('Reports cleared', 'Removed ' + resolved.length + ' resolved report(s).');
      showAlert('adminAlert', resolved.length + ' resolved report(s) removed.', 'success');
      renderReports();
      renderDashboard();
      renderDataSelects();
    }
  );
}

/* ---------- EDIT REPORT MODAL ---------- */

let editingReportId = null;

function openEditReport(itemId) {
  const item = getItems().find(i => i.id === itemId);
  if (!item) return;
  editingReportId = itemId;

  document.getElementById('editItemName').value = item.itemName;
  fillSelect('editCategory', CATEGORIES, 'Select a category');
  fillSelect('editColor', COLORS, 'Select a color');
  fillSelect('editLocation', LOCATIONS, 'Select a campus zone');
  document.getElementById('editCategory').value = item.category;
  document.getElementById('editColor').value = item.color;
  document.getElementById('editLocation').value = item.location;
  document.getElementById('editDate').value = item.date;
  document.getElementById('editDescription').value = item.description;

  const alert = document.getElementById('editAlert');
  alert.style.display = 'none';

  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  editingReportId = null;
  document.getElementById('editModal').style.display = 'none';
}

function saveEditedReport() {
  if (!editingReportId) return;
  const items = getItems();
  const item = items.find(i => i.id === editingReportId);
  if (!item) return;

  const itemName = document.getElementById('editItemName').value.trim();
  const category = document.getElementById('editCategory').value;
  const color = document.getElementById('editColor').value;
  const location = document.getElementById('editLocation').value;
  const date = document.getElementById('editDate').value;
  const description = document.getElementById('editDescription').value.trim();

  if (itemName === '' || category === '' || color === '' || location === '' || date === '' || description === '') {
    showAlert('editAlert', 'All fields are required.', 'error');
    return;
  }

  item.itemName = itemName;
  item.category = category;
  item.color = color;
  item.location = location;
  item.date = date;
  item.description = description;
  saveItems(items);

  addActivityLog('Report edited', item.itemName + ' edited by admin.');
  showAlert('adminAlert', 'Report updated.', 'success');
  closeEditModal();
  renderReports();
  renderDashboard();
  renderDataSelects();
}

/* ---------- CLAIMS TAB ---------- */

// Which claim filter is active: 'pending' | 'approved' | 'rejected' | 'all'
let claimFilter = 'pending';

function setClaimFilter(filter) {
  claimFilter = filter;
  document.querySelectorAll('.chip[data-claim-filter]').forEach(function (chip) {
    chip.classList.toggle('active', chip.dataset.claim-filter === filter);
  });
  renderClaims();
}

function renderClaims() {
  const claims = getClaims().slice().sort((a, b) => b.createdAt - a.createdAt);
  const items = getItems();
  const filtered = claims.filter(c => claimFilter === 'all' || c.status === claimFilter);
  const body = document.getElementById('claimBody');

  document.getElementById('claimCount').textContent =
    filtered.length === 1 ? '1 claim' : filtered.length + ' claims';

  if (filtered.length === 0) {
    body.innerHTML = '<tr><td colspan="9"><div class="empty-state">No claims in this view.</div></td></tr>';
    return;
  }

  body.innerHTML = filtered.map(function (claim) {
    const lost = items.find(i => i.id === claim.lostItemId);
    const found = items.find(i => i.id === claim.foundItemId);
    const pending = claim.status === 'pending';
    const statusBadge = pending
      ? '<span class="badge badge-status-claim-requested">Pending</span>'
      : (claim.status === 'approved'
        ? '<span class="badge badge-status-verified">Approved</span>'
        : '<span class="badge badge-status-returned">Rejected</span>');

    let actions = '';
    if (pending) {
      actions =
        '<button type="button" class="btn btn-small btn-success" onclick="approveClaim(' + claim.id + ')">' + ICON.check + ' Approve</button> ' +
        '<button type="button" class="btn btn-small btn-danger" onclick="rejectClaim(' + claim.id + ')">' + ICON.x + ' Reject</button>';
    } else {
      actions = '<span class="match-note">Decided by ' + escapeHTML(claim.decidedBy || 'admin') + '</span>';
    }

    return (
      '<tr>' +
        '<td class="table-item"><strong>' + escapeHTML(claim.claimantName) + '</strong></td>' +
        '<td>' + adminItemName(lost) + '</td>' +
        '<td>' + adminItemName(found) + '</td>' +
        '<td class="claim-detail">' + escapeHTML(claim.answer || '—') + '</td>' +
        '<td><span class="badge ' + (claim.autoVerified ? 'badge-active' : 'badge-inactive') + '">' +
          (claim.autoVerified ? ICON.check + ' Yes' : ICON.x + ' No') + '</span></td>' +
        '<td class="claim-detail">' + escapeHTML(found ? (found.verificationDetail || '—') : '—') + '</td>' +
        '<td>' + formatTimestamp(claim.createdAt) + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td class="action-cell">' + actions + '</td>' +
      '</tr>'
    );
  }).join('');
}

// Approve a pending claim -> both reports become Verified (linked pair).
function approveClaim(claimId) {
  const claims = getClaims();
  const claim = claims.find(c => c.id === claimId);
  if (!claim || claim.status !== 'pending') return;

  const items = getItems();
  const lost = items.find(i => i.id === claim.lostItemId);
  const found = items.find(i => i.id === claim.foundItemId);

  // If either report was already marked Returned, do not silently override it.
  const lostIsReturned = lost && lost.status === 'returned';
  const foundIsReturned = found && found.status === 'returned';
  if (lostIsReturned || foundIsReturned) {
    showAlert('adminAlert', 'Cannot approve: one of the reports is already Returned.', 'error');
    return;
  }

  if (lost && found) {
    lost.status = 'verified';
    found.status = 'verified';
    lost.matchedWithId = found.id;
    found.matchedWithId = lost.id;
    saveItems(items);
  }

  claim.status = 'approved';
  claim.decidedAt = Date.now();
  claim.decidedBy = getCurrentUser().name;
  saveClaims(claims);

  addActivityLog('Claim approved',
    'Claim by ' + claim.claimantName + ' for "' + (lost ? lost.itemName : 'item') + '" approved.');
  showAlert('adminAlert', 'Claim approved — the reports are now Verified.', 'success');
  renderClaims();
  renderDashboard();
  renderDataSelects();
}

// Reject a pending claim -> both reports go back to Match Found.
function rejectClaim(claimId) {
  const claims = getClaims();
  const claim = claims.find(c => c.id === claimId);
  if (!claim || claim.status !== 'pending') return;

  const items = getItems();
  const lost = items.find(i => i.id === claim.lostItemId);
  const found = items.find(i => i.id === claim.foundItemId);
  if (lost && lost.status === 'claim-requested') lost.status = 'match-found';
  if (found && found.status === 'claim-requested') found.status = 'match-found';
  saveItems(items);

  claim.status = 'rejected';
  claim.decidedAt = Date.now();
  claim.decidedBy = getCurrentUser().name;
  saveClaims(claims);

  addActivityLog('Claim rejected',
    'Claim by ' + claim.claimantName + ' for "' + (lost ? lost.itemName : 'item') + '" rejected.');
  showAlert('adminAlert', 'Claim rejected — the reports are back to Match Found.', 'success');
  renderClaims();
  renderDashboard();
  renderDataSelects();
}

/* ---------- MATCHES OVERVIEW TAB ---------- */

function renderMatchesOverview() {
  const allItems = getItems();
  const lostItems = allItems.filter(i => i.type === 'lost' && i.status !== 'returned');
  const foundItems = allItems.filter(i => i.type === 'found' && i.status !== 'returned');

  const pairs = [];
  lostItems.forEach(function (lost) {
    foundItems.forEach(function (found) {
      const result = getMatchScore(lost, found);
      if (result.score > 0) pairs.push({ lost: lost, found: found, score: result.score });
    });
  });
  pairs.sort((a, b) => b.score - a.score);

  document.getElementById('matchOverviewCount').textContent =
    pairs.length === 1 ? '1 active match pair' : pairs.length + ' active match pairs';

  const body = document.getElementById('matchOverviewBody');
  if (pairs.length === 0) {
    body.innerHTML = '<tr><td colspan="6"><div class="empty-state">No match pairs yet.</div></td></tr>';
    return;
  }

  body.innerHTML = pairs.map(function (pair) {
    const strength = matchStrength(pair.score);
    return (
      '<tr>' +
        '<td class="table-item"><strong>' + escapeHTML(pair.lost.itemName) + '</strong></td>' +
        '<td class="table-item"><strong>' + escapeHTML(pair.found.itemName) + '</strong></td>' +
        '<td><span class="score-pill">' + pair.score + '/10</span></td>' +
        '<td><span class="match-strength ' + strength.className + '">' + strength.label + '</span></td>' +
        '<td><span class="badge badge-status badge-status-' + (pair.lost.status || 'open') + '">' + statusLabel(pair.lost) + '</span></td>' +
        '<td><span class="badge badge-status badge-status-' + (pair.found.status || 'open') + '">' + statusLabel(pair.found) + '</span></td>' +
      '</tr>'
    );
  }).join('');
}

/* ---------- DATA MANAGEMENT TAB ---------- */

// Fill the two dropdowns used by the Data tab.
function renderDataSelects() {
  const users = getUsers();
  const currentUser = getCurrentUser();
  const userSelect = document.getElementById('dataUserSelect');
  userSelect.innerHTML =
    '<option value="">— choose a user —</option>' +
    users.filter(u => !currentUser || u.id !== currentUser.id).map(function (u) {
      return '<option value="' + u.id + '">' + escapeHTML(u.name) + ' (' + escapeHTML(u.email) + ')</option>';
    }).join('');

  const items = getItems();
  const reportSelect = document.getElementById('dataReportSelect');
  reportSelect.innerHTML =
    '<option value="">— choose a report —</option>' +
    items.map(function (item) {
      return '<option value="' + item.id + '">[' + item.type.toUpperCase() + '] ' + escapeHTML(item.itemName) + '</option>';
    }).join('');
}

function askDeleteSelectedUser() {
  const userId = Number(document.getElementById('dataUserSelect').value);
  if (!userId) {
    showAlert('adminAlert', 'Please choose a user first.', 'error');
    return;
  }
  askDeleteUser(userId);
}

function askDeleteSelectedReport() {
  const reportId = Number(document.getElementById('dataReportSelect').value);
  if (!reportId) {
    showAlert('adminAlert', 'Please choose a report first.', 'error');
    return;
  }
  askDeleteReport(reportId);
}

function askClearAllReports() {
  const count = getItems().length;
  if (count === 0) {
    showAlert('adminAlert', 'There are no reports to clear.', 'error');
    return;
  }
  openConfirm(
    'Clear all reports?',
    'Delete ALL ' + count + ' lost and found reports? This cannot be undone.',
    function () {
      saveItems([]);
      addActivityLog('Reports cleared', 'All ' + count + ' reports cleared.');
      showAlert('adminAlert', 'All reports cleared.', 'success');
      renderReports();
      renderDashboard();
      renderDataSelects();
    }
  );
}

function askClearUsersExceptAdmin() {
  const users = getUsers();
  const currentUser = getCurrentUser();
  const toRemove = users.filter(u => !currentUser || u.id !== currentUser.id).length;
  if (toRemove === 0) {
    showAlert('adminAlert', 'There are no other users to remove.', 'error');
    return;
  }
  openConfirm(
    'Clear all users except admin?',
    'Delete all ' + toRemove + ' regular user account(s)? Your admin account stays. This cannot be undone.',
    function () {
      saveUsers(users.filter(u => currentUser && u.id === currentUser.id));
      addActivityLog('Users cleared', 'Removed ' + toRemove + ' user account(s).');
      showAlert('adminAlert', toRemove + ' user account(s) removed.', 'success');
      renderUsers();
      renderDashboard();
      renderDataSelects();
    }
  );
}

// Replace everything with a small set of demo users and reports.
function askResetDemoData() {
  openConfirm(
    'Reset demo data?',
    'Replace all users and reports with fresh demo data? Your admin account stays logged in.',
    function () {
      resetDemoData();
    }
  );
}

function resetDemoData() {
  const admin = getUsers().find(u => u.role === 'admin') || getCurrentUser();

  // Demo users (ids fixed so reports can reference them).
  const demoUsers = [
    { id: 9001, name: 'Priya Sharma', email: 'priya@campus.edu', password: 'demo123', role: 'user', active: true, createdAt: Date.now() - 900000 },
    { id: 9002, name: 'Rahul Verma', email: 'rahul@campus.edu', password: 'demo123', role: 'user', active: true, createdAt: Date.now() - 800000 },
    { id: 9003, name: 'Sneha Iyer', email: 'sneha@campus.edu', password: 'demo123', role: 'user', active: true, createdAt: Date.now() - 700000 }
  ];
  if (admin) demoUsers.unshift(admin);

  const now = new Date();
  const day = n => new Date(now.getTime() - n * 86400000).toISOString().slice(0, 10);

  const demoItems = [
    {
      id: 9101, type: 'lost', itemName: 'Black leather wallet', category: 'Bags & Backpacks', color: 'Black',
      location: 'Library', date: day(1), description: 'Black leather wallet left near the reading tables.',
      verificationDetail: '', postedBy: { id: 9001, name: 'Priya Sharma' }, status: 'match-found', createdAt: Date.now() - 500000
    },
    {
      id: 9102, type: 'found', itemName: 'Black leather wallet', category: 'Bags & Backpacks', color: 'Black',
      location: 'Library', date: day(0), description: 'Found a black wallet in the library.',
      verificationDetail: 'One college ID was inside the wallet.', postedBy: { id: 9002, name: 'Rahul Verma' },
      status: 'match-found', createdAt: Date.now() - 400000
    },
    {
      id: 9103, type: 'lost', itemName: 'Blue water bottle', category: 'Bottles & Lunchboxes', color: 'Blue',
      location: 'Canteen', date: day(2), description: 'Blue steel water bottle with a sticker.',
      verificationDetail: '', postedBy: { id: 9003, name: 'Sneha Iyer' }, status: 'open', createdAt: Date.now() - 300000
    },
    {
      id: 9104, type: 'found', itemName: 'Scientific calculator', category: 'Electronics', color: 'Black',
      location: 'Lecture Halls', date: day(2), description: 'Casio calculator found under a seat.',
      verificationDetail: 'The calculator had a name sticker on the back.', postedBy: { id: 9001, name: 'Priya Sharma' },
      status: 'open', createdAt: Date.now() - 200000
    }
  ];

  saveUsers(demoUsers);
  saveItems(demoItems);
  saveClaims([]);
  addActivityLog('Demo data reset', 'Demo users and reports recreated by admin.');
  showAlert('adminAlert', 'Demo data reset complete.', 'success');
  renderDashboard();
  renderUsers();
  renderReports();
  renderClaims();
  renderDataSelects();
}

/* ---------- CONFIRM MODAL ---------- */

let confirmCallback = null;

// Show the confirmation dialog; run the callback only if the admin confirms.
function openConfirm(title, message, onConfirm) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmText').textContent = message;
  confirmCallback = onConfirm;
  document.getElementById('confirmModal').style.display = 'flex';
}

function closeConfirm() {
  confirmCallback = null;
  document.getElementById('confirmModal').style.display = 'none';
}

function confirmYes() {
  const callback = confirmCallback;
  closeConfirm();
  if (callback) callback();
}

/* ---------- Wire up the events ---------- */

// Reports tab: search + filters re-render on change.
document.getElementById('adminReportSearch').addEventListener('input', function (event) {
  adminReportFilters.search = event.target.value.trim().toLowerCase();
  renderReports();
});
document.getElementById('adminReportType').addEventListener('change', function (event) {
  adminReportFilters.type = event.target.value;
  renderReports();
});
document.getElementById('adminReportStatus').addEventListener('change', function (event) {
  adminReportFilters.status = event.target.value;
  renderReports();
});

// Escape key closes any open modal.
document.addEventListener('keydown', function (event) {
  if (event.key !== 'Escape') return;
  if (document.getElementById('confirmModal').style.display !== 'none') closeConfirm();
  if (document.getElementById('editModal').style.display !== 'none') closeEditModal();
});

// Draw the dashboard on load.
renderDashboard();
