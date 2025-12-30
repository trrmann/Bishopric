// Roles tab UI logic

export function renderRolesTable(roles) {
    const tbody = document.getElementById('rolesBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!roles || roles.length === 0) return;
    roles.forEach(role => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${role.name}</td>
            <td>${role.callingName || ''}</td>
            <td>
                <button class="roles-edit-btn" onclick="editRole(${role.id})">Edit</button>
                <button class="roles-delete-btn" onclick="deleteRole(${role.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

import { Roles } from '../modules/roles.mjs';
import { Callings } from '../modules/callings.mjs';
export async function renderRolesFromClass(storageObj) {
    const store = storageObj || window.Storage;
    const rolesInstance = await Roles.Factory({ _storageObj: store });
    renderRolesTable(rolesInstance.RolesDetails);
}

export function openAddRole() {
    alert('Add Role modal would open here.');
}

window.renderRolesTable = renderRolesTable;
window.renderRolesFromClass = renderRolesFromClass;
window.openAddRole = openAddRole;
window.editRole = function(id) {
    alert('Edit role: ' + id);
};
window.deleteRole = function(id) {
    alert('Delete role: ' + id);
};
