/* ============================================================
   dashboard.js — extra behaviour for the dashboard page
   ------------------------------------------------------------
   1. Shows a green success message right after posting an item.
   2. Lists the 3 most recent reports from LocalStorage.
   ============================================================ */

// 1) Success message after posting an item.
//    The post page redirects to dashboard.html?posted=lost (or found).
const dashboardParams = new URLSearchParams(window.location.search);
const postedType = dashboardParams.get('posted');

if (postedType === 'lost' || postedType === 'found') {
  const message = postedType === 'lost'
    ? 'Your lost item report was posted successfully!'
    : 'Your found item report was posted successfully!';
  showAlert('dashAlert', message, 'success');

  // Clean the URL so the banner doesn't come back on refresh.
  // (Wrapped in try/catch because file:// pages can throw here.)
  try {
    history.replaceState(null, '', 'dashboard.html');
  } catch (err) {
    /* ignore */
  }
}

// 2) Show the 3 most recent reports.
function renderRecentReports() {
  const items = getItems().slice();                 // copy the list
  items.sort((a, b) => b.createdAt - a.createdAt);  // newest first
  const recent = items.slice(0, 3);

  const list = document.getElementById('recentList');

  if (recent.length === 0) {
    list.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon" aria-hidden="true">' + ICON.folder + '</div>' +
        '<h3>No reports yet</h3>' +
        '<p>Nothing has been posted so far. Use the Quick Actions above to report the first lost or found item.</p>' +
      '</div>';
    return;
  }

  list.innerHTML = '<div class="item-grid">' + recent.map(itemCardHTML).join('') + '</div>';
}

// 3) Show the current user's own reports (feature #6) in a table:
//    item name, lost/found, date, location and current status.
function renderMyReports() {
  const user = getCurrentUser();
  const body = document.getElementById('myReportsBody');
  if (!user) return;

  // Only reports posted by the logged-in user.
  const mine = getItems()
    .filter(item => item.postedBy && item.postedBy.id === user.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (mine.length === 0) {
    body.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon" aria-hidden="true">' + ICON.clipboard + '</div>' +
        '<h3>You have no reports yet</h3>' +
        '<p>Use the Quick Actions above to post your first lost or found item.</p>' +
      '</div>';
    return;
  }

  const rows = mine.map(item => {
    const isLost = item.type === 'lost';
    const canReturn = item.status === 'verified'; // verified items can be resolved
    return (
      '<tr>' +
        '<td class="table-item"><strong>' + escapeHTML(item.itemName) + '</strong></td>' +
        '<td><span class="badge ' + (isLost ? 'badge-lost' : 'badge-found') + '">' + (isLost ? 'LOST' : 'FOUND') + '</span></td>' +
        '<td>' + formatDate(item.date) + '</td>' +
        '<td>' + ICON.pin + ' ' + escapeHTML(item.location) + '</td>' +
        '<td><span class="badge badge-status badge-status-' + (item.status || 'open') + '">' + statusLabel(item) + '</span></td>' +
        '<td>' + (canReturn
          ? '<button type="button" class="btn btn-small btn-success" onclick="returnFromTable(' + item.id + ')">Mark as Returned</button>'
          : '') + '</td>' +
      '</tr>'
    );
  }).join('');

  body.innerHTML =
    '<table class="reports-table">' +
      '<thead><tr><th>Item</th><th>Lost / Found</th><th>Date</th><th>Location</th><th>Status</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';
}

// "Mark as Returned" from the My Reports table (feature #5).
function returnFromTable(itemId) {
  if (markItemReturned(itemId)) {
    showAlert('dashAlert', 'Item marked as returned! The reports are now resolved.', 'success');
  }
  renderMyReports();
  renderRecentReports();
}

renderRecentReports();
renderMyReports();
