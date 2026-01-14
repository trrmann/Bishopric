import { Org } from "../modules/org.mjs";

export async function renderOrganizationTable(storageObj) {
  // Use async factory for proper initialization
  const store = storageObj || window.Storage;
  // Always use window.Storage for storage operations
  const storage = window.Storage;
  const orgInstance = await Org.Factory({ _storageObj: store });
  // Adapt to Org class data structure
  const stakes = Array.isArray(orgInstance.Stakes) ? orgInstance.Stakes : [];
  const tbody = document.getElementById("organizationBody");
  if (!tbody) return;
  if (stakes.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4">No organization data found.</td></tr>';
    console.warn("No organization data found");
    return;
  }
  tbody.innerHTML = "";
  let rowIndex = 0;
  for (const stake of stakes) {
    // Stake header row: name (with unit number label) and add unit button, spanning all columns
    const stakeTr = document.createElement("tr");
    stakeTr.innerHTML = `
            <td colspan="4" style="font-weight:bold; background:#e3e8f0; color:#234; font-size:1.1em; border-top:2px solid #bcd;">
                ${stake.name} <span style="font-weight:normal; font-size:0.95em; color:#789;">(Stake)</span>
                <span style="font-weight:normal; font-size:0.95em; color:#789; margin-left:1em;">Unit Number: ${stake.unitNumber}</span>
                <button class="add-unit-btn" data-stake="${stake.unitNumber}" style="font-size:0.98em; padding:0.4em 1em; float:right;">Add Unit</button>
            </td>
        `;
    tbody.appendChild(stakeTr);
    rowIndex++;
    // Child units
    if (Array.isArray(stake.units)) {
      for (const unit of stake.units) {
        const tr = document.createElement("tr");
        const bg = rowIndex % 2 === 0 ? "#f9fbfd" : "#f3f6fa";
        tr.innerHTML = `
                    <td style="padding-left:2.5em; background:${bg};">${unit.name}</td>
                    <td style="background:${bg}; color:#567; text-align:center;">${unit.unitNumber}</td>
                    <td style="background:${bg}; text-transform:capitalize; color:#468; text-align:center;">${unit.type}</td>
                    <td style="background:${bg}; text-align:center;">
                        <button class="org-edit-btn" data-unit="${unit.unitNumber}" style="margin-right:0.5em;">Edit</button>
                        <button class="org-delete-btn" data-unit="${unit.unitNumber}">Delete</button>
                    </td>
                `;
        tbody.appendChild(tr);
        rowIndex++;
      }
    }
  }

  // Button handlers
  tbody.querySelectorAll(".org-edit-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const unit = e.target.getAttribute("data-unit");
      alert("Edit unit: " + unit);
    };
  });
  tbody.querySelectorAll(".org-delete-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const unit = e.target.getAttribute("data-unit");
      alert("Delete unit: " + unit);
    };
  });
  tbody.querySelectorAll(".add-unit-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const stake = e.target.getAttribute("data-stake");
      alert("Add unit to stake: " + stake);
    };
  });
  tbody.querySelectorAll(".edit-stake-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const stake = e.target.getAttribute("data-stake");
      alert("Edit stake: " + stake);
    };
  });
  tbody.querySelectorAll(".delete-stake-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const stake = e.target.getAttribute("data-stake");
      alert("Delete stake: " + stake);
    };
  });

  // Button handlers
  tbody.querySelectorAll(".org-edit-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const unit = e.target.getAttribute("data-unit");
      alert("Edit unit: " + unit);
    };
  });
  tbody.querySelectorAll(".org-delete-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const unit = e.target.getAttribute("data-unit");
      alert("Delete unit: " + unit);
    };
  });
  tbody.querySelectorAll(".add-unit-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const stake = e.target.getAttribute("data-stake");
      alert("Add unit to stake: " + stake);
    };
  });
}

export function openEditOrganization() {
  alert("Edit Organization modal would open here.");
}

if (typeof window !== "undefined") {
  window.renderOrganizationTable = renderOrganizationTable;
  window.openEditOrganization = openEditOrganization;
  window.editOrganizationUnit = function (unit) {
    alert("Edit organization unit: " + unit);
  };
}
