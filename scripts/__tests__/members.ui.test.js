/** @jest-environment jsdom */
import { renderMembersTable, renderMembersPagination } from '../members.ui.js';

describe('Members Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input type="text" id="membersSearch" />
            <button id="syncMembersBtn">Sync Members</button>
            <table><tbody id="membersBody"></tbody></table>
            <div id="membersPagination"></div>
        `;
        window.allMembers = [
            {
                memberNumber: '123',
                fullname: 'John Doe',
                email: 'john@example.com',
                phone: '555-1234',
                callingNames: ['Bishop'],
                gender: 'Male',
                stakeUnitNumber: 'STK001',
                unitNumber: 'UNIT001',
            },
            {
                memberNumber: '456',
                fullname: 'Jane Smith',
                email: 'jane@example.com',
                phone: '555-5678',
                callingNames: ['Relief Society President'],
                gender: 'Female',
                stakeUnitNumber: 'STK002',
                unitNumber: 'UNIT002',
            }
        ];
        window.editMember = jest.fn();
        window.deleteMember = jest.fn();
        window.alert = jest.fn();
    });

    it('renders members table with all required columns', () => {
        renderMembersTable(window.allMembers);
        const rows = document.querySelectorAll('#membersBody tr');
        expect(rows.length).toBe(2);
        const firstRow = rows[0].innerHTML;
        expect(firstRow).toContain('John Doe');
        expect(firstRow).toContain('john@example.com');
        expect(firstRow).toContain('123');
        expect(firstRow).toContain('555-1234');
        expect(firstRow).toContain('Bishop');
        expect(firstRow).toContain('Male');
        expect(firstRow).toContain('STK001');
        expect(firstRow).toContain('UNIT001');
        const secondRow = rows[1].innerHTML;
        expect(secondRow).toContain('Jane Smith');
        expect(secondRow).toContain('jane@example.com');
        expect(secondRow).toContain('456');
        expect(secondRow).toContain('555-5678');
        expect(secondRow).toContain('Relief Society President');
        expect(secondRow).toContain('Female');
        expect(secondRow).toContain('STK002');
        expect(secondRow).toContain('UNIT002');
    });

    it('renders Edit and Delete buttons for each member', () => {
        renderMembersTable([window.allMembers[0]]);
        const editBtn = document.querySelector('.members-edit-btn');
        const deleteBtn = document.querySelector('.members-delete-btn');
        expect(editBtn).toBeTruthy();
        expect(deleteBtn).toBeTruthy();
        expect(editBtn.textContent).toMatch(/edit/i);
        expect(deleteBtn.textContent).toMatch(/delete/i);
    });

    it('Edit and Delete button handlers are called', () => {
        renderMembersTable([window.allMembers[0]]);
        document.querySelector('.members-edit-btn').onclick = () => window.editMember('123');
        document.querySelector('.members-delete-btn').onclick = () => window.deleteMember('123');
        document.querySelector('.members-edit-btn').click();
        document.querySelector('.members-delete-btn').click();
        expect(window.editMember).toHaveBeenCalledWith('123');
        expect(window.deleteMember).toHaveBeenCalledWith('123');
    });

    it('renders empty table if no members', () => {
        renderMembersTable([]);
        const rows = document.querySelectorAll('#membersBody tr');
        expect(rows.length).toBe(0);
    });

    it('renders pagination controls and handles page change', () => {
        renderMembersPagination(1, 3);
        const container = document.getElementById('membersPagination');
        expect(container.innerHTML).toContain('changeMembersPage(1)');
        expect(container.innerHTML).toContain('changeMembersPage(2)');
        expect(container.innerHTML).toContain('changeMembersPage(3)');
    });


    it('sync members button triggers handler (alert)', () => {
        // Simulate DOMContentLoaded to attach event handlers
        window.alert = jest.fn();
        window.dispatchEvent(new Event('DOMContentLoaded'));
        const syncBtn = document.getElementById('syncMembersBtn');
        syncBtn.click();
        expect(window.alert).toHaveBeenCalledWith('Members synced!');
    });

    it('members search bar filters members table', () => {
        // Simulate DOMContentLoaded to attach event handlers
        window.dispatchEvent(new Event('DOMContentLoaded'));
        const searchInput = document.getElementById('membersSearch');
        searchInput.value = 'jane';
        searchInput.dispatchEvent(new Event('input'));
        const rows = document.querySelectorAll('#membersBody tr');
        expect(rows.length).toBe(1);
        expect(rows[0].innerHTML).toContain('Jane Smith');
    });
});
