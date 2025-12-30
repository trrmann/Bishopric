/**
 * @jest-environment jsdom
 */
// scripts/__tests__/eventscheduletemplate.ui.test.js
import * as eventSchedule from '../eventscheduletemplate.ui.js';

describe('Event Schedule Template Tab', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="section-toolbar eventscheduletemplate-toolbar improved-toolbar">
                <div class="eventscheduletemplate-toolbar-row">
                    <input type="text" id="eventscheduletemplateSearch" class="eventscheduletemplate-search" placeholder="Search event schedule templates..." />
                    <div class="eventscheduletemplate-toolbar-buttons">
                        <button class="btn-secondary" id="eventscheduletemplateImportBtn">Import</button>
                        <button class="btn-secondary" id="eventscheduletemplateExportBtn">Export</button>
                        <button class="btn-primary eventschedule-AddTemplate" id="eventscheduletemplateAddBtn">Add</button>
                    </div>
                </div>
            </div>
            <table><tbody id="eventscheduletemplateBody"></tbody></table>
        `;
        window.alert = jest.fn();
        require('../eventscheduletemplate.ui.js');
    });
    test('import button triggers import handler', () => {
        document.getElementById('eventscheduletemplateImportBtn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Import Event Schedule Templates/));
    });

    test('export button triggers export handler', () => {
        document.getElementById('eventscheduletemplateExportBtn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Export Event Schedule Templates/));
    });

    test('add button triggers openAddEventScheduleTemplate', () => {
        window.openAddEventScheduleTemplate = jest.fn();
        document.getElementById('eventscheduletemplateAddBtn').onclick();
        expect(window.openAddEventScheduleTemplate).toHaveBeenCalled();
    });

    test('search bar filters event schedule template table', () => {
        const { renderEventScheduleTemplateTable } = require('../eventscheduletemplate.ui.js');
        window.__setAllEventScheduleTemplates([
            { name: 'Ward Council Meeting', description: 'Monthly leadership meeting' },
            { name: 'Bishopric Meeting', description: 'Weekly bishopric planning' }
        ]);
        renderEventScheduleTemplateTable();
        const searchInput = document.getElementById('eventscheduletemplateSearch');
        searchInput.value = 'bishopric';
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
        const rows = document.querySelectorAll('#eventscheduletemplateBody tr');
        expect(rows.length).toBe(1);
        expect(rows[0].innerHTML).toContain('Bishopric Meeting');
    });

    test('renders static templates to table', () => {
        eventSchedule.renderEventScheduleTemplateTable();
        const rows = document.querySelectorAll('#eventscheduletemplateBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].textContent).toContain('Ward Council Meeting');
        expect(rows[1].textContent).toContain('Bishopric Meeting');
    });

    test('openAddEventScheduleTemplate triggers alert', () => {
        window.alert = jest.fn();
        window.openAddEventScheduleTemplate();
        expect(window.alert).toHaveBeenCalledWith('Add Event Schedule Template (not yet implemented)');
    });

    test('editEventScheduleTemplate triggers alert', () => {
        window.alert = jest.fn();
        window.editEventScheduleTemplate(1);
        expect(window.alert).toHaveBeenCalledWith('Edit Event Schedule Template #1 (not yet implemented)');
    });

    test('deleteEventScheduleTemplate triggers alert', () => {
        window.alert = jest.fn();
        window.deleteEventScheduleTemplate(0);
        expect(window.alert).toHaveBeenCalledWith('Delete Event Schedule Template #0 (not yet implemented)');
    });
});
