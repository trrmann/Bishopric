// modules/eventscheduletemplate.ui.js
// Modular logic for the Event Schedule Template tab

export function initEventScheduleTemplateTab() {
  // Called on page load to initialize the tab
  renderEventScheduleTemplateTable();
}

export function renderEventScheduleTemplateTable() {
  const tbody = document.getElementById("eventscheduletemplateBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  // For now, use a static example. Replace with real data integration as needed.
  const templates = [
    { name: "Ward Council Meeting", description: "Monthly leadership meeting" },
    { name: "Bishopric Meeting", description: "Weekly bishopric planning" },
  ];
  if (!Array.isArray(templates) || templates.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3">No event schedule templates found.</td></tr>';
    return;
  }
  templates.forEach((tpl, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${tpl.name}</td>
            <td>${tpl.description}</td>
            <td>
                <button class="btn-secondary" onclick="editEventScheduleTemplate(${idx})"><i class="fas fa-edit"></i></button>
                <button class="btn-danger" onclick="deleteEventScheduleTemplate(${idx})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Placeholder for add/edit/delete actions

if (typeof window !== "undefined") {
  window.openAddEventScheduleTemplate = function () {
    alert("Add Event Schedule Template (not yet implemented)");
  };
  window.editEventScheduleTemplate = function (idx) {
    alert(`Edit Event Schedule Template #${idx} (not yet implemented)`);
  };
  window.deleteEventScheduleTemplate = function (idx) {
    alert(`Delete Event Schedule Template #${idx} (not yet implemented)`);
  };

  // --- Toolbar Button Handlers ---
  window.addEventListener("DOMContentLoaded", () => {
    const importBtn = document.getElementById("eventscheduletemplateImportBtn");
    const exportBtn = document.getElementById("eventscheduletemplateExportBtn");
    const addBtn = document.getElementById("eventscheduletemplateAddBtn");
    const searchInput = document.getElementById("eventscheduletemplateSearch");
    let allTemplates = [
      {
        name: "Ward Council Meeting",
        description: "Monthly leadership meeting",
      },
      { name: "Bishopric Meeting", description: "Weekly bishopric planning" },
    ];

    // Import
    if (importBtn) {
      importBtn.onclick = () => {
        alert("Import Event Schedule Templates functionality goes here.");
      };
    }
    // Export
    if (exportBtn) {
      exportBtn.onclick = () => {
        alert("Export Event Schedule Templates functionality goes here.");
      };
    }
    // Add
    if (addBtn) {
      addBtn.onclick = () => {
        window.openAddEventScheduleTemplate();
      };
    }
    // Search
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        let filtered = [];
        if (Array.isArray(allTemplates)) {
          filtered = allTemplates.filter(
            (tpl) =>
              (tpl.name || "").toLowerCase().includes(val) ||
              (tpl.description || "").toLowerCase().includes(val),
          );
        }
        // Render filtered
        const tbody = document.getElementById("eventscheduletemplateBody");
        if (!tbody) return;
        tbody.innerHTML = "";
        if (!Array.isArray(filtered) || filtered.length === 0) {
          tbody.innerHTML =
            '<tr><td colspan="3">No event schedule templates found.</td></tr>';
          return;
        }
        filtered.forEach((tpl, idx) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                        <td>${tpl.name}</td>
                        <td>${tpl.description}</td>
                        <td>
                            <button class="btn-secondary" onclick="editEventScheduleTemplate(${idx})"><i class="fas fa-edit"></i></button>
                            <button class="btn-danger" onclick="deleteEventScheduleTemplate(${idx})"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
          tbody.appendChild(tr);
        });
      });
    }
    // Expose for testability
    window.__setAllEventScheduleTemplates = (arr) => {
      allTemplates = arr;
    };
  });
}
