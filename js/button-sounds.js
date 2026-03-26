// Button sound logic for Delete, Save, and Update buttons
// Usage: call setupButtonSound(buttonElement, soundFile)

function setupButtonSound(btn, soundFile) {
    if (!btn) return;
    let audio = new Audio(soundFile);
    btn.addEventListener('click', () => {
        audio.currentTime = 0;
        audio.play();
    });
}

// Example usage (to be called after DOMContentLoaded):
// setupButtonSound(document.getElementById('deleteAssignmentBtn'), 'ui-delete.wav');
// setupButtonSound(document.querySelector('.save-btn'), 'ui-save.wav');
// setupButtonSound(document.querySelector('.update-btn'), 'ui-update.wav');
