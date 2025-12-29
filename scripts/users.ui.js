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
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${Array.isArray(user.roles) ? user.roles.join(', ') : ''}</td>
            <td><button onclick="editUser('${user.memberNumber}')">Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}

export function openAddUser() {
    alert('Add User modal would open here.');
}

window.renderUsersTable = renderUsersTable;
window.openAddUser = openAddUser;
window.editUser = function(memberNumber) {
    alert('Edit user: ' + memberNumber);
};
