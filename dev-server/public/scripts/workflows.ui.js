// Workflows tab UI logic

export function renderWorkflowsTable(workflows) {
  const tbody = document.getElementById("workflowsBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!Array.isArray(workflows) || workflows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No workflows data found.</td></tr>';
    return;
  }
  workflows.forEach((workflow) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${workflow.workflow}</td>
            <td>${workflow.description}</td>
            <td><button onclick="editWorkflow('${workflow.workflow}')">Edit</button></td>
        `;
    tbody.appendChild(tr);
  });
}

export function openAddWorkflow() {
  alert("Add Workflow modal would open here.");
}

window.renderWorkflowsTable = renderWorkflowsTable;
window.openAddWorkflow = openAddWorkflow;
window.editWorkflow = function (workflow) {
  alert("Edit workflow: " + workflow);
};

// --- Toolbar Button Handlers ---
window.addEventListener("DOMContentLoaded", () => {
  const importBtn = document.getElementById("workflowsImportBtn");
  const exportBtn = document.getElementById("workflowsExportBtn");
  const addBtn = document.getElementById("workflowsAddBtn");
  const searchInput = document.getElementById("workflowsSearch");
  let allWorkflows = [];

  // Placeholder: fetch all workflows (simulate with static data for now)
  function fetchAndRenderWorkflows() {
    // In a real app, fetch workflows from storage or API
    // For now, do nothing (assume allWorkflows is set externally)
    renderWorkflowsTable(allWorkflows);
  }

  // Import
  if (importBtn) {
    importBtn.onclick = () => {
      alert("Import Workflows functionality goes here.");
    };
  }
  // Export
  if (exportBtn) {
    exportBtn.onclick = () => {
      alert("Export Workflows functionality goes here.");
    };
  }
  // Add
  if (addBtn) {
    addBtn.onclick = () => {
      openAddWorkflow();
    };
  }
  // Search
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value.toLowerCase();
      const filtered = allWorkflows.filter(
        (workflow) =>
          (workflow.workflow || "").toLowerCase().includes(val) ||
          (workflow.description || "").toLowerCase().includes(val),
      );
      renderWorkflowsTable(filtered);
    });
  }
  // Expose for testability
  window.__setAllWorkflows = (arr) => {
    allWorkflows = arr;
    renderWorkflowsTable(allWorkflows);
  };
});
