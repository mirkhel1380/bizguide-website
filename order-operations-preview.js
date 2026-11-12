(() => {
  'use strict';
  // Demonstration data is fabricated and exists only in memory.
  const initial = [
    {id:'DEMO-1001',service:'LLC Formation',state:'Wyoming',payment:'Not collected',status:'quote_requested'},
    {id:'DEMO-1002',service:'Registered Agent',state:'Delaware',payment:'Verified (sample only)',status:'review_required'},
    {id:'DEMO-1003',service:'EIN Assistance',state:'Texas',payment:'Verified (sample only)',status:'submitted_to_provider'},
    {id:'DEMO-1004',service:'Registered Agent',state:'Florida',payment:'Verified (sample only)',status:'complete'}
  ];
  const labels = {
    quote_requested:'Quote requested', payment_verified:'Payment verified',
    review_required:'Review required', submitted_to_provider:'Submitted to provider',
    processing:'Processing', complete:'Complete'
  };
  let orders = initial.map(row => ({...row}));
  const tbody = document.getElementById('orders');
  const filter = document.getElementById('filter');
  function cell(tr, text, tag='td') {
    const el = document.createElement(tag);
    el.textContent = text;
    tr.appendChild(el);
    return el;
  }
  function render() {
    tbody.replaceChildren();
    document.getElementById('count-all').textContent = String(orders.length);
    document.getElementById('count-review').textContent = String(orders.filter(o => ['quote_requested','review_required'].includes(o.status)).length);
    document.getElementById('count-complete').textContent = String(orders.filter(o => o.status === 'complete').length);
    const visible = orders.filter(o => filter.value === 'all' || filter.value === o.status);
    document.getElementById('empty').hidden = visible.length > 0;
    for (const o of visible) {
      const tr = document.createElement('tr');
      cell(tr, o.id); cell(tr, o.service); cell(tr, o.state); cell(tr, o.payment);
      const statusTd = document.createElement('td');
      const sel = document.createElement('select');
      sel.setAttribute('aria-label', 'Demo status for ' + o.id);
      for (const [value, label] of Object.entries(labels)) {
        const option = document.createElement('option');
        option.value = value; option.textContent = label;
        option.selected = value === o.status; sel.appendChild(option);
      }
      sel.addEventListener('change', () => { o.status = sel.value; render(); });
      statusTd.appendChild(sel); tr.appendChild(statusTd);
      const next = {
        quote_requested:'Prepare written quote',payment_verified:'Check authorization',
        review_required:'Review filing details',submitted_to_provider:'Track provider',
        processing:'Monitor completion',complete:'Archive documents securely'
      };
      cell(tr, next[o.status]); tbody.appendChild(tr);
    }
  }
  const sampleForm = document.getElementById('demo-quote-form');
  let sampleNumber = 2000;
  sampleForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = document.getElementById('demo-state').value;
    const service = document.getElementById('demo-service').value;
    const stateNames = {WY:'Wyoming',DE:'Delaware',TX:'Texas',FL:'Florida',CA:'California'};
    orders.unshift({
      id: 'DEMO-' + (++sampleNumber),
      service,
      state: stateNames[state],
      payment: 'Not collected',
      status: 'quote_requested'
    });
    filter.value = 'all';
    document.getElementById('demo-quote-message').textContent = 'Sample request added to this demo only — not saved.';
    render();
  });
  filter.addEventListener('change', render);
  document.getElementById('reset').addEventListener('click', () => { orders = initial.map(row => ({...row})); filter.value='all'; render(); });
  render();
})();