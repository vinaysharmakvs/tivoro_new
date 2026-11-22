// A native sticky section: vertical page travel becomes horizontal project travel.
// No wheel/touch interception. Normal scrolling resumes at either end.
(() => {
  const section = document.querySelector('.project-showcase');
  if (!section) return;
  const pin = section.querySelector('.showcase-pin');
  const viewport = section.querySelector('.showcase-window');
  const track = section.querySelector('.showcase-track');
  const cards = [...section.querySelectorAll('.showcase-card')];
  const buttons = [...section.querySelectorAll('[data-project-go]')];
  const bar = section.querySelector('.showcase-progress span');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const capture = new URLSearchParams(location.search).has('capture');
  // A shorter desktop sequence; smaller screens keep their native swipe rail.
  const travelRatio = .72;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  let enabled = false, start = 0, distance = 0, frame = 0, current = 0;
  let previousTime = 0, lastScrollTime = 0;
  let positions = [], active = -1, resizeFrame = 0;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function select(index) {
    if (index === active) return;
    active = index;
    section.dataset.activeProject = cards[index].dataset.project;
    buttons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }
  function paint() {
    const x = enabled ? current : viewport.scrollLeft;
    if (enabled) track.style.transform = `translate3d(${-x}px,0,0)`;
    const nearest = positions.reduce((best, pos, i) => Math.abs(pos - x) < Math.abs(positions[best] - x) ? i : best, 0);
    select(nearest);
    bar.style.transform = `scaleX(${distance ? clamp(x / distance, 0, 1) : 0})`;
  }
  function tick(time) {
    frame = 0;
    if (!enabled) return;
    const target = clamp((scrollY - start) / travelRatio, 0, distance);
    const dt = previousTime ? Math.min(40, time - previousTime) : 16.67;
    previousTime = time;
    // A short, bounded glide removes wheel steps. Touch keeps native inertia.
    // Never let the reel trail by more than 48px or run a long catch-up tail.
    const soften = finePointer.matches && scrollY > start && scrollY < start + distance * travelRatio && time - lastScrollTime < 200;
    if (soften) {
      current = clamp(current, target - 48, target + 48);
      current += (target - current) * (1 - Math.exp(-dt / 60));
    } else current = target;
    if (Math.abs(target - current) < .35) current = target;
    paint();
    if (current !== target) frame = requestAnimationFrame(tick);
    else previousTime = 0;
  }
  function update() {
    lastScrollTime = performance.now();
    if (enabled && !frame) frame = requestAnimationFrame(tick);
  }
  function measure() {
    resizeFrame = 0;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    enabled = !reduced.matches && !capture && innerWidth > 900 && innerHeight >= 650;
    section.toggleAttribute('data-pinned', enabled);
    track.style.transform = '';
    viewport.scrollLeft = 0;
    // Read layout once; the scroll handler and animation loop only write transforms.
    distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
    const first = cards[0].offsetLeft;
    positions = cards.map(card => clamp(card.offsetLeft - first, 0, distance));
    section.style.height = enabled ? `${pin.offsetHeight + distance * travelRatio}px` : '';
    start = section.getBoundingClientRect().top + scrollY;
    current = enabled ? clamp((scrollY - start) / travelRatio, 0, distance) : 0;
    section.dataset.scrollMode = enabled ? 'pinned' : capture ? 'overview' : 'native';
    const instruction = section.querySelector('.showcase-instruction');
    if(instruction) instruction.innerHTML = enabled ? 'Scroll to explore <span aria-hidden="true">→</span>' : 'Swipe or choose a project <span aria-hidden="true">→</span>';
    paint();
  }
  function scheduleMeasure() {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(measure);
  }
  function go(index, behavior = 'smooth') {
    index = clamp(index, 0, cards.length - 1);
    if (enabled) window.scrollTo({top: start + positions[index] * travelRatio, behavior});
    else viewport.scrollTo({left: positions[index], behavior: reduced.matches ? 'instant' : behavior});
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => go(i)));
  viewport.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next;
    if (event.key === 'ArrowRight') next = active + 1;
    if (event.key === 'ArrowLeft') next = active - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = cards.length - 1;
    if (next === undefined) return;
    event.preventDefault(); go(next);
  });
  // Bring an offscreen project into view when reached with the keyboard.
  cards.forEach((card, i) => card.addEventListener('focusin', event => {
    if (enabled && event.target.matches(':focus-visible')) { go(i, 'instant'); current = positions[i]; paint(); }
  }));
  viewport.addEventListener('scroll', () => { if (!enabled) paint(); }, {passive:true});
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', scheduleMeasure, {passive:true});
  window.addEventListener('pageshow', scheduleMeasure);
  reduced.addEventListener('change', scheduleMeasure);
  document.fonts?.ready.then(scheduleMeasure);
  measure();
})();
