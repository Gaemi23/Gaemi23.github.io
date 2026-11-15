(() => {
  const article = document.querySelector('article.article');
  if (!article) return;
  const prose = article.querySelector('.prose');
  const toc = article.querySelector('.post-toc');
  const headings = [...prose.querySelectorAll('h2, h3')];
  if (toc && headings.length >= 3) {
    const list = toc.querySelector('ol');
    headings.forEach((heading, index) => {
      let id = heading.id || `section-${index + 1}`;
      const base = id;
      let suffix = 1;
      while (document.getElementById(id) && document.getElementById(id) !== heading) id = `${base}-${suffix++}`;
      heading.id = id;
      const item = document.createElement('li');
      item.className = heading.tagName === 'H3' ? 'toc-subheading' : '';
      const link = document.createElement('a');
      link.href = `#${encodeURIComponent(id)}`;
      link.textContent = heading.textContent;
      item.append(link);
      list.append(item);
    });
    toc.hidden = false;
  }

  const copyText = async text => {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(text); return; } catch { /* Try the browser's legacy copy command. */ }
    }
    const selection = document.getSelection();
    const ranges = selection ? Array.from({length: selection.rangeCount}, (_, i) => selection.getRangeAt(i).cloneRange()) : [];
    const previousFocus = document.activeElement;
    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); }
    finally {
      field.remove();
      if (selection) { selection.removeAllRanges(); ranges.forEach(range => selection.addRange(range)); }
      previousFocus?.focus({preventScroll: true});
    }
    if (!copied) throw new Error('Clipboard unavailable');
  };
  prose.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    const label = document.createElement('span');
    const languageClass = `${code.className} ${pre.parentElement.className} ${pre.parentElement.parentElement?.className || ''}`;
    label.textContent = languageClass.match(/language-([\w+-]+)/)?.[1] || 'code';
    const button = document.createElement('button');
    button.type = 'button';
    const icons = {
      copy: ['M9 5V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1', 'M5 8h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z'],
      success: ['m5 12 4 4L19 6'],
      error: ['M12 4 2 21h20Z', 'M12 10v5', 'M12 18h.01']
    };
    const setState = state => {
      button.dataset.state = state;
      const description = state === 'success' ? '복사 완료' : state === 'error' ? '복사 실패, 다시 시도' : `${label.textContent} 코드 복사`;
      button.setAttribute('aria-label', description);
      button.title = description;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      icons[state].forEach(d => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        svg.append(path);
      });
      button.replaceChildren(svg);
    };
    setState('copy');
    const status = document.createElement('span');
    status.className = 'copy-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    toolbar.append(label, button, status);
    pre.before(wrapper);
    wrapper.append(toolbar, pre);
    let timer;
    button.addEventListener('click', async () => {
      clearTimeout(timer);
      button.disabled = true;
      status.textContent = '';
      try {
        await copyText(code.textContent);
        setState('success');
        status.textContent = '코드를 복사했습니다.';
      } catch {
        setState('error');
        status.textContent = '자동 복사를 사용할 수 없습니다. 코드를 선택해 복사해주세요.';
      } finally {
        button.disabled = false;
        timer = setTimeout(() => setState('copy'), 2000);
      }
    });
  });
})();
