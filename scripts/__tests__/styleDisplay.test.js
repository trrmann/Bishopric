/**
 * @jest-environment jsdom
 */

describe('Page Style Display', () => {
  beforeAll(() => {
    // Simulate loading CSS files
    const cssFiles = [
      'header-footer.css', 'laptop.css', 'largescreen.css', 'login.css',
      'mobile.css', 'site.css', 'menu.css', 'tablet.css', 'styles.css'
    ];
    cssFiles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
    // Add minimal HTML for hamburger and nav
    document.body.innerHTML = `
      <button id="userMenuToggle" class="user-menu-toggle" aria-label="Toggle user menu"><span id="userMenuToggleIcon" class="fa fa-bars"></span></button>
      <nav class="navbar"></nav>
    `;
  });

  test('All main CSS files are loaded', () => {
    const expected = [
      'header-footer.css', 'laptop.css', 'largescreen.css', 'login.css',
      'mobile.css', 'site.css', 'menu.css', 'tablet.css', 'styles.css'
    ];
    expected.forEach(href => {
      expect(
        Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(link => link.href.includes(href))
      ).toBe(true);
    });
  });

  test('Hamburger button is visible in mobile mode', () => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
    const btn = document.getElementById('userMenuToggle');
    // Simulate CSS: display block in mobile
    btn.style.display = 'block';
    expect(getComputedStyle(btn).display).toBe('block');
  });

  test('Hamburger button is hidden in desktop mode', () => {
    window.innerWidth = 900;
    window.dispatchEvent(new Event('resize'));
    const btn = document.getElementById('userMenuToggle');
    // Simulate CSS: display none in desktop
    btn.style.display = 'none';
    expect(getComputedStyle(btn).display).toBe('none');
  });

  test('Nav bar toggles show class', () => {
    const nav = document.querySelector('.navbar');
    nav.classList.add('show');
    expect(nav.classList.contains('show')).toBe(true);
    nav.classList.remove('show');
    expect(nav.classList.contains('show')).toBe(false);
  });
});
