/** @jest-environment jsdom */
// Unit tests for Testing tab UI logic
import { resetCache, resetSessionStorage, resetLocalStorage, resetCloudStorage } from '../testing.ui.js';

// Mock CacheStore for cache clearing tests
class MockCacheStore {
    constructor() {
        this.clearAllCalled = false;
        this.clearAll = this.clearAll.bind(this);
    }
    clearAll() {
        this.clearAllCalled = true;
    }
}

// --- Begin migrated test logic ---

describe('Testing Tab UI', () => {
                                    describe('Event Schedule Templates Import/Export Buttons (Mock)', () => {
                                        beforeEach(() => {
                                            document.body.innerHTML = `
                                                <button id="exportRawEventScheduleTemplatesBtn"></button>
                                                <button id="importRawEventScheduleTemplatesBtn"></button>
                                                <input type="file" id="importRawEventScheduleTemplatesInput">
                                                <button id="exportDetailedEventScheduleTemplatesBtn"></button>
                                                <button id="importDetailedEventScheduleTemplatesBtn"></button>
                                                <input type="file" id="importDetailedEventScheduleTemplatesInput">
                                            `;
                                            window.alert = jest.fn();
                                        });

                                        afterEach(() => {
                                            jest.resetModules();
                                        });

                                        it('Export Raw Event Schedule Templates button triggers mock alert', () => {
                                            const { attachTestingTabHandlers } = require('../testing.ui.js');
                                            attachTestingTabHandlers();
                                            document.getElementById('exportRawEventScheduleTemplatesBtn').dispatchEvent(new window.Event('click'));
                                            expect(window.alert).toHaveBeenCalledWith('Mock: Export Raw Event Schedule Templates triggered.');
                                        });

                                        it('Import Raw Event Schedule Templates input triggers mock alert', () => {
                                            const { attachTestingTabHandlers } = require('../testing.ui.js');
                                            attachTestingTabHandlers();
                                            document.getElementById('importRawEventScheduleTemplatesInput').dispatchEvent(new window.Event('change'));
                                            expect(window.alert).toHaveBeenCalledWith('Mock: Import Raw Event Schedule Templates triggered.');
                                        });

                                        it('Export Detailed Event Schedule Templates button triggers mock alert', () => {
                                            const { attachTestingTabHandlers } = require('../testing.ui.js');
                                            attachTestingTabHandlers();
                                            document.getElementById('exportDetailedEventScheduleTemplatesBtn').dispatchEvent(new window.Event('click'));
                                            expect(window.alert).toHaveBeenCalledWith('Mock: Export Detailed Event Schedule Templates triggered.');
                                        });

                                        it('Import Detailed Event Schedule Templates input triggers mock alert', () => {
                                            const { attachTestingTabHandlers } = require('../testing.ui.js');
                                            attachTestingTabHandlers();
                                            document.getElementById('importDetailedEventScheduleTemplatesInput').dispatchEvent(new window.Event('change'));
                                            expect(window.alert).toHaveBeenCalledWith('Mock: Import Detailed Event Schedule Templates triggered.');
                                        });
                                    });
                                describe('Workflows Import/Export Buttons (Mock)', () => {
                                    beforeEach(() => {
                                        document.body.innerHTML = `
                                            <button id="exportRawWorkflowsBtn"></button>
                                            <button id="importRawWorkflowsBtn"></button>
                                            <input type="file" id="importRawWorkflowsInput">
                                            <button id="exportDetailedWorkflowsBtn"></button>
                                            <button id="importDetailedWorkflowsBtn"></button>
                                            <input type="file" id="importDetailedWorkflowsInput">
                                        `;
                                        window.alert = jest.fn();
                                    });

                                    afterEach(() => {
                                        jest.resetModules();
                                    });

                                    it('Export Raw Workflows button triggers mock alert', () => {
                                        const { attachTestingTabHandlers } = require('../testing.ui.js');
                                        attachTestingTabHandlers();
                                        document.getElementById('exportRawWorkflowsBtn').dispatchEvent(new window.Event('click'));
                                        expect(window.alert).toHaveBeenCalledWith('Mock: Export Raw Workflows triggered.');
                                    });

                                    it('Import Raw Workflows input triggers mock alert', () => {
                                        const { attachTestingTabHandlers } = require('../testing.ui.js');
                                        attachTestingTabHandlers();
                                        document.getElementById('importRawWorkflowsInput').dispatchEvent(new window.Event('change'));
                                        expect(window.alert).toHaveBeenCalledWith('Mock: Import Raw Workflows triggered.');
                                    });

                                    it('Export Detailed Workflows button triggers mock alert', () => {
                                        const { attachTestingTabHandlers } = require('../testing.ui.js');
                                        attachTestingTabHandlers();
                                        document.getElementById('exportDetailedWorkflowsBtn').dispatchEvent(new window.Event('click'));
                                        expect(window.alert).toHaveBeenCalledWith('Mock: Export Detailed Workflows triggered.');
                                    });

                                    it('Import Detailed Workflows input triggers mock alert', () => {
                                        const { attachTestingTabHandlers } = require('../testing.ui.js');
                                        attachTestingTabHandlers();
                                        document.getElementById('importDetailedWorkflowsInput').dispatchEvent(new window.Event('change'));
                                        expect(window.alert).toHaveBeenCalledWith('Mock: Import Detailed Workflows triggered.');
                                    });
                                });
                            describe('Workflows Import/Export Buttons (Mock)', () => {
                                beforeEach(() => {
                                    document.body.innerHTML = `
                                        <button id="exportRawWorkflowsBtn"></button>
                                        <button id="importRawWorkflowsBtn"></button>
                                        <input type="file" id="importRawWorkflowsInput">
                                        <button id="exportDetailedWorkflowsBtn"></button>
                                        <button id="importDetailedWorkflowsBtn"></button>
                                        <input type="file" id="importDetailedWorkflowsInput">
                                    `;
                                    window.alert = jest.fn();
                                });

                                afterEach(() => {
                                    jest.resetModules();
                                });

                                it('Export Raw Workflows button triggers mock alert', () => {
                                    const { attachTestingTabHandlers } = require('../testing.ui.js');
                                    attachTestingTabHandlers();
                                    document.getElementById('exportRawWorkflowsBtn').dispatchEvent(new window.Event('click'));
                                    expect(window.alert).toHaveBeenCalledWith('Mock: Export Raw Workflows triggered.');
                                });

                                it('Import Raw Workflows button triggers mock alert', () => {
                                    const { attachTestingTabHandlers } = require('../testing.ui.js');
                                    attachTestingTabHandlers();
                                    const input = document.getElementById('importRawWorkflowsInput');
                                    const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
                                    file.name = 'test.json';
                                    Object.defineProperty(input, 'files', { value: [file] });
                                    input.dispatchEvent(new window.Event('change'));
                                    expect(window.alert).toHaveBeenCalledWith('Mock: Import Raw Workflows triggered.');
                                });

                                it('Export Detailed Workflows button triggers mock alert', () => {
                                    const { attachTestingTabHandlers } = require('../testing.ui.js');
                                    attachTestingTabHandlers();
                                    document.getElementById('exportDetailedWorkflowsBtn').dispatchEvent(new window.Event('click'));
                                    expect(window.alert).toHaveBeenCalledWith('Mock: Export Detailed Workflows triggered.');
                                });

                                it('Import Detailed Workflows button triggers mock alert', () => {
                                    const { attachTestingTabHandlers } = require('../testing.ui.js');
                                    attachTestingTabHandlers();
                                    const input = document.getElementById('importDetailedWorkflowsInput');
                                    const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
                                    file.name = 'test.json';
                                    Object.defineProperty(input, 'files', { value: [file] });
                                    input.dispatchEvent(new window.Event('change'));
                                    expect(window.alert).toHaveBeenCalledWith('Mock: Import Detailed Workflows triggered.');
                                });
                            });
                        describe('Users Import/Export Buttons', () => {
                            beforeEach(() => {
                                document.body.innerHTML = `
                                    <button id="exportRawUsersBtn"></button>
                                    <button id="importRawUsersBtn"></button>
                                    <input type="file" id="importRawUsersInput">
                                    <button id="exportDetailedUsersBtn"></button>
                                    <button id="importDetailedUsersBtn"></button>
                                    <input type="file" id="importDetailedUsersInput">
                                `;
                                window.alert = jest.fn();
                                window.URL.createObjectURL = jest.fn(() => 'blob:url');
                                window.URL.revokeObjectURL = jest.fn();
                                document.createElement = jest.fn((tag) => {
                                    if (tag === 'a') {
                                        return { click: jest.fn(), set href(v) {}, set download(v) {}, remove() {} };
                                    }
                                    return document.createElement._orig(tag);
                                });
                                document.createElement._orig = document.createElement.bind(document);
                                document.body.appendChild = jest.fn();
                                document.body.removeChild = jest.fn();
                            });

                            afterEach(() => {
                                jest.resetModules();
                            });

                            it('Export Raw Users button downloads users as JSON', () => {
                                window.Users = { users: { foo: 'bar' } };
                                const { attachTestingTabHandlers } = require('../testing.ui.js');
                                attachTestingTabHandlers();
                                document.getElementById('exportRawUsersBtn').dispatchEvent(new window.Event('click'));
                                expect(window.URL.createObjectURL).toHaveBeenCalled();
                            });

                            it('Import Raw Users button imports users from JSON', () => {
                                window.Users = { users: {} };
                                const { attachTestingTabHandlers } = require('../testing.ui.js');
                                attachTestingTabHandlers();
                                // Simulate FileReader
                                const origFileReader = window.FileReader;
                                function MockFileReader() {
                                    this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar" }' } }); };
                                }
                                window.FileReader = MockFileReader;
                                const input = document.getElementById('importRawUsersInput');
                                const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
                                file.name = 'test.json';
                                Object.defineProperty(input, 'files', { value: [file] });
                                input.dispatchEvent(new window.Event('change'));
                                expect(window.Users.users).toEqual({ foo: 'bar' });
                                expect(window.alert).toHaveBeenCalledWith('Raw users import successful.');
                                window.FileReader = origFileReader;
                            });

                            it('Export Detailed Users button downloads detailed users as JSON', () => {
                                const copyToJSON = jest.fn(() => ({ foo: 'detailed' }));
                                window.Users = { constructor: { CopyToJSON: copyToJSON } };
                                const { attachTestingTabHandlers } = require('../testing.ui.js');
                                attachTestingTabHandlers();
                                document.getElementById('exportDetailedUsersBtn').dispatchEvent(new window.Event('click'));
                                expect(window.URL.createObjectURL).toHaveBeenCalled();
                                expect(copyToJSON).toHaveBeenCalledWith(window.Users);
                            });

                            it('Import Detailed Users button imports detailed users from JSON', () => {
                                const copyFromObject = jest.fn((dest, src) => { dest.users = src.users; dest._storageObj = src._storageObj; });
                                window.Users = { users: {}, _storageObj: {}, constructor: { CopyFromObject: copyFromObject } };
                                window.alert = jest.fn();
                                const { attachTestingTabHandlers } = require('../testing.ui.js');
                                attachTestingTabHandlers();
                                // Simulate FileReader
                                const origFileReader = window.FileReader;
                                function MockFileReader() {
                                    this.readAsText = function(f) { this.onload({ target: { result: '{ "users": { "foo": "bar" }, "_storageObj": { "type": "mockStorage" } }' } }); };
                                }
                                window.FileReader = MockFileReader;
                                const input = document.getElementById('importDetailedUsersInput');
                                const file = new Blob([JSON.stringify({ users: { foo: 'bar' }, _storageObj: { type: 'mockStorage' } })], { type: 'application/json' });
                                file.name = 'test.json';
                                Object.defineProperty(input, 'files', { value: [file] });
                                input.dispatchEvent(new window.Event('change'));
                                expect(copyFromObject).toHaveBeenCalled();
                                expect(window.Users.users).toEqual({ foo: 'bar' });
                                expect(window.Users._storageObj).toEqual({ type: 'mockStorage' });
                                expect(window.alert).toHaveBeenCalledWith('Detailed users import successful.');
                                window.FileReader = origFileReader;
                            });
                        });
                    describe('Members Import/Export Buttons', () => {
                        beforeEach(() => {
                            document.body.innerHTML = `
                                <button id="exportRawMembersBtn"></button>
                                <button id="importRawMembersBtn"></button>
                                <input type="file" id="importRawMembersInput">
                                <button id="exportDetailedMembersBtn"></button>
                                <button id="importDetailedMembersBtn"></button>
                                <input type="file" id="importDetailedMembersInput">
                            `;
                            window.alert = jest.fn();
                            window.URL.createObjectURL = jest.fn(() => 'blob:url');
                            window.URL.revokeObjectURL = jest.fn();
                            document.createElement = jest.fn((tag) => {
                                if (tag === 'a') {
                                    return { click: jest.fn(), set href(v) {}, set download(v) {}, remove() {} };
                                }
                                return document.createElement._orig(tag);
                            });
                            document.createElement._orig = document.createElement.bind(document);
                            document.body.appendChild = jest.fn();
                            document.body.removeChild = jest.fn();
                        });

                        afterEach(() => {
                            jest.resetModules();
                        });

                        it('Export Raw Members button downloads members as JSON', () => {
                            window.Members = { members: { foo: 'bar' } };
                            const { attachTestingTabHandlers } = require('../testing.ui.js');
                            attachTestingTabHandlers();
                            document.getElementById('exportRawMembersBtn').dispatchEvent(new window.Event('click'));
                            expect(window.URL.createObjectURL).toHaveBeenCalled();
                        });

                        it('Import Raw Members button imports members from JSON', () => {
                            window.Members = { members: {} };
                            const { attachTestingTabHandlers } = require('../testing.ui.js');
                            attachTestingTabHandlers();
                            // Simulate FileReader
                            const origFileReader = window.FileReader;
                            function MockFileReader() {
                                this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar" }' } }); };
                            }
                            window.FileReader = MockFileReader;
                            const input = document.getElementById('importRawMembersInput');
                            const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
                            file.name = 'test.json';
                            Object.defineProperty(input, 'files', { value: [file] });
                            input.dispatchEvent(new window.Event('change'));
                            expect(window.Members.members).toEqual({ foo: 'bar' });
                            expect(window.alert).toHaveBeenCalledWith('Raw members import successful.');
                            window.FileReader = origFileReader;
                        });

                        it('Export Detailed Members button downloads detailed members as JSON', () => {
                            const copyToJSON = jest.fn(() => ({ foo: 'detailed' }));
                            window.Members = { constructor: { CopyToJSON: copyToJSON } };
                            const { attachTestingTabHandlers } = require('../testing.ui.js');
                            attachTestingTabHandlers();
                            document.getElementById('exportDetailedMembersBtn').dispatchEvent(new window.Event('click'));
                            expect(window.URL.createObjectURL).toHaveBeenCalled();
                            expect(copyToJSON).toHaveBeenCalledWith(window.Members);
                        });

                        it('Import Detailed Members button imports detailed members from JSON', () => {
                            const copyFromObject = jest.fn((dest, src) => { dest.members = src.members; dest._storageObj = src._storageObj; });
                            window.Members = { members: {}, _storageObj: {}, constructor: { CopyFromObject: copyFromObject } };
                            window.alert = jest.fn();
                            const { attachTestingTabHandlers } = require('../testing.ui.js');
                            attachTestingTabHandlers();
                            // Simulate FileReader
                            const origFileReader = window.FileReader;
                            function MockFileReader() {
                                this.readAsText = function(f) { this.onload({ target: { result: '{ "members": { "foo": "bar" }, "_storageObj": { "type": "mockStorage" } }' } }); };
                            }
                            window.FileReader = MockFileReader;
                            const input = document.getElementById('importDetailedMembersInput');
                            const file = new Blob([JSON.stringify({ members: { foo: 'bar' }, _storageObj: { type: 'mockStorage' } })], { type: 'application/json' });
                            file.name = 'test.json';
                            Object.defineProperty(input, 'files', { value: [file] });
                            input.dispatchEvent(new window.Event('change'));
                            expect(copyFromObject).toHaveBeenCalled();
                            expect(window.Members.members).toEqual({ foo: 'bar' });
                            expect(window.Members._storageObj).toEqual({ type: 'mockStorage' });
                            expect(window.alert).toHaveBeenCalledWith('Detailed members import successful.');
                            window.FileReader = origFileReader;
                        });
                    });
                describe('Roles Import/Export Buttons', () => {
                    beforeEach(() => {
                        document.body.innerHTML = `
                            <button id="exportRawRolesBtn"></button>
                            <button id="importRawRolesBtn"></button>
                            <input type="file" id="importRawRolesInput">
                            <button id="exportDetailedRolesBtn"></button>
                            <button id="importDetailedRolesBtn"></button>
                            <input type="file" id="importDetailedRolesInput">
                        `;
                        window.alert = jest.fn();
                        window.URL.createObjectURL = jest.fn(() => 'blob:url');
                        window.URL.revokeObjectURL = jest.fn();
                        document.createElement = jest.fn((tag) => {
                            if (tag === 'a') {
                                return { click: jest.fn(), set href(v) {}, set download(v) {}, remove() {} };
                            }
                            return document.createElement._orig(tag);
                        });
                        document.createElement._orig = document.createElement.bind(document);
                        document.body.appendChild = jest.fn();
                        document.body.removeChild = jest.fn();
                    });

                    afterEach(() => {
                        jest.resetModules();
                    });

                    it('Export Raw Roles button downloads roles as JSON', () => {
                        window.Roles = { roles: { foo: 'bar' } };
                        const { attachTestingTabHandlers } = require('../testing.ui.js');
                        attachTestingTabHandlers();
                        document.getElementById('exportRawRolesBtn').dispatchEvent(new window.Event('click'));
                        expect(window.URL.createObjectURL).toHaveBeenCalled();
                    });

                    it('Import Raw Roles button imports roles from JSON', () => {
                        window.Roles = { roles: {} };
                        const { attachTestingTabHandlers } = require('../testing.ui.js');
                        attachTestingTabHandlers();
                        // Simulate FileReader
                        const origFileReader = window.FileReader;
                        function MockFileReader() {
                            this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar" }' } }); };
                        }
                        window.FileReader = MockFileReader;
                        const input = document.getElementById('importRawRolesInput');
                        const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
                        file.name = 'test.json';
                        Object.defineProperty(input, 'files', { value: [file] });
                        input.dispatchEvent(new window.Event('change'));
                        expect(window.Roles.roles).toEqual({ foo: 'bar' });
                        expect(window.alert).toHaveBeenCalledWith('Raw roles import successful.');
                        window.FileReader = origFileReader;
                    });

                    it('Export Detailed Roles button downloads detailed roles as JSON', () => {
                        const copyToJSON = jest.fn(() => ({ foo: 'detailed' }));
                        window.Roles = { constructor: { CopyToJSON: copyToJSON } };
                        const { attachTestingTabHandlers } = require('../testing.ui.js');
                        attachTestingTabHandlers();
                        document.getElementById('exportDetailedRolesBtn').dispatchEvent(new window.Event('click'));
                        expect(window.URL.createObjectURL).toHaveBeenCalled();
                        expect(copyToJSON).toHaveBeenCalledWith(window.Roles);
                    });

                    it('Import Detailed Roles button imports detailed roles from JSON', () => {
                        const copyFromObject = jest.fn((dest, src) => { dest.roles = src.roles; dest._storageObj = src._storageObj; });
                        window.Roles = { roles: {}, _storageObj: {}, constructor: { CopyFromObject: copyFromObject } };
                        window.alert = jest.fn();
                        const { attachTestingTabHandlers } = require('../testing.ui.js');
                        attachTestingTabHandlers();
                        // Simulate FileReader
                        const origFileReader = window.FileReader;
                        function MockFileReader() {
                            this.readAsText = function(f) { this.onload({ target: { result: '{ "roles": { "foo": "bar" }, "_storageObj": { "type": "mockStorage" } }' } }); };
                        }
                        window.FileReader = MockFileReader;
                        const input = document.getElementById('importDetailedRolesInput');
                        const file = new Blob([JSON.stringify({ roles: { foo: 'bar' }, _storageObj: { type: 'mockStorage' } })], { type: 'application/json' });
                        file.name = 'test.json';
                        Object.defineProperty(input, 'files', { value: [file] });
                        input.dispatchEvent(new window.Event('change'));
                        expect(copyFromObject).toHaveBeenCalled();
                        expect(window.Roles.roles).toEqual({ foo: 'bar' });
                        expect(window.Roles._storageObj).toEqual({ type: 'mockStorage' });
                        expect(window.alert).toHaveBeenCalledWith('Detailed roles import successful.');
                        window.FileReader = origFileReader;
                    });
                });
            describe('Callings Import/Export Buttons', () => {
                beforeEach(() => {
                    document.body.innerHTML = `
                        <button id="exportRawCallingsBtn"></button>
                        <button id="importRawCallingsBtn"></button>
                        <input type="file" id="importRawCallingsInput">
                        <button id="exportDetailedCallingsBtn"></button>
                        <button id="importDetailedCallingsBtn"></button>
                        <input type="file" id="importDetailedCallingsInput">
                    `;
                    window.alert = jest.fn();
                    window.URL.createObjectURL = jest.fn(() => 'blob:url');
                    window.URL.revokeObjectURL = jest.fn();
                    document.createElement = jest.fn((tag) => {
                        if (tag === 'a') {
                            return { click: jest.fn(), set href(v) {}, set download(v) {}, remove() {} };
                        }
                        return document.createElement._orig(tag);
                    });
                    document.createElement._orig = document.createElement.bind(document);
                    document.body.appendChild = jest.fn();
                    document.body.removeChild = jest.fn();
                });

                afterEach(() => {
                    jest.resetModules();
                });

                it('Export Raw Callings button downloads callings as JSON', () => {
                    window.Callings = { callings: { foo: 'bar' } };
                    const { attachTestingTabHandlers } = require('../testing.ui.js');
                    attachTestingTabHandlers();
                    document.getElementById('exportRawCallingsBtn').dispatchEvent(new window.Event('click'));
                    expect(window.URL.createObjectURL).toHaveBeenCalled();
                });

                it('Import Raw Callings button imports callings from JSON', () => {
                    window.Callings = { callings: {} };
                    const { attachTestingTabHandlers } = require('../testing.ui.js');
                    attachTestingTabHandlers();
                    // Simulate FileReader
                    const origFileReader = window.FileReader;
                    function MockFileReader() {
                        this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar" }' } }); };
                    }
                    window.FileReader = MockFileReader;
                    const input = document.getElementById('importRawCallingsInput');
                    const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
                    file.name = 'test.json';
                    Object.defineProperty(input, 'files', { value: [file] });
                    input.dispatchEvent(new window.Event('change'));
                    expect(window.Callings.callings).toEqual({ foo: 'bar' });
                    expect(window.alert).toHaveBeenCalledWith('Raw callings import successful.');
                    window.FileReader = origFileReader;
                });

                it('Export Detailed Callings button downloads detailed callings as JSON', () => {
                    const copyToJSON = jest.fn(() => ({ foo: 'detailed' }));
                    window.Callings = { constructor: { CopyToJSON: copyToJSON } };
                    const { attachTestingTabHandlers } = require('../testing.ui.js');
                    attachTestingTabHandlers();
                    document.getElementById('exportDetailedCallingsBtn').dispatchEvent(new window.Event('click'));
                    expect(window.URL.createObjectURL).toHaveBeenCalled();
                    expect(copyToJSON).toHaveBeenCalledWith(window.Callings);
                });

                it('Import Detailed Callings button imports detailed callings from JSON', () => {
                    const copyFromObject = jest.fn((dest, src) => { dest.callings = src.callings; dest._storageObj = src._storageObj; });
                    window.Callings = { callings: {}, _storageObj: {}, constructor: { CopyFromObject: copyFromObject } };
                    window.alert = jest.fn();
                    const { attachTestingTabHandlers } = require('../testing.ui.js');
                    attachTestingTabHandlers();
                    // Simulate FileReader
                    const origFileReader = window.FileReader;
                    function MockFileReader() {
                        this.readAsText = function(f) { this.onload({ target: { result: '{ "callings": { "foo": "bar" }, "_storageObj": { "type": "mockStorage" } }' } }); };
                    }
                    window.FileReader = MockFileReader;
                    const input = document.getElementById('importDetailedCallingsInput');
                    const file = new Blob([JSON.stringify({ callings: { foo: 'bar' }, _storageObj: { type: 'mockStorage' } })], { type: 'application/json' });
                    file.name = 'test.json';
                    Object.defineProperty(input, 'files', { value: [file] });
                    input.dispatchEvent(new window.Event('change'));
                    expect(copyFromObject).toHaveBeenCalled();
                    expect(window.Callings.callings).toEqual({ foo: 'bar' });
                    expect(window.Callings._storageObj).toEqual({ type: 'mockStorage' });
                    expect(window.alert).toHaveBeenCalledWith('Detailed callings import successful.');
                    window.FileReader = origFileReader;
                });
            });
        describe('Organization Import/Export Buttons', () => {
            beforeEach(() => {
                document.body.innerHTML = `
                    <button id="exportRawOrgBtn"></button>
                    <button id="importRawOrgBtn"></button>
                    <input type="file" id="importRawOrgInput">
                    <button id="exportDetailedOrgBtn"></button>
                    <button id="importDetailedOrgBtn"></button>
                    <input type="file" id="importDetailedOrgInput">
                `;
                window.alert = jest.fn();
                window.URL.createObjectURL = jest.fn(() => 'blob:url');
                window.URL.revokeObjectURL = jest.fn();
                document.createElement = jest.fn((tag) => {
                    if (tag === 'a') {
                        return { click: jest.fn(), set href(v) {}, set download(v) {}, remove() {} };
                    }
                    return document.createElement._orig(tag);
                });
                document.createElement._orig = document.createElement.bind(document);
                document.body.appendChild = jest.fn();
                document.body.removeChild = jest.fn();
            });

            afterEach(() => {
                jest.resetModules();
            });

            it('Export Raw Organization button downloads organization as JSON', () => {
                window.Organization = { organization: { foo: 'bar' } };
                const { attachTestingTabHandlers } = require('../testing.ui.js');
                attachTestingTabHandlers();
                document.getElementById('exportRawOrgBtn').dispatchEvent(new window.Event('click'));
                expect(window.URL.createObjectURL).toHaveBeenCalled();
            });

            it('Import Raw Organization button imports organization from JSON', () => {
                window.Organization = { organization: {} };
                const { attachTestingTabHandlers } = require('../testing.ui.js');
                attachTestingTabHandlers();
                // Simulate FileReader
                const origFileReader = window.FileReader;
                function MockFileReader() {
                    this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar" }' } }); };
                }
                window.FileReader = MockFileReader;
                const input = document.getElementById('importRawOrgInput');
                const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
                file.name = 'test.json';
                Object.defineProperty(input, 'files', { value: [file] });
                input.dispatchEvent(new window.Event('change'));
                expect(window.Organization.organization).toEqual({ foo: 'bar' });
                expect(window.alert).toHaveBeenCalledWith('Raw organization import successful.');
                window.FileReader = origFileReader;
            });

            it('Export Detailed Organization button downloads detailed org as JSON', () => {
                const copyToJSON = jest.fn(() => ({ foo: 'detailed' }));
                window.Organization = { constructor: { CopyToJSON: copyToJSON } };
                const { attachTestingTabHandlers } = require('../testing.ui.js');
                attachTestingTabHandlers();
                document.getElementById('exportDetailedOrgBtn').dispatchEvent(new window.Event('click'));
                expect(window.URL.createObjectURL).toHaveBeenCalled();
                expect(copyToJSON).toHaveBeenCalledWith(window.Organization);
            });

            it('Import Detailed Organization button imports detailed org from JSON', () => {
                const copyFromObject = jest.fn((dest, src) => { dest.organization = src.organization; dest._storageObj = src._storageObj; });
                window.Organization = { organization: {}, _storageObj: {}, constructor: { CopyFromObject: copyFromObject } };
                window.alert = jest.fn();
                const { attachTestingTabHandlers } = require('../testing.ui.js');
                attachTestingTabHandlers();
                // Simulate FileReader
                const origFileReader = window.FileReader;
                function MockFileReader() {
                    this.readAsText = function(f) { this.onload({ target: { result: '{ "organization": { "foo": "bar" }, "_storageObj": { "type": "mockStorage" } }' } }); };
                }
                window.FileReader = MockFileReader;
                const input = document.getElementById('importDetailedOrgInput');
                const file = new Blob([JSON.stringify({ organization: { foo: 'bar' }, _storageObj: { type: 'mockStorage' } })], { type: 'application/json' });
                file.name = 'test.json';
                Object.defineProperty(input, 'files', { value: [file] });
                input.dispatchEvent(new window.Event('change'));
                expect(copyFromObject).toHaveBeenCalled();
                expect(window.Organization.organization).toEqual({ foo: 'bar' });
                expect(window.Organization._storageObj).toEqual({ type: 'mockStorage' });
                expect(window.alert).toHaveBeenCalledWith('Detailed organization import successful.');
                window.FileReader = origFileReader;
            });
        });
    beforeEach(() => {
        document.body.innerHTML = '';
        window.alert = jest.fn();
    });
    afterEach(() => {
        jest.resetModules();
    });

    it('resetCache triggers modal/alert', () => {
        // Setup mock cache
        const mockCache = new MockCacheStore();
        window.CacheStore = mockCache;
        resetCache();
        expect(window.alert).toHaveBeenCalledWith('Cache reset triggered.');
        expect(mockCache.clearAllCalled).toBe(true);
    });

    it('resetCache clears all cache entries regardless of expiration', () => {
        const mockCache = new MockCacheStore();
        window.CacheStore = mockCache;
        resetCache();
        expect(mockCache.clearAllCalled).toBe(true);
    });

    it('resetSessionStorage triggers modal/alert and clears all session storage', () => {
        const clearMock = jest.fn();
        const origSessionStorage = window.sessionStorage;
        Object.defineProperty(window, 'sessionStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: { clear: clearMock }
        });
        resetSessionStorage();
        expect(clearMock).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Session Storage reset triggered. All session storage entries removed.');
        Object.defineProperty(window, 'sessionStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: origSessionStorage
        });
    });

    it('resetLocalStorage triggers modal/alert and clears all local storage', () => {
        const clearMock = jest.fn();
        const origLocalStorage = window.localStorage;
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: { clear: clearMock }
        });
        resetLocalStorage();
        expect(clearMock).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Local Storage reset triggered. All local storage entries removed.');
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: origLocalStorage
        });
    });

    it('resetCloudStorage triggers modal/alert and clears all cloud storage', () => {
        const clearMock = jest.fn();
        const origCloudStorage = window.CloudStorage;
        Object.defineProperty(window, 'CloudStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: { clearAll: clearMock }
        });
        resetCloudStorage();
        expect(clearMock).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Cloud Storage reset triggered. All cloud storage entries removed.');
        Object.defineProperty(window, 'CloudStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: origCloudStorage
        });
    });

    it('reset buttons call correct handlers on click', () => {
        require('../testing.ui.js');
        window.alert = jest.fn();
        const mockCache = new MockCacheStore();
        window.CacheStore = mockCache;
        resetCache();
        expect(window.alert).toHaveBeenCalledWith('Cache reset triggered.');
        const clearMock = jest.fn();
        const origSessionStorage = window.sessionStorage;
        window.sessionStorage = { clear: clearMock };
        resetSessionStorage();
        expect(window.alert).toHaveBeenCalledWith('Session Storage reset triggered. All session storage entries removed.');
        window.sessionStorage = origSessionStorage;
        resetLocalStorage();
        expect(window.alert).toHaveBeenCalledWith('Local Storage reset triggered. All local storage entries removed.');
        resetCloudStorage();
        expect(window.alert).toHaveBeenCalledWith('Cloud Storage reset triggered. All cloud storage entries removed.');
    });

    it('viewCacheBtn shows cache entries', () => {
        window.CacheStore = {
            entries: () => [['foo', 'bar'], ['baz', 123]]
        };
        document.body.innerHTML += '<button id="viewCacheBtn"></button>';
        require('../testing.ui.js');
        window.alert = jest.fn();
        document.getElementById('viewCacheBtn').onclick();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Cache Entries'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('foo'));
    });

    it('exportCacheBtn downloads cache entries as JSON', () => {
        window.CacheStore = {
            entries: () => [['foo', 'bar']]
        };
        document.body.innerHTML += '<button id="exportCacheBtn"></button>';
        require('../testing.ui.js');
        const createObjectURL = jest.fn(() => 'blob:url');
        const revokeObjectURL = jest.fn();
        window.URL.createObjectURL = createObjectURL;
        window.URL.revokeObjectURL = revokeObjectURL;
        const clickMock = jest.fn();
        document.createElement = jest.fn(() => ({ click: clickMock, set href(v) {}, set download(v) {}, remove() {} }));
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportCacheBtn').onclick();
        expect(createObjectURL).toHaveBeenCalled();
        expect(clickMock).toHaveBeenCalled();
    });

    it('importCacheInput imports cache entries from JSON', () => {
        const setMock = jest.fn();
        window.CacheStore = { Set: setMock };
        document.body.innerHTML += '<input type="file" id="importCacheInput">';
        require('../testing.ui.js');
        window.alert = jest.fn();
        const input = document.getElementById('importCacheInput');
        const file = new Blob([JSON.stringify([['foo', 'bar']])], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '[ ["foo", "bar"] ]' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(setMock).toHaveBeenCalledWith('foo', 'bar');
        expect(window.alert).toHaveBeenCalledWith('Cache import successful.');
        window.FileReader = origFileReader;
    });

    it('viewSessionStorageBtn shows session storage entries', () => {
        window.sessionStorage = {
            length: 1,
            key: () => 'foo',
            getItem: () => 'bar'
        };
        document.body.innerHTML += '<button id="viewSessionStorageBtn"></button>';
        require('../testing.ui.js');
        window.alert = jest.fn();
        document.getElementById('viewSessionStorageBtn').onclick();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Session Storage Entries'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('foo'));
    });

    it('exportSessionStorageBtn downloads session storage as JSON', () => {
        window.sessionStorage = {
            length: 1,
            key: () => 'foo',
            getItem: () => 'bar'
        };
        document.body.innerHTML += '<button id="exportSessionStorageBtn"></button>';
        require('../testing.ui.js');
        const createObjectURL = jest.fn(() => 'blob:url');
        const revokeObjectURL = jest.fn();
        window.URL.createObjectURL = createObjectURL;
        window.URL.revokeObjectURL = revokeObjectURL;
        const clickMock = jest.fn();
        document.createElement = jest.fn(() => ({ click: clickMock, set href(v) {}, set download(v) {}, remove() {} }));
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportSessionStorageBtn').onclick();
        expect(createObjectURL).toHaveBeenCalled();
        expect(clickMock).toHaveBeenCalled();
    });

    it('importSessionStorageInput imports session storage from JSON', () => {
        window.sessionStorage = { setItem: jest.fn() };
        document.body.innerHTML += '<input type="file" id="importSessionStorageInput">';
        require('../testing.ui.js');
        window.alert = jest.fn();
        const input = document.getElementById('importSessionStorageInput');
        const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar" }' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith('foo', 'bar');
        expect(window.alert).toHaveBeenCalledWith('Session Storage import successful.');
        window.FileReader = origFileReader;
    });

    it('viewLocalStorageBtn shows local storage entries', () => {
        window.localStorage = {
            length: 1,
            key: () => 'foo',
            getItem: () => 'bar'
        };
        document.body.innerHTML += '<button id="viewLocalStorageBtn"></button>';
        require('../testing.ui.js');
        window.alert = jest.fn();
        document.getElementById('viewLocalStorageBtn').onclick();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Local Storage Entries'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('foo'));
    });

    it('exportLocalStorageBtn downloads local storage as JSON', () => {
        window.localStorage = {
            length: 1,
            key: () => 'foo',
            getItem: () => 'bar'
        };
        document.body.innerHTML += '<button id="exportLocalStorageBtn"></button>';
        require('../testing.ui.js');
        const createObjectURL = jest.fn(() => 'blob:url');
        const revokeObjectURL = jest.fn();
        window.URL.createObjectURL = createObjectURL;
        window.URL.revokeObjectURL = revokeObjectURL;
        const clickMock = jest.fn();
        document.createElement = jest.fn(() => ({ click: clickMock, set href(v) {}, set download(v) {}, remove() {} }));
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportLocalStorageBtn').onclick();
        expect(createObjectURL).toHaveBeenCalled();
        expect(clickMock).toHaveBeenCalled();
    });

    it('importLocalStorageInput imports local storage from JSON', () => {
        window.localStorage = { setItem: jest.fn() };
        document.body.innerHTML += '<input type="file" id="importLocalStorageInput">';
        require('../testing.ui.js');
        window.alert = jest.fn();
        const input = document.getElementById('importLocalStorageInput');
        const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar" }' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(window.localStorage.setItem).toHaveBeenCalledWith('foo', 'bar');
        expect(window.alert).toHaveBeenCalledWith('Local Storage import successful.');
        window.FileReader = origFileReader;
    });

    it('viewCloudStorageBtn shows cloud storage entries', () => {
        window.CloudStorage = {
            entries: () => [['foo', 'bar']]
        };
        document.body.innerHTML += '<button id="viewCloudStorageBtn"></button>';
        require('../testing.ui.js');
        window.alert = jest.fn();
        document.getElementById('viewCloudStorageBtn').onclick();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Cloud Storage Entries'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('foo'));
    });

    it('exportCloudStorageBtn downloads cloud storage as JSON', () => {
        window.CloudStorage = {
            entries: () => [['foo', 'bar']]
        };
        document.body.innerHTML += '<button id="exportCloudStorageBtn"></button>';
        require('../testing.ui.js');
        const createObjectURL = jest.fn(() => 'blob:url');
        const revokeObjectURL = jest.fn();
        window.URL.createObjectURL = createObjectURL;
        window.URL.revokeObjectURL = revokeObjectURL;
        const clickMock = jest.fn();
        document.createElement = jest.fn(() => ({ click: clickMock, set href(v) {}, set download(v) {}, remove() {} }));
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportCloudStorageBtn').onclick();
        expect(createObjectURL).toHaveBeenCalled();
        expect(clickMock).toHaveBeenCalled();
    });

    it('importCloudStorageInput imports cloud storage from JSON', () => {
        const setMock = jest.fn();
        window.CloudStorage = { Set: setMock };
        document.body.innerHTML += '<input type="file" id="importCloudStorageInput">';
        require('../testing.ui.js');
        window.alert = jest.fn();
        const input = document.getElementById('importCloudStorageInput');
        const file = new Blob([JSON.stringify([['foo', 'bar']])], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '[ ["foo", "bar"] ]' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(setMock).toHaveBeenCalledWith('foo', 'bar');
        expect(window.alert).toHaveBeenCalledWith('Cloud Storage import successful.');
        window.FileReader = origFileReader;
    });
});

