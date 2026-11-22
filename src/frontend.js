// Secure server submission, with an explicit email-draft fallback.
const serviceNames = {
  'website-design-development':'Website design & development',
  'product-design-development':'Product design & development',
  'tools-analytics':'Tools & analytics'
};
const form=document.querySelector('#project-form');
function track(action,context='') {
  document.dispatchEvent(new CustomEvent('tivoro:interaction',{detail:{action,context}}));
}
if(form){
  const service=new URLSearchParams(location.search).get('service');
  if(serviceNames[service])form.elements.service.value=serviceNames[service];
  const preview=document.querySelector('#brief-preview');
  const status=document.querySelector('#form-status');
  const submit=form.querySelector('button[type="submit"]');
  let token='',submissionId=crypto.randomUUID(),busy=false;
  const loadSession=async()=>{
    const response=await fetch('/api/enquiries/session',{credentials:'same-origin',cache:'no-store'});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'The secure form could not be started.');
    token=data.token;return token;
  };
  const clearErrors=()=>{
    form.querySelectorAll('.field-error').forEach(el=>el.remove());
    for(const field of form.querySelectorAll('[aria-invalid]')){field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');field.setCustomValidity('');}
  };
  const brief=()=>{
    const data=new FormData(form);
    return ['Project enquiry for Tivoro','','Name: '+(data.get('name')||''),'Business: '+(data.get('business')||''),'Email: '+(data.get('email')||''),'Service: '+(data.get('service')||''),'',data.get('message')||''].join('\n');
  };
  const update=()=>preview.value=brief();
  form.addEventListener('input',()=>{clearErrors();update();});form.addEventListener('change',update);update();
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy||!form.reportValidity())return;
    busy=true;submit.disabled=true;submit.textContent='Sending enquiry…';form.setAttribute('aria-busy','true');clearErrors();status.textContent='Sending your enquiry securely…';
    update();
    try{
      if(!token)await loadSession();
      const values=Object.fromEntries(new FormData(form));
      const response=await fetch('/api/enquiries',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,token,submissionId}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(!response.ok){
        if(response.status===403)token='';
        for(const [name,message] of Object.entries(result.fields||{})){
          const field=form.elements.namedItem(name);if(!field)continue;
          const hint=document.createElement('small');hint.className='field-error';hint.id='error-'+name;hint.textContent=String(message);field.closest('label').append(hint);field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',hint.id);
        }
        form.querySelector('[aria-invalid]')?.focus();
        throw new Error(result.error||'Your enquiry could not be saved. Please try again.');
      }
      if(!result.saved)throw new Error('The enquiry could not be confirmed. Please try again.');
      status.textContent='Thank you—your enquiry is saved. Reference '+result.reference+'. Tivoro will review it and reply using the email you provided.';
      track('enquiry_saved',values.service);form.reset();submissionId=crypto.randomUUID();update();
      if(serviceNames[service])form.elements.service.value=serviceNames[service];
    }catch(error){status.textContent=(error.name==='TimeoutError'?'The connection took too long. Please try again; your enquiry will not be duplicated.':error.message||'The connection failed. Please try again.')+' You can also open an email draft or copy your project brief below.';}
    finally{busy=false;submit.disabled=false;submit.textContent='Send project enquiry ↗';form.removeAttribute('aria-busy');}
  });
  document.querySelector('#email-brief').addEventListener('click',()=>{
    if(!form.reportValidity())return;update();const data=new FormData(form);
    location.href='mailto:tivorosupport@gmail.com?subject='+encodeURIComponent('Project enquiry: '+(data.get('business')||data.get('name')))+'&body='+encodeURIComponent(brief());
    status.textContent='Your email draft is ready to review in your email app. Nothing has been sent by this email-draft option.';
    track('email_draft_prepared',data.get('service'));
  });
  document.querySelector('#copy-brief').addEventListener('click',async()=>{
    if(!form.reportValidity())return;
    update();
    try{
      await navigator.clipboard.writeText(brief());
      status.textContent='Project brief copied. Paste it into your email or WhatsApp, then review and send it.';
      track('project_brief_copied',form.elements.service.value);
    }catch{
      document.querySelector('.brief-fallback').open=true;
      preview.focus();preview.select();
      status.textContent='Your brief is selected below. Copy it using your device’s copy command.';
    }
  });
}
// Anonymous integration hooks only. No personal form values enter events.
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');if(!link)return;
  if(link.href.startsWith('tel:'))track('phone_link');
  else if(link.href.includes('wa.me/'))track('whatsapp_link');
  else if(link.classList.contains('project-preview-link'))track('portfolio_link',link.getAttribute('aria-label')||'');
});
function markServices(){
  const summary=document.querySelector('.services-menu summary');
  if(!summary)return;
  if(location.hash==='#services')summary.setAttribute('aria-current','location');
  else if(!document.querySelector('.services-menu a[aria-current]'))summary.removeAttribute('aria-current');
}
window.addEventListener('hashchange',markServices);markServices();

const goalSelect=document.querySelector('#measurement-goal');
if(goalSelect){
 let goalAnimation;
 const goalPreview=document.querySelector('.goal-preview');
 const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
 const animateGoal=()=>{
  goalAnimation?.cancel();
  if(motionPreference.matches || new URLSearchParams(location.search).has('capture'))return;
  goalAnimation=goalPreview.animate([{opacity:.35,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:380,easing:'cubic-bezier(.25,.8,.25,1)'});
 };
 motionPreference.addEventListener('change',()=>goalAnimation?.cancel());
 const goals={
  enquiry:['A request received.','Count enquiries that successfully reach your team, with the relevant service and source when available.','Which channels and services lead to useful conversations.'],
  booking:['A booking confirmed.','Count confirmed bookings after a successful reservation, using the booking system as the source of confirmation.','Which services people book and where the booking journey can become clearer.'],
  purchase:['An order completed.','Count confirmed purchases, with the order reference and agreed value where the checkout can provide them.','Which products and channels contribute to completed orders.']
 };
 goalSelect.addEventListener('change',()=>{
  const goal=goals[goalSelect.value];if(!goal)return;
  document.querySelector('#goal-result-title').textContent=goal[0];
  document.querySelector('#goal-result-copy').textContent=goal[1];
  document.querySelector('#goal-result-review').textContent=goal[2];
  animateGoal();
  track('measurement_demo',goalSelect.value);
 });
}
