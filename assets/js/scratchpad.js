(() => {
  const panel = document.querySelector('.scratchpad');
  if (!panel) return;
  const canvas = panel.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  const paper = panel.querySelector('.scratchpad-paper');
  const colors = [...panel.querySelectorAll('[data-ink]')];
  const eraser = panel.querySelector('[data-action="eraser"]');
  const undo = panel.querySelector('[data-action="undo"]');
  const clear = panel.querySelector('[data-action="clear"]');
  const status = panel.querySelector('.scratchpad-status');
  const strokes = [];
  let current = null;
  let pointer = null;
  let ink = colors[0].dataset.ink;
  let erasing = false;
  let width = 0;
  let height = 0;

  const updateButtons = () => {
    undo.disabled = clear.disabled = strokes.length === 0;
  };
  const segment = (stroke, from, to) => {
    context.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
    context.strokeStyle = context.fillStyle = stroke.ink;
    context.lineWidth = stroke.erase ? 19 : 2;
    context.lineCap = context.lineJoin = 'round';
    context.beginPath();
    if (from === to) {
      context.arc(to.x * width, to.y * height, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.moveTo(from.x * width, from.y * height);
      context.lineTo(to.x * width, to.y * height);
      context.stroke();
    }
  };
  const render = () => {
    context.clearRect(0, 0, width, height);
    for (const stroke of [...strokes, ...(current ? [current] : [])]) {
      segment(stroke, stroke.points[0], stroke.points[0]);
      for (let i = 1; i < stroke.points.length; i++) segment(stroke, stroke.points[i - 1], stroke.points[i]);
    }
  };
  const resize = () => {
    if (!panel.open) return;
    width = paper.clientWidth;
    height = paper.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    render();
  };
  const point = (event, rect) => ({
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
  });
  const finish = event => {
    if (event.pointerId !== pointer) return;
    if (current) strokes.push(current);
    current = null;
    pointer = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    updateButtons();
  };
  canvas.addEventListener('pointerdown', event => {
    if (pointer !== null || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    pointer = event.pointerId;
    canvas.setPointerCapture(pointer);
    const first = point(event, canvas.getBoundingClientRect());
    current = { ink, erase: erasing, points: [first] };
    segment(current, first, first);
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer || !current) return;
    const rect = canvas.getBoundingClientRect();
    const samples = event.getCoalescedEvents?.() || [event];
    for (const sample of samples.length ? samples : [event]) {
      const next = point(sample, rect);
      segment(current, current.points.at(-1), next);
      current.points.push(next);
    }
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => canvas.addEventListener(type, finish));
  colors.forEach(button => button.addEventListener('click', () => {
    ink = button.dataset.ink;
    erasing = false;
    eraser.setAttribute('aria-pressed', 'false');
    colors.forEach(color => color.setAttribute('aria-pressed', String(color === button)));
    canvas.classList.remove('is-erasing');
  }));
  eraser.addEventListener('click', () => {
    erasing = !erasing;
    eraser.setAttribute('aria-pressed', String(erasing));
    colors.forEach(color => color.setAttribute('aria-pressed', String(!erasing && color.dataset.ink === ink)));
    canvas.classList.toggle('is-erasing', erasing);
  });
  undo.addEventListener('click', () => {
    strokes.pop(); render(); updateButtons(); status.textContent = '마지막 획을 되돌렸습니다.';
  });
  clear.addEventListener('click', () => {
    strokes.length = 0; render(); updateButtons(); status.textContent = '낙서를 모두 지웠습니다.';
  });
  panel.querySelector('[data-action="close"]').addEventListener('click', () => {
    panel.open = false;
    panel.querySelector('summary').focus();
  });
  panel.addEventListener('toggle', resize);
  new ResizeObserver(resize).observe(paper);
  panel.hidden = false;
})();