describe('Configuration Testing Tab Buttons', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        window.alert = jest.fn();
        window.URL.createObjectURL = jest.fn(() => 'blob:url');
        window.URL.revokeObjectURL = jest.fn();
        document.createElement = jest.fn(() => ({ click: jest.fn(), set href(v) {}, set download(v) {}, remove() {} }));
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
    });

    // --- Fix configuration button tests ---
    it('Export Raw Configuration button downloads raw config as JSON', () => {
        window.Configuration = { configuration: { foo: 'bar', baz: 123 } };
        document.body.innerHTML += '<button id="exportRawConfigBtn"></button>';
        require('../testing.ui.js');
        window.URL.createObjectURL = jest.fn(() => 'blob:url');
        const a = document.createElement('a');
        a.click = jest.fn();
        document.createElement = jest.fn(() => a);
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportRawConfigBtn').dispatchEvent(new window.Event('click'));
        expect(window.URL.createObjectURL).toHaveBeenCalled();
        expect(a.click).toHaveBeenCalled();
    });

    it('Import Raw Configuration button imports raw config from JSON', () => {
            jest.resetModules();
        window.Configuration = { configuration: {} };
        window.Configuration = { configuration: {} };
        window.alert = jest.fn();
        document.body.innerHTML += '<input type="file" id="importRawConfigInput">';
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar", "baz": 123 }' } }); };
        }
        window.FileReader = MockFileReader;
        const { attachTestingTabHandlers } = require('../testing.ui.js');
        attachTestingTabHandlers();
        const input = document.getElementById('importRawConfigInput');
        const file = new Blob([JSON.stringify({ foo: 'bar', baz: 123 })], { type: 'application/json' });
        file.name = 'test.json';
        Object.defineProperty(input, 'files', { value: [file] });
        input.dispatchEvent(new window.Event('change'));
        expect(window.Configuration.configuration).toEqual({ foo: 'bar', baz: 123 });
        expect(window.alert).toHaveBeenCalledWith('Raw configuration import successful.');
        window.FileReader = origFileReader;
    });

    it('Export Detailed Configuration button downloads detailed config as JSON', () => {
            jest.resetModules();
        window.Configuration = {
            configuration: { foo: 'bar' },
            _storageObj: { type: 'mockStorage' },
            constructor: {
                CopyToJSON: jest.fn((instance) => ({ _storageObj: instance._storageObj, configuration: instance.configuration }))
            }
        };
        window.URL.createObjectURL = jest.fn(() => 'blob:url');
        const a = document.createElement('a');
        a.click = jest.fn();
        document.createElement = jest.fn(() => a);
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.body.innerHTML += '<button id="exportDetailedConfigBtn"></button>';
        const { attachTestingTabHandlers } = require('../testing.ui.js');
        attachTestingTabHandlers();
        document.getElementById('exportDetailedConfigBtn').dispatchEvent(new window.Event('click'));
        expect(window.URL.createObjectURL).toHaveBeenCalled();
        expect(a.click).toHaveBeenCalled();
        expect(window.Configuration.constructor.CopyToJSON).toHaveBeenCalledWith(window.Configuration);
    });

    it('Import Detailed Configuration button imports detailed config from JSON', () => {
            jest.resetModules();
        const copyFromObjectMock = jest.fn((dest, src) => { dest.configuration = src.configuration; dest._storageObj = src._storageObj; });
        window.Configuration = {
            configuration: {},
            _storageObj: {},
            constructor: { CopyFromObject: copyFromObjectMock }
        };
        window.alert = jest.fn();
        document.body.innerHTML += '<input type="file" id="importDetailedConfigInput">';
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '{ "configuration": { "foo": "bar" }, "_storageObj": { "type": "mockStorage" } }' } }); };
        }
        window.FileReader = MockFileReader;
        const { attachTestingTabHandlers } = require('../testing.ui.js');
        attachTestingTabHandlers();
        const input = document.getElementById('importDetailedConfigInput');
        const file = new Blob([JSON.stringify({ configuration: { foo: 'bar' }, _storageObj: { type: 'mockStorage' } })], { type: 'application/json' });
        file.name = 'test.json';
        Object.defineProperty(input, 'files', { value: [file] });
        input.dispatchEvent(new window.Event('change'));
        expect(copyFromObjectMock).toHaveBeenCalled();
        expect(window.Configuration.configuration).toEqual({ foo: 'bar' });
        expect(window.Configuration._storageObj).toEqual({ type: 'mockStorage' });
        expect(window.alert).toHaveBeenCalledWith('Detailed configuration import successful.');
        window.FileReader = origFileReader;
    });
});

// --- End migrated test logic ---
