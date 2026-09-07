const allItems = getItems();

function renderMatches() {
  const allItems = getItems();

  const claimedItemIds = new Set();
  getClaims().forEach(function (claim) {
    claimedItemIds.add(claim.lostItemId);
    claimedItemIds.add(claim.foundItemId);
  });

  let leftoverClaim = false;
  allItems.forEach(item => {
    if (item.status === 'claim-requested' && !claimedItemIds.has(item.id)) {
      item.status = 'match-found';
      leftoverClaim = true;
    }
  });

  if (leftoverClaim) saveItems(allItems);

  const lostItems = allItems.filter(item =>
    item.type === 'lost' && item.status !== 'returned'
  );

  const foundItems = allItems.filter(item =>
    item.type === 'found' && item.status !== 'returned'
  );

  const list = document.getElementById('matchList');
  const empty = document.getElementById('matchEmpty');
  const count = document.getElementById('matchCount');
  const filter = document.getElementById('lostFilter');
  const selectedLostId = filter.value;

  filter.innerHTML =
    '<option value="">All lost items</option>' +
    lostItems
      .map(item =>
        '<option value="' + item.id + '">' +
        escapeHTML(item.itemName) +
        '</option>'
      )
      .join('');

  if (lostItems.length === 0 || foundItems.length === 0) {
    list.innerHTML = '';
    count.textContent = '';

    document.getElementById('matchEmptyTitle').textContent =
      'Not enough reports yet';

    document.getElementById('matchEmptyText').textContent =
      'Matches need at least one LOST item and one FOUND item. Post both from the dashboard to see suggestions here.';

    empty.style.display = 'block';
    return;
  }

  const chosenLost = lostItems.filter(
    item => selectedLostId === '' || String(item.id) === selectedLostId
  );

  const pairs = [];

  chosenLost.forEach(lost => {
    foundItems.forEach(found => {
      const result = getMatchScore(lost, found);

      if (result.score > 0) {
        pairs.push({
          lost: lost,
          found: found,
          score: result.score,
          max: result.max,
          reasons: result.reasons
        });
      }
    });
  });

  let statusChanged = false;

  pairs.forEach(pair => {
    if (pair.lost.status === 'open') {
      pair.lost.status = 'match-found';
      statusChanged = true;
    }

    if (pair.found.status === 'open') {
      pair.found.status = 'match-found';
      statusChanged = true;
    }
  });

  if (statusChanged) saveItems(allItems);

  pairs.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.lost.createdAt - a.lost.createdAt;
  });

  filter.value = selectedLostId;

  count.textContent = pairs.length === 1
    ? '1 match found'
    : pairs.length + ' matches found';

  if (pairs.length === 0) {
    list.innerHTML = '';

    document.getElementById('matchEmptyTitle').textContent =
      'No matches found';

    document.getElementById('matchEmptyText').textContent =
      'No lost and found item pair scored above 0. Try posting items with more details (category, colour, campus zone and description).';

    empty.style.display = 'block';
  } else {
    list.innerHTML = pairs.map(matchCardHTML).join('');
    empty.style.display = 'none';
  }
}

function matchCardHTML(pair) {
  const currentUser = getCurrentUser();
  const lost = pair.lost;
  const found = pair.found;
  const strength = matchStrength(pair.score);
  const pct = Math.round((pair.score / pair.max) * 100);

  const iOwnLost = !!(
    currentUser &&
    lost.postedBy &&
    lost.postedBy.id === currentUser.id
  );

  const foundHasPendingClaim = getClaims().some(
    c => c.status === 'pending' && c.foundItemId === found.id
  );

  const canClaim =
    iOwnLost &&
    !foundHasPendingClaim &&
    (
      found.status === 'open' ||
      found.status === 'match-found' ||
      found.status === 'claim-requested'
    ) &&
    lost.status !== 'verified' &&
    lost.status !== 'returned';

  const canReturn =
    iOwnLost &&
    lost.status === 'verified' &&
    found.status === 'verified';

  let actionHTML = '';

  if (canClaim) {
    actionHTML =
      '<button type="button" class="btn btn-small" onclick="openClaimModal(' +
      lost.id + ',' + found.id + ')">' +
      ICON.lock + ' Claim this item</button>';

  } else if (canReturn) {
    actionHTML =
      '<button type="button" class="btn btn-small btn-success" onclick="markMatchReturned(' +
      lost.id + ')">' +
      ICON.checkCircle + ' Mark as Returned</button>';

  } else if (iOwnLost && foundHasPendingClaim) {
    actionHTML =
      '<span class="match-note">' +
      ICON.clock +
      ' A claim on this found item is awaiting admin approval.</span>';

  } else if (iOwnLost && isResolved(found)) {
    actionHTML =
      '<span class="match-note">' +
      'This found item has already been claimed by someone else.</span>';
  }

  return (
    '<article class="match-card">' +
      '<div class="match-card-top">' +
        '<div class="match-items">' +
          itemPillHTML(lost, 'lost') +
          '<div class="match-arrow" aria-hidden="true">' +
            ICON.arrowLR +
          '</div>' +
          itemPillHTML(found, 'found') +
        '</div>' +

        '<div class="match-score-box">' +
          '<div class="match-score" style="--score:' + pct + '">' +
            '<span class="match-num">' +
              pair.score +
              '<small>/10</small>' +
            '</span>' +
            '<span class="match-label">match score</span>' +
          '</div>' +

          '<span class="match-strength ' +
            strength.className +
            '">' +
            strength.label +
          '</span>' +
        '</div>' +
      '</div>' +

      '<div class="match-why">' +
        '<h4 class="match-why-title">Why this is a match?</h4>' +

        '<div class="reason-chips">' +
          pair.reasons
            .map(reason =>
              '<span class="reason-chip">' +
              ICON.check + ' ' +
              reason +
              '</span>'
            )
            .join('') +
        '</div>' +

        '<div class="score-bar" aria-hidden="true">' +
          '<span class="score-bar-fill" style="width:' +
          pct +
          '%"></span>' +
        '</div>' +
      '</div>' +

      (
        actionHTML
          ? '<div class="match-actions">' +
            actionHTML +
            '</div>'
          : ''
      ) +

    '</article>'
  );
}

