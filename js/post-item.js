/* ============================================================
   post-item.js — the "Post a Lost / Found Item" form
   ------------------------------------------------------------
   One page handles both report types. The URL decides which
   one we are on:
     post-item.html?type=lost   -> Post a Lost Item
     post-item.html?type=found  -> Post a Found Item
   ============================================================ */

// Which kind of form is this?
const type = new URLSearchParams(window.location.search).get('type');

// If the type is missing or invalid, go back to the dashboard.
if (type !== 'lost' && type !== 'found') {
  window.location.href = 'dashboard.html';
}

const isLost = type === 'lost';

// Adjust the heading, icon, date label and button for this type.
document.getElementById('formIcon').innerHTML = isLost ? ICON.package : ICON.inbox;
document.getElementById('formTitle').textContent = isLost ? 'Post a Lost Item' : 'Post a Found Item';
document.getElementById('formSub').textContent = isLost
  ? 'Tell the campus community what you lost, so people can help you find it.'
  : 'Report something you found, so it can be returned to its owner.';
document.getElementById('dateLabel').textContent = isLost ? 'Date lost *' : 'Date found *';
document.getElementById('submitBtn').textContent = isLost ? 'Post Lost Item' : 'Post Found Item';

// Fill the dropdowns with the shared option lists from items.js.
fillSelect('category', CATEGORIES, 'Select a category');
fillSelect('color', COLORS, 'Select a color');
fillSelect('location', LOCATIONS, 'Select a campus zone / location');

// The private verification detail (feature #4) is ONLY for FOUND items.
// A lost item report does not need it, so the field is hidden.
document.getElementById('verificationWrap').style.display = isLost ? 'none' : 'block';

/* ---------- Form submission ---------- */

// Runs when the form is submitted.
function handlePostItem(event) {
  event.preventDefault(); // stop the page from reloading

  // Read what the user typed (.trim() removes extra spaces).
  const itemName = document.getElementById('itemName').value.trim();
  const category = document.getElementById('category').value;
  const color = document.getElementById('color').value;
  const location = document.getElementById('location').value;
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value.trim();

  // Private verification detail — only found-item finders fill this in.
  // It is stored with the item but NEVER shown on any public page.
  // The owner must describe it to claim the item (see matches.js).
  let verificationDetail = '';
  if (!isLost) {
    verificationDetail = document.getElementById('verificationDetail').value.trim();
  }

  // ---- Validation (every field is required) ----
  if (itemName === '') {
    return showAlert('postAlert', 'Please enter the item name.', 'error');
  }
  if (category === '') {
    return showAlert('postAlert', 'Please choose a category.', 'error');
  }
  if (color === '') {
    return showAlert('postAlert', 'Please choose a color.', 'error');
  }
  if (location === '') {
    return showAlert('postAlert', 'Please choose a campus zone / location.', 'error');
  }
  if (date === '') {
    return showAlert('postAlert', 'Please choose the date.', 'error');
  }
  if (description === '') {
    return showAlert('postAlert', 'Please enter a description.', 'error');
  }

  // The user who is posting — this page is protected, but double-check anyway.
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Build the item object and save it to LocalStorage.
  const item = {
    id: Date.now(),            // simple unique id
    type: type,                // 'lost' or 'found'
    itemName: itemName,
    category: category,
    color: color,
    location: location,
    date: date,                // e.g. "2026-08-08"
    description: description,
    verificationDetail: verificationDetail,  // private — only used for claim verification
    postedBy: { id: user.id, name: user.name },  // no email stored -> privacy (feature #7)
    status: 'open',            // lifecycle: open -> match-found -> ... (feature #5)
    createdAt: Date.now()
  };

  addItem(item); // storage.js helper

  // Go back to the dashboard and show a success message there.
  window.location.href = 'dashboard.html?posted=' + type;
}
