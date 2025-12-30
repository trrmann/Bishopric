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
            <td>${role.callingName ? role.callingName : 'none'}</td>
            <td>${Array.isArray(role.subRoleNames) ? role.subRoleNames.join(', ') : ''}</td>
            <td>${role.status || (role.active ? 'Active' : 'Inactive')}</td>
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

if (typeof window !== 'undefined') {
    window.renderRolesTable = renderRolesTable;
    window.renderRolesFromClass = renderRolesFromClass;
    window.openAddRole = openAddRole;
    window.editRole = function(id) {
        alert('Edit role: ' + id);
    };
    window.deleteRole = function(id) {
        alert('Delete role: ' + id);
    };
}

// --- Toolbar Button Handlers ---
window.addEventListener('DOMContentLoaded', () => {
    const importBtn = document.getElementById('rolesImportBtn');
    const exportBtn = document.getElementById('rolesExportBtn');
    const searchInput = document.getElementById('rolesSearch');
    let allRoles = [];

    // Fetch and store all roles for search
    async function fetchAndRenderRoles() {
        const rolesInstance = await Roles.Factory({ _storageObj: window.Storage });
        allRoles = rolesInstance.RolesDetails || [];
        renderRolesTable(allRoles);
    }

    // Initial load
    if (document.getElementById('roles')) {
        fetchAndRenderRoles();
    }

    // Import
    if (importBtn) {
        importBtn.onclick = () => {
            alert('Import Roles functionality goes here.');
        };
    }
    // Export
    if (exportBtn) {
        exportBtn.onclick = () => {
            alert('Export Roles functionality goes here.');
        };
    }
    // Search
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            const val = e.target.value.toLowerCase();
            const filtered = allRoles.filter(role =>
                (role.name || '').toLowerCase().includes(val) ||
                (role.callingName || '').toLowerCase().includes(val)
            );
            renderRolesTable(filtered);
        });
    }
});
