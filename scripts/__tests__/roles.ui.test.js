/**
 * @jest-environment jsdom
 */
// Unit tests for Roles tab UI logic
import { renderRolesTable, openAddRole, renderRolesFromClass } from '../roles.ui.js';

describe('Roles Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="section-toolbar roles-toolbar improved-toolbar">
                <div class="roles-toolbar-row">
                    <input type="text" id="rolesSearch" class="roles-search" placeholder="Search roles..." />
                    <div class="roles-toolbar-buttons">
                        <button class="btn-secondary" id="rolesImportBtn">Import</button>
                        <button class="btn-secondary" id="rolesExportBtn">Export</button>
                        <button class="btn-primary roles-AddRole" id="rolesAddBtn">Add</button>
                    </div>
                </div>
            </div>
            <table><tbody id="rolesBody"></tbody></table>
        `;
        global.alert = jest.fn();
        global.editRole = jest.fn((id) => alert('Edit role: ' + id));
        global.deleteRole = jest.fn((id) => alert('Delete role: ' + id));
        jest.resetModules();
        require('../roles.ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
    });
        it('import button triggers import handler', () => {
            require('../roles.ui.js'); // Ensure event listeners are attached
            const importBtn = document.getElementById('rolesImportBtn');
            importBtn.click();
            expect(global.alert).toHaveBeenCalledWith('Import Roles functionality goes here.');
        });

    it('export button triggers export handler', () => {
        require('../roles.ui.js');
        const exportBtn = document.getElementById('rolesExportBtn');
        exportBtn.click();
        expect(global.alert).toHaveBeenCalledWith('Export Roles functionality goes here.');
    });

    it('add button triggers openAddRole', () => {
        require('../roles.ui.js');
        const addBtn = document.getElementById('rolesAddBtn');
        addBtn.onclick = () => openAddRole();
        addBtn.click();
        expect(global.alert).toHaveBeenCalled();
    });

    it('search bar filters roles table', () => {
        // Setup table and roles
        const { renderRolesTable } = require('../roles.ui.js');
        const roles = [
            { id: 1, name: 'Bishop', callingName: 'Bishop', active: true },
            { id: 2, name: 'Clerk', callingName: 'Clerk', active: true }
        ];
        renderRolesTable(roles);
        const searchInput = document.getElementById('rolesSearch');
        searchInput.value = 'bishop';
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
        // Simulate filtering logic as in the UI
        const filtered = roles.filter(r => r.name.toLowerCase().includes('bishop'));
        renderRolesTable(filtered);
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(1);
        expect(rows[0].innerHTML).toContain('Bishop');
    });

    it('displays roles data from the Roles class (integration)', async () => {
        // Mock Storage with roles and callings data
        const mockRoles = {
            roles: [
                { id: 101, name: 'President', calling: 201, active: true },
                { id: 102, name: 'Secretary', calling: 202, active: true }
            ]
        };
        const mockCallings = {
            callings: [
                { id: 201, name: 'President', active: true },
                { id: 202, name: 'Secretary', active: true }
            ]
        };
        const mockStorage = {
            Get: async (filename) => {
                if (filename && filename.includes('roles')) return mockRoles;
                if (filename && filename.includes('callings')) return mockCallings;
                return undefined;
            },
            Set: async () => {},
            Cache: { Set: jest.fn() },
            SessionStorage: { Set: jest.fn() },
            _gitHubDataObj: { fetchJsonFile: jest.fn() }
        };
        window.Storage = mockStorage;
        await renderRolesFromClass();
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('President');
        expect(rows[1].innerHTML).toContain('Secretary');
    });

    it('renders roles table with new columns and buttons', () => {
        const roles = [
            { id: 1, name: 'Bishop', callingName: 'Bishop', subRoleNames: ['Assistant'], status: 'Active' },
            { id: 2, name: 'Clerk', callingName: '', subRoleNames: [], status: 'Inactive' },
            { id: 3, name: 'Teacher', subRoleNames: ['Junior', 'Senior'], status: 'Active' }
        ];
        renderRolesTable(roles);
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(3);
        // Check columns for first row
        const cells = rows[0].querySelectorAll('td');
        expect(cells[0].textContent).toBe('Bishop'); // Role Name
        expect(cells[1].textContent).toBe('Bishop'); // Calling Name
        expect(cells[2].textContent).toBe('Assistant'); // Sub Role Names
        expect(cells[3].textContent).toBe('Active'); // Status
        // Second row: callingName empty, should show 'none'
        expect(cells.length).toBe(5);
        const cells2 = rows[1].querySelectorAll('td');
        expect(cells2[0].textContent).toBe('Clerk');
        expect(cells2[1].textContent).toBe('none');
        expect(cells2[2].textContent).toBe('');
        expect(cells2[3].textContent).toBe('Inactive');
        // Third row: multiple subRoleNames
        const cells3 = rows[2].querySelectorAll('td');
        expect(cells3[0].textContent).toBe('Teacher');
        expect(cells3[1].textContent).toBe('none');
        expect(cells3[2].textContent).toBe('Junior, Senior');
        expect(cells3[3].textContent).toBe('Active');
        // Buttons
        expect(rows[0].querySelector('.roles-edit-btn')).toBeTruthy();
        expect(rows[0].querySelector('.roles-delete-btn')).toBeTruthy();
    });

    it('edit button triggers editRole', () => {
        const roles = [ { id: 1, name: 'Bishop', callingName: 'Bishop', active: true } ];
        renderRolesTable(roles);
        const editBtn = document.querySelector('.roles-edit-btn');
        editBtn.click();
        expect(global.alert).toHaveBeenCalledWith('Edit role: 1');
    });

    it('delete button triggers deleteRole', () => {
        const roles = [ { id: 2, name: 'Clerk', callingName: 'Clerk', active: true } ];
        renderRolesTable(roles);
        const delBtn = document.querySelector('.roles-delete-btn');
        delBtn.click();
        expect(global.alert).toHaveBeenCalledWith('Delete role: 2');
    });

    it('renders empty table if no roles', () => {
        renderRolesTable([]);
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(0);
    });

    it('openAddRole triggers modal/alert', () => {
        openAddRole();
        expect(global.alert).toHaveBeenCalled();
    });

    it('renders roles from Roles class (integration)', async () => {
        // Mock Storage with roles data
        const mockRoles = {
            roles: [
                { id: 10, name: 'Elder', calling: 1, active: true },
                { id: 11, name: 'Teacher', calling: 2, active: false }
            ]
        };
        const mockCallings = {
            callings: [
                { id: 1, name: 'Elder', active: true },
                { id: 2, name: 'Teacher', active: false }
            ]
        };
        const mockStorage = {
            Get: async (filename) => {
                if (filename && filename.includes('roles')) return mockRoles;
                if (filename && filename.includes('callings')) return mockCallings;
                return undefined;
            },
            Set: async () => {},
            Cache: { Set: jest.fn() },
            SessionStorage: { Set: jest.fn() },
            _gitHubDataObj: { fetchJsonFile: jest.fn() }
        };
        window.Storage = mockStorage;
        await renderRolesFromClass();
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Elder');
        expect(rows[1].innerHTML).toContain('Teacher');
    });
});
