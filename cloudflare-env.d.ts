declare namespace Cloudflare {
 interface Env {
  DB?:D1Database;BUCKET?:R2Bucket;
  ADMIN_EMAILS?:string;ENQUIRY_TOKEN_SECRET?:string;PUBLIC_SITE_ORIGIN?:string;
  ENQUIRY_EMAIL_TO?:string;ENQUIRY_EMAIL_FROM?:string;RESEND_API_KEY?:string;
 }
}
