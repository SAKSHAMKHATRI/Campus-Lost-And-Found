/* ============================================================
   matches.js — automatic match suggestions + claim verification
   ------------------------------------------------------------
   1. Compares every LOST item with every FOUND item using the
      weighted score from items.js (maximum 10) and shows the
      highest-scoring matches first.
   2. Marks reports as "Match Found" the first time they match.
   3. Lets the owner of a LOST item claim a matched FOUND item:
      the claimant describes an identifying detail and it is
      compared with the finder's private detail. Matching answers
      create a PENDING CLAIM that the admin approves/rejects in
      the admin panel (claim verification feature #4).
   ============================================================ */

// Draw the full list of match pairs.
function renderMatches() {
  const allItems = getItems();

  // Safety net: "Claim Requested" should only exist while a claim is being
  // made. Items with NO claim record behind them (e.g. the user refreshed the
  // page mid-claim) are reset to "Match Found". Items covered by a real claim
  // are left alone — the admin manages those.
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

  // Returned reports are done — they are kept out of new suggestions.
  const lostItems = allItems.filter(item => item.type === 'lost' && item.status !== 'returned');
  const foundItems = allItems.filter(item => item.type === 'found' && item.status !== 'returned');

  const list = document.getElementById('matchList');
  const empty = document.getElementById('matchEmpty');
  const count = document.getElementById('matchCount');
  const filter = document.getElementById('lostFilter');
  const selectedLostId = filter.value; // remember the current choice

  // Rebuild the dropdown options (keeps them in sync with the data).
  filter.innerHTML =
    '<option value="">All lost items</option>' +
    lostItems.map(item => '<option value="' + item.id + '">' + escapeHTML(item.itemName) + '</option>').join('');

  // We need at least one lost AND one found item to make a match.
  if (lostItems.length === 0 || foundItems.length === 0) {
    list.innerHTML = '';
    count.textContent = '';
    document.getElementById('matchEmptyTitle').textContent = 'Not enough reports yet';
    document.getElementById('matchEmptyText').textContent =
      'Matches need at least one LOST item and one FOUND item. Post both from the dashboard to see suggestions here.';
    empty.style.display = 'block';
    return;
  }

  // The dropdown can focus on one specific lost item ('' = all of them).
  const chosenLost = lostItems.filter(item => selectedLostId === '' || String(item.id) === selectedLostId);

  // Build every lost × found pair and score it.
  const pairs = [];
  chosenLost.forEach(lost => {
    foundItems.forEach(found => {
      const result = getMatchScore(lost, found);
      if (result.score > 0) {
        pairs.push({ lost: lost, found: found, score: result.score, reasons: result.reasons });
      }
    });
  });

  // When a report first gains a match, move it to the "Match Found" stage.
  let statusChanged = false;
  pairs.forEach(pair => {
    if (pair.lost.status === 'open') { pair.lost.status = 'match-found'; statusChanged = true; }
    if (pair.found.status === 'open') { pair.found.status = 'match-found'; statusChanged = true; }
  });
  if (statusChanged) saveItems(allItems);

  // Highest scores first.
  pairs.sort((a, b) => b.score - a.score);

  filter.value = selectedLostId;

  count.textContent = pairs.length === 1
    ? '1 match found'
    : pairs.length + ' matches found';

  if (pairs.length === 0) {
    list.innerHTML = '';
    document.getElementById('matchEmptyTitle').textContent = 'No matches found';
    document.getElementById('matchEmptyText').textContent =
      'No lost and found item pair scored above 0. Try posting items with more details (category, colour, campus zone and description).';
    empty.style.display = 'block';
  } else {
    list.innerHTML = pairs.map(matchCardHTML).join('');
    empty.style.display = 'none';
  }
}

/* ---------- Match card HTML ---------- */

