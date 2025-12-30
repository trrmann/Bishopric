// Unit tests for Workflows tab UI logic
import { renderWorkflowsTable, openAddWorkflow } from '../workflows.ui.js';


describe('Workflows Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="section-toolbar workflows-toolbar improved-toolbar">
                <div class="workflows-toolbar-row">
                    <input type="text" id="workflowsSearch" class="workflows-search" placeholder="Search workflows..." />
                    <div class="workflows-toolbar-buttons">
                        <button class="btn-secondary" id="workflowsImportBtn">Import</button>
                        <button class="btn-secondary" id="workflowsExportBtn">Export</button>
                        <button class="btn-primary workflows-AddWorkflow" id="workflowsAddBtn">Add</button>
                    </div>
                </div>
            </div>
            <table><tbody id="workflowsBody"></tbody></table>
        `;
        window.alert = jest.fn();
        require('../workflows.ui.js');
    });
    it('import button triggers import handler', () => {
        document.getElementById('workflowsImportBtn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Import Workflows/));
    });

    it('export button triggers export handler', () => {
        document.getElementById('workflowsExportBtn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Export Workflows/));
    });

    it('add button triggers openAddWorkflow', () => {
        document.getElementById('workflowsAddBtn').onclick();
        expect(window.alert).toHaveBeenCalled();
    });

    it('search bar filters workflows table', () => {
        const { renderWorkflowsTable } = require('../workflows.ui.js');
        const workflows = [
            { workflow: 'Calling Pipeline', description: 'Automates calling process' },
            { workflow: 'Sacrament Talk', description: 'Manages sacrament talks' }
        ];
        window.__setAllWorkflows(workflows);
        const searchInput = document.getElementById('workflowsSearch');
        searchInput.value = 'sacrament';
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
        const rows = document.querySelectorAll('#workflowsBody tr');
        expect(rows.length).toBe(1);
        expect(rows[0].innerHTML).toContain('Sacrament Talk');
    });

    it('renders workflows table with provided workflows', () => {
        const workflows = [
            { workflow: 'Calling Pipeline', description: 'Automates calling process' },
            { workflow: 'Sacrament Talk', description: 'Manages sacrament talks' }
        ];
        renderWorkflowsTable(workflows);
        const rows = document.querySelectorAll('#workflowsBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Calling Pipeline');
        expect(rows[1].innerHTML).toContain('Sacrament Talk');
    });

    it('renders empty table if no workflows', () => {
        renderWorkflowsTable([]);
        const rows = document.querySelectorAll('#workflowsBody tr');
        expect(rows.length).toBe(0);
    });

    it('openAddWorkflow triggers modal/alert', () => {
        window.alert = jest.fn();
        openAddWorkflow();
        expect(window.alert).toHaveBeenCalled();
    });
});
