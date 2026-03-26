// export-button.js
// Simple export script for assignment tracker

(function () {
  const exportBtn = document.getElementById('exportBtn');
  if (!exportBtn) return;

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
      a.href = url;
      a.download = 'assignments-export.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      alert('Export failed: ' + err.message);
      console.error('Export error:', err);
    }
  });
})();