// HTML for one match card (lost item ↔ found item + score + strength).
function matchCardHTML(pair) {
  const currentUser = getCurrentUser();
  const lost = pair.lost;
  const found = pair.found;
  const strength = matchStrength(pair.score);
  const pct = Math.round((pair.score / pair.max) * 100); // percentage for the visual score ring

  // Only the owner of the LOST item may claim, and only while the found item
  // has not already been verified / returned / is already being claimed.
  const iOwnLost = !!(currentUser && lost.postedBy && lost.postedBy.id === currentUser.id);
  const foundHasPendingClaim = getClaims().some(c => c.status === 'pending' && c.foundItemId === found.id);
  const canClaim = iOwnLost && !foundHasPendingClaim &&
    (found.status === 'open' || found.status === 'match-found' || found.status === 'claim-requested') &&
    lost.status !== 'verified' && lost.status !== 'returned';

  // After the admin approves a claim, the owner can mark it as returned.
  const canReturn = iOwnLost && lost.status === 'verified' && found.status === 'verified';

  let actionHTML = '';
  if (canClaim) {
    actionHTML = '<button type="button" class="btn btn-small" onclick="openClaimModal(' + lost.id + ',' + found.id + ')">' + ICON.lock + ' Claim this item</button>';
  } else if (canReturn) {
    actionHTML = '<button type="button" class="btn btn-small btn-success" onclick="markMatchReturned(' + lost.id + ')">' + ICON.checkCircle + ' Mark as Returned</button>';
  } else if (iOwnLost && foundHasPendingClaim) {
    actionHTML = '<span class="match-note">' + ICON.clock + ' A claim on this found item is awaiting admin approval.</span>';
  } else if (iOwnLost && isResolved(found)) {
    actionHTML = '<span class="match-note">This found item has already been claimed by someone else.</span>';
  }

  return (
    '<article class="match-card">' +
      '<div class="match-card-top">' +
        '<div class="match-items">' +
          itemPillHTML(lost, 'lost') +
          '<div class="match-arrow" aria-hidden="true">' + ICON.arrowLR + '</div>' +
          itemPillHTML(found, 'found') +
        '</div>' +
        '<div class="match-score-box">' +
          '<div class="match-score" style="--score:' + pct + '">' +
            '<span class="match-num">' + pair.score + '<small>/10</small></span>' +
            '<span class="match-label">match score</span>' +
          '</div>' +
          '<span class="match-strength ' + strength.className + '">' + strength.label + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="match-why">' +
        '<h4 class="match-why-title">Why this is a match?</h4>' +
        '<div class="reason-chips">' +
          pair.reasons.map(reason => '<span class="reason-chip">' + ICON.check + ' ' + reason + '</span>').join('') +
        '</div>' +
        '<div class="score-bar" aria-hidden="true">' +
          '<span class="score-bar-fill" style="width:' + pct + '%"></span>' +
        '</div>' +
      '</div>' +
      (actionHTML ? '<div class="match-actions">' + actionHTML + '</div>' : '') +
    '</article>'
  );
}

// One side of a match (either the lost item or the found item).
function itemPillHTML(item, type) {
  return (
    '<div class="match-item-pill pill-' + type + '">' +
      '<div class="pill-badges">' +
        '<span class="badge ' + (type === 'lost' ? 'badge-lost' : 'badge-found') + '">' + type.toUpperCase() + '</span>' +
        statusBadgeHTML(item) +
      '</div>' +
      '<strong>' + escapeHTML(item.itemName) + '</strong>' +
      '<span class="pill-meta">' + escapeHTML(item.category) + ' · ' + escapeHTML(item.color) + ' · ' + escapeHTML(item.location) + '</span>' +
      '<span class="pill-meta">' + ICON.calendar + ' ' + formatDate(item.date) + ' · Posted by ' + escapeHTML(item.postedBy ? item.postedBy.name : 'Unknown') + '</span>' +
    '</div>'
  );
}

/* ---------- Claim verification modal (feature #4) ---------- */

// The pair the open modal belongs to: { lostId, foundId, submitted }.
let activeClaim = null;

