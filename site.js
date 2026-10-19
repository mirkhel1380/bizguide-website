const menu = document.querySelector('.menu');
if (menu) menu.addEventListener('click', () => {
  const nav = document.querySelector('.navlinks');
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});

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
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
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
      if (event.key === 'Escape') {
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
