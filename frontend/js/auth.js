
async function handleSignup(event) {
  event.preventDefault(); // stop the page from reloading

  // Read what the user typed in the form (.trim() removes extra spaces)
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // ---- Form validation ----
  if (name === '') {
    return showAlert('signupAlert', 'Please enter your name.', 'error');
  }
  if (!isValidEmail(email)) {
    return showAlert('signupAlert', 'Please enter a valid email address.', 'error');
  }
  if (password.length < 6) {
    return showAlert('signupAlert', 'Password must be at least 6 characters.', 'error');
  }
  if (password !== confirmPassword) {
    return showAlert('signupAlert', 'Passwords do not match.', 'error');
  }

  // Submit button loading state
  const submitBtn = event.target ? event.target.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.textContent : 'Create Account';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
  }

  try {
    // Send registration request to backend API
    await registerUserAPI({ name, email, password });

    // Go to the login page with "?signup=success" so it can show a green message
    window.location.href = 'index.html?signup=success';
  } catch (error) {
    showAlert('signupAlert', error.message || 'Registration failed. Please try again.', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }
}

/* ---------- LOGIN ---------- */

// Runs when the Login form is submitted.
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  if (email === '' || password === '') {
    return showAlert('loginAlert', 'Please enter your email and password.', 'error');
  }

  // Submit button loading state
  const submitBtn = event.target ? event.target.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.textContent : 'Login';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
  }

  try {
    // Authenticate user with backend API
    const result = await loginUserAPI({ email, password });

    if (result.token) {
      saveAuthToken(result.token);
    }

    const user = {
      id: result.data.id || result.data._id,
      name: result.data.name,
      email: result.data.email,
      role: result.data.role || 'user',
      active: result.data.active !== false,
      token: result.token
    };

    saveCurrentUser(user);

    // Go to the main app page
    window.location.href = 'dashboard.html';
  } catch (error) {
    showAlert('loginAlert', error.message || 'Wrong email or password. Please try again.', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }
}

/* ---------- LOGOUT ---------- */

// Runs when the Logout button is clicked.
function logout() {
  clearCurrentUser();                  // remove the session and auth token
  window.location.href = 'index.html'; // go back to the login page
}

/* ---------- PAGE PROTECTION (feature #13) ---------- */

// Called on pages that need a logged-in user (e.g. dashboard).
// If nobody is logged in, redirect to the login page.
function protectPage() {
  if (!getCurrentUser()) {
    window.location.href = 'index.html';
  }
}

/* ---------- ADMIN ACCESS (Phase 1 / demo only) ---------- */

// A user is an admin only if their role field says so.
// Legacy users without a role are treated as normal users.
function getUserRole(user) {
  return (user && user.role) ? user.role : 'user';
}

function isAdmin(user) {
  return getUserRole(user) === 'admin';
}

// Called on admin.html. Only a logged-in ADMIN may stay on the page:
//   - nobody logged in            -> go to the login page
//   - normal user (not admin)     -> go to the dashboard
// NOTE: this is demo-only security. Phase 2 will use JWT tokens issued
// by a real backend so users cannot forge their role.
function requireAdmin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return false;
  }
  if (!isAdmin(user)) {
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

// Called on the login page after a successful signup, to show a green message.
function showSignupSuccess() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('signup') === 'success') {
    showAlert('loginAlert', 'Account created! Please login.', 'success');
  }
}

/* ---------- Small helpers ---------- */

// Very simple email check (something @ something . something)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Shows a message inside an alert box on the page.
// type is 'error' (red) or 'success' (green).
function showAlert(elementId, message, type) {
  const box = document.getElementById(elementId);
  box.textContent = message;
  box.className = 'alert alert-' + type; // e.g. "alert alert-error"
  box.style.display = 'block';
}
