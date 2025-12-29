// Unit tests for Roles tab UI logic
import { renderRolesTable, openAddRole } from '../roles.ui.js';

describe('Roles Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="rolesBody"></tbody></table>
        `;
    });

    it('renders roles table with provided roles', () => {
        const roles = [
            { role: 'Admin', description: 'System administrator' },
            { role: 'Clerk', description: 'Ward clerk' }
        ];
        renderRolesTable(roles);
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Admin');
        expect(rows[1].innerHTML).toContain('Clerk');
    });

    it('renders empty table if no roles', () => {
        renderRolesTable([]);
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(0);
    });

    it('openAddRole triggers modal/alert', () => {
        window.alert = jest.fn();
        openAddRole();
        expect(window.alert).toHaveBeenCalled();
    });
});
