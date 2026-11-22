import {ease,motion} from '../../src/motion-config.js';
// Tivoro motion direction: readable by default, progressive and interruptible.
(() => {
  const capture = new URLSearchParams(location.search).has('capture');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const moving = () => !capture && !reduced.matches;
  const animations = new Set();
  const play = (element, frames, options = {}) => {
    if (!moving()) return;
    const animation = element.animate(frames, {duration:550,easing:ease,fill:'backwards',...options});
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      observer.unobserve(element);
      element.dataset.revealed = 'true';
      if (!moving()) continue;
      if (element.matches('h2')) {
        play(element,[{transform:'translate3d(0,14px,0)',opacity:.65},{transform:'translate3d(0,0,0)',opacity:1}],{duration:motion.enter});
      } else {
        play(element,[{opacity:.65,transform:'translate3d(0,14px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:motion.enter});
      }
    }
  }, {threshold:.15,rootMargin:'0px 0px -30px 0px'});

  if (!capture) {
    document.querySelectorAll('main h2,.hello h2').forEach(heading => {
      if (heading.closest('.project-caption')) return;
      observer.observe(heading);
    });
    document.querySelectorAll('.home-intro p,.home-intro .text-link,.story-body>p,.case-copy,.contact-brief>div,.hello p,.hello .text-link,.footer-baseline,.faq-stack details').forEach(element => observer.observe(element));
  }

  const ribbon = document.querySelector('.studio-ribbon');
  if (ribbon) {
    const button = ribbon.querySelector('.ribbon-toggle');
    let paused = false;
    button.addEventListener('click', () => {
      paused = !paused;
      ribbon.toggleAttribute('data-paused', paused);
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? 'Play moving studio text' : 'Pause moving studio text');
      button.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
    });
    new IntersectionObserver(entries => ribbon.toggleAttribute('data-in-view', entries[0].isIntersecting)).observe(ribbon);
  }

  const magnets = [...document.querySelectorAll('.pill,.nav-contact,.text-link')];
  magnets.forEach(element => {
    let rect, pending = 0, x = 0, y = 0;
    element.classList.add('motion-magnet');
    const reset = () => {
      if (pending) cancelAnimationFrame(pending); pending = 0;
      element.style.removeProperty('--magnet-x'); element.style.removeProperty('--magnet-y');
    };
    element.addEventListener('pointerenter', () => {rect = element.getBoundingClientRect();});
    element.addEventListener('pointermove', event => {
      if (!moving() || !fine.matches || event.pointerType === 'touch' || !rect) return;
      x = Math.max(-6, Math.min(6, (event.clientX - rect.left - rect.width/2)*.08));
      y = Math.max(-4, Math.min(4, (event.clientY - rect.top - rect.height/2)*.15));
      if (!pending) pending = requestAnimationFrame(() => {
        pending = 0; element.style.setProperty('--magnet-x', x+'px');element.style.setProperty('--magnet-y', y+'px');
      });
    }, {passive:true});
    element.addEventListener('pointerleave', reset);
    element.addEventListener('blur', reset);
    reduced.addEventListener('change', reset);
  });

  document.querySelectorAll('.showcase-project .project-stage').forEach(stage => {
    const label = document.createElement('span');
    label.className = 'project-hover-label';label.setAttribute('aria-hidden','true');label.innerHTML = 'View<br>project ↗';
    stage.append(label);
    let rect;
    stage.addEventListener('pointerenter', () => {rect = stage.getBoundingClientRect();});
    stage.addEventListener('pointermove', event => {
      if (!moving() || !fine.matches || event.pointerType === 'touch' || !rect) return;
      stage.style.setProperty('--cursor-x', (event.clientX - rect.left)+'px');
      stage.style.setProperty('--cursor-y', (event.clientY - rect.top)+'px');
    }, {passive:true});
  });

  const progress = document.createElement('div'); progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden','true'); document.body.append(progress);
  const photos = [...document.querySelectorAll('.project-stage.photo .backdrop')].filter(photo => !photo.closest('.project-showcase'));
  const screens = [...document.querySelectorAll('main .project-screen')].filter(screen => !screen.closest('.project-showcase'));
  const screenCenters = new Map(), visibleScreens = new Set();
  screens.forEach(screen => screen.setAttribute('data-scene-depth',''));
  const screenObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) visibleScreens.add(entry.target); else visibleScreens.delete(entry.target);
    onScroll();
  }));
  screens.forEach(screen => screenObserver.observe(screen));
  let visiblePhotos = new Set(), scrollFrame = 0, pageHeight = 1;
  const photoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) visiblePhotos.add(entry.target);else visiblePhotos.delete(entry.target);
  }));
  photos.forEach(photo => photoObserver.observe(photo));
  function scrollPaint() {
    scrollFrame = 0;
    if (!moving()) return;
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1,scrollY/pageHeight))})`;
    const values = [...visiblePhotos].map(photo => {
      const rect = photo.parentElement.getBoundingClientRect();
      return [photo, Math.max(-1,Math.min(1,(rect.top+rect.height/2-innerHeight/2)/innerHeight))];
    });
    values.forEach(([photo,value]) => photo.style.transform = `translate3d(0,${value*28}px,0) scale(1.08)`);
    // Cached geometry, at most the visible portfolio images, one frame per scroll.
    if (innerWidth > 700 && fine.matches) visibleScreens.forEach(screen => {
      const center = screenCenters.get(screen);
      if (center === undefined) return;
      const position = Math.max(-1,Math.min(1,(center-scrollY-innerHeight/2)/innerHeight));
      screen.style.setProperty('--scene-y', `${position*14}px`);
    });
  }
  function onScroll() {if (moving() && !scrollFrame) scrollFrame = requestAnimationFrame(scrollPaint);}
  function measure() {
    pageHeight = Math.max(1,document.documentElement.scrollHeight-innerHeight);
    screens.forEach(screen => {const rect=screen.parentElement.getBoundingClientRect();screenCenters.set(screen,rect.top+scrollY+rect.height/2);});
    onScroll();
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', measure, {passive:true});
  window.addEventListener('load', measure);document.fonts?.ready.then(measure);
  new ResizeObserver(measure).observe(document.body);
  document.addEventListener('visibilitychange', () => ribbon?.toggleAttribute('data-page-hidden', document.hidden));
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      animations.forEach(animation => animation.cancel());
      photos.forEach(photo => photo.style.removeProperty('transform'));
      screens.forEach(screen => screen.style.removeProperty('--scene-y'));
      progress.style.transform = 'scaleX(0)';
    } else measure();
  });
  document.body.dataset.studioMotion = moving() ? 'active' : 'static';
  measure();
})();
