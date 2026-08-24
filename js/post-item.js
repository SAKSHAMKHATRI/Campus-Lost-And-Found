const type = new URLSearchParams(window.location.search).get('type');

if (type !== 'lost' && type !== 'found') {
  window.location.href = 'dashboard.html';
}

const isLost = type === 'lost';

document.getElementById('formIcon').innerHTML = isLost ? ICON.package : ICON.inbox;
document.getElementById('formTitle').textContent = isLost ? 'Post a Lost Item' : 'Post a Found Item';
document.getElementById('formSub').textContent = isLost
  ? 'Tell the campus community what you lost, so people can help you find it.'
  : 'Report something you found, so it can be returned to its owner.';
document.getElementById('dateLabel').textContent = isLost ? 'Date lost *' : 'Date found *';
document.getElementById('submitBtn').textContent = isLost ? 'Post Lost Item' : 'Post Found Item';

fillSelect('category', CATEGORIES, 'Select a category');
fillSelect('color', COLORS, 'Select a color');
fillSelect('location', LOCATIONS, 'Select a campus zone / location');

document.getElementById('verificationWrap').style.display = isLost ? 'none' : 'block';

const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.max = today;

function handlePostItem(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('submitBtn');

  const itemName = document.getElementById('itemName').value.trim();
  const category = document.getElementById('category').value;
  const color = document.getElementById('color').value;
  const location = document.getElementById('location').value;
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value.trim();

  let verificationDetail = '';

  if (!isLost) {
    verificationDetail = document.getElementById('verificationDetail').value.trim();
  }

  if (itemName === '') {
    return showAlert('postAlert', 'Please enter the item name.', 'error');
  }

  if (itemName.length < 3) {
    return showAlert('postAlert', 'Item name must contain at least 3 characters.', 'error');
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

  if (date > today) {
    return showAlert('postAlert', 'Date cannot be in the future.', 'error');
  }

  if (description === '') {
    return showAlert('postAlert', 'Please enter a description.', 'error');
  }

  if (description.length < 10) {
    return showAlert('postAlert', 'Please provide a more detailed description.', 'error');
  }

  const user = getCurrentUser();

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  submitBtn.disabled = true;

  const item = {
    id: Date.now(),
    type: type,
    itemName: itemName,
    category: category,
    color: color,
    location: location,
    date: date,
    description: description,
    verificationDetail: verificationDetail,
    postedBy: {
      id: user.id,
      name: user.name
    },
    status: 'open',
    createdAt: Date.now()
  };

  addItem(item);

  window.location.href = 'dashboard.html?posted=' + type;
}