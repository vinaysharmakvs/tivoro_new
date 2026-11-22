import {ease,motion} from './motion-config.js';

const previews=[...document.querySelectorAll('[data-project-preview]')];
if(previews.length){
 const dialog=document.createElement('dialog');
 dialog.className='project-dialog';
 dialog.setAttribute('aria-labelledby','preview-title');
 dialog.innerHTML='<div class="preview-shell"><header class="preview-header"><div><span class="preview-kicker">Website preview <span id="preview-count"></span></span><h2 id="preview-title"></h2></div><button class="preview-close" type="button" autofocus>Close <span aria-hidden="true">×</span></button></header><div class="preview-image"><img alt="" width="1280" height="800"/></div><footer class="preview-footer"><p id="preview-context"></p><div class="preview-actions"><button type="button" data-preview-prev aria-label="Previous project">←</button><button type="button" data-preview-next aria-label="Next project">→</button><a class="text-link" target="_blank" rel="noopener noreferrer">Visit website <span aria-hidden="true">↗</span></a></div></footer></div>';
 document.body.append(dialog);
 const title=dialog.querySelector('h2'),image=dialog.querySelector('img'),visit=dialog.querySelector('a');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let selected=0,opener,animation,previousOverflow='';
 function show(index){
  selected=(index+previews.length)%previews.length;
  const button=previews[selected];
  title.textContent=button.dataset.previewTitle;
  image.src=button.dataset.previewSrc;
  image.alt=button.dataset.previewTitle+' website screenshot';
  visit.href=button.dataset.previewSite;
  visit.setAttribute('aria-label','Visit '+button.dataset.previewTitle+' website (opens in a new tab)');
  dialog.querySelector('#preview-count').textContent=`${selected+1} / ${previews.length}`;
  dialog.querySelector('#preview-context').textContent=button.closest('.case,.work-feature')?.querySelector('.case-copy>p')?.textContent||'';
  animation?.cancel();
  if(!preference.matches)animation=image.animate([{opacity:.6},{opacity:1}],{duration:motion.quick,easing:ease});
 }
 previews.forEach((button,index)=>button.addEventListener('click',()=>{
  opener=button;show(index);previousOverflow=document.documentElement.style.overflow;
  document.documentElement.style.overflow='hidden';
  dialog.showModal();
 }));
 dialog.querySelector('.preview-close').addEventListener('click',()=>dialog.close());
 dialog.querySelector('[data-preview-prev]').addEventListener('click',()=>show(selected-1));
 dialog.querySelector('[data-preview-next]').addEventListener('click',()=>show(selected+1));
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();show(selected+(event.key==='ArrowRight'?1:-1));
  }
 });
 dialog.addEventListener('close',()=>{
  document.documentElement.style.overflow=previousOverflow;
  animation?.cancel();opener?.focus({preventScroll:true});
 });
 preference.addEventListener('change',()=>animation?.cancel());
}
