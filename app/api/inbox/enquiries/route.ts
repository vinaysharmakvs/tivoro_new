import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../../chatgpt-auth';
import {listEnquiries,respond} from '../../../../server/enquiries.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return respond(async()=>listEnquiries(request,env,await getChatGPTUser()));}
