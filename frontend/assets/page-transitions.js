// Native navigation starts immediately; the head bootstrap resets new pages.
(() => {
  const normalize = path => path.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const pages = new Set(['/', '/about', '/work', '/contact', '/website-design-development', '/product-design-development', '/tools-analytics', '/privacy', '/terms']);
  const prefetched = new Set();
  const hosted = location.hostname.endsWith('.chatgpt.site');
  const saveData = navigator.connection?.saveData;
  const capture = new URLSearchParams(location.search).has('capture');

  function destination(anchor) {
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return null;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || !pages.has(normalize(url.pathname))) return null;
    return url;
  }
  // Hosting redirects .html paths. Link straight to their canonical route.
  if (hosted) document.querySelectorAll('a[href]').forEach(anchor => {
    const url = destination(anchor);if (!url) return;
    url.pathname = normalize(url.pathname);anchor.href = url.href;
  });

  function warm(anchor) {
    const url = destination(anchor);
    if (!url || capture || saveData || normalize(url.pathname) === normalize(location.pathname)) return;
    url.hash = '';
    if (prefetched.has(url.href)) return;
    prefetched.add(url.href);
    const link = document.createElement('link');link.rel='prefetch';link.as='document';link.href=url.href;
    document.head.append(link);
  }
  document.addEventListener('pointerover',event=>warm(event.target.closest('a[href]')),{passive:true});
  document.addEventListener('focusin',event=>warm(event.target.closest('a[href]')));
  document.addEventListener('touchstart',event=>warm(event.target.closest('a[href]')),{passive:true});
  // Warm the few primary destinations while the browser is idle, including
  // on touch devices where hovering cannot start a prefetch before a tap.
  if (!capture && !saveData) {
    const warmPrimary=()=>document.querySelectorAll('.desktop-nav a[href],.nav-contact').forEach(warm);
    if ('requestIdleCallback' in window) requestIdleCallback(warmPrimary,{timeout:1500});
    else window.addEventListener('load',warmPrimary,{once:true});
  }
  document.addEventListener('click',event=>{
    if (capture || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor=event.target.closest('a[href]'),url=destination(anchor);
    if (!url || normalize(url.pathname)===normalize(location.pathname)) return;
    const record={path:normalize(url.pathname),at:Date.now()};
    try {sessionStorage.setItem('tivoro-page-transition',JSON.stringify(record));}catch{}
    document.body.dataset.lastPageTransition='native-navigation';
    // Intentionally leave the link's default action untouched.
  });
  document.documentElement.dataset.navigationMode='immediate';
  // A restored page keeps its scroll position and never replays its entrance.
  window.addEventListener('pageshow',event=>{
    if(event.persisted)delete document.documentElement.dataset.pageArrival;
  });
})();
