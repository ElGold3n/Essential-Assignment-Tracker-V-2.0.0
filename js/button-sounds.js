// Button sound logic for Delete, Save, and Update buttons
// Usage: call setupButtonSound(buttonElement, soundFile)

function setupButtonSound(btn, soundFile) {
    if (!btn) return;
    let audio = new Audio(soundFile);
    btn.addEventListener('click', () => {
        const soundEnabled = typeof window.isAppSoundEnabled === 'function'
            ? window.isAppSoundEnabled()
            : localStorage.getItem('soundEnabled') !== '0';
        if (!soundEnabled) return;

        if (typeof window.playAppSound === 'function') {
            window.playAppSound(soundFile, audio);
            return;
        }

        audio.currentTime = 0;
        const playResult = audio.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(() => {});
        }
    });
}

// Example usage (to be called after DOMContentLoaded):
// setupButtonSound(document.getElementById('deleteAssignmentBtn'), 'ui-delete.wav');
// setupButtonSound(document.querySelector('.save-btn'), 'ui-save.wav');
// setupButtonSound(document.querySelector('.update-btn'), 'ui-update.wav');
