// Stable irregularities: handwriting stays in place when the page reloads.
(() => {
  const selector = 'nav a, .intro h1, .profile-label, figcaption, .section-heading h2, .post-card h3, .note-card h2, .article-header h1, .category-header h1, .category-group h2, .category-sidebar h2';
  let seed = 1977;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  document.querySelectorAll(selector).forEach(element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement.closest('.brand-mark, .section-number, .hand-visual, .hand-original') || !node.textContent.trim()
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      const original = document.createElement('span');
      original.className = 'hand-original';
      original.textContent = node.textContent;
      fragment.append(original);
      const visual = document.createElement('span');
      visual.className = 'hand-visual';
      visual.setAttribute('aria-hidden', 'true');
      node.textContent.split(/(\s+)/u).forEach(word => {
        if (!word.trim()) { visual.append(document.createTextNode(word)); return; }
        const group = document.createElement('span');
        group.className = 'hand-word';
        Array.from(word).forEach(character => {
          const letter = document.createElement('span');
          letter.className = 'hand-letter';
          letter.textContent = character;
          letter.style.setProperty('--tilt', `${(random() * 15 - 7.5).toFixed(2)}deg`);
          letter.style.setProperty('--lift', `${(random() * .11 - .055).toFixed(3)}em`);
          letter.style.setProperty('--stretch', (random() * .16 + .92).toFixed(3));
          letter.style.setProperty('--space', `${(random() * .035 - .012).toFixed(3)}em`);
          letter.style.setProperty('--ink', (random() * .22 + .78).toFixed(2));
          group.append(letter);
        });
        visual.append(group);
      });
      fragment.append(visual);
      node.replaceWith(fragment);
    });
  });
})();

// A category link also opens its empty-state disclosure.
(() => {
  const revealCategory = () => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target?.matches('details.category-pending')) {
      target.open = true;
      requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
    }
  };
  revealCategory();
  addEventListener('hashchange', revealCategory);
})();
