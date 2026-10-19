const menu=document.querySelector('.menu');if(menu)menu.addEventListener('click',()=>{const nav=document.querySelector('.navlinks');const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});const cfg=window.BIZGUIDE_CONFIG||{};document.querySelectorAll('[data-service]').forEach(a=>{const url=cfg.links?.[a.dataset.service];if(cfg.affiliateApproved&&url&&/^https:\/\//.test(url)){a.href=url;a.rel='sponsored noopener';a.textContent='Explore with Registered Agents Inc. ↗';}});if(cfg.affiliateApproved){document.querySelectorAll('[data-affiliate-status]').forEach(el=>{el.textContent='A Registered Agents Inc affiliate';});document.querySelectorAll('[data-disclosure]').forEach(el=>{el.textContent='Affiliate disclosure: We may earn a commission when you purchase through our affiliate links. This can influence which provider we feature. You purchase directly from Registered Agents Inc.';});}

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
