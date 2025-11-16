// Blacklink Accounts Navbar Component
// Shared navbar controller that renders the account menu, handles dropdown behaviour,
// and exposes helpers so pages can update the visible user state.

(function initNavbarModule(global) {
  const state = {
    auth: null,
    db: null,
    currentPage: '',
    container: null,
    userMenu: null,
    userDropdown: null,
    logoutButton: null,
    adminLink: null,
    dropdownTeardown: null,
    logoutHandler: null,
    logoutButtonHandler: null,
    adminHandler: null,
    adminLinkHandler: null,
    adminHref: 'adminpanel.html',
    unsubscribeAuth: null,
    user: {
      displayName: 'User',
      initials: 'U',
      photoURL: '',
      tier: 'FREE',
      isAdmin: false
    }
  };

  function renderNavbar(currentPage = '') {
    return `
      <header class="header">
        <a href="dashboard.html" class="logo">
          <div class="logo-icon">B</div>
          <span>Blacklink</span>
        </a>
        <nav class="nav-links">
          <a href="dashboard.html" class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}">Dashboard</a>
          <a href="profile.html" class="nav-link ${currentPage === 'profile' ? 'active' : ''}">Profile</a>
          <a href="settings.html" class="nav-link ${currentPage === 'settings' ? 'active' : ''}">Settings</a>
          <a href="subscription.html" class="nav-link ${currentPage === 'subscription' ? 'active' : ''}">Subscription</a>
          <a href="beta.html" class="nav-link ${currentPage === 'beta' ? 'active' : ''}">Beta</a>
          <a href="privacy.html" class="nav-link ${currentPage === 'privacy' ? 'active' : ''}">Privacy</a>
          <a href="about.html" class="nav-link ${currentPage === 'about' ? 'active' : ''}">About</a>
        </nav>
        <div class="user-menu-wrapper">
          <button class="user-menu" id="userMenu" type="button" aria-haspopup="true" aria-expanded="false">
            <div class="user-avatar" id="userAvatar" aria-hidden="true">U</div>
            <div class="user-menu-label">
              <span class="user-menu-name" id="userName">User</span>
              <span class="user-menu-badges">
                <span class="user-tier-pill" id="userTierBadge" hidden>ULTRA</span>
                <span class="user-admin-pill" id="userAdminBadge" hidden>ADMIN</span>
              </span>
              <span class="user-menu-meta">
                <i class="fas fa-chevron-down user-menu-caret" aria-hidden="true"></i>
                <span class="sr-only">Open account menu</span>
              </span>
            </div>
          </button>
          <div class="user-dropdown" id="userDropdown" role="menu">
            <div class="user-dropdown-profile" id="userDropdownProfile">
              <div>
                <div class="user-dropdown-name" id="userDropdownName">User</div>
                <div class="user-dropdown-email" id="userDropdownEmail">user@example.com</div>
              </div>
              <span class="user-dropdown-tier" id="userDropdownTier">FREE</span>
            </div>
            <a href="profile.html" class="user-dropdown-item" role="menuitem">
              <i class="fas fa-id-badge" aria-hidden="true"></i>
              Profile
            </a>
            <a href="settings.html" class="user-dropdown-item" role="menuitem">
              <i class="fas fa-sliders-h" aria-hidden="true"></i>
              Settings
            </a>
            <a href="privacy.html" class="user-dropdown-item" role="menuitem">
              <i class="fas fa-shield-alt" aria-hidden="true"></i>
              Privacy
            </a>
            <a href="admin.html" class="user-dropdown-item admin-link" id="adminToolsLink" role="menuitem" hidden aria-hidden="true">
              <i class="fas fa-shield-halved" aria-hidden="true"></i>
              <span id="adminToolsLabel">Admin Dashboard</span>
            </a>
            <button type="button" class="user-dropdown-item danger" id="logoutButton" role="menuitem">
              <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
              Log out
            </button>
          </div>
        </div>
      </header>
    `;
  }

  function normalizeTier(tier) {
    if (!tier) return 'FREE';
    const value = String(tier).toUpperCase().replace(/\s+/g, '_');
    // Employee tier gets ULTRA_PLUS access
    if (value.includes('EMPLOYEE')) return 'ULTRA_PLUS';
    if (value === 'ULTRA_PLUS' || value === 'ULTRA+') return 'ULTRA_PLUS';
    if (value === 'ULTRA' || value.includes('DISTRICT')) return 'ULTRA';
    return 'FREE';
  }

  function computeInitials(name, fallback = 'U') {
    if (!name) return fallback;
    const parts = String(name).trim().split(/\s+/);
    const chars = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
    return chars.join('') || fallback;
  }

  function cacheElements() {
    state.userMenu = document.getElementById('userMenu');
    state.userDropdown = document.getElementById('userDropdown');
    state.logoutButton = document.getElementById('logoutButton');
    state.adminLink = document.getElementById('adminToolsLink');
  }

  function openDropdown() {
    if (!state.userDropdown || !state.userMenu) return;
    state.userDropdown.classList.add('open');
    state.userMenu.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    if (!state.userDropdown || !state.userMenu) return;
    state.userDropdown.classList.remove('open');
    state.userMenu.setAttribute('aria-expanded', 'false');
  }

  function toggleDropdown(forceState) {
    if (!state.userDropdown || !state.userMenu) return;
    const shouldOpen = typeof forceState === 'boolean'
      ? forceState
      : !state.userDropdown.classList.contains('open');
    if (shouldOpen) {
      openDropdown();
    } else {
      closeDropdown();
    }
  }

  function attachDropdownEvents() {
    if (state.dropdownTeardown) {
      state.dropdownTeardown();
      state.dropdownTeardown = null;
    }

    const userMenu = state.userMenu;
    const userDropdown = state.userDropdown;
    if (!userMenu || !userDropdown) {
      return;
    }

    const handleToggleClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleDropdown();
    };

    const handleToggleKeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDropdown();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        openDropdown();
        const firstItem = userDropdown.querySelector('.user-dropdown-item:not([hidden])');
        firstItem?.focus();
      } else if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    const handleDocumentClick = (event) => {
      if (!userDropdown.classList.contains('open')) return;
      if (userMenu.contains(event.target) || userDropdown.contains(event.target)) {
        return;
      }
      closeDropdown();
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && userDropdown.classList.contains('open')) {
        closeDropdown();
      }
    };

    const handleItemClick = () => closeDropdown();

    userMenu.addEventListener('click', handleToggleClick);
    userMenu.addEventListener('keydown', handleToggleKeydown);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscapeKey);
    userDropdown.querySelectorAll('.user-dropdown-item').forEach((item) => {
      item.addEventListener('click', handleItemClick);
    });

    state.dropdownTeardown = () => {
      userMenu.removeEventListener('click', handleToggleClick);
      userMenu.removeEventListener('keydown', handleToggleKeydown);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleEscapeKey);
      userDropdown.querySelectorAll('.user-dropdown-item').forEach((item) => {
        item.removeEventListener('click', handleItemClick);
      });
    };
  }

  async function defaultLogoutHandler() {
    closeDropdown();
    try {
      const shouldLogout = window.confirm('Sign out of Blacklink?');
      if (!shouldLogout) return;
      if (state.auth && typeof state.auth.signOut === 'function') {
        await state.auth.signOut();
      }
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  function setLogoutHandler(handler) {
    state.logoutHandler = typeof handler === 'function' ? handler : null;
    if (!state.logoutButton) {
      state.logoutButton = document.getElementById('logoutButton');
    }
    if (!state.logoutButton) return;

    if (state.logoutButtonHandler) {
      state.logoutButton.removeEventListener('click', state.logoutButtonHandler);
      state.logoutButtonHandler = null;
    }

    const listener = async (event) => {
      event.preventDefault();
      closeDropdown();
      if (state.logoutHandler) {
        await state.logoutHandler();
      } else {
        await defaultLogoutHandler();
      }
    };

    state.logoutButton.addEventListener('click', listener);
    state.logoutButtonHandler = listener;
  }

  function setAdminHref(href) {
    if (!href) return;
    state.adminHref = href;
    if (!state.adminLink) {
      state.adminLink = document.getElementById('adminToolsLink');
    }
    if (!state.adminLink) return;

    if (state.adminLinkHandler) {
      state.adminLink.removeEventListener('click', state.adminLinkHandler);
      state.adminLinkHandler = null;
    }

    state.adminLink.setAttribute('href', href);
  }

  function attachAdminHandler() {
    if (!state.adminLink) {
      state.adminLink = document.getElementById('adminToolsLink');
    }
    if (!state.adminLink) return;

    if (state.adminLinkHandler) {
      state.adminLink.removeEventListener('click', state.adminLinkHandler);
      state.adminLinkHandler = null;
    }

    if (state.adminHandler) {
      state.adminLink.removeAttribute('href');
      state.adminLinkHandler = (event) => {
        event.preventDefault();
        closeDropdown();
        state.adminHandler();
      };
      state.adminLink.addEventListener('click', state.adminLinkHandler);
    } else {
      setAdminHref(state.adminHref);
    }
  }

  function setAdminHandler(handler, options = {}) {
    state.adminHandler = typeof handler === 'function' ? handler : null;
    if (options && typeof options.label === 'string') {
      const labelEl = document.getElementById('adminToolsLabel');
      if (labelEl) {
        labelEl.textContent = options.label;
      }
    }
    attachAdminHandler();
  }

  function updateBadges(tier, isAdmin) {
    const tierBadge = document.getElementById('userTierBadge');
    const adminBadge = document.getElementById('userAdminBadge');
    const avatar = document.getElementById('userAvatar');
    const badgesContainer = document.querySelector('.user-menu-badges');

    if (tierBadge) {
      tierBadge.classList.remove('tier-ultra', 'tier-ultra-plus');
      if (tier === 'ULTRA' || tier === 'ULTRA_PLUS') {
        tierBadge.hidden = false;
        tierBadge.textContent = tier === 'ULTRA_PLUS' ? '💖 ULTRA+' : 'ULTRA';
        tierBadge.dataset.tier = tier;
        tierBadge.classList.add(tier === 'ULTRA_PLUS' ? 'tier-ultra-plus' : 'tier-ultra');
        if (tier === 'ULTRA_PLUS') {
          tierBadge.title = 'Thank you for supporting Blacklink! 💖';
        }
      } else {
        tierBadge.hidden = true;
        tierBadge.dataset.tier = 'FREE';
      }
    }

    if (adminBadge) {
      if (isAdmin) {
        adminBadge.hidden = false;
        adminBadge.textContent = state.user.adminLabel || 'ADMIN';
      } else {
        adminBadge.hidden = true;
      }
    }

    if (avatar) {
      avatar.classList.remove('avatar-ultra', 'avatar-ultra-plus');
      avatar.removeAttribute('data-tier');
      if (tier === 'ULTRA') {
        avatar.classList.add('avatar-ultra');
        avatar.setAttribute('data-tier', 'ULTRA');
      } else if (tier === 'ULTRA_PLUS') {
        avatar.classList.add('avatar-ultra-plus');
        avatar.setAttribute('data-tier', 'ULTRA+');
      }

      if (isAdmin) {
        avatar.setAttribute('data-admin', 'true');
      } else {
        avatar.removeAttribute('data-admin');
      }
    }

    if (state.adminLink) {
      if (isAdmin) {
        state.adminLink.hidden = false;
        state.adminLink.setAttribute('aria-hidden', 'false');
      } else {
        state.adminLink.hidden = true;
        state.adminLink.setAttribute('aria-hidden', 'true');
      }
    }

    if (badgesContainer) {
      const shouldShow = (tierBadge && !tierBadge.hidden) || (adminBadge && !adminBadge.hidden);
      badgesContainer.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    }
  }

  function setUser(payload = {}) {
    state.user = { ...state.user, ...payload };
    const displayName = state.user.displayName || state.user.name || 'User';
    const initials = state.user.initials || computeInitials(displayName);
    const photoURL = state.user.photoURL || '';
    const tier = normalizeTier(state.user.tier);
    const isAdmin = Boolean(state.user.isAdmin);
    const email = state.user.email || state.user.emailAddress || '';

    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = displayName;
    }

    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) {
      if (photoURL) {
        avatarElement.style.backgroundImage = `url('${photoURL}')`;
        avatarElement.style.backgroundSize = 'cover';
        avatarElement.style.backgroundPosition = 'center';
        avatarElement.textContent = '';
      } else {
        avatarElement.style.backgroundImage = '';
        avatarElement.textContent = initials;
      }
    }

    const dropdownName = document.getElementById('userDropdownName');
    if (dropdownName) {
      dropdownName.textContent = displayName;
    }
    const dropdownEmail = document.getElementById('userDropdownEmail');
    if (dropdownEmail) {
      dropdownEmail.textContent = email || '—';
    }
    const dropdownTier = document.getElementById('userDropdownTier');
    if (dropdownTier) {
      dropdownTier.textContent = tier === 'ULTRA_PLUS' ? 'ULTRA+' : tier;
    }

    updateBadges(tier, isAdmin);
  }

  function mountNavbar(currentPage) {
    const container = document.getElementById('navbar-container');
    state.container = container || null;
    if (!container) {
      console.warn('Navbar container not found. Add <div id="navbar-container"></div> to the page.');
      return null;
    }
    container.innerHTML = renderNavbar(currentPage);
    return container;
  }

  function subscribeToAuth() {
    if (state.unsubscribeAuth) {
      state.unsubscribeAuth();
      state.unsubscribeAuth = null;
    }

    if (!state.auth || !state.db) {
      return;
    }

    state.unsubscribeAuth = state.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setUser({
          displayName: 'Guest',
          initials: 'G',
          photoURL: '',
          tier: 'FREE',
          isAdmin: false,
          email: ''
        });
        return;
      }

      try {
        const userDoc = await state.db.collection('users').doc(user.uid).get();
        const userData = userDoc.data() || {};
        const displayName = userData.name || user.displayName || user.email?.split('@')[0] || 'User';
        const initials = computeInitials(displayName || user.email);
        setUser({
          displayName,
          initials,
          photoURL: userData.photoURL || user.photoURL || '',
          tier: userData.subscription?.tier || userData.subscriptionTier || 'FREE',
          isAdmin: Boolean(userData.isAdmin),
          adminLabel: userData.adminLabel || state.user.adminLabel,
          email: user.email || userData.email || ''
        });
        document.dispatchEvent(new CustomEvent('navbar:user', {
          detail: { user, userData }
        }));
      } catch (error) {
        console.error('Error loading user data for navbar:', error);
        const fallbackName = user.displayName || user.email?.split('@')[0] || 'User';
        setUser({
          displayName: fallbackName,
          initials: computeInitials(fallbackName),
          photoURL: user.photoURL || '',
          tier: 'FREE',
          isAdmin: false,
          email: user.email || ''
        });
      }
    });
  }

  function initNavbar(auth, db, optionsOrPage) {
    const options = typeof optionsOrPage === 'string'
      ? { currentPage: optionsOrPage }
      : (optionsOrPage || {});

    state.auth = auth || null;
    state.db = db || null;
    state.currentPage = options.currentPage || options.page || '';

    mountNavbar(state.currentPage);
    cacheElements();
    attachDropdownEvents();
    setLogoutHandler(options.logoutHandler || state.logoutHandler);
    setAdminHref(options.adminHref || state.adminHref);
    setAdminHandler(options.adminHandler || state.adminHandler, {
      label: options.adminLabel
    });

    if (options.user) {
      setUser(options.user);
    } else {
      // ensure badges reflect any retained state
      updateBadges(normalizeTier(state.user.tier), Boolean(state.user.isAdmin));
    }

    subscribeToAuth();

    document.dispatchEvent(new CustomEvent('navbar:ready', {
      detail: { currentPage: state.currentPage }
    }));
  }

  function teardown() {
    if (state.dropdownTeardown) {
      state.dropdownTeardown();
      state.dropdownTeardown = null;
    }

    if (state.logoutButton && state.logoutButtonHandler) {
      state.logoutButton.removeEventListener('click', state.logoutButtonHandler);
      state.logoutButtonHandler = null;
    }

    if (state.adminLink && state.adminLinkHandler) {
      state.adminLink.removeEventListener('click', state.adminLinkHandler);
      state.adminLinkHandler = null;
    }

    if (state.unsubscribeAuth) {
      state.unsubscribeAuth();
      state.unsubscribeAuth = null;
    }
  }

  global.Navbar = Object.freeze({
    renderNavbar,
    initNavbar,
    init: initNavbar,
    setUser,
    setLogoutHandler,
    setAdminHandler,
    setAdminHref,
    openMenu: openDropdown,
    closeMenu: closeDropdown,
    teardown,
    normalizeTier
  });

  // Allow other scripts to request teardown on navigation.
  window.addEventListener('beforeunload', teardown);
})(window);
