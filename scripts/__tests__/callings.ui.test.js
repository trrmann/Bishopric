/**
 * @jest-environment jsdom
 */
// Unit tests for Callings tab UI logic

describe('Callings Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="section-toolbar callings-toolbar improved-toolbar">
                <div class="callings-toolbar-row">
                    <input type="text" id="callingsSearch" class="callings-search" placeholder="Search callings..." />
                    <div class="callings-toolbar-buttons">
                        <button class="btn-secondary" id="callingsImportBtn">Import</button>
                        <button class="btn-secondary" id="callingsExportBtn">Export</button>
                        <button class="btn-secondary" id="callingsSyncBtn">Sync</button>
                        <button class="btn-primary callings-AddCalling" id="callingsAddBtn">Add</button>
                    </div>
                </div>
            </div>
            <table><tbody id="callingsBody"></tbody></table>
        `;
        global.alert = jest.fn();
        global.editCalling = jest.fn((id) => alert('Edit calling: ' + id));
        global.deleteCalling = jest.fn((id) => alert('Delete calling: ' + id));
        // Inject valid async storage mock for all tests
        global.Storage = {
            Get: jest.fn(async () => []),
            Set: jest.fn(async () => {}),
        };
        // Do not import callings.ui.js or dispatch DOMContentLoaded here
    });
    it('import button triggers import handler', () => {
        jest.resetModules();
        require('../callings.ui.js');
        const event = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
        window.dispatchEvent(event);
        const importBtn = document.getElementById('callingsImportBtn');
        importBtn.click();
        expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/Import Callings/));
    });

    it('export button triggers export handler', () => {
        jest.resetModules();
        require('../callings.ui.js');
        const event = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
        window.dispatchEvent(event);
        const exportBtn = document.getElementById('callingsExportBtn');
        exportBtn.click();
        expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/Export Callings/));
    });

    it('sync button triggers sync handler and reloads table', async () => {
        jest.resetModules();
        require('../callings.ui.js');
        // Re-dispatch DOMContentLoaded to attach handler
        const event = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
        window.dispatchEvent(event);
        const syncBtn = document.getElementById('callingsSyncBtn');
        syncBtn.click();
        // Wait for async
        await new Promise(r => setTimeout(r, 10));
        expect(global.alert).toHaveBeenCalledWith('Callings synced!');
    });

    it('add button triggers openAddCalling', () => {
        jest.resetModules();
        require('../callings.ui.js');
        const event = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
        window.dispatchEvent(event);
        const addBtn = document.getElementById('callingsAddBtn');
        addBtn.onclick = window.openAddCalling;
        addBtn.click();
        expect(global.alert).toHaveBeenCalled();
    });

    it('search bar filters callings table', async () => {
        // Add #callings element so fetchAndRenderCallings runs
        const callingsDiv = document.createElement('div');
        callingsDiv.id = 'callings';
        document.body.appendChild(callingsDiv);
        // Mock window.Callings.Factory and window.Storage before importing UI module
        const testCallings = [
            { id: 1, name: 'Bishop', member: 'John Doe', active: true },
            { id: 2, name: 'Clerk', member: 'Jane Smith', active: false }
        ];
        window.Callings = {
            Factory: async () => ({
                get CallingsDetails() { return testCallings; }
            })
        };
        window.Storage = {
            Get: jest.fn(async () => testCallings),
            Set: jest.fn(async () => {})
        };
        jest.resetModules();
        require('../callings.ui.js');
        const event = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
        window.dispatchEvent(event);
        await new Promise(r => setTimeout(r, 50));
        const searchInput = document.getElementById('callingsSearch');
        searchInput.value = 'bishop';
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
        // Debug: log table rows after async render
        const rows = Array.from(document.querySelectorAll('#callingsBody tr'));
        console.log('Table rows after search:', rows.map(r => r.innerHTML));
        const visibleRows = rows.filter(row => row.innerHTML.toLowerCase().includes('bishop'));
        console.log('Visible rows:', visibleRows.length, visibleRows.map(r => r.innerHTML));
        expect(visibleRows.length).toBe(1);
        expect(visibleRows[0].innerHTML).toContain('Bishop');
    });

    it('displays callings data from the Callings class (integration)', async () => {
        // Mock Storage with callings data
        const mockCallings = [
            { id: 201, name: 'President', member: 'Alice', active: true },
            { id: 202, name: 'Secretary', member: 'Bob', active: true }
        ];
        const mockStorage = {
            Get: jest.fn(async () => mockCallings),
            Set: jest.fn(async () => {}),
        };
        await renderCallingsFromClass(mockStorage);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('President');
        expect(rows[1].innerHTML).toContain('Secretary');
    });

    it('renders callings from Callings class (integration)', async () => {
        // Mock Storage with callings data
        const mockCallings = [
            { id: 10, name: 'Elder', member: 'Eli Brown', active: true },
            { id: 11, name: 'Teacher', member: 'Tina White', active: false }
        ];
        const mockStorage = {
            Get: jest.fn(async () => mockCallings),
            Set: jest.fn(async () => {}),
        };
        await renderCallingsFromClass(mockStorage);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Elder');
        expect(rows[1].innerHTML).toContain('Teacher');
    });

    it('renders callings table with provided callings and buttons', () => {
        const { renderCallingsTable } = require('../callings.ui.js');
        const callings = [
            { id: 1, name: 'Bishop', level: 'Ward', hasTitle: true, title: 'President', titleOrdinal: 1, status: 'Active' },
            { id: 2, name: 'Clerk', level: 'Ward', hasTitle: false, title: '', titleOrdinal: '', status: 'Inactive' }
        ];
        renderCallingsTable(callings);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(2);
        // Check columns for first row
        const cells0 = rows[0].querySelectorAll('td');
        expect(cells0[0].textContent).toBe('Bishop');
        expect(cells0[1].textContent).toBe('Ward');
        expect(cells0[2].textContent).toBe('Yes');
        expect(cells0[3].textContent).toBe('President');
        expect(cells0[4].textContent).toBe('1');
        expect(cells0[5].textContent).toBe('Active');
        // Check columns for second row
        const cells1 = rows[1].querySelectorAll('td');
        expect(cells1[0].textContent).toBe('Clerk');
        expect(cells1[1].textContent).toBe('Ward');
        expect(cells1[2].textContent).toBe('No');
        expect(cells1[3].textContent).toBe('');
        expect(cells1[4].textContent).toBe('');
        expect(cells1[5].textContent).toBe('Inactive');
        // Buttons present
        expect(rows[0].querySelector('.callings-edit-btn')).toBeTruthy();
        expect(rows[0].querySelector('.callings-delete-btn')).toBeTruthy();
        expect(rows[1].querySelector('.callings-edit-btn')).toBeTruthy();
        expect(rows[1].querySelector('.callings-delete-btn')).toBeTruthy();
    });

    it('edit button triggers editCalling', () => {
        const { renderCallingsTable } = require('../callings.ui.js');
        const callings = [ { id: 1, name: 'Bishop', member: 'John Doe', active: true } ];
        renderCallingsTable(callings);
        const editBtn = document.querySelector('.callings-edit-btn');
        expect(editBtn).toBeTruthy();
        editBtn && editBtn.click();
        expect(global.alert).toHaveBeenCalledWith('Edit calling: 1');
    });

    it('delete button triggers deleteCalling', () => {
        const { renderCallingsTable } = require('../callings.ui.js');
        const callings = [ { id: 2, name: 'Clerk', member: 'Jane Smith', active: false } ];
        renderCallingsTable(callings);
        const delBtn = document.querySelector('.callings-delete-btn');
        expect(delBtn).toBeTruthy();
        delBtn && delBtn.click();
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
