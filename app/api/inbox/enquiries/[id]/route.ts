import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../../../chatgpt-auth';
import {respond,updateEnquiry} from '../../../../../server/enquiries.mjs';
export const dynamic='force-dynamic';
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){return respond(async()=>updateEnquiry(request,env,await getChatGPTUser(),(await params).id));}
