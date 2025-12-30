/**
 * @jest-environment jsdom
 */
// Unit tests for Roles tab UI logic
import { renderRolesTable, openAddRole, renderRolesFromClass } from '../roles.ui.js';

describe('Roles Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="rolesBody"></tbody></table>
        `;
        global.alert = jest.fn();
        global.editRole = jest.fn((id) => alert('Edit role: ' + id));
        global.deleteRole = jest.fn((id) => alert('Delete role: ' + id));
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
            Get: jest.fn(async (filename) => {
                if (filename.includes('roles')) return mockRoles;
                if (filename.includes('callings')) return mockCallings;
                return undefined;
            }),
            Cache: { Set: jest.fn() },
            SessionStorage: { Set: jest.fn() },
            _gitHubDataObj: { fetchJsonFile: jest.fn() }
        };
        await renderRolesFromClass(mockStorage);
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('President');
        expect(rows[1].innerHTML).toContain('Secretary');
    });

    it('renders roles table with provided roles and buttons', () => {
        const roles = [
            { id: 1, name: 'Bishop', callingName: 'Bishop', active: true },
            { id: 2, name: 'Clerk', callingName: 'Clerk', active: true }
        ];
        renderRolesTable(roles);
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Bishop');
        expect(rows[1].innerHTML).toContain('Clerk');
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
            Get: jest.fn(async (filename) => {
                if (filename.includes('roles')) return mockRoles;
                if (filename.includes('callings')) return mockCallings;
                return undefined;
            }),
            Cache: { Set: jest.fn() },
            SessionStorage: { Set: jest.fn() },
            _gitHubDataObj: { fetchJsonFile: jest.fn() }
        };
        await renderRolesFromClass(mockStorage);
        const rows = document.querySelectorAll('#rolesBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Elder');
        expect(rows[1].innerHTML).toContain('Teacher');
    });
});
