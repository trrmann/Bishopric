/** @jest-environment jsdom */
// Unit tests for Users tab UI logic
import { renderUsersTable, renderUsersFromClass, openAddUser } from '../users.ui.js';
import { Users } from '../../modules/users.mjs';

describe('Users Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="section-toolbar users-toolbar improved-toolbar">
                <div class="users-toolbar-row">
                    <input type="text" id="usersSearch" class="users-search" placeholder="Search users..." />
                    <input type="text" id="membersSearch" class="members-search" placeholder="Search members..." />
                    <div class="users-toolbar-buttons">
                        <button class="btn-secondary" id="importUsersBtn">Import Users</button>
                        <button class="btn-secondary" id="importMembersBtn">Import Members</button>
                        <button class="btn-secondary" id="exportUsersBtn">Export Users</button>
                        <button class="btn-secondary" id="exportMembersBtn">Export Members</button>
                        <button class="btn-secondary" id="syncMembersBtn">Sync Members</button>
                        <button class="btn-primary users-AddUser" id="addUserBtn">Add User</button>
                        <button class="btn-primary users-AddMember" id="addMemberBtn">Add Member</button>
                    </div>
                </div>
            </div>
            <table><tbody id="usersBody"></tbody></table>
        `;
        window.alert = jest.fn();
        window.openAddUser = jest.fn();
        window.openAddMember = jest.fn();
    });
    it('import users button triggers handler', () => {
        require('../users.ui.js');
        document.getElementById('importUsersBtn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Import Users/));
    });

    it('import members button triggers handler', () => {
        require('../users.ui.js');
        document.getElementById('importMembersBtn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Import Members/));
    });

    it('export users button triggers handler', () => {
        require('../users.ui.js');
        document.getElementById('exportUsersBtn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Export Users/));
    });

    it('export members button triggers handler', () => {
        require('../users.ui.js');
        document.getElementById('exportMembersBtn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Export Members/));
    });

    it('sync members button triggers handler', async () => {
        require('../users.ui.js');
        document.getElementById('syncMembersBtn').click();
        await new Promise(r => setTimeout(r, 10));
        expect(window.alert).toHaveBeenCalledWith('Members synced!');
    });

    it('add user button triggers openAddUser', () => {
        require('../users.ui.js');
        document.getElementById('addUserBtn').onclick();
        expect(window.openAddUser).toHaveBeenCalled();
    });

    it('add member button triggers openAddMember', () => {
        require('../users.ui.js');
        document.getElementById('addMemberBtn').onclick();
        expect(window.openAddMember).toHaveBeenCalled();
    });

    it('users search bar filters users table', () => {
        const { renderUsersTable } = require('../users.ui.js');
        const users = [
            { memberNumber: '123', fullname: 'John Doe', email: 'john@example.com', roles: ['Admin'] },
            { memberNumber: '456', fullname: 'Jane Smith', email: 'jane@example.com', roles: ['Member'] }
        ];
        renderUsersTable(users);
        const searchInput = document.getElementById('usersSearch');
        searchInput.value = 'john';
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
        const rows = document.querySelectorAll('#usersBody tr');
        expect(rows.length).toBe(1);
        expect(rows[0].innerHTML).toContain('John Doe');
    });

    it('members search bar filters users table (simulated)', () => {
        const { renderUsersTable } = require('../users.ui.js');
        const users = [
            { memberNumber: '123', fullname: 'John Doe', email: 'john@example.com', roles: ['Admin'] },
            { memberNumber: '456', fullname: 'Jane Smith', email: 'jane@example.com', roles: ['Member'] }
        ];
        renderUsersTable(users);
        const searchInput = document.getElementById('membersSearch');
        searchInput.value = 'jane';
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
        const rows = document.querySelectorAll('#usersBody tr');
        expect(rows.length).toBe(1);
        expect(rows[0].innerHTML).toContain('Jane Smith');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders users table with provided users', () => {
        const users = [
            { memberNumber: '123', name: 'John Doe', email: 'john@example.com', roles: ['Admin', 'Clerk'] },
            { memberNumber: '456', name: 'Jane Smith', email: 'jane@example.com', roles: ['Member'] }
        ];
        renderUsersTable(users);
        const rows = document.querySelectorAll('#usersBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('John Doe');
        expect(rows[1].innerHTML).toContain('Jane Smith');
    });

    it('renders Edit and Delete buttons for each user', () => {
        const users = [
            { memberNumber: '123', name: 'John Doe', email: 'john@example.com', roles: ['Admin'] },
        ];
        renderUsersTable(users);
        const editBtn = document.querySelector('.users-edit-btn');
        const deleteBtn = document.querySelector('.users-delete-btn');
        expect(editBtn).toBeTruthy();
        expect(deleteBtn).toBeTruthy();
        expect(editBtn.textContent).toMatch(/edit/i);
        expect(deleteBtn.textContent).toMatch(/delete/i);
    });

    it('renders empty table if no users', () => {
        renderUsersTable([]);
        const rows = document.querySelectorAll('#usersBody tr');
        expect(rows.length).toBe(0);
    });

    it('Edit and Delete button handlers are called', () => {
        window.editUser = jest.fn();
        window.deleteUser = jest.fn();
        const users = [
            { memberNumber: '123', name: 'John Doe', email: 'john@example.com', roles: ['Admin'] },
        ];
        renderUsersTable(users);
        document.querySelector('.users-edit-btn').click();
        document.querySelector('.users-delete-btn').click();
        expect(window.editUser).toHaveBeenCalledWith('123');
        expect(window.deleteUser).toHaveBeenCalledWith('123');
    });

    it('openAddUser triggers modal/alert', () => {
        window.alert = jest.fn();
        openAddUser();
        expect(window.alert).toHaveBeenCalled();
    });

    it('renders users from Users class (integration)', async () => {
        // Mock Storage and Users.Factory
        const mockUsers = [
            { memberNumber: '111', fullname: 'Alice Example', email: 'alice@example.com', roleNames: ['Admin'] },
            { memberNumber: '222', fullname: 'Bob Example', email: 'bob@example.com', roleNames: ['Member'] }
        ];
        const mockUsersInstance = {
            UsersDetails: jest.fn().mockResolvedValue(mockUsers)
        };
        jest.spyOn(Users, 'Factory').mockResolvedValue(mockUsersInstance);
        await renderUsersFromClass({});
        const rows = document.querySelectorAll('#usersBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Alice Example');
        expect(rows[1].innerHTML).toContain('Bob Example');
        expect(mockUsersInstance.UsersDetails).toHaveBeenCalled();
    });

    it('ensures valid data from Users class is displayed', async () => {
        // This test ensures that the data rendered is what UsersDetails returns
        const validUser = { memberNumber: '333', fullname: 'Valid User', email: 'valid@example.com', roleNames: ['Clerk'] };
        const mockUsersInstance = {
            UsersDetails: jest.fn().mockResolvedValue([validUser])
        };
        jest.spyOn(Users, 'Factory').mockResolvedValue(mockUsersInstance);
        await renderUsersFromClass({});
        const row = document.querySelector('#usersBody tr');
        expect(row.innerHTML).toContain('Valid User');
        expect(row.innerHTML).toContain('valid@example.com');
        expect(row.innerHTML).toContain('Clerk');
    });
});
