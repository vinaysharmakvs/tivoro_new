import type {Metadata} from 'next';
export const metadata:Metadata={title:'Tivoro — Enquiry Inbox',description:'Private project enquiry inbox for the Tivoro Site owner.',robots:{index:false,follow:false},icons:{icon:'/assets/tivoro-favicon-studio.svg'}};
export default function Layout({children}:{children:React.ReactNode}){
 return <html lang="en"><head><link rel="stylesheet" href="/assets/inbox.css?v=25"/></head><body>{children}</body></html>;
}
