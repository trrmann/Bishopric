/** @jest-environment jsdom */
// Unit tests for Users tab UI logic
import { renderUsersTable, renderUsersFromClass, openAddUser } from '../users.ui.js';
import { Users } from '../../modules/users.mjs';

describe('Users Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="usersBody"></tbody></table>
        `;
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
