import {ease,motion} from '../src/motion-config.js';
// Motion enhances the existing layout; native links and forms keep their behaviour.
const captureMode = new URLSearchParams(location.search).has('capture');
if (captureMode) {document.body.dataset.capture = '';document.documentElement.dataset.capture = '';}
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const useMotion = () => !captureMode && !motionPreference.matches;
const disclosures = new Map();

document.querySelectorAll('details').forEach(details => {
  const summary = details.querySelector(':scope > summary');
  if (!summary) return;
  const isMenu = details.matches('.mobile-menu,.services-menu');
  const panel = isMenu ? details.querySelector('.menu-panel') : details;
  let animation;
  let desired = details.open;
  const clean = () => {
    details.style.removeProperty('height');
    details.style.removeProperty('overflow');
    summary.setAttribute('aria-expanded', String(details.open));
  };
  const setOpen = (open, returnFocus = false, immediate = false) => {
    desired = open;
    if (!animation && details.open === open) { clean(); return; }
    const startHeight = details.getBoundingClientRect().height;
    const startOpacity = isMenu && details.open ? getComputedStyle(panel).opacity : '0';
    animation?.cancel();
    animation = undefined;
    if (!useMotion() || immediate) {
      details.open = open;
      clean();
      if (returnFocus) summary.focus({preventScroll:true});
      return;
    }
    details.open = true;
    summary.setAttribute('aria-expanded', String(open));
    if (isMenu) {
      animation = panel.animate(
        open ? [{opacity:startOpacity,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}]
             : [{opacity:startOpacity,transform:'translateY(0)'},{opacity:0,transform:'translateY(-4px)'}],
        {duration:open?280:160,easing:ease}
      );
    } else {
      details.style.height = '';
      const expandedHeight = details.getBoundingClientRect().height;
      const collapsedHeight = summary.getBoundingClientRect().height + parseFloat(getComputedStyle(details).paddingTop) + parseFloat(getComputedStyle(details).paddingBottom) + parseFloat(getComputedStyle(details).borderTopWidth) + parseFloat(getComputedStyle(details).borderBottomWidth);
      details.style.height = startHeight + 'px';
      details.style.overflow = 'clip';
      animation = details.animate([{height:startHeight+'px'},{height:(open?expandedHeight:collapsedHeight)+'px'}],{duration:open?320:240,easing:ease});
    }
    const current = animation;
    current.onfinish = () => {
      if (animation !== current) return;
      details.open = desired;
      animation = undefined;
      clean();
      if (returnFocus) summary.focus({preventScroll:true});
    };
  };
  disclosures.set(details, {setOpen, summary});
  summary.setAttribute('aria-expanded', String(details.open));
  summary.addEventListener('click', event => {
    event.preventDefault();
    const opening = !desired;
    if (opening && !isMenu) {
      const group = details.closest('.faq-stack');
      group?.querySelectorAll('details').forEach(other => {
        if (other !== details) disclosures.get(other)?.setOpen(false);
      });
    }
    setOpen(opening);
  });
  if (isMenu) {
    panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', event => {
      if (desired && !details.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && desired) setOpen(false, true);
    });
  }
  motionPreference.addEventListener('change', () => setOpen(desired));
});

// A restored document should not bring an old navigation panel back over its title.
window.addEventListener('pageshow',()=>{
  document.querySelectorAll('.services-menu,.mobile-menu').forEach(menu=>disclosures.get(menu)?.setOpen(false,false,true));
});

// Visible entrances and scroll choreography, with an always-readable fallback.
const activeMotion = new Set();
const play = (el, frames, options) => {
  const animation = el.animate(frames, options);
  activeMotion.add(animation);
  animation.finished.catch(() => {}).finally(() => activeMotion.delete(animation));
  return animation;
};
document.body.dataset.motion = useMotion() ? 'active' : 'reduced';
if (useMotion()) {
  document.querySelectorAll('main h1 .headline-inner').forEach((line,index) => play(line,
    [{transform:'translateY(12px)',opacity:.65},{transform:'translateY(0)',opacity:1}],
    {duration:motion.hero,delay:index*40,easing:ease,fill:'backwards'}));
  const heroFoot = document.querySelector('.home-hero .hero-foot,.page-hero .hero-foot,.studio-hero .hero-foot');
  if(heroFoot) play(heroFoot,[{opacity:.65,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:motion.hero,delay:40,easing:ease,fill:'backwards'});
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (useMotion()) {
          const grouped = entry.target.matches('.service-columns,.founder-grid');
          const elements = grouped ? [...entry.target.children] : [entry.target];
          elements.filter(el=>!el.closest(".project-showcase")).forEach((el,index) => play(el,
            [{transform:'translateY(18px)',opacity:.65},{transform:'translateY(0)',opacity:1}],
            {duration:motion.enter,delay:grouped?index*motion.stagger:0,easing:ease,fill:'backwards'}));
        }
        observer.unobserve(entry.target);
      }
    }, {threshold:.09,rootMargin:'0px 0px -32px 0px'});
    document.querySelectorAll('.service-columns').forEach(el => observer.observe(el));
  }
}
motionPreference.addEventListener('change',()=>{document.body.dataset.motion=useMotion()?'active':'reduced';if(!useMotion())activeMotion.forEach(animation=>animation.cancel());});
window.addEventListener('pageshow',event=>{if(event.persisted)activeMotion.forEach(animation=>animation.cancel());});



// Depth and reflected light on the real portfolio, without introducing a demo.
if(!captureMode){
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  document.querySelectorAll('.project-stage:not(.photo)').forEach(stage=>{
    const reset=()=>{for(const key of ['--project-rx','--project-ry','--project-lift','--project-light'])stage.style.removeProperty(key);};
    stage.addEventListener('pointermove',event=>{if(!useMotion()||!finePointer.matches||event.pointerType==='touch')return;const rect=stage.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;stage.style.setProperty('--project-rx',((.5-y)*6)+'deg');stage.style.setProperty('--project-ry',((x-.5)*8)+'deg');stage.style.setProperty('--project-lift','-5px');stage.style.setProperty('--project-light','1');stage.style.setProperty('--project-light-x',(x*100)+'%');stage.style.setProperty('--project-light-y',(y*100)+'%');},{passive:true});
    stage.addEventListener('pointerleave',reset);motionPreference.addEventListener('change',reset);
  });
}
