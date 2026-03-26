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

  const currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';

  const html = links
    .map(function (link) {
      const isActive = currentPage === link.href.toLowerCase();
      return '<a href="' + link.href + '" aria-label="' + link.text + '"' + (isActive ? ' class="active" aria-current="page"' : '') + '><span class="nav-icon">' + link.icon + '</span><span class="nav-text">' + link.text + '</span></a>';
    })
    .join('');

  navContainers.forEach(function (container) {
    container.innerHTML = html;
  });

  const darkModeToggle = document.getElementById('darkModeToggle');
  let leftGroup = document.querySelector('.left-group');

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
      controls.appendChild(darkModeToggle);
    }

    if (leftGroup) {
      leftGroup.classList.add('nav-gear-group');
      leftGroup.style.position = '';
      leftGroup.style.left = '';
      controls.appendChild(leftGroup);
    }

    navContainers[0].appendChild(controls);
  }

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
