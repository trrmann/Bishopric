// Users tab UI logic

export function renderUsersTable(users) {
  const tbody = document.getElementById("usersBody");
  if (!tbody) return;
  // Always use window.Storage for storage operations
  const storage = window.Storage;
  tbody.innerHTML = "";
  if (!Array.isArray(users) || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No users data found.</td></tr>';
    return;
  }
  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${user.fullname || user.name || ""}</td>
            <td>${user.email || ""}</td>
            <td>${user.memberNumber || ""}</td>
            <td>${Array.isArray(user.roleNames) ? user.roleNames.join(", ") : Array.isArray(user.roles) ? user.roles.join(", ") : ""}</td>
            <td>${user.active ? "Active" : "Inactive"}</td>
            <td style="white-space:normal;">
                <div style="display:flex; flex-wrap:wrap; gap:0.25em;">
                    <button class="users-edit-btn btn-secondary" onclick="editUser('${user.memberNumber}')">Edit</button>
                    <button class="users-delete-btn btn-secondary" onclick="deleteUser('${user.memberNumber}')">Delete</button>
                    <button class="users-reset-btn btn-secondary" onclick="resetUserPassword('${user.memberNumber}')">Reset Password</button>
                    <button class="users-superuser-btn btn-secondary" onclick="makeSuperuser('${user.memberNumber}')">Superuser</button>
                </div>
            </td>
        `;
    tbody.appendChild(tr);
  });
  if (!window.resetUserPassword) {
    window.resetUserPassword = function (memberNumber) {
      alert("Reset password for user: " + memberNumber);
    };
  }
  if (!window.makeSuperuser) {
    window.makeSuperuser = function (memberNumber) {
      alert("Superuser privileges granted to user: " + memberNumber);
    };
  }
}

import { Users } from "../modules/users.mjs";
export async function renderUsersFromClass(storageObj) {
  const store = storageObj || window.Storage;
  const usersInstance = await Users.Factory({ _storageObj: store });
  const details = await usersInstance.UsersDetails();
  // console.log('[DEBUG] UsersDetails returned:', details);
  renderUsersTable(details);
}

export function openAddUser() {
  alert("Add User modal would open here.");
}

window.renderUsersTable = renderUsersTable;
window.renderUsersFromClass = renderUsersFromClass;
window.openAddUser = openAddUser;
window.openAddMember = function () {
  alert("Add Member modal would open here.");
};
window.editUser = function (memberNumber) {
  alert("Edit user: " + memberNumber);
};
window.deleteUser = function (memberNumber) {
  alert("Delete user: " + memberNumber);
};

// --- Toolbar Button Handlers ---
window.addEventListener("DOMContentLoaded", () => {
  const importUsersBtn = document.getElementById("importUsersBtn");
  const importMembersBtn = document.getElementById("importMembersBtn");
  const exportUsersBtn = document.getElementById("exportUsersBtn");
  const exportMembersBtn = document.getElementById("exportMembersBtn");
  const syncMembersBtn = document.getElementById("syncMembersBtn");
  const addUserBtn = document.getElementById("addUserBtn");
  const addMemberBtn = document.getElementById("addMemberBtn");
  const usersSearch = document.getElementById("usersSearch");
  const membersSearch = document.getElementById("membersSearch");
  let allUsers = [];
  let allMembers = [];

  // Fetch and store all users and members for search
  async function fetchAndRenderUsers() {
    const usersInstance = await Users.Factory({ _storageObj: window.Storage });
    allUsers = await usersInstance.UsersDetails();
    renderUsersTable(allUsers);
  }
  // Placeholder: fetch all members (simulate with users for now)
  async function fetchAndRenderMembers() {
    // In a real app, fetch members separately
    allMembers = allUsers;
  }

  // Initial load
  if (document.getElementById("users")) {
    fetchAndRenderUsers();
    fetchAndRenderMembers();
  }

  // Import Users
  if (importUsersBtn) {
    importUsersBtn.onclick = () => {
      alert("Import Users functionality goes here.");
    };
  }
  // Import Members
  if (importMembersBtn) {
    importMembersBtn.onclick = () => {
      alert("Import Members functionality goes here.");
    };
  }
  // Export Users
  if (exportUsersBtn) {
    exportUsersBtn.onclick = () => {
      alert("Export Users functionality goes here.");
    };
  }
  // Export Members
  if (exportMembersBtn) {
    exportMembersBtn.onclick = () => {
      alert("Export Members functionality goes here.");
    };
  }
  // Sync Members
  if (syncMembersBtn) {
    syncMembersBtn.onclick = async () => {
      await fetchAndRenderMembers();
      alert("Members synced!");
    };
  }
  // Add User
  if (addUserBtn) {
    addUserBtn.onclick = () => {
      openAddUser();
    };
  }
  // Add Member
  if (addMemberBtn) {
    addMemberBtn.onclick = () => {
      window.openAddMember();
    };
  }
  // Users Search
  if (usersSearch) {
    usersSearch.addEventListener("input", (e) => {
      const val = e.target.value.toLowerCase();
      const filtered = allUsers.filter(
        (user) =>
          (user.fullname || user.name || "").toLowerCase().includes(val) ||
          (user.email || "").toLowerCase().includes(val) ||
          (user.memberNumber || "").toString().includes(val),
      );
      renderUsersTable(filtered);
    });
  }
  // Members Search (simulate with users for now)
  if (membersSearch) {
    membersSearch.addEventListener("input", (e) => {
      const val = e.target.value.toLowerCase();
      const filtered = allMembers.filter(
        (member) =>
          (member.fullname || member.name || "").toLowerCase().includes(val) ||
          (member.email || "").toLowerCase().includes(val) ||
          (member.memberNumber || "").toString().includes(val),
      );
      renderUsersTable(filtered);
    });
  }
});
