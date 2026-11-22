import {env} from 'cloudflare:workers';
import {requireChatGPTUser,chatGPTSignOutPath} from '../chatgpt-auth';
import {authorizeOwner} from '../../server/enquiries.mjs';
import Inbox from './Inbox';
export const dynamic='force-dynamic';
export default async function InboxPage(){
 const user=await requireChatGPTUser('/inbox');
 try{authorizeOwner(env,user);}catch{return <main className="inbox-denied"><a href="/" className="inbox-brand">tivoro</a><h1>This inbox is private.</h1><p>Sign in with the Site owner account to view project enquiries.</p><a href={chatGPTSignOutPath('/inbox')} target="_top">Switch account →</a></main>;}
 return <Inbox displayName={user.displayName}/>;
}
