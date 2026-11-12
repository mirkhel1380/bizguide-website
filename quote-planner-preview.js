(() => {
  'use strict';
  // Everything remains local until the visitor intentionally opens their own email client.
  const states = "Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming,Washington DC".split(',');
  const state = document.getElementById('rq-state');
  for (const name of states) { const opt = document.createElement('option'); opt.value = name; opt.textContent = name; state.appendChild(opt); }
  const fields = [...document.querySelectorAll('input[name="rq-service"]')];
  const company = document.getElementById('rq-status');
  const ack = document.getElementById('rq-ack');
  const error = document.getElementById('rq-error');
  const ready = document.getElementById('rq-ready');
  const email = document.getElementById('rq-email');
  function services() { return fields.filter(x => x.checked).map(x => x.value); }
  function refresh() {
    document.getElementById('rq-state-summary').textContent = state.value || 'Not selected';
    document.getElementById('rq-services-summary').textContent = services().join(', ') || 'None selected';
    document.getElementById('rq-status-summary').textContent = company.value;
    ready.hidden = true; error.hidden = true;
  }
  [state, company, ack, ...fields].forEach(el => el.addEventListener('change', refresh));
  document.getElementById('rq-create').addEventListener('click', () => {
    if (!state.value || !services().length || !ack.checked) {
      error.textContent = 'Please select a state and at least one service, then acknowledge the pre-launch conditions.';
      error.hidden = false; ready.hidden = true; return;
    }
    const subject = 'BizGuide preliminary service quote request – ' + state.value;
    const body = [
      'Hello BizGuide,', '',
      'I would like a preliminary written quote for the following services:', '',
      'State: ' + state.value,
      'Services: ' + services().join(', '),
      'Company status: ' + company.value, '',
      'Please provide eligibility, service fees, applicable government charges, expected renewal costs and next steps.', '',
      'I understand this is not an order and no filing or payment is initiated.', '',
      'Thank you.'
    ].join('\n');
    email.href = 'mailto:contact@bizguide.website?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    error.hidden = true; ready.hidden = false;
    email.focus();
  });
  refresh();
})();