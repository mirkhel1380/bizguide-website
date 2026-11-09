// Shared mobile navigation: keep visibility, focus and ARIA state in sync.
const menu = document.querySelector('.menu');
if (menu) {
  const nav = document.querySelector('.navlinks');
  const mobile = window.matchMedia('(max-width: 620px)');
  function closeMenu(returnFocus = false) {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    nav.querySelectorAll('.submenu-toggle').forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
    nav.querySelectorAll('.nav-submenu').forEach(panel => { panel.hidden = true; });
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    if (nav.classList.contains('open')) closeMenu();
    else { nav.classList.add('open'); menu.setAttribute('aria-expanded', 'true'); }
  });
  document.addEventListener('click', event => {
    if (mobile.matches && !nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    // A submenu consumes the first Escape; the next closes the mobile menu.
    if (event.key === 'Escape' && !event.defaultPrevented && mobile.matches && nav.classList.contains('open')) {
      closeMenu(true);
      event.preventDefault();
    }
  });
  mobile.addEventListener('change', () => closeMenu());
}

// Only enable referrals after written program acceptance and receipt of exact AWIN links.
(() => {
  const cfg = window.BIZGUIDE_CONFIG || {};
  if (cfg.affiliateApproved !== true) return;
  const notice = 'We may earn a commission if you purchase through this link. You order directly from Registered Agents Inc.';
  const validLink = key => {
    const value = cfg.links?.[key];
    if (typeof value !== 'string') return null;
    try { const parsed = new URL(value); return parsed.protocol === 'https:' ? value : null; }
    catch { return null; }
  };
  document.querySelectorAll('[data-affiliate-status]').forEach(el => {
    el.textContent = 'A Registered Agents Inc affiliate';
    el.hidden = false;
  });
  document.querySelectorAll('[data-service]').forEach(a => {
    const url = validLink(a.dataset.service);
    if (!url) return;
    a.href = url;
    a.rel = 'sponsored noopener';
    a.textContent = 'Explore with Registered Agents Inc. ↗';
  });
  // Keep all provider-bound referrals in the exact supplied tracking format.
  document.querySelectorAll('a[href]').forEach(a => {
    let parsed;
    try { parsed = new URL(a.getAttribute('href'), window.location.href); } catch { return; }
    if (!['registeredagentsinc.com', 'www.registeredagentsinc.com'].includes(parsed.hostname)) return;
    const key = parsed.pathname.startsWith('/business-formation') ? 'formation'
      : parsed.pathname.startsWith('/registered-agent') ? 'agent'
      : parsed.pathname.startsWith('/domain') ? 'domain'
      : /hosting|website/.test(parsed.pathname) ? 'hosting' : null;
    const url = key && validLink(key);
    if (!url) return;
    a.href = url;
    a.rel = 'sponsored noopener';
    const label = document.createElement('span');
    label.className = 'affiliate-disclosure';
    label.textContent = notice;
    a.insertAdjacentElement('beforebegin', label);
  });
})();

// Shared header dropdowns for mouse, touch and keyboard navigation.
(() => {
  const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
  const hover = window.matchMedia('(min-width: 621px) and (hover: hover) and (pointer: fine)');
  function setOpen(dropdown, open) {
    dropdown.querySelector('.submenu-toggle').setAttribute('aria-expanded', String(open));
    dropdown.querySelector('.nav-submenu').hidden = !open;
  }
  function closeOthers(current) {
    dropdowns.forEach(item => { if (item !== current) setOpen(item, false); });
  }
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.submenu-toggle');
    const panel = dropdown.querySelector('.nav-submenu');
    function open() { closeOthers(dropdown); setOpen(dropdown, true); }
    toggle.addEventListener('click', () => {
      if (panel.hidden) open(); else setOpen(dropdown, false);
    });
    dropdown.addEventListener('mouseenter', () => { if (hover.matches) open(); });
    dropdown.addEventListener('mouseleave', () => { if (hover.matches) setOpen(dropdown, false); });
    dropdown.addEventListener('focusout', event => {
      if (!dropdown.contains(event.relatedTarget)) setOpen(dropdown, false);
    });
    dropdown.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) {
        setOpen(dropdown, false);
        toggle.focus();
        event.preventDefault();
      }
      if (event.key === 'ArrowDown' && event.target === toggle) {
        open();
        panel.querySelector('a').focus();
        event.preventDefault();
      }
    });
  });
  document.addEventListener('click', event => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(event.target)) setOpen(dropdown, false);
    });
  });
  document.querySelector('.menu')?.addEventListener('click', () => {
    if (!document.querySelector('.navlinks')?.classList.contains('open')) closeOthers(null);
  });
})();

// Decorative hero motion is optional and respects the visitor’s motion preference.
(() => {
  const control = document.querySelector('.motion-control');
  if (!control) return;
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  function update() {
    const reduce = preference.matches;
    root.classList.toggle('motion-enabled', !reduce);
    root.classList.toggle('motion-paused', paused || reduce);
    control.hidden = reduce;
    control.setAttribute('aria-pressed', String(paused));
    control.querySelector('.motion-control-label').textContent = paused ? 'Resume motion' : 'Pause motion';
    control.querySelector('.motion-control-icon').textContent = paused ? '▷' : 'Ⅱ';
  }
  control.addEventListener('click', () => { paused = !paused; update(); });
  preference.addEventListener('change', update);
  update();
})();
