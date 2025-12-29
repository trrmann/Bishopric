// Testing tab UI logic

export function resetCache() {
    alert('Cache reset triggered.');
}

export function exportData() {
    alert('Data export triggered.');
}

window.resetCache = resetCache;
window.exportData = exportData;
