import { Callings } from '../modules/callings.mjs';
// Render callings from Callings class (async)
export async function renderCallingsFromClass(storageObj) {
    const store = storageObj || window.Storage;
    const callingsInstance = new Callings({ _storageObj: store });
    if (typeof callingsInstance.Fetch === 'function') {
        await callingsInstance.Fetch();
    }
    const callings = callingsInstance.CallingsDetails;
    renderCallingsTable(callings);
}
// Callings tab UI logic

export function renderCallingsTable(callings) {
    const tbody = document.getElementById('callingsBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!callings || callings.length === 0) return;
    callings.forEach(calling => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${calling.name || calling.calling || ''}</td>
            <td>${calling.member || ''}</td>
            <td>${calling.status || (calling.active ? 'Active' : 'Inactive')}</td>
            <td style="white-space:nowrap;">
                <button class="callings-edit-btn" data-calling-id="${calling.id}">Edit</button>
                <button class="callings-delete-btn" data-calling-id="${calling.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    // Attach button handlers
    tbody.querySelectorAll('.callings-edit-btn').forEach(btn => {
        btn.onclick = e => {
            const id = e.target.getAttribute('data-calling-id');
            window.editCalling(id);
        };
    });
    tbody.querySelectorAll('.callings-delete-btn').forEach(btn => {
        btn.onclick = e => {
            const id = e.target.getAttribute('data-calling-id');
            window.deleteCalling(id);
        };
    });
}

export function openAddCalling() {
    alert('Add Calling modal would open here.');
}

if (typeof window !== 'undefined') {
    window.renderCallingsTable = renderCallingsTable;
    window.renderCallingsFromClass = renderCallingsFromClass;
    window.openAddCalling = openAddCalling;
    window.editCalling = function(id) {
        alert('Edit calling: ' + id);
    };
    window.deleteCalling = function(id) {
        alert('Delete calling: ' + id);
    };
}
