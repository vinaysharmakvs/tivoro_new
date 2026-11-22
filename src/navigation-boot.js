// Runs in the head before layout, so a new page cannot restore the old offset.
(() => {
  const normalize = path => path.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/';
  let fresh = false;
  try {
    const record = JSON.parse(sessionStorage.getItem('tivoro-page-transition') || 'null');
    sessionStorage.removeItem('tivoro-page-transition');
    fresh = !!record && Date.now() - record.at < 12000 && normalize(location.pathname) === record.path;
  } catch {}
  const type = performance.getEntriesByType('navigation')[0]?.type;
  // Keep intentional anchor links and the browser's Back/Forward position.
  if (location.hash || type === 'back_forward' || (!fresh && type !== 'navigate')) return;
  const previous = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  document.documentElement.dataset.navigationStart = 'top';
  let interacted = false;
  const stopReset = () => { interacted = true; };
  for (const name of ['wheel', 'touchstart', 'keydown']) addEventListener(name, stopReset, {once:true, passive:true});
  const reset = () => {
    if (!interacted) scrollTo({left:0, top:0, behavior:'instant'});
  };
  reset();
  document.addEventListener('DOMContentLoaded', reset, {once:true});
  addEventListener('pageshow', event => {
    if (!event.persisted) reset();
    requestAnimationFrame(() => { history.scrollRestoration = previous || 'auto'; });
  });
})();
