(() => {
  const search = document.querySelector('#journal-search');
  if (!search) return;
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.journal-library .journal-card')];
  const count = document.querySelector('#journal-count');
  const empty = document.querySelector('#journal-empty');
  const topic = new URLSearchParams(window.location.search).get('topic');
  let category = buttons.some(button => button.dataset.filter === topic) ? topic : 'All';
  function update() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const match = (category === 'All' || card.dataset.category === category) && card.dataset.search.includes(query);
      card.hidden = !match;
      if (match) visible++;
    });
    count.textContent = `${visible} ${visible === 1 ? 'article' : 'articles'}${query ? ' matching your search' : ''}`;
    empty.hidden = visible !== 0;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    update();
  }));
  search.addEventListener('input', update);
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  update();
})();
