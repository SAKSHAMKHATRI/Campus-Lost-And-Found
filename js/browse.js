// The current filter state ('' means "show everything").
const browseFilters = {
  search: '',     // text from the search box
  status: 'all',  // 'all' | 'lost' | 'found'
  category: '',
  color: '',
  location: '',
  date: 'any'     // 'any' | number of days as a string (e.g. '7')
};

// Fill the three filter dropdowns with the shared option lists.
fillSelect('filterCategory', CATEGORIES, 'All categories');
fillSelect('filterColor', COLORS, 'All colors');
fillSelect('filterLocation', LOCATIONS, 'All locations');

// Does an item's date fall within the chosen "last N days" window?
// filterValue is 'any' (no filter) or a number of days as a string.
function itemMatchesDate(item, filterValue) {
  if (!filterValue || filterValue === 'any' || !item.date) return true;
  const days = parseInt(filterValue, 10);
  if (!days || isNaN(days)) return true;

  // "Last 7 days" means today plus the previous 6 days.
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  const itemDate = new Date(item.date + 'T00:00:00'); // treat as a local date
  return itemDate >= cutoff;
}

// Re-draw the list using the current filters.
function renderItems() {
  const allItems = getItems();
  const list = document.getElementById('itemList');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultCount');

  // Keep only the items that match every filter.
  const filtered = allItems.filter(function (item) {
    const searchText = (
      item.itemName + ' ' + item.category + ' ' + item.color + ' ' +
      item.location + ' ' + item.description
    ).toLowerCase();

    const matchesSearch   = browseFilters.search === '' || searchText.indexOf(browseFilters.search) !== -1;
    const matchesStatus   = browseFilters.status === 'all' || item.type === browseFilters.status;
    const matchesCategory = browseFilters.category === '' || item.category === browseFilters.category;
    const matchesColor    = browseFilters.color === '' || item.color === browseFilters.color;
    const matchesLocation = browseFilters.location === '' || item.location === browseFilters.location;
    const matchesDate     = itemMatchesDate(item, browseFilters.date);

    return matchesSearch && matchesStatus && matchesCategory && matchesColor && matchesLocation && matchesDate;
  });

  // Newest reports first.
  filtered.sort((a, b) => b.createdAt - a.createdAt);

  // Show how many results there are.
  count.textContent = filtered.length === 1
    ? '1 report found'
    : filtered.length + ' reports found';

  if (filtered.length === 0) {
    // "No items found" — with a friendlier message when there are no reports at all.
    list.innerHTML = '';
    document.getElementById('emptyTitle').textContent = allItems.length === 0 ? 'No reports yet' : 'No items found';
    document.getElementById('emptyText').textContent = allItems.length === 0
      ? 'Nothing has been posted yet. Use "Post a Lost Item" or "Post a Found Item" to add the first report.'
      : 'Try changing the search text or clearing some filters.';
    empty.style.display = 'block';
  } else {
    list.innerHTML = filtered.map(itemCardHTML).join('');
    empty.style.display = 'none';
  }
}

// Reset every filter back to its default and re-draw the list.
function clearFilters() {
  browseFilters.search = '';
  browseFilters.status = 'all';
  browseFilters.category = '';
  browseFilters.color = '';
  browseFilters.location = '';
  browseFilters.date = 'any';

  // Reset the controls to match the filter state.
  document.getElementById('searchInput').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterColor').value = '';
  document.getElementById('filterLocation').value = '';
  document.getElementById('filterDate').value = 'any';

  document.querySelectorAll('.chip[data-status]').forEach(function (chip) {
    const isAll = chip.dataset.status === 'all';
    chip.classList.toggle('active', isAll);
    chip.setAttribute('aria-pressed', isAll ? 'true' : 'false');
  });

  renderItems();
}

/* ---------- Wire up the events ---------- */

// 1) Live search while typing.
document.getElementById('searchInput').addEventListener('input', function (event) {
  browseFilters.search = event.target.value.trim().toLowerCase();
  renderItems();
});

// 2) Status chips (All / Lost / Found).
document.querySelectorAll('.chip[data-status]').forEach(function (chip) {
  chip.addEventListener('click', function () {
    document.querySelectorAll('.chip[data-status]').forEach(function (c) {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
    browseFilters.status = chip.dataset.status;
    renderItems();
  });
});

// 3) Category / colour / location / date dropdowns.
document.getElementById('filterCategory').addEventListener('change', function (event) {
  browseFilters.category = event.target.value;
  renderItems();
});
document.getElementById('filterColor').addEventListener('change', function (event) {
  browseFilters.color = event.target.value;
  renderItems();
});
document.getElementById('filterLocation').addEventListener('change', function (event) {
  browseFilters.location = event.target.value;
  renderItems();
});
document.getElementById('filterDate').addEventListener('change', function (event) {
  browseFilters.date = event.target.value;
  renderItems();
});

// Draw the list for the first time.
renderItems();
