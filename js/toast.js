(function () {
  // Reusable toast popup for success/info messages.
  function getToastContainer() {
    return document.getElementById('toastContainer');
  }

  function buildIconSvg(icon) {
    if (icon === 'check') {
      return '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#38b6ff"/><path d="M8 14.5l4 4 8-8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    return '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#38b6ff"/><path d="M14 8v8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="14" cy="20" r="1.5" fill="#fff"/></svg>';
  }

  window.showNotification = function showNotification(message, options) {
    var opts = options || {};
    var toastContainer = getToastContainer();
    if (!toastContainer) return;

    toastContainer.innerHTML = '';

    var toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML =
      '<span class="toast-icon">' + buildIconSvg(opts.icon) + '</span>' +
      '<span>' + String(message) + '</span>' +
      '<button class="toast-close" aria-label="Close notification">&times;</button>';

    var closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.onclick = function () {
        toast.classList.remove('visible');
        setTimeout(function () { toast.remove(); }, 400);
      };
    }

    toastContainer.appendChild(toast);

    setTimeout(function () { toast.classList.add('visible'); }, 10);

    setTimeout(function () {
      toast.classList.remove('visible');
      setTimeout(function () { toast.remove(); }, 400);
    }, opts.duration || 3500);
  };
})();
