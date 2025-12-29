// Unit tests for Callings tab UI logic
import { renderCallingsTable, openAddCalling } from '../callings.ui.js';

describe('Callings Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="callingsBody"></tbody></table>
        `;
    });

    it('renders callings table with provided callings', () => {
        const callings = [
            { calling: 'Bishop', member: 'John Doe', status: 'Active' },
            { calling: 'Clerk', member: 'Jane Smith', status: 'Pending' }
        ];
        renderCallingsTable(callings);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Bishop');
        expect(rows[1].innerHTML).toContain('Clerk');
    });

    it('renders empty table if no callings', () => {
        renderCallingsTable([]);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(0);
    });

    it('openAddCalling triggers modal/alert', () => {
        window.alert = jest.fn();
        openAddCalling();
        expect(window.alert).toHaveBeenCalled();
    });
});