function itemPillHTML(item, type) {
  return (
    '<div class="match-item-pill pill-' + type + '">' +

      '<div class="pill-badges">' +
        '<span class="badge ' +
          (type === 'lost' ? 'badge-lost' : 'badge-found') +
          '">' +
          type.toUpperCase() +
        '</span>' +

        statusBadgeHTML(item) +
      '</div>' +

      '<strong>' +
        escapeHTML(item.itemName) +
      '</strong>' +

      '<span class="pill-meta">' +
        escapeHTML(item.category) +
        ' · ' +
        escapeHTML(item.color) +
        ' · ' +
        escapeHTML(item.location) +
      '</span>' +

      '<span class="pill-meta">' +
        ICON.calendar +
        ' ' +
        formatDate(item.date) +
        ' · Posted by ' +
        escapeHTML(
          item.postedBy ? item.postedBy.name : 'Unknown'
        ) +
      '</span>' +

    '</div>'
  );
}

let activeClaim = null;

function openClaimModal(lostId, foundId) {
  const items = getItems();

  const lost = items.find(i => i.id === lostId);
  const found = items.find(i => i.id === foundId);

  if (!lost || !found) return;

  if (
    lost.status === 'open' ||
    lost.status === 'match-found'
  ) {
    lost.status = 'claim-requested';
  }

  if (
    found.status === 'open' ||
    found.status === 'match-found'
  ) {
    found.status = 'claim-requested';
  }

  saveItems(items);

  activeClaim = {
    lostId: lostId,
    foundId: foundId,
    submitted: false
  };

  document.getElementById('claimSub').textContent =
    'Lost item "' +
    lost.itemName +
    '" is being claimed against found item "' +
    found.itemName +
    '".';

  const answer = document.getElementById('claimAnswer');

  answer.value = '';
  answer.disabled = false;

  const submitBtn =
    document.getElementById('claimSubmitBtn');

  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit Claim';

  const resultBox =
    document.getElementById('claimResult');

  resultBox.style.display = 'none';

  document.getElementById('claimModal').style.display = 'flex';

  answer.focus();
}

function submitClaim() {
  if (!activeClaim) return;

  const answer =
    document.getElementById('claimAnswer').value.trim();

  if (answer === '') {
    showAlert(
      'claimResult',
      'Please describe an identifying detail first.',
      'error'
    );
    return;
  }

  const items = getItems();

  const lost = items.find(
    i => i.id === activeClaim.lostId
  );

  const found = items.find(
    i => i.id === activeClaim.foundId
  );

  if (!lost || !found) return;

  const result = verifyClaim(found, answer);

  if (result.ok) {
    const claim = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      lostItemId: lost.id,
      foundItemId: found.id,
      claimantId: lost.postedBy
        ? lost.postedBy.id
        : null,
      claimantName: lost.postedBy
        ? lost.postedBy.name
        : 'Unknown',
      answer: answer,
      autoVerified: true,
      status: 'pending',
      createdAt: Date.now(),
      decidedAt: null,
      decidedBy: null
    };

    addClaim(claim);

    activeClaim.submitted = true;

    showAlert(
      'claimResult',
      'Your answer matches the private detail. The claim has been submitted to the admin for final approval.',
      'success'
    );

    document.getElementById('claimAnswer').disabled = true;

    document.getElementById('claimSubmitBtn').disabled = true;

    document.getElementById('claimSubmitBtn').textContent =
      'Claim Submitted';

  } else {
    lost.status = 'match-found';
    found.status = 'match-found';

    activeClaim.submitted = true;

    showAlert(
      'claimResult',
      result.message,
      'error'
    );
  }

  saveItems(items);
}

function closeClaimModal() {
  const modal =
    document.getElementById('claimModal');

  if (!modal || modal.style.display === 'none') return;

  if (activeClaim && !activeClaim.submitted) {
    const items = getItems();

    const lost = items.find(
      i => i.id === activeClaim.lostId
    );

    const found = items.find(
      i => i.id === activeClaim.foundId
    );

    if (
      lost &&
      lost.status === 'claim-requested'
    ) {
      lost.status = 'match-found';
    }

    if (
      found &&
      found.status === 'claim-requested'
    ) {
      found.status = 'match-found';
    }

    saveItems(items);
  }

  activeClaim = null;
  modal.style.display = 'none';

  renderMatches();
}

function markMatchReturned(lostId) {
  if (markItemReturned(lostId)) {
    showAlert(
      'matchAlert',
      'Item marked as returned! The reports are now resolved.',
      'success'
    );
  }

  renderMatches();
}

document
  .getElementById('lostFilter')
  .addEventListener('change', renderMatches);

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeClaimModal();
  }
});

renderMatches();