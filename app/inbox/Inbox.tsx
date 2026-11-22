'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
type Enquiry={id:string;name:string;business:string;email:string;service:string;message:string;status:string;created_at:string;notification_state:string};
type Result={items:Enquiry[];hasMore:boolean;page:number;counts:Record<string,number>;emailAlertsConfigured:boolean};
const labels:Record<string,string>={new:'New',contacted:'Contacted',archived:'Archived'};
export default function Inbox({displayName}:{displayName:string}){
 const [data,setData]=useState<Result|null>(null),[filter,setFilter]=useState('all'),[query,setQuery]=useState(''),[draft,setDraft]=useState(''),[page,setPage]=useState(0);
 const [selected,setSelected]=useState<string|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[saving,setSaving]=useState(false),[notice,setNotice]=useState('');
 const controller=useRef<AbortController|null>(null);
 const load=useCallback(async()=>{
  controller.current?.abort();const current=new AbortController();controller.current=current;
  setLoading(true);setError('');
  try{
   const response=await fetch('/api/inbox/enquiries?'+new URLSearchParams({status:filter,q:query,page:String(page)}),{cache:'no-store',signal:current.signal});
   const result=await response.json() as Result&{error?:string};if(!response.ok)throw new Error(result.error||'The inbox could not be loaded.');
   if(!Array.isArray(result.items)||!result.counts)throw new Error('The inbox response could not be read. Please try again.');
   setData(result);
  }catch(cause){if(!current.signal.aborted)setError(cause instanceof Error?cause.message:'The inbox could not be loaded.');}
  finally{if(!current.signal.aborted)setLoading(false);}
 },[filter,query,page]);
 useEffect(()=>{void load();return()=>controller.current?.abort();},[load]);
 const enquiry=data?.items.find(item=>item.id===selected)||null;
 async function changeStatus(status:string){
  if(!enquiry)return;setSaving(true);setNotice('');
  try{
   const response=await fetch('/api/inbox/enquiries/'+enquiry.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
   const result=await response.json() as {error?:string};if(!response.ok)throw new Error(result.error||'The status could not be saved.');
   setNotice('Enquiry marked '+labels[status].toLowerCase()+'.');await load();
  }catch(cause){setNotice(cause instanceof Error?cause.message:'The status could not be saved.');}
  finally{setSaving(false);}
 }
 const total=data?Object.values(data.counts).reduce((sum,n)=>sum+n,0):null;
 return <main className="inbox-app">
  <header className="inbox-top"><a href="/" aria-label="Tivoro home"><img src="/assets/tivoro-wordmark-vector.svg" width="140" height="35" alt="Tivoro"/></a><div><span>Private enquiry inbox</span><a href="/signout-with-chatgpt?return_to=%2Finbox" target="_top">Sign out ↗</a></div></header>
  <section className="inbox-intro"><div><span className="inbox-eyebrow">THE NEXT CONVERSATION</span><h1>Project <em>enquiries.</em></h1></div><p>Welcome, {displayName}. Review project enquiries and keep track of the next step.</p></section>
  <section className="inbox-stats" aria-label="Enquiry totals"><div><strong>{total??'—'}</strong><span>All enquiries</span></div><div><strong>{data?.counts.new??(data?0:'—')}</strong><span>New conversations</span></div><div><strong>{data?.counts.contacted??(data?0:'—')}</strong><span>Contacted</span></div></section>
  {data&&!data.emailAlertsConfigured&&<aside className="inbox-notification"><strong>Email alerts are not active yet.</strong> Enquiries are safely stored here. An email provider is needed to send automatic alerts to tivorosupport@gmail.com.</aside>}
  <div className="inbox-controls"><nav aria-label="Filter enquiries">{['all','new','contacted','archived'].map(value=><button key={value} aria-pressed={filter===value} onClick={()=>{setFilter(value);setPage(0);setSelected(null);}}>{value==='all'?'All enquiries':labels[value]}</button>)}</nav><form role="search" onSubmit={event=>{event.preventDefault();setQuery(draft);setPage(0);setSelected(null);}}><label className="inbox-sr" htmlFor="enquiry-search">Search name, organisation or email</label><input id="enquiry-search" value={draft} onChange={event=>setDraft(event.target.value)} placeholder="Name, organisation or email" maxLength={100}/><button type="submit">Search</button></form></div>
  {error&&<div className="inbox-error" role="alert">{error} <button onClick={()=>void load()}>Try again</button><a href="/signin-with-chatgpt?return_to=%2Finbox" target="_top">Sign in again ↗</a></div>}
  <p className="inbox-status" aria-live="polite">{loading?'Loading enquiries…':notice||((data?.items.length||0)+((data?.items.length||0)===1?' enquiry shown':' enquiries shown'))}</p>
  <section className={'inbox-workspace'+(enquiry?' has-selection':'')} aria-label="Project enquiries" aria-busy={loading}>
   <div className="enquiry-list">{data?.items.map(item=><button className="enquiry-card" key={item.id} aria-pressed={selected===item.id} onClick={()=>{setSelected(item.id);setNotice('');}}><div><strong>{item.name}</strong><span className={'enquiry-badge '+item.status}>{labels[item.status]}</span></div><p>{item.business||'Individual project'}</p><span className="enquiry-service">{item.service}</span><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString('en-IN',{dateStyle:'medium'})}</time></button>)}{!loading&&!error&&data?.items.length===0&&<div className="inbox-empty"><h2>No enquiries here yet.</h2><p>{query?'Try another name, organisation or email.':'New project enquiries will appear here when someone sends the contact form.'}</p><a href="/contact">View the contact form ↗</a></div>}<div className="inbox-pagination"><button disabled={page===0||loading} onClick={()=>{setPage(p=>p-1);setSelected(null);}}>← Previous</button><span>Page {page+1}</span><button disabled={!data?.hasMore||loading} onClick={()=>{setPage(p=>p+1);setSelected(null);}}>Next →</button></div></div>
   <div className="enquiry-detail">{enquiry?<><button className="inbox-back" onClick={()=>setSelected(null)}>← Back to enquiries</button><div className="detail-heading"><div><span className="inbox-eyebrow">TIV-{enquiry.id.slice(0,8).toUpperCase()}</span><h2>{enquiry.business||enquiry.name}</h2></div><span className={'enquiry-badge '+enquiry.status}>{labels[enquiry.status]}</span></div><dl><dt>From</dt><dd>{enquiry.name}</dd><dt>Email</dt><dd><a href={'mailto:'+enquiry.email}>{enquiry.email}</a></dd><dt>Service</dt><dd>{enquiry.service}</dd><dt>Received</dt><dd>{new Date(enquiry.created_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</dd></dl><h3>The project</h3><p className="enquiry-message">{enquiry.message}</p><div className="detail-actions"><a className="inbox-primary" href={'mailto:'+enquiry.email+'?subject='+encodeURIComponent('Re: Your Tivoro project enquiry TIV-'+enquiry.id.slice(0,8).toUpperCase())}>Prepare a reply ↗</a><span>Review and send the reply in your email app.</span></div><div className="status-actions" aria-label="Update enquiry status">{['new','contacted','archived'].map(status=><button key={status} disabled={saving||enquiry.status===status} onClick={()=>void changeStatus(status)}>Mark {labels[status].toLowerCase()}</button>)}</div><p className="delivery-note">{enquiry.notification_state==='sent'?'An email alert was sent to the team.':enquiry.notification_state==='failed'?'Email delivery was not confirmed. This enquiry is saved here.':'This enquiry is stored in the private inbox.'}</p></>:<div className="inbox-detail-empty"><span className="inbox-eyebrow">A CONVERSATION WORTH HAVING</span><h2>Select an enquiry.</h2><p>The project details and next steps will appear here.</p></div>}</div>
  </section><footer className="inbox-footer"><span>© 2026 Tivoro</span><a href="/">Back to the website ↗</a></footer>
 </main>;
}
