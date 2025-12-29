// Callings tab UI logic

export function renderCallingsTable(callings) {
    const tbody = document.getElementById('callingsBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!callings || callings.length === 0) return;
    callings.forEach(calling => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${calling.calling}</td>
            <td>${calling.member}</td>
            <td>${calling.status}</td>
            <td><button onclick="editCalling('${calling.calling}')">Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}

export function openAddCalling() {
    alert('Add Calling modal would open here.');
}

window.renderCallingsTable = renderCallingsTable;
window.openAddCalling = openAddCalling;
window.editCalling = function(calling) {
    alert('Edit calling: ' + calling);
};
