import {build} from 'esbuild';
import {readFile,writeFile,stat,mkdir,cp,readdir,unlink} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
await build({entryPoints:['src/site.js'],outfile:'frontend/assets/site.min.js',bundle:true,minify:true,format:'iife',target:['es2022']});
const config=JSON.parse(await readFile('site-config.json','utf8'));
const descriptions=new Set();
const navigationBoot=await readFile('src/navigation-boot.js','utf8');
for(const page of [...config.pages,'404']){
 let html=await readFile(`frontend/${page}.html`,'utf8');
 html=html.replace(/<meta charset="utf-8"\s*\/?\s*>/i,'');
 html=html.replace('<head>','<head><meta charset="utf-8"/>');
 if(!html.includes('data-tivoro-transition-boot'))throw new Error(`Navigation bootstrap missing: ${page}`);
 html=html.replace(/<script data-tivoro-transition-boot="">[\s\S]*?<\/script>/,()=>`<script data-tivoro-transition-boot="">${navigationBoot}</script>`);
 await writeFile(`frontend/${page}.html`,html);
 if((html.match(/<h1\b/g)||[]).length!==1)throw new Error(`Expected one page heading: ${page}`);
 if(!html.includes('noindex, follow'))throw new Error(`Preview indexing guard missing: ${page}`);
 const description=html.match(/<meta content="([^"]+)" name="description"/);
 if(description){if(descriptions.has(description[1]))throw new Error('Duplicate description');descriptions.add(description[1]);}
 for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  const ref=match[1].split(/[?#]/)[0];
  if(/^(https?:|mailto:|tel:|data:)/.test(ref))continue;
  if(!ref)continue;
  const assetRef=ref==='home.html'?'index.html':ref;
  if(!(await stat(path.join(root,'frontend',assetRef)).catch(()=>null)))throw new Error(`Missing ${ref} on ${page}`);
 }
}
console.log('Built one shared script; validated nine pages plus 404 and local asset references.');

await mkdir("public",{recursive:true});
// HTML is served by the Worker so public/index.html cannot bypass the page route.
for(const name of await readdir('public')){if(name.endsWith('.html'))await unlink(path.join('public',name));}
await cp("frontend","public",{recursive:true,filter:source=>!source.endsWith('.html')});
await mkdir("server",{recursive:true});
const pages={};for(const name of await readdir("frontend")){if(name.endsWith(".html"))pages[name]=await readFile("frontend/"+name,"utf8");}
await writeFile("server/pages.generated.json",JSON.stringify(pages));
console.log("Prepared marketing assets for the server build.");
