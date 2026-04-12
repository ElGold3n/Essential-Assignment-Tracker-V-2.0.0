// Plays a sound when a button is clicked.
// Use: setupButtonSound(buttonElement, soundFile)

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

// Example calls (after DOM is ready):
// setupButtonSound(document.getElementById('deleteAssignmentBtn'), 'FX/ui-delete.wav');
// setupButtonSound(document.querySelector('.save-btn'), 'FX/ui-save.wav');
// setupButtonSound(document.querySelector('.update-btn'), 'FX/ui-update.wav');
