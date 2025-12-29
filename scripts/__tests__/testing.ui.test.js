// Unit tests for Testing tab UI logic
import { resetCache, exportData } from '../testing.ui.js';

describe('Testing Tab UI', () => {
    it('resetCache triggers modal/alert', () => {
        window.alert = jest.fn();
        resetCache();
        expect(window.alert).toHaveBeenCalledWith('Cache reset triggered.');
    });

    it('exportData triggers modal/alert', () => {
        window.alert = jest.fn();
        exportData();
        expect(window.alert).toHaveBeenCalledWith('Data export triggered.');
    });
});
