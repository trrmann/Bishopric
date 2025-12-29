// Unit tests for Users tab UI logic
import { renderUsersTable, openAddUser } from '../users.ui.js';

describe('Users Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="usersBody"></tbody></table>
        `;
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

    it('renders empty table if no users', () => {
        renderUsersTable([]);
        const rows = document.querySelectorAll('#usersBody tr');
        expect(rows.length).toBe(0);
    });

    it('openAddUser triggers modal/alert', () => {
        window.alert = jest.fn();
        openAddUser();
        expect(window.alert).toHaveBeenCalled();
    });
});
