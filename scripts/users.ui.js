// Users tab UI logic

export function renderUsersTable(users) {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!users || users.length === 0) return;
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.memberNumber}</td>
            <td>${user.fullname || user.name || ''}</td>
            <td>${user.email || ''}</td>
            <td>${Array.isArray(user.roleNames) ? user.roleNames.join(', ') : (Array.isArray(user.roles) ? user.roles.join(', ') : '')}</td>
            <td>
                <button class="users-edit-btn" onclick="editUser('${user.memberNumber}')">Edit</button>
                <button class="users-delete-btn" onclick="deleteUser('${user.memberNumber}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

import { Users } from '../modules/users.mjs';
export async function renderUsersFromClass(storageObj) {
    const store = storageObj || window.Storage;
    const usersInstance = await Users.Factory({ _storageObj: store });
    const details = await usersInstance.UsersDetails();
        // console.log('[DEBUG] UsersDetails returned:', details);
    renderUsersTable(details);
}

export function openAddUser() {
    alert('Add User modal would open here.');
}

window.renderUsersTable = renderUsersTable;
window.renderUsersFromClass = renderUsersFromClass;
window.openAddUser = openAddUser;
window.editUser = function(memberNumber) {
    alert('Edit user: ' + memberNumber);
};
window.deleteUser = function(memberNumber) {
    alert('Delete user: ' + memberNumber);
};
