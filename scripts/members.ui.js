import { Members } from "../modules/members.mjs";

export async function renderMembersFromClass(storageObj) {
  const store = storageObj || window.Storage;
  const membersInstance = await Members.Factory({ _storageObj: store });
  renderMembersTable(membersInstance.Members);
}
// Members tab UI logic

export function renderMembersTable(members) {
  const tbody = document.getElementById("membersBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!Array.isArray(members) || members.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9">No members data found.</td></tr>';
    return;
  }
  members.forEach((member) => {
    const tr = document.createElement("tr");
    tr.innerHTML = [
      `<td>${member.fullname || ""}</td>`,
      `<td>${member.email || ""}</td>`,
      `<td>${member.gender || ""}</td>`,
      `<td>${member.memberNumber || ""}</td>`,
      `<td>${member.phone || ""}</td>`,
      `<td>${Array.isArray(member.callingNames) ? member.callingNames.join(", ") : ""}</td>`,
      `<td>${member.stakeUnitNumber || ""}</td>`,
      `<td>${member.unitNumber || ""}</td>`,
      `<td><button class="members-edit-btn" onclick="editMember('${member.memberNumber}')">Edit</button> <button class="members-delete-btn" onclick="deleteMember('${member.memberNumber}')">Delete</button></td>`,
    ].join("");
    tbody.appendChild(tr);
  });
}

export function renderMembersPagination(currentPage, totalPages) {
  const container = document.getElementById("membersPagination");
  if (!container) return;
  let html = "";
  // Previous arrow
  html += `<button onclick="changeMembersPage(${currentPage - 1})"${currentPage === 1 ? " disabled" : ""}>&laquo;</button> `;
  // Page numbers (show up to 5 pages, with ... if many)
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);
  if (currentPage <= 3) end = Math.min(5, totalPages);
  if (currentPage >= totalPages - 2) start = Math.max(1, totalPages - 4);
  if (start > 1) html += "<span>...</span> ";
  for (let i = start; i <= end; i++) {
    html += `<button onclick="changeMembersPage(${i})"${i === currentPage ? ' disabled style=\"font-weight:bold;\"' : ""}>${i}</button> `;
  }
  if (end < totalPages) html += "<span>...</span> ";
  // Next arrow
  html += `<button onclick="changeMembersPage(${currentPage + 1})"${currentPage === totalPages ? " disabled" : ""}>&raquo;</button> `;
  // Page indicator
  html += `<span style="margin-left:1em;">Page ${currentPage} of ${totalPages}</span>`;
  container.innerHTML = html;
}

window.renderMembersTable = renderMembersTable;
window.renderMembersPagination = renderMembersPagination;
window.renderMembersFromClass = renderMembersFromClass;
window.editMember = function (memberNumber) {
  alert("Edit member: " + memberNumber);
};
window.deleteMember = function (memberNumber) {
  alert("Delete member: " + memberNumber);
};

window.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("membersSearch");
  const syncBtn = document.getElementById("syncMembersBtn");
  let allMembers = window.allMembers || [];
  // Search bar
  if (search) {
    search.addEventListener("input", (e) => {
      const val = e.target.value.toLowerCase();
      const filtered = allMembers.filter(
        (member) =>
          (member.fullname || "").toLowerCase().includes(val) ||
          (member.email || "").toLowerCase().includes(val) ||
          (member.memberNumber || "").toString().includes(val),
      );
      renderMembersTable(filtered);
    });
  }
  // Sync Members
  if (syncBtn) {
    syncBtn.onclick = () => {
      // Simulate sync
      alert("Members synced!");
    };
  }
});