// Open the modal and move both reports to the "Claim Requested" stage.
function openClaimModal(lostId, foundId) {
  const items = getItems();
  const lost = items.find(i => i.id === lostId);
  const found = items.find(i => i.id === foundId);
  if (!lost || !found) return;

  if (lost.status === 'open' || lost.status === 'match-found') lost.status = 'claim-requested';
  if (found.status === 'open' || found.status === 'match-found') found.status = 'claim-requested';
  saveItems(items);

  activeClaim = { lostId: lostId, foundId: foundId, submitted: false };

  document.getElementById('claimSub').textContent =
    'Lost item "' + lost.itemName + '" is being claimed against found item "' + found.itemName + '".';

  const answer = document.getElementById('claimAnswer');
  answer.value = '';
  answer.disabled = false;

  const submitBtn = document.getElementById('claimSubmitBtn');
  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit Claim';

  const resultBox = document.getElementById('claimResult');
  resultBox.style.display = 'none';

  document.getElementById('claimModal').style.display = 'flex';
  answer.focus();
}

// Compare the claimant's answer with the finder's private detail.
// A matching answer creates a PENDING CLAIM that the admin approves or
// rejects in the admin panel. A non-matching answer fails immediately.
function submitClaim() {
  if (!activeClaim) return;

  const answer = document.getElementById('claimAnswer').value.trim();

  // An empty answer is rejected before any comparison is made.
  if (answer === '') {
    showAlert('claimResult', 'Please describe an identifying detail first.', 'error');
    return;
  }

  const items = getItems();
  const lost = items.find(i => i.id === activeClaim.lostId);
  const found = items.find(i => i.id === activeClaim.foundId);
  if (!lost || !found) return;

  const result = verifyClaim(found, answer);

  if (result.ok) {
    // The answer matched the private detail -> create a pending claim.
    // The admin makes the final decision (approve = Verified, reject = back
    // to Match Found). Both reports stay "Claim Requested" meanwhile.
    const claim = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      lostItemId: lost.id,
      foundItemId: found.id,
      claimantId: lost.postedBy ? lost.postedBy.id : null,
      claimantName: lost.postedBy ? lost.postedBy.name : 'Unknown',
      answer: answer,
      autoVerified: true,
      status: 'pending',
      createdAt: Date.now(),
      decidedAt: null,
      decidedBy: null
    };
    addClaim(claim);
    activeClaim.submitted = true;

    showAlert('claimResult',
      'Your answer matches the private detail. The claim has been submitted to the admin for final approval.', 'success');
    document.getElementById('claimAnswer').disabled = true;
    document.getElementById('claimSubmitBtn').disabled = true;
    document.getElementById('claimSubmitBtn').textContent = 'Claim Submitted';
  } else {
    // Verification failed — no claim is created, revert to "Match Found".
    lost.status = 'match-found';
    found.status = 'match-found';
    activeClaim.submitted = true;
    showAlert('claimResult', result.message, 'error');
  }

  saveItems(items);
}

// Close the modal. If the claim was never completed, cancel it back to
// "Match Found" so the user can try again later.
function closeClaimModal() {
  const modal = document.getElementById('claimModal');
  if (!modal || modal.style.display === 'none') return;

  if (activeClaim && !activeClaim.submitted) {
    const items = getItems();
    const lost = items.find(i => i.id === activeClaim.lostId);
    const found = items.find(i => i.id === activeClaim.foundId);
    if (lost && lost.status === 'claim-requested') lost.status = 'match-found';
    if (found && found.status === 'claim-requested') found.status = 'match-found';
    saveItems(items);
  }

  activeClaim = null;
  modal.style.display = 'none';
  renderMatches();
}

// "Mark as returned" from a match card (resolves both reports).
function markMatchReturned(lostId) {
  if (markItemReturned(lostId)) {
    showAlert('matchAlert', 'Item marked as returned! The reports are now resolved.', 'success');
  }
  renderMatches();
}

/* ---------- Wire up the events ---------- */

// The dropdown lets the user focus on one lost item.
document.getElementById('lostFilter').addEventListener('change', renderMatches);

// Pressing Escape (or clicking the dark area) closes the modal.
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') closeClaimModal();
});

// Draw the page for the first time.
renderMatches();
