// Roles tab UI logic

export function renderRolesTable(roles) {
    const tbody = document.getElementById('rolesBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!roles || roles.length === 0) return;
    roles.forEach(role => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${role.role}</td>
            <td>${role.description}</td>
            <td><button onclick="editRole('${role.role}')">Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}

export function openAddRole() {
    alert('Add Role modal would open here.');
}

window.renderRolesTable = renderRolesTable;
window.openAddRole = openAddRole;
window.editRole = function(role) {
    alert('Edit role: ' + role);
};
