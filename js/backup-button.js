/*
  backup-button.js (refactored – no programmatic .click())
  -------------------------------------------------------
  Changes:
  - Removed restoreBtn and importFileInput.click()
  - Uses <label for="importFileInput"> instead → native, reliable file dialog trigger
  - closeMenu() simplified (no setTimeout needed for this case)
*/

(function () {
  // DOM elements
  const backupBtn = document.getElementById('backupBtn');
  const backupMenu = document.getElementById('backupMenu');
  const exportBtn = document.getElementById('exportBtn');
  const importFileInput = document.getElementById('importFileInput');

  // Early exit if core elements missing
  if (!backupBtn || !backupMenu) return;

  // Initialize menu hidden
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
    backupMenu.style.display = 'none'; // immediate – no timeout needed here
  }

  function openMenu() {
    backupMenu.setAttribute('aria-hidden', 'false');
    backupBtn.setAttribute('aria-expanded', 'true');
    backupMenu.style.display = 'block';
    setTimeout(() => {
      backupMenu.style.opacity = '1';
      backupMenu.style.pointerEvents = 'auto';
    }, 10);
  }

  // Toggle menu on gear click
  backupBtn.addEventListener('click', function (e) {
    const isOpen = backupMenu.getAttribute('aria-hidden') === 'false';
    if (isOpen) closeMenu();
    else openMenu();
    e.stopPropagation();
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!backupMenu.contains(e.target) && e.target !== backupBtn) {
      closeMenu();
    }
  });

  // Esc to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Export (unchanged – works great)
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
        alert('Exported file should download shortly.');
        closeMenu();
      } catch (err) {
        alert('Export failed: ' + err.message);
        console.error('Export error:', err);
      }
    });
  }

  // Import – now triggered by label click → file input change
  if (importFileInput) {
    importFileInput.addEventListener('change', function (ev) {
      const file = ev.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const imported = JSON.parse(e.target.result);
          if (typeof imported !== 'object' || imported === null) {
            alert('Imported file does not contain a valid JSON object.');
            return;
          }

          const overwrite = confirm(
            'Import will add keys to localStorage. Click OK to overwrite existing keys, Cancel to only add keys that do not exist.'
          );

          if (overwrite) {
            Object.keys(imported).forEach((k) => {
              const val = imported[k];
              localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
            });
            alert('Import complete (existing keys overwritten).');
          } else {
            let added = 0;
            Object.keys(imported).forEach((k) => {
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

      // Optional: reset input for next use
      importFileInput.value = '';
      closeMenu();
    });
  }

  console.log('[backup-button] initialized (label-based import)');
  try {
    window.backupButtonInitialized = true;
  } catch (e) {}
})();