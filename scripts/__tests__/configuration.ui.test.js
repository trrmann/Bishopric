
/**
 * @jest-environment jsdom
 */
import { renderConfigurationTable } from '../configuration.ui.js';
import { Configuration } from '../../modules/configuration.mjs';

describe('Configuration Table UI', () => {
    let tbody;
    let originalConsoleLog;
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="configurationBody"></tbody></table>
        `;
        tbody = document.getElementById('configurationBody');
        // Mock Configuration
        jest.spyOn(Configuration.prototype, 'Fetch').mockImplementation(async function() {
            this.configuration = {
                testKey: 'testValue',
                nested: { inner: 123 }
            };
        });
        jest.spyOn(Configuration.prototype, 'HasConfig').mockImplementation(function() {
            return !!this.configuration;
        });
        jest.spyOn(Configuration.prototype, 'FlattenObject').mockImplementation(function(obj) {
            return {
                testKey: 'testValue',
                'nested.inner': 123
            };
        });
        originalConsoleLog = console.log;
        console.log = jest.fn();
    });
    afterEach(() => {
        jest.restoreAllMocks();
        console.log = originalConsoleLog;
    });
    it('renders configuration data in hierarchical rows and logs to console', async () => {
        await renderConfigurationTable();
        expect(tbody.innerHTML).toContain('testKey');
        expect(tbody.innerHTML).toContain('testValue');
        expect(tbody.innerHTML).toContain('nested.inner');
        expect(tbody.innerHTML).toContain('123');
        expect(console.log).toHaveBeenCalledWith(
            'Hierarchical Configuration Data:',
            expect.objectContaining({ testKey: 'testValue', 'nested.inner': 123 })
        );
    });
    it('renders edit and delete buttons for each row', async () => {
        await renderConfigurationTable();
        expect(tbody.querySelectorAll('.config-edit-btn').length).toBeGreaterThan(0);
        expect(tbody.querySelectorAll('.config-delete-btn').length).toBeGreaterThan(0);
    });
    it('shows error if fetch fails', async () => {
        jest.spyOn(Configuration.prototype, 'Fetch').mockImplementation(async function() {
            throw new Error('fail');
        });
        await renderConfigurationTable();
        expect(tbody.innerHTML).toContain('Error loading configuration');
    });
    it('shows no data message if config is empty', async () => {
        jest.spyOn(Configuration.prototype, 'HasConfig').mockImplementation(() => false);
        await renderConfigurationTable();
        expect(tbody.innerHTML).toContain('No configuration data found.');
    });
});
