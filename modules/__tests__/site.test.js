import { Site } from '../site.mjs';

describe('Site Class', () => {
  let site;
  const setupDOMMocks = () => {
    global.document = {
      body: { appendChild: jest.fn() },
      querySelector: jest.fn(sel => ({ classList: { remove: jest.fn(), add: jest.fn(), toggle: jest.fn(), contains: jest.fn() }, addEventListener: jest.fn() })),
      querySelectorAll: jest.fn(sel => [{ classList: { remove: jest.fn(), add: jest.fn() }, textContent: '', style: {} }]),
      activeElement: { classList: { contains: jest.fn(() => false), remove: jest.fn(), add: jest.fn() } }
    };
    global.document.createElement = jest.fn(tag => ({ className: '', id: '', innerHTML: '', textContent: '', appendChild: jest.fn(), addEventListener: jest.fn(), style: {}, type: '', onclick: null }));
    global.document.getElementById = jest.fn(id => {
      if (id === 'modal') return null;
      if (id === 'userMenuToggle') return { style: {}, addEventListener: jest.fn(), classList: { remove: jest.fn(), add: jest.fn(), toggle: jest.fn(), contains: jest.fn() } };
      if (id === 'userMenuToggleIcon') return { classList: { remove: jest.fn(), add: jest.fn(), contains: jest.fn() } };
      if (id === 'modalTitle') return { textContent: '' };
      if (id === 'modalForm') return {};
      if (id === 'modalBody') return {};
      return null;
    });
    global.window = {
      addEventListener: jest.fn(),
      event: { target: { closest: jest.fn(() => ({ classList: { remove: jest.fn(), add: jest.fn() } })) } },
      membersCurrentPage: 1
    };
    global.alert = jest.fn();
  };
  beforeEach(() => {
    setupDOMMocks();
    site = new Site();
  });

  describe('Initialization', () => {
    test('constructor initializes properties', () => {
      expect(site._siteConfig).toBeNull();
      expect(site._toggleBtn).toBeNull();
      expect(site._navBar).toBeNull();
      expect(site._icon).toBeNull();
      expect(site._modal).toBeNull();
      expect(site._modalTitle).toBeNull();
      expect(site._modalBody).toBeNull();
      expect(site._resizeTimer).toBeNull();
      expect(site._memberSearchInput).toBeNull();
    });
  });

  describe('DOM and event handling', () => {
    test('_setupEventListeners sets up listeners and window bindings', () => {
      global.document.addEventListener = jest.fn((event, cb) => {
        if (event === 'DOMContentLoaded') cb();
      });
      global.document.querySelector = jest.fn(sel => ({ classList: { remove: jest.fn(), add: jest.fn(), toggle: jest.fn(), contains: jest.fn() }, addEventListener: jest.fn() }));
      site._setupEventListeners();
      expect(global.document.getElementById).toHaveBeenCalledWith('userMenuToggle');
      expect(global.document.querySelector).toHaveBeenCalledWith('.navbar');
      expect(global.document.getElementById).toHaveBeenCalledWith('userMenuToggleIcon');
      expect(typeof window.showSection).toBe('function');
      expect(typeof window.quickAction).toBe('function');
    });
    test('_toggleMenu toggles navBar and icon', () => {
      site._navBar = { classList: { toggle: jest.fn(), contains: jest.fn(() => true), remove: jest.fn(), add: jest.fn() } };
      site._icon = { classList: { remove: jest.fn(), add: jest.fn() } };
      site._toggleMenu();
      expect(site._navBar.classList.toggle).toHaveBeenCalledWith('show');
      expect(site._icon.classList.remove).toHaveBeenCalledWith('fa-bars');
      expect(site._icon.classList.add).toHaveBeenCalledWith('fa-xmark');
    });
    test('_updateToggleVisibility sets display and navBar state', () => {
      site._toggleBtn = { style: {} };
      site._navBar = { classList: { remove: jest.fn(), add: jest.fn() } };
      site._icon = { classList: { remove: jest.fn(), add: jest.fn() } };
      global.window.innerWidth = 500;
      site._updateToggleVisibility();
      expect(site._toggleBtn.style.display).toBe('block');
      global.window.innerWidth = 800;
      site._updateToggleVisibility();
      expect(site._toggleBtn.style.display).toBe('none');
    });
  });

  describe('UI actions', () => {
    test('showSection activates correct section and nav button', () => {
      global.document.querySelectorAll = jest.fn(() => [{ classList: { remove: jest.fn(), add: jest.fn() } }]);
      global.document.getElementById = jest.fn(() => ({ classList: { add: jest.fn() } }));
      site.showSection('section1');
      expect(global.document.getElementById).toHaveBeenCalledWith('section1');
    });
    test('quickAction triggers alert', () => {
      site.quickAction('test');
      expect(global.alert).toHaveBeenCalledWith('Action: test');
    });
    test('filterMembers filters table rows', () => {
      global.document.getElementById = jest.fn(() => ({ value: 'foo' }));
      global.document.querySelectorAll = jest.fn(() => [{ textContent: 'foo', style: {} }, { textContent: 'bar', style: {} }]);
      site.filterMembers();
      expect(global.document.querySelectorAll).toHaveBeenCalledWith('#membersBody tr');
    });
    test('filterMembers uses cached search input when available', () => {
      const mockSearchInput = { value: 'test' };
      site._memberSearchInput = mockSearchInput;
      global.document.querySelectorAll = jest.fn(() => [{ textContent: 'test value', style: {} }]);
      site.filterMembers();
      expect(global.document.getElementById).not.toHaveBeenCalledWith('memberSearch');
    });
    test('filterMembers shows all rows when search term is empty', () => {
      const row1 = { textContent: 'foo', style: { display: 'none' } };
      const row2 = { textContent: 'bar', style: { display: 'none' } };
      site._memberSearchInput = { value: '' };
      global.document.querySelectorAll = jest.fn(() => [row1, row2]);
      site.filterMembers();
      expect(row1.style.display).toBe('');
      expect(row2.style.display).toBe('');
    });
  });

  describe('Modal caching', () => {
    test('openModal uses cached modal elements when available', () => {
      const mockModal = { classList: { add: jest.fn() } };
      const mockModalTitle = { textContent: '' };
      const mockModalBody = { innerHTML: '' };
      site._modal = mockModal;
      site._modalTitle = mockModalTitle;
      site._modalBody = mockModalBody;
      
      site.openModal('Test Title', '<p>Test Content</p>');
      
      expect(mockModalTitle.textContent).toBe('Test Title');
      expect(mockModalBody.innerHTML).toBe('<p>Test Content</p>');
      expect(mockModal.classList.add).toHaveBeenCalledWith('show');
    });

    test('closeModal uses cached modal element when available', () => {
      const mockModal = { classList: { remove: jest.fn() } };
      site._modal = mockModal;
      
      site.closeModal();
      
      expect(mockModal.classList.remove).toHaveBeenCalledWith('show');
    });
  });

  describe('Performance optimizations', () => {
    test('_debounce delays function execution', (done) => {
      jest.useFakeTimers();
      const mockFn = jest.fn();
      const debouncedFn = site._debounce(mockFn, 100);
      
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
      done();
    });

    test('_debounce cancels previous calls', (done) => {
      jest.useFakeTimers();
      const mockFn = jest.fn();
      const debouncedFn = site._debounce(mockFn, 100);
      
      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
      done();
    });
  });
});
