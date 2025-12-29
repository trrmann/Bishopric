// Unit tests for Workflows tab UI logic
import { renderWorkflowsTable, openAddWorkflow } from '../workflows.ui.js';

describe('Workflows Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="workflowsBody"></tbody></table>
        `;
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
