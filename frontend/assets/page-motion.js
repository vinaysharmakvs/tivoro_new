import {ease,motion} from '../../src/motion-config.js';
// Shared inner-page choreography. Content remains visible without JavaScript.
(() => {
  const capture = new URLSearchParams(location.search).has('capture');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const allowed = () => !capture && !reduced.matches;
  const active = new Set();
  const plans = new Map();
  const animate = (el, frames, duration = 780, delay = 0) => {
    if (!allowed() || !el) return;
    const animation = el.animate(frames, {duration:Math.min(duration,motion.media),delay:Math.min(delay,180),easing:ease,fill:'backwards'});
    active.add(animation);
    animation.finished.catch(() => {}).finally(() => active.delete(animation));
  };
  const lift = (el, delay = 0, distance = 24, duration = 720) => animate(el,
    [{opacity:.65,translate:`0 ${Math.min(distance,18)}px`},{opacity:1,translate:'0 0'}],Math.min(duration,motion.enter),delay);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      observer.unobserve(el);
      el.dataset.motionRevealed = 'true';
      if (allowed()) plans.get(el)?.();
      plans.delete(el);
    });
  }, {threshold:.08,rootMargin:'0px 0px -20px 0px'});
  const watch = (el, plan) => {plans.set(el,plan);observer.observe(el);};

  // Visible top-of-page details accompany the existing headline animation.
  document.querySelectorAll('.page-hero>.eyebrow,.page-hero>div>.eyebrow,.page-hero>.hero-foot>div').forEach((el,i)=>lift(el,i*65,14,650));

  const media = [...document.querySelectorAll('main .project-stage')].filter(el=>!el.closest('.project-showcase'));
  media.forEach((stage,i) => {
    stage.classList.add('motion-project-media');
    watch(stage, () => {
      animate(stage,[{opacity:.35,translate:'0 28px'},{opacity:1,translate:'0 0'}],860);
      const caption = stage.closest('.case,.work-feature,.project-link')?.querySelector('.project-caption');
      if (caption) {
        lift(caption.querySelector('h2,h3'),100,18,760);
        lift(caption.querySelector('p'),170,14,680);
        lift(caption.querySelector('.arrow'),210,12,680);
      }
      const count = stage.querySelector('.work-media-count');
      if(count) lift(count,180,12,650);
    });
    if (document.body.dataset.page === 'work') {
      const count = document.createElement('span');
      count.className='work-media-count';count.setAttribute('aria-hidden','true');
      count.textContent=`${String(i+1).padStart(2,'0')} / ${String(media.length).padStart(2,'0')}`;
      stage.append(count);
    }
  });

  // Each service has its own movement while retaining the shared rhythm.
  document.querySelectorAll('.product-canvas').forEach(canvas=>watch(canvas,()=>{
    canvas.dataset.vignetteVisible='true';
    lift(canvas,0,20,800);
    canvas.querySelectorAll('.paper-prototype').forEach((paper,i)=>{
      lift(paper,100+i*110,34,920);
      paper.querySelectorAll('.sketch-field,.sketch-row,.sketch-button').forEach((row,j)=>lift(row,230+i*110+j*50,9,540));
    });
  }));
  document.querySelectorAll('.analytics-canvas').forEach(canvas=>watch(canvas,()=>{
    canvas.dataset.vignetteVisible='true';
    lift(canvas,0,20,800);
    canvas.querySelectorAll('.analytics-path article').forEach((node,i)=>lift(node,120+i*140,26,800));
    canvas.querySelectorAll('.analytics-path>.arrow').forEach((arrow,i)=>animate(arrow,[{opacity:0,translate:'-12px 0'},{opacity:1,translate:'0 0'}],600,240+i*140));
  }));
  document.querySelectorAll('.portrait-composition').forEach(group=>watch(group,()=>{
    group.querySelectorAll('img').forEach((photo,i)=>animate(photo,[{opacity:0,translate:`0 ${26+i*6}px`,scale:'.96'},{opacity:1,translate:'0 0',scale:'1'}],900,i*110));
    lift(group.querySelector('figcaption'),260,12,650);
  }));
  document.querySelectorAll('.founder-grid article').forEach(article=>watch(article,()=>{
    animate(article.querySelector('figure'),[{opacity:0,clipPath:'inset(0 0 14% 0)',translate:'0 25px'},{opacity:1,clipPath:'inset(0 0 0% 0)',translate:'0 0'}],900);
    article.querySelectorAll('.eyebrow,h3,.focus,.bio').forEach((el,i)=>lift(el,100+i*65,16,680));
  }));
  document.querySelectorAll('.project-form').forEach(form=>watch(form,()=>{
    [...form.children].forEach((row,i)=>lift(row,Math.min(i,5)*65,18,680));
  }));
  document.querySelectorAll('.scope-note,.concept-caption,.split-heading>p,.process-note>p,.hero-meta,.story-heading>p').forEach(el=>watch(el,()=>lift(el,0,20,740)));

  // Carry the rhythm through the handover, interactive example and page end.
  document.querySelectorAll('.project-plan ul').forEach(list=>watch(list,()=>{
    [...list.children].forEach((row,i)=>lift(row,Math.min(i,3)*65,16,620));
  }));
  document.querySelectorAll('.goal-demo-panel,.feature-caption,.page-end,.footer-meta').forEach(el=>watch(el,()=>lift(el,0,16,620)));
  document.querySelectorAll('.hello').forEach(el=>watch(el,()=>{
    el.dataset.signatureVisible='true';
  }));

  // A finite cue makes the Work page invite scrolling without constant motion.
  if(document.body.dataset.page==='work') {
    const hero=document.querySelector('.page-hero');
    const cue=document.createElement('div');cue.className='work-scroll-cue';
    cue.innerHTML='<span aria-hidden="true"></span>Scroll through the work';
    hero.append(cue);lift(cue,180,12,720);
  }
  // Underlines are drawn on view, then remain still.
  document.querySelectorAll('.detail-list li,.process-track>article,.steps article').forEach(el=>{
    el.classList.add('motion-rule');
    watch(el,()=>{
      el.dataset.ruleVisible='true';
      animate(el,[{opacity:.45,translate:'0 18px'},{opacity:1,translate:'0 0'}],740);
    });
  });
  function settle() {
    active.forEach(animation=>animation.cancel());
    document.querySelectorAll('.motion-rule').forEach(el=>el.dataset.ruleVisible='true');
    document.querySelectorAll('[data-vignette-visible]').forEach(el=>el.removeAttribute('data-vignette-visible'));
  }
  reduced.addEventListener('change',()=>{if(reduced.matches)settle();});
  window.addEventListener('pageshow',event=>{if(event.persisted)settle();});
  document.body.dataset.pageMotion=allowed()?'enhanced':'static';
})();
