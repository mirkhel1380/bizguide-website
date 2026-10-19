const menu=document.querySelector('.menu');if(menu)menu.addEventListener('click',()=>{const nav=document.querySelector('.navlinks');const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});const cfg=window.BIZGUIDE_CONFIG||{};document.querySelectorAll('[data-service]').forEach(a=>{const url=cfg.links?.[a.dataset.service];if(cfg.affiliateApproved&&url&&/^https:\/\//.test(url)){a.href=url;a.rel='sponsored noopener';a.textContent='Explore with Registered Agents Inc. ↗';}});if(cfg.affiliateApproved){document.querySelectorAll('[data-affiliate-status]').forEach(el=>{el.textContent='A Registered Agents Inc affiliate';});document.querySelectorAll('[data-disclosure]').forEach(el=>{el.textContent='Affiliate disclosure: We may earn a commission when you purchase through our affiliate links. This can influence which provider we feature. You purchase directly from Registered Agents Inc.';});}

// Services disclosure: hover on a mouse, click on touch, natural keyboard links.
(() => {
  const dropdown = document.querySelector('.nav-dropdown');
  if (!dropdown) return;
  const toggle = dropdown.querySelector('.services-toggle');
  const panel = dropdown.querySelector('.services-submenu');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  }
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  dropdown.addEventListener('mouseenter', () => { if (hover.matches) setOpen(true); });
  dropdown.addEventListener('mouseleave', () => { if (hover.matches) setOpen(false); });
  dropdown.addEventListener('focusout', event => {
    if (!dropdown.contains(event.relatedTarget)) setOpen(false);
  });
  document.addEventListener('click', event => {
    if (!dropdown.contains(event.target)) setOpen(false);
  });
  dropdown.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setOpen(false);
      toggle.focus();
      event.preventDefault();
    }
    if (event.key === 'ArrowDown' && event.target === toggle) {
      setOpen(true);
      panel.querySelector('a').focus();
      event.preventDefault();
    }
  });
  document.querySelector('.menu')?.addEventListener('click', () => {
    if (!document.querySelector('.navlinks')?.classList.contains('open')) setOpen(false);
  });
})();
