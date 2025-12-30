
// Polyfill TextEncoder for Node.js/jsdom (must be first)
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

import { Auth } from '../auth.mjs';
import { JSDOM } from 'jsdom';

const mockConfig = {
  configuration: {
    login: {
      target: 'target',
      destinationID: 'modal',
      formID: 'loginForm',
      emailInputID: 'emailInput',
      emailListID: 'emailList',
      passwordInputID: 'passwordInput',
    },
    main: {
      container: 'mainContainer',
      roleSelector: 'roleSelector',
      selectedRoles: 'selectedRoles',
      logout: 'logoutBtn',
    }
  },
  _storageObj: {}
};

describe('Auth', () => {
  let auth;

  beforeEach(() => {
    // Setup jsdom for DOM mocking
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    // Create the required target element for modal placement
    const targetDiv = document.createElement('div');
    targetDiv.id = mockConfig.configuration.login.target;
    document.body.appendChild(targetDiv);
    auth = new Auth(mockConfig);
  });

  test('constructor initializes properties', () => {
    expect(auth.target).toBe('target');
    expect(auth.destinationID).toBe('modal');
    expect(auth.formID).toBe('loginForm');
    expect(auth.emailInputID).toBe('emailInput');
    expect(auth.emailListID).toBe('emailList');
    expect(auth.passwordInputID).toBe('passwordInput');
    expect(auth.mainContainerID).toBe('mainContainer');
    expect(auth.roleSelectorID).toBe('roleSelector');
    expect(auth.selectedRolesID).toBe('selectedRoles');
    expect(auth.logoutID).toBe('logoutBtn');
    expect(auth.allUsers).toEqual([]);
    expect(auth.currentUser).toBeNull();
  });

  test('CreateLoginModalWithSpecs creates modal if not present', () => {
    expect(document.getElementById(auth.destinationID)).toBeNull();
    auth.CreateLoginModalWithSpecs();
    expect(document.getElementById(auth.destinationID)).not.toBeNull();
  });

  test('CreateLoginModalWithSpecs does not duplicate modal', () => {
    auth.CreateLoginModalWithSpecs();
    auth.CreateLoginModalWithSpecs();
    expect(document.querySelectorAll(`#${auth.destinationID}`).length).toBe(1);
  });

  // Additional tests for login logic, error handling, and session restoration would require more extensive mocking
});
