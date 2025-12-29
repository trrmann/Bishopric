// Workflows tab UI logic

export function renderWorkflowsTable(workflows) {
    const tbody = document.getElementById('workflowsBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!workflows || workflows.length === 0) return;
    workflows.forEach(workflow => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${workflow.workflow}</td>
            <td>${workflow.description}</td>
            <td><button onclick="editWorkflow('${workflow.workflow}')">Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}

export function openAddWorkflow() {
    alert('Add Workflow modal would open here.');
}

window.renderWorkflowsTable = renderWorkflowsTable;
window.openAddWorkflow = openAddWorkflow;
window.editWorkflow = function(workflow) {
    alert('Edit workflow: ' + workflow);
};
