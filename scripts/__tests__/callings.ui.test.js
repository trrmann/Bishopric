/**
 * @jest-environment jsdom
 */
// Unit tests for Callings tab UI logic
import { renderCallingsTable, openAddCalling, renderCallingsFromClass } from '../callings.ui.js';

describe('Callings Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="callingsBody"></tbody></table>
        `;
        global.alert = jest.fn();
        global.editCalling = jest.fn((id) => alert('Edit calling: ' + id));
        global.deleteCalling = jest.fn((id) => alert('Delete calling: ' + id));
    });

    it('renders callings from Callings class (integration)', async () => {
        // Mock Storage with callings data
        const mockCallings = [
            { id: 10, name: 'Elder', member: 'Eli Brown', active: true },
            { id: 11, name: 'Teacher', member: 'Tina White', active: false }
        ];
        const mockStorage = {
            Get: jest.fn(async () => mockCallings),
            Cache: { Set: jest.fn() },
            SessionStorage: { Set: jest.fn() },
            _gitHubDataObj: { fetchJsonFile: jest.fn() }
        };
        await renderCallingsFromClass(mockStorage);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Elder');
        expect(rows[1].innerHTML).toContain('Teacher');
    });

    it('renders callings table with provided callings and buttons', () => {
        const callings = [
            { id: 1, name: 'Bishop', member: 'John Doe', active: true },
            { id: 2, name: 'Clerk', member: 'Jane Smith', active: false }
        ];
        renderCallingsTable(callings);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Bishop');
        expect(rows[1].innerHTML).toContain('Clerk');
        // Buttons present
        expect(rows[0].querySelector('.callings-edit-btn')).toBeTruthy();
        expect(rows[0].querySelector('.callings-delete-btn')).toBeTruthy();
    });

    it('edit button triggers editCalling', () => {
        const callings = [ { id: 1, name: 'Bishop', member: 'John Doe', active: true } ];
        renderCallingsTable(callings);
        const editBtn = document.querySelector('.callings-edit-btn');
        editBtn.click();
        expect(global.alert).toHaveBeenCalledWith('Edit calling: 1');
    });

    it('delete button triggers deleteCalling', () => {
        const callings = [ { id: 2, name: 'Clerk', member: 'Jane Smith', active: false } ];
        renderCallingsTable(callings);
        const delBtn = document.querySelector('.callings-delete-btn');
        delBtn.click();
        expect(global.alert).toHaveBeenCalledWith('Delete calling: 2');
    });

    it('renders empty table if no callings', () => {
        renderCallingsTable([]);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(0);
    });

    it('openAddCalling triggers modal/alert', () => {
        openAddCalling();
        expect(global.alert).toHaveBeenCalled();
    });
});
