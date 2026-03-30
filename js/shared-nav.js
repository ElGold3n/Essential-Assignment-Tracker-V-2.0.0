(function () {
  const navContainers = document.querySelectorAll('.nav[data-shared-nav]');
  if (!navContainers.length) return;

  document.body.classList.add('has-shared-sidebar');

  function updateSidebarOffset() {
    if (window.matchMedia('(max-width: 980px)').matches) return;

    const heading = document.querySelector('.header h1, h1');
    if (!heading) return;

    const rect = heading.getBoundingClientRect();
    const offset = Math.max(72, Math.round(rect.bottom + 10));
    document.documentElement.style.setProperty('--shared-nav-header-offset', offset + 'px');
  }

  const links = [
    { href: 'dashboard.html', icon: '🏠', text: 'Home' },
    { href: 'add-Assignment.html', icon: '➕', text: 'Add Assignment' },
    { href: 'overview.html', icon: '📊', text: 'Overview' },
    { href: 'About.html', icon: 'ℹ️', text: 'About' }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const rawName = (localStorage.getItem('username') || 'Student').trim();
  const userName = rawName || 'Student';
  const ROOT_PROFILE_IMAGE = 'USER%20ICON.png';
  const DEFAULT_PROFILE_IMAGE = 'Icons/user.svg';
  const savedProfileImg = localStorage.getItem('userProfileImage');
  const initialProfileImg = savedProfileImg || ROOT_PROFILE_IMAGE;
  const userHtml =
    '<div class="nav-user" aria-label="User profile">' +
    '  <button type="button" class="nav-user-bubble user-profile-picker" title="Click to upload profile picture" aria-label="Upload profile picture" style="border:none;padding:0;cursor:pointer;background:inherit;"><img class="nav-user-icon" src="' + initialProfileImg + '" alt="User profile" loading="lazy" decoding="async"></button>' +
    '  <input class="user-profile-input" type="file" accept="image/*" style="display:none;">' +
    '  <div class="nav-user-name" title="' + escapeHtml(userName) + '">' + escapeHtml(userName) + '</div>' +
    '  <button type="button" class="nav-user-remove" aria-label="Remove profile photo" title="Remove profile photo">Remove photo</button>' +
    '</div>';

  const currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';

  const linksHtml = links
    .map(function (link) {
      const isActive = currentPage === link.href.toLowerCase();
      return '<a href="' + link.href + '" aria-label="' + link.text + '"' + (isActive ? ' class="active" aria-current="page"' : '') + '><span class="nav-icon">' + link.icon + '</span><span class="nav-text">' + link.text + '</span></a>';
    })
    .join('');

  const html = userHtml + linksHtml;

  function notify(message) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, { type: 'success' });
    }
  }

  navContainers.forEach(function (container) {
    container.innerHTML = html;

    // Profile picture upload handler - attach to each container
    const userProfilePicker = container.querySelector('.user-profile-picker');
    const userProfileInput = container.querySelector('.user-profile-input');
    const userProfileRemove = container.querySelector('.nav-user-remove');

    function setFallback(icon) {
      icon.onerror = null;
      icon.src = DEFAULT_PROFILE_IMAGE;
    }

    function setAllProfileImages(src) {
      const allProfileIcons = document.querySelectorAll('.nav-user-icon');
      allProfileIcons.forEach(function (icon) {
        icon.onerror = function () { setFallback(icon); };
        icon.src = src;
        icon.style.objectFit = 'cover';
      });
    }

    setAllProfileImages(initialProfileImg);

    if (userProfilePicker && userProfileInput) {
      userProfilePicker.addEventListener('click', function () {
        userProfileInput.click();
      });

      userProfileInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = function (event) {
            const base64Img = event.target.result;
            localStorage.setItem('userProfileImage', base64Img);
            setAllProfileImages(base64Img);
            notify('Profile photo updated');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (userProfileRemove) {
      userProfileRemove.addEventListener('click', function () {
        localStorage.removeItem('userProfileImage');
        setAllProfileImages(ROOT_PROFILE_IMAGE);
        notify('Profile photo removed');
      });
    }
  });

  const darkModeToggle = document.getElementById('darkModeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  let leftGroup = document.querySelector('.left-group');
  let sidebarSoundToggle = null;

  const SOUND_PREF_KEY = 'soundEnabled';

  function isSoundEnabled() {
    return localStorage.getItem(SOUND_PREF_KEY) !== '0';
  }

  function setSoundEnabled(enabled) {
    const value = enabled ? '1' : '0';
    localStorage.setItem(SOUND_PREF_KEY, value);
    window.dispatchEvent(new CustomEvent('app-sound-change', { detail: { enabled: enabled } }));
  }

  window.isAppSoundEnabled = isSoundEnabled;
  window.setAppSoundEnabled = setSoundEnabled;

  function initThemeMenu(toggleBtn) {
    if (!toggleBtn) return;

    const modeOptions = ['light', 'dark', 'system'];
    const systemMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const themeMenu = document.createElement('div');
    themeMenu.className = 'theme-menu';
    themeMenu.setAttribute('aria-hidden', 'true');
    themeMenu.innerHTML =
      '<button type="button" class="theme-option" data-theme-mode="light">LIGHT</button>' +
      '<button type="button" class="theme-option" data-theme-mode="dark">DARK</button>' +
      '<button type="button" class="theme-option" data-theme-mode="system">USE SYSTEM SYSTEMS</button>';

    if (!toggleBtn.parentElement) return;
    toggleBtn.parentElement.appendChild(themeMenu);

    function getStoredThemeMode() {
      const explicit = localStorage.getItem('themeMode');
      if (modeOptions.indexOf(explicit) !== -1) return explicit;

      const legacy = localStorage.getItem('darkMode');
      if (legacy === '1') return 'dark';
      if (legacy === '0') return 'light';
      return 'system';
    }

    function updateIcons(isDark) {
      if (!sunIcon || !moonIcon) return;
      sunIcon.style.display = isDark ? 'none' : 'block';
      moonIcon.style.display = isDark ? 'block' : 'none';
    }

    function setThemeMode(mode, persist) {
      const safeMode = modeOptions.indexOf(mode) !== -1 ? mode : 'system';
      const darkOn = safeMode === 'system' ? systemMedia.matches : safeMode === 'dark';

      document.documentElement.classList.toggle('dark-mode', darkOn);
      document.body.classList.toggle('dark-mode', darkOn);
      updateIcons(darkOn);

      if (persist !== false) {
        localStorage.setItem('themeMode', safeMode);
      }
      localStorage.setItem('darkMode', darkOn ? '1' : '0');

      themeMenu.querySelectorAll('[data-theme-mode]').forEach(function (option) {
        const active = option.getAttribute('data-theme-mode') === safeMode;
        option.classList.toggle('active', active);
        option.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function closeThemeMenu() {
      toggleBtn.setAttribute('aria-expanded', 'false');
      themeMenu.setAttribute('aria-hidden', 'true');
      themeMenu.classList.remove('open');
    }

    function openThemeMenu() {
      toggleBtn.setAttribute('aria-expanded', 'true');
      themeMenu.setAttribute('aria-hidden', 'false');
      themeMenu.classList.add('open');
    }

    toggleBtn.setAttribute('aria-haspopup', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');

    // Capture phase stops old page-level click toggles from firing on this button.
    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (themeMenu.classList.contains('open')) closeThemeMenu();
      else openThemeMenu();
    }, true);

    themeMenu.addEventListener('click', function (e) {
      const option = e.target.closest('[data-theme-mode]');
      if (!option) return;
      const mode = option.getAttribute('data-theme-mode');
      setThemeMode(mode, true);
      closeThemeMenu();
      e.stopPropagation();
    });

    document.addEventListener('click', function (e) {
      if (!themeMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeThemeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeThemeMenu();
    });

    if (typeof systemMedia.addEventListener === 'function') {
      systemMedia.addEventListener('change', function () {
        if (getStoredThemeMode() === 'system') {
          setThemeMode('system', false);
        }
      });
    } else if (typeof systemMedia.addListener === 'function') {
      systemMedia.addListener(function () {
        if (getStoredThemeMode() === 'system') {
          setThemeMode('system', false);
        }
      });
    }

    setThemeMode(getStoredThemeMode(), false);
  }

  function createSharedGearGroup() {
    const importId = 'sharedImportFileInput';
    const wrapper = document.createElement('div');
    wrapper.className = 'left-group nav-gear-group';
    wrapper.innerHTML =
      '<div class="settings">' +
      '  <button class="gear-btn nav-gear-btn" aria-haspopup="true" aria-expanded="false" title="Backup & Restore" aria-label="Backup and restore data">⚙️</button>' +
      '  <div class="gear-menu nav-gear-menu" role="menu" aria-hidden="true">' +
      '    <div class="hint">Backup / Restore</div>' +
      '    <label for="' + importId + '" class="nav-restore-btn" style="display:block;cursor:pointer;padding:10px 12px;">Restore (Import)…</label>' +
      '    <button type="button" class="nav-export-btn" style="display:block;cursor:pointer;padding:10px 12px;width:100%;background:none;border:none;text-align:left;">Backup (Export)</button>' +
      '  </div>' +
      '</div>' +
      '<input id="' + importId + '" class="nav-import-file" type="file" accept="application/json,.json" style="display:none" />';
    return wrapper;
  }

  if (!leftGroup) {
    leftGroup = createSharedGearGroup();
  }

  if (darkModeToggle || leftGroup) {
    const controls = document.createElement('div');
    controls.className = 'nav-controls';

    if (darkModeToggle) {
      const themeToggleWrap = document.createElement('div');
      themeToggleWrap.className = 'theme-toggle-wrap';
      themeToggleWrap.appendChild(darkModeToggle);
      controls.appendChild(themeToggleWrap);
    }

    if (leftGroup) {
      leftGroup.classList.add('nav-gear-group');
      leftGroup.style.position = '';
      leftGroup.style.left = '';
      controls.appendChild(leftGroup);
    }

    const soundBtn = document.createElement('button');
    soundBtn.type = 'button';
    soundBtn.className = 'nav-sound-toggle-btn';
    soundBtn.setAttribute('aria-label', 'Toggle page sounds');
    controls.appendChild(soundBtn);
    sidebarSoundToggle = soundBtn;

    navContainers[0].appendChild(controls);
  }

  initThemeMenu(darkModeToggle);

  function initStandaloneSoundToggle(toggleBtn) {
    if (!toggleBtn) return;

    function refreshSoundState() {
      const enabled = isSoundEnabled();
      toggleBtn.textContent = enabled ? '🔊' : '🔇';
      toggleBtn.title = enabled ? 'Sound: ON' : 'Sound: OFF';
      toggleBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      toggleBtn.classList.toggle('is-off', !enabled);
    }

    toggleBtn.addEventListener('click', function () {
      setSoundEnabled(!isSoundEnabled());
      refreshSoundState();
    });

    window.addEventListener('app-sound-change', refreshSoundState);
    refreshSoundState();
  }

  initStandaloneSoundToggle(sidebarSoundToggle);

  function initBackupControls(group) {
    if (!group) return;

    const backupBtn = group.querySelector('#backupBtn, .nav-gear-btn, .gear-btn');
    const backupMenu = group.querySelector('#backupMenu, .nav-gear-menu, .gear-menu');
    const exportBtn = group.querySelector('#exportBtn, .nav-export-btn');
    const importFileInput = group.querySelector('#importFileInput, .nav-import-file');

    if (!backupBtn || !backupMenu) return;
    if (backupBtn.dataset.sharedNavBound === 'true') return;
    backupBtn.dataset.sharedNavBound = 'true';

    backupMenu.setAttribute('aria-hidden', 'true');
    backupBtn.setAttribute('aria-expanded', 'false');
    backupMenu.style.display = 'none';
    backupMenu.style.opacity = '0';
    backupMenu.style.pointerEvents = 'none';

    function closeMenu() {
      backupMenu.setAttribute('aria-hidden', 'true');
      backupBtn.setAttribute('aria-expanded', 'false');
      backupMenu.style.opacity = '0';
      backupMenu.style.pointerEvents = 'none';
      backupMenu.style.display = 'none';
    }

    function openMenu() {
      backupMenu.setAttribute('aria-hidden', 'false');
      backupBtn.setAttribute('aria-expanded', 'true');
      backupMenu.style.display = 'block';
      setTimeout(function () {
        backupMenu.style.opacity = '1';
        backupMenu.style.pointerEvents = 'auto';
      }, 10);
    }

    backupBtn.addEventListener('click', function (e) {
      const isOpen = backupMenu.getAttribute('aria-hidden') === 'false';
      if (isOpen) closeMenu();
      else openMenu();
      e.stopPropagation();
    });

    document.addEventListener('click', function (e) {
      if (!backupMenu.contains(e.target) && !backupBtn.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        try {
          const data = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
              data[key] = JSON.parse(localStorage.getItem(key));
            } catch (_) {
              data[key] = localStorage.getItem(key);
            }
          }
          const json = JSON.stringify(data, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
          a.href = url;
          a.download = 'assignments-export-' + ts + '.json';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          closeMenu();
        } catch (err) {
          alert('Export failed: ' + err.message);
        }
      });
    }

    if (importFileInput) {
      importFileInput.addEventListener('change', function (ev) {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const imported = JSON.parse(e.target.result);
            if (typeof imported !== 'object' || imported === null) {
              alert('Imported file is not a valid JSON object.');
              return;
            }

            const overwrite = confirm(
              'Import will add keys to localStorage. Click OK to overwrite existing keys, or Cancel to only add missing keys.'
            );

            if (overwrite) {
              Object.keys(imported).forEach(function (k) {
                const val = imported[k];
                localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
              });
              alert('Import complete (existing keys overwritten).');
            } else {
              let added = 0;
              Object.keys(imported).forEach(function (k) {
                if (localStorage.getItem(k) == null) {
                  const val = imported[k];
                  localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
                  added++;
                }
              });
              alert('Import complete — ' + added + ' new keys added.');
            }
          } catch (err) {
            alert('Failed to parse JSON: ' + err.message);
          }
        };

        reader.readAsText(file);
        importFileInput.value = '';
        closeMenu();
      });
    }
  }

  initBackupControls(leftGroup);

  updateSidebarOffset();
  window.addEventListener('resize', updateSidebarOffset);
  window.addEventListener('load', updateSidebarOffset);
})();
