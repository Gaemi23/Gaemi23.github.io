(() => {
  const guide = document.querySelector('.field-guide');
  if (!guide) return;
  const tabs = [...guide.querySelectorAll('.guide-tabs a')];
  const panels = [...guide.querySelectorAll('.guide-panel')];
  const position = guide.querySelector('[data-guide-position]');
  const nav = guide.querySelector('.guide-tabs');
  nav.setAttribute('role', 'tablist');
  const form = guide.querySelector('.guide-search');
  const input = form.querySelector('input');
  const clear = form.querySelector('[data-search-clear]');
  const status = form.querySelector('[role="status"]');
  const noResults = guide.querySelector('.guide-no-results');
  const rows = [...guide.querySelectorAll('[data-post-url]')];
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  const fullText = new Map();
  let indexRequest;
  let indexReady = false;
  let indexFailed = false;
  let loading = false;
  panels.forEach(panel => {
    const count = panel.querySelector('.guide-panel-heading>span');
    count.dataset.original = count.textContent;
  });
  const filter = () => {
    const query = normalize(input.value);
    const terms = query.split(' ').filter(Boolean);
    rows.forEach(row => {
      const text = fullText.get(row.dataset.postUrl) || normalize(row.dataset.search);
      row.hidden = !terms.every(term => text.includes(term));
    });
    const panel = panels.find(panel => !panel.hidden);
    panel.append(noResults);
    const matches = panel.querySelectorAll('[data-post-url]:not([hidden])').length;
    const count = panel.querySelector('.guide-panel-heading>span');
    count.textContent = query ? `${matches}개의 결과` : count.dataset.original;
    panels.forEach(p => p.querySelectorAll('.guide-empty').forEach(empty => { empty.hidden = Boolean(query); }));
    noResults.hidden = !query || matches > 0 || loading;
    clear.hidden = !input.value;
    status.textContent = !query ? '' : loading ? '본문을 검색하고 있습니다…' :
      indexFailed ? `본문 검색을 불러오지 못해 제목과 요약에서 검색했습니다. ${matches}개의 결과` : `${matches}개의 검색 결과`;
  };
  const loadIndex = () => {
    if (!indexRequest) {
      loading = true;
      indexRequest = fetch(form.dataset.indexUrl).then(response => {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      }).then(entries => {
        if (!Array.isArray(entries)) throw new Error('Invalid search index');
        entries.forEach(entry => fullText.set(entry.url, normalize(entry.text)));
        indexReady = true;
      }).catch(() => { indexFailed = true; }).finally(() => { loading = false; filter(); });
    }
    return indexRequest;
  };
  form.addEventListener('submit', event => event.preventDefault());
  input.addEventListener('focus', loadIndex, {once: true});
  input.addEventListener('input', () => {
    if (input.value.trim() && !indexReady && !indexFailed) loadIndex();
    filter();
  });
  clear.addEventListener('click', () => { input.value = ''; filter(); input.focus(); });
  form.hidden = false;
  const select = hash => {
    let index = tabs.findIndex(tab => tab.hash === hash);
    if (index < 0) index = 0;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    position.textContent = `${String(index + 1).padStart(2, '0')} / ${String(tabs.length).padStart(2, '0')}`;
    filter();
  };
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].tabIndex = 0;
    tab.addEventListener('click', event => {
      event.preventDefault();
      if (location.hash !== tab.hash) history.pushState(null, '', tab.hash);
      select(tab.hash);
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
      else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus(); tabs[next].click();
    });
  });
  guide.classList.add('is-interactive');
  select(location.hash);
  addEventListener('hashchange', () => select(location.hash));
  addEventListener('popstate', () => select(location.hash));
})();
