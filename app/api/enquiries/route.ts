import {env} from 'cloudflare:workers';
import {respond,submitEnquiry} from '../../../server/enquiries.mjs';
export const dynamic='force-dynamic';
export function POST(request:Request){return respond(()=>submitEnquiry(request,env));}
