import { Callings } from "../modules/callings.mjs";
// Render callings from Callings class (async)
export async function renderCallingsFromClass(storageObj) {
  const store = storageObj || window.Storage;
  // Use async factory for proper initialization
  const callingsInstance = await Callings.Factory({ _storageObj: store });
  const callings = callingsInstance.CallingsDetails;
  renderCallingsTable(callings);
}
// Callings tab UI logic

// Always use window.Storage for storage operations
const storage = window.Storage;
export function renderCallingsTable(callings) {
  const tbody = document.getElementById("callingsBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!Array.isArray(callings) || callings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No callings data found.</td></tr>';
    return;
  }
  callings.forEach((calling) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${calling.name || calling.calling || ""}</td>
            <td>${calling.level || ""}</td>
            <td>${calling.hasTitle ? "Yes" : "No"}</td>
            <td>${calling.title || ""}</td>
            <td>${calling.titleOrdinal != null ? calling.titleOrdinal : ""}</td>
            <td>${calling.status || (calling.active ? "Active" : "Inactive")}</td>
            <td style="white-space:nowrap;">
                <button class="callings-edit-btn" data-calling-id="${calling.id}">Edit</button>
                <button class="callings-delete-btn" data-calling-id="${calling.id}">Delete</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
  // Attach button handlers
  tbody.querySelectorAll(".callings-edit-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const id = e.target.getAttribute("data-calling-id");
      window.editCalling(id);
    };
  });
  tbody.querySelectorAll(".callings-delete-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const id = e.target.getAttribute("data-calling-id");
      window.deleteCalling(id);
    };
  });
}

export function openAddCalling() {
  alert("Add Calling modal would open here.");
}

if (typeof window !== "undefined") {
  if (typeof window !== "undefined") {
    window.renderCallingsTable = renderCallingsTable;
    window.renderCallingsFromClass = renderCallingsFromClass;
    window.openAddCalling = openAddCalling;
    window.editCalling = function (id) {
      alert("Edit calling: " + id);
    };
    window.deleteCalling = function (id) {
      alert("Delete calling: " + id);
    };
  }

  // --- Toolbar Button Handlers ---
  window.addEventListener("DOMContentLoaded", () => {
    const importBtn = document.getElementById("callingsImportBtn");
    const exportBtn = document.getElementById("callingsExportBtn");
    const syncBtn = document.getElementById("callingsSyncBtn");
    const searchInput = document.getElementById("callingsSearch");
    let allCallings = [];

    // Fetch and store all callings for search
    async function fetchAndRenderCallings() {
      // Use async factory for proper initialization
      const callingsInstance = await Callings.Factory({
        _storageObj: window.Storage,
      });
      allCallings = callingsInstance.CallingsDetails || [];
      renderCallingsTable(allCallings);
    }

    // Initial load
    if (document.getElementById("callings")) {
      fetchAndRenderCallings();
    }

    // Import
    if (importBtn) {
      importBtn.onclick = () => {
        alert("Import Callings functionality goes here.");
      };
    }
    // Export
    if (exportBtn) {
      exportBtn.onclick = () => {
        alert("Export Callings functionality goes here.");
      };
    }
    // Sync
    if (syncBtn) {
      syncBtn.onclick = async () => {
        await fetchAndRenderCallings();
        alert("Callings synced!");
      };
    }
    // Search
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = allCallings.filter(
          (calling) =>
            (calling.name || calling.calling || "")
              .toLowerCase()
              .includes(val) ||
            (calling.member || "").toLowerCase().includes(val) ||
            (calling.status || "").toLowerCase().includes(val),
        );
        renderCallingsTable(filtered);
      });
    }
  });
}
