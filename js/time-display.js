// Shows live time and date in the page header.

(function () {
  function updateTime() {
    const timeDisplay = document.getElementById('timeDisplay');
    if (!timeDisplay) return;

    const now = new Date();
    
    // Build time text.
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    
    // Build date text.
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${dayName}, ${date}/${month}/${year}`;
    
    timeDisplay.innerHTML = `<div style="font-size: 1.25rem; font-weight: 600; text-align: right; line-height: 1.3; color: rgba(154, 160, 166, 0.84);">${timeStr}</div><div style="font-size: 0.9rem; text-align: right; margin-top: 8px; color: rgba(120, 126, 134, 0.88); letter-spacing: 0.02em; font-weight: 700; font-style: italic;">${dateStr}</div>`;
  }

  // Update now, then refresh every second.
  updateTime();
  setInterval(updateTime, 1000);
})();
