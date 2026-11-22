import {env} from 'cloudflare:workers';
import {formSession,respond} from '../../../../server/enquiries.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){return respond(()=>formSession(request,env));}
