const browseFilters = {
  search: '',
  status: 'all',
  category: '',
  color: '',
  location: '',
  date: 'any'
};

fillSelect('filterCategory', CATEGORIES, 'All categories');
fillSelect('filterColor', COLORS, 'All colors');
fillSelect('filterLocation', LOCATIONS, 'All locations');

function itemMatchesDate(item, filterValue) {
  if (!filterValue || filterValue === 'any' || !item.date) return true;

  const days = parseInt(filterValue, 10);
  if (!days || isNaN(days)) return true;

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  const itemDate = new Date(item.date + 'T00:00:00');
  return itemDate >= cutoff;
}

function renderItems() {
  const allItems = getItems();
  const list = document.getElementById('itemList');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultCount');

  const filtered = allItems.filter(function (item) {
    const searchText = [
      item.itemName,
      item.category,
      item.color,
      item.location,
      item.description
    ].filter(Boolean).join(' ').toLowerCase();

    const searchTerms = browseFilters.search.split(/\s+/).filter(Boolean);

    const matchesSearch = searchTerms.length === 0 ||
      searchTerms.every(function (term) {
        return searchText.includes(term);
      });

    const matchesStatus =
      browseFilters.status === 'all' ||
      item.type === browseFilters.status;

    const matchesCategory =
      browseFilters.category === '' ||
      item.category === browseFilters.category;

    const matchesColor =
      browseFilters.color === '' ||
      item.color === browseFilters.color;

    const matchesLocation =
      browseFilters.location === '' ||
      item.location === browseFilters.location;

    const matchesDate = itemMatchesDate(item, browseFilters.date);

    return matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesColor &&
      matchesLocation &&
      matchesDate;
  });

  filtered.sort((a, b) => b.createdAt - a.createdAt);

  const label = filtered.length === 1 ? 'report' : 'reports';
  count.textContent = `${filtered.length} ${label} found`;

  if (filtered.length === 0) {
    list.innerHTML = '';

    document.getElementById('emptyTitle').textContent =
      allItems.length === 0 ? 'No reports yet' : 'No items found';

    document.getElementById('emptyText').textContent =
      allItems.length === 0
        ? 'Nothing has been posted yet. Use "Post a Lost Item" or "Post a Found Item" to add the first report.'
        : 'Try changing the search text or clearing some filters.';

    empty.style.display = 'block';
  } else {
    list.innerHTML = filtered.map(itemCardHTML).join('');
    empty.style.display = 'none';
  }
}

function clearFilters() {
  browseFilters.search = '';
  browseFilters.status = 'all';
  browseFilters.category = '';
  browseFilters.color = '';
  browseFilters.location = '';
  browseFilters.date = 'any';

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

document.getElementById('searchInput').addEventListener('input', function (event) {
  browseFilters.search = event.target.value.trim().toLowerCase();
  renderItems();
});

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

renderItems();