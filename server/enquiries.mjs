const encoder=new TextEncoder();
export const services=['Website design & development','Product design & development','Tools & analytics','Not sure yet — let’s discuss'];
const statuses=['new','contacted','archived'];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class RequestError extends Error{
 constructor(status,message,fields={},headers={}){super(message);this.status=status;this.fields=fields;this.headers=headers;}
}
export function json(data,status=200,extra={}){
 return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...extra}});
}
export async function respond(action){
 try{return await action();}catch(error){
  if(error instanceof RequestError)return json({error:error.message,fields:error.fields},error.status,error.headers);
  console.error('Enquiry operation failed.');
  return json({error:'We could not complete that request. Please try again.'},503);
 }
}
function database(env){if(!env.DB)throw new RequestError(503,'The enquiry service is temporarily unavailable. Please email Tivoro directly.');return env.DB;}
function secret(env){if(!env.ENQUIRY_TOKEN_SECRET)throw new RequestError(503,'The secure form is temporarily unavailable. Please email Tivoro directly.');return env.ENQUIRY_TOKEN_SECRET;}
function cookieName(request){return new URL(request.url).protocol==='https:'?'__Host-tivoro-form':'tivoro-local-form';}
function sameOrigin(request,env,required=true){
 const expected=env.PUBLIC_SITE_ORIGIN||new URL(request.url).origin;
 const origin=request.headers.get('origin');
 if(request.headers.get('sec-fetch-site')==='cross-site'||(required&&!origin)||(origin&&origin!==expected))throw new RequestError(403,'Please send the form from the Tivoro website.');
}
function base64(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
function unbase64(value){const normalized=value.replaceAll('-','+').replaceAll('_','/');return Uint8Array.from(atob(normalized),c=>c.charCodeAt(0));}
async function key(env){return crypto.subtle.importKey('raw',encoder.encode(secret(env)),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function digest(value,env){return base64(await crypto.subtle.sign('HMAC',await key(env),encoder.encode(value)));}
export async function formSession(request,env){
 sameOrigin(request,env,false);secret(env);
 const nonce=crypto.randomUUID(),issued=Date.now();
 const token=issued+'.'+await digest(nonce+'|'+issued,env);
 const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
 return json({token},200,{'Set-Cookie':`${cookieName(request)}=${nonce}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600${secure}`});
}
async function verifyToken(request,env,token){
 const name=cookieName(request);
 const nonce=(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1);
 const parts=typeof token==='string'?token.split('.'):[];
 const issued=Number(parts[0]);
 if(!nonce||!uuid.test(nonce)||parts.length!==2||!Number.isFinite(issued)||Date.now()-issued>3600000||issued>Date.now()+5000)throw new RequestError(403,'Your form session expired. Please try again.');
 let valid=false;
 try{valid=await crypto.subtle.verify('HMAC',await key(env),unbase64(parts[1]),encoder.encode(nonce+'|'+issued));}catch{}
 if(!valid)throw new RequestError(403,'Your form session expired. Please try again.');
 return nonce;
}
async function readBody(request){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new RequestError(415,'Please use the project form to send this enquiry.');
 if(Number(request.headers.get('content-length'))>16000)throw new RequestError(413,'That request is too large. Please shorten your project details.');
 const reader=request.body?.getReader();let size=0;const chunks=[];
 if(!reader)throw new RequestError(400,'The request is empty.');
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();throw new RequestError(413,'That request is too large. Please shorten your project details.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 try{const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||Array.isArray(data)||typeof data!=='object')throw new Error();return data;}catch{throw new RequestError(400,'The form could not be read. Please try again.');}
}
export function validateEnquiry(data){
 const clean=value=>typeof value==='string'?value.trim():'';
 const enquiry={name:clean(data.name),business:clean(data.business),email:clean(data.email).toLowerCase(),service:clean(data.service),message:clean(data.message),submission_id:clean(data.submissionId)};
 const fields={};
 if(enquiry.name.length<2||enquiry.name.length>100||/[\r\n\u0000-\u001f]/.test(enquiry.name))fields.name='Enter a name between 2 and 100 characters.';
 if(enquiry.business.length>200||/[\r\n\u0000-\u001f]/.test(enquiry.business))fields.business='Use up to 200 characters for the organisation name.';
 if(enquiry.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email))fields.email='Enter a valid email address.';
 if(!services.includes(enquiry.service))fields.service='Choose one of the listed services.';
 if(enquiry.message.length<10||enquiry.message.length>5000||enquiry.message.includes('\u0000'))fields.message='Share between 10 and 5,000 characters about the project.';
 if(Object.keys(fields).length)throw new RequestError(422,'Please check the highlighted fields.',fields);
 if(!uuid.test(enquiry.submission_id))throw new RequestError(400,'Please reload the form and try again.');
 if(clean(data.website))throw new RequestError(400,'We could not accept this form. Please try again.');
 return enquiry;
}
function reference(id){return 'TIV-'+id.slice(0,8).toUpperCase();}
async function rateLimit(request,env,nonce){
 const db=database(env),window=Math.floor(Date.now()/900000);
 const source=request.headers.get('cf-connecting-ip')||'session:'+nonce;
 const identifier=await digest('rate|'+source+'|'+window,env);
 const row=await db.prepare('INSERT INTO enquiry_limits (key, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(identifier,Date.now()+1800000).first();
 if(row.attempts>5)throw new RequestError(429,'Too many enquiries were sent recently. Please wait a little or email Tivoro directly.',{}, {'Retry-After':'900'});
 await db.prepare('DELETE FROM enquiry_limits WHERE key IN (SELECT key FROM enquiry_limits WHERE expires_at < ? LIMIT 100)').bind(Date.now()).run();
}
export async function submitEnquiry(request,env){
 sameOrigin(request,env);const data=await readBody(request);
 const nonce=await verifyToken(request,env,data.token),enquiry=validateEnquiry(data),db=database(env);
 const hash=await digest('payload|'+JSON.stringify(enquiry),env);
 let existing=await db.prepare('SELECT id, payload_hash FROM enquiries WHERE submission_id = ?').bind(enquiry.submission_id).first();
 if(existing){if(existing.payload_hash!==hash)throw new RequestError(409,'This form was already sent with different details. Please reload before sending another enquiry.');return json({saved:true,reference:reference(existing.id)});}
 await rateLimit(request,env,nonce);
 const id=crypto.randomUUID(),now=new Date().toISOString();
 const notification=env.RESEND_API_KEY&&env.ENQUIRY_EMAIL_FROM?'pending':'not_configured';
 const inserted=await db.prepare('INSERT INTO enquiries (id, submission_id, name, business, email, service, message, status, created_at, updated_at, payload_hash, notification_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(submission_id) DO NOTHING').bind(id,enquiry.submission_id,enquiry.name,enquiry.business,enquiry.email,enquiry.service,enquiry.message,'new',now,now,hash,notification).run();
 if(!inserted.meta?.changes){
  existing=await db.prepare('SELECT id, payload_hash FROM enquiries WHERE submission_id = ?').bind(enquiry.submission_id).first();
  if(!existing||existing.payload_hash!==hash)throw new RequestError(409,'This form was already sent with different details. Please reload before sending another enquiry.');
  return json({saved:true,reference:reference(existing.id)});
 }
 if(notification==='pending')await notifyEnquiry(env,{...enquiry,id,created_at:now});
 return json({saved:true,reference:reference(id)},201);
}
export async function notifyEnquiry(env,enquiry,send=fetch){
 const db=database(env);
 if(!env.RESEND_API_KEY||!env.ENQUIRY_EMAIL_FROM)return false;
 try{
  const response=await send('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'tivoro-enquiry-'+enquiry.id},body:JSON.stringify({from:env.ENQUIRY_EMAIL_FROM,to:[env.ENQUIRY_EMAIL_TO||'tivorosupport@gmail.com'],reply_to:enquiry.email,subject:'Tivoro enquiry '+reference(enquiry.id)+' — '+enquiry.service,text:['New Tivoro project enquiry',reference(enquiry.id),'','Name: '+enquiry.name,'Organisation: '+enquiry.business,'Email: '+enquiry.email,'Service: '+enquiry.service,'Received: '+enquiry.created_at,'',enquiry.message].join('\n')}),signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error('provider_rejected');
  await db.prepare('UPDATE enquiries SET notification_state = ?, notification_error = NULL WHERE id = ?').bind('sent',enquiry.id).run();return true;
 }catch{
  await db.prepare('UPDATE enquiries SET notification_state = ?, notification_error = ? WHERE id = ?').bind('failed','Email delivery was not confirmed. The enquiry is safely stored in the inbox.',enquiry.id).run();return false;
 }
}
export function authorizeOwner(env,user){
 if(!user?.userId||!user?.email)throw new RequestError(401,'Sign in with the Site owner account.');
 const allowed=(env.ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
 if(!allowed.includes(user.email.toLowerCase()))throw new RequestError(403,'This inbox is available only to the Site owner.');
 return user;
}
export async function listEnquiries(request,env,user){
 authorizeOwner(env,user);const db=database(env),url=new URL(request.url);
 const status=url.searchParams.get('status')||'all';if(status!=='all'&&!statuses.includes(status))throw new RequestError(400,'Choose a valid status.');
 const page=Math.max(0,Math.min(1000,Number.parseInt(url.searchParams.get('page')||'0',10)||0));
 const search=(url.searchParams.get('q')||'').trim().slice(0,100);
 const conditions=[],values=[];
 if(status!=='all'){conditions.push('status = ?');values.push(status);}
 if(search){conditions.push('(name LIKE ? ESCAPE \'\\\' OR business LIKE ? ESCAPE \'\\\' OR email LIKE ? ESCAPE \'\\\')');const term='%'+search.replace(/[\\%_]/g,'\\$&')+'%';values.push(term,term,term);}
 const where=conditions.length?' WHERE '+conditions.join(' AND '):'';
 const result=await db.prepare('SELECT id, name, business, email, service, message, status, created_at, updated_at, notification_state FROM enquiries'+where+' ORDER BY created_at DESC, id DESC LIMIT 26 OFFSET ?').bind(...values,page*25).all();
 const stats=await db.prepare('SELECT status, count(*) AS count FROM enquiries GROUP BY status').all();
 return json({items:result.results.slice(0,25),hasMore:result.results.length>25,page,counts:Object.fromEntries(stats.results.map(r=>[r.status,r.count])),emailAlertsConfigured:!!(env.RESEND_API_KEY&&env.ENQUIRY_EMAIL_FROM)});
}
export async function updateEnquiry(request,env,user,id){
 authorizeOwner(env,user);sameOrigin(request,env);if(!uuid.test(id))throw new RequestError(404,'Enquiry not found.');
 const data=await readBody(request);if(!statuses.includes(data.status))throw new RequestError(422,'Choose a valid enquiry status.');
 const result=await database(env).prepare('UPDATE enquiries SET status = ?, updated_at = ?, updated_by = ? WHERE id = ?').bind(data.status,new Date().toISOString(),user.userId,id).run();
 if(!result.meta?.changes)throw new RequestError(404,'Enquiry not found.');
 return json({updated:true});
}
