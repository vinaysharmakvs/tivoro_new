(()=>{var M=`
uniform float uTime, uAmp, uFlutter, uPhase, uFreq, uTwist;
uniform vec2  uSize;

// the sheet hangs: it curls harder at the top than along the bottom edge
float sAmp(float u, float v){ return uAmp*(0.10 + pow(u,1.35))*(0.50 + 0.64*v); }
float sAmpV(float u){        return uAmp*(0.10 + pow(u,1.35))*0.64; }

float sTheta(float u, float v){
  float a  = sAmp(u,v);
  float ph = uFreq*u + uTwist*v + uTime*0.40 + uPhase;
  return a*sin(ph) + uFlutter*a*0.60*sin(ph*2.35 + uTime*2.0);
}
float sThetaV(float u, float v){
  float a  = sAmp(u,v), da = sAmpV(u);
  float ph = uFreq*u + uTwist*v + uTime*0.40 + uPhase;
  float f  = ph*2.35 + uTime*2.0;
  return da*sin(ph) + a*cos(ph)*uTwist
       + uFlutter*0.60*(da*sin(f) + a*cos(f)*uTwist*2.35);
}
float sYoff(float u, float v){
  float w = 1.0 - 0.55*v;
  return 0.021*uSize.y*sin(2.05*u + uTime*0.47 + uPhase)
       + 0.013*uSize.y*sin(3.35*u - 1.55*v + uTime*0.63 + uPhase)*w;
}
float sYdU(float u, float v){
  float w = 1.0 - 0.55*v;
  return 0.0431*uSize.y*cos(2.05*u + uTime*0.47 + uPhase)
       + 0.0436*uSize.y*cos(3.35*u - 1.55*v + uTime*0.63 + uPhase)*w;
}
float sYdV(float u, float v){
  float ph = 3.35*u - 1.55*v + uTime*0.63 + uPhase;
  return 0.013*uSize.y*(-1.55*cos(ph)*(1.0-0.55*v) - 0.55*sin(ph));
}

// paper conserves arc length: integrate the bend instead of pushing Z,
// so the silhouette really pulls in where the sheet turns away
void sheetPoint(vec2 q, out vec3 P, out vec3 NN){
  float u = q.x, v = q.y;
  float x=0.0, z=0.0, xe=0.0, ze=0.0, dxv=0.0, dzv=0.0, dxe=0.0, dze=0.0;
  const int NS = 20;
  float h = 1.0/float(NS);
  for(int i=0;i<NS;i++){
    float uu = (float(i)+0.5)*h;
    float w  = clamp((u-(uu-0.5*h))/h, 0.0, 1.0);
    float th = sTheta(uu,v);
    float dt = sThetaV(uu,v);
    float c = cos(th), sn = sin(th);
    xe += c*h;          ze += sn*h;
    dxe += -sn*dt*h;    dze +=  c*dt*h;
    x   += c*h*w;       z   += sn*h*w;
    dxv += -sn*dt*h*w;  dzv +=  c*dt*h*w;
  }
  float W = uSize.x, H = uSize.y;
  float th0 = sTheta(u,v);
  P = vec3((x - xe*0.5)*W, (v-0.5)*H + sYoff(u,v), (z - ze*0.5)*W);
  vec3 Tu = vec3(W*cos(th0), sYdU(u,v), W*sin(th0));
  vec3 Tv = vec3((dxv - dxe*0.5)*W, H + sYdV(u,v), (dzv - dze*0.5)*W);
  NN = normalize(cross(Tu, Tv));
}`;(()=>{let a=window.THREE,i=document.querySelector("[data-project-flow]"),p=matchMedia("(prefers-reduced-motion: reduce)"),q=new URLSearchParams(location.search).has("capture");if(!a||!i||q)return;let w,S=!1;async function b(){if(S||w||p.matches)return;S=!0;let f=i.querySelector(".project-screen"),r=f.querySelector("img");try{let F=function(){let t=r.clientWidth,n=r.clientHeight;!t||!n||(m.setSize(t+80,n+80,!1),s.left=-(t+80)/(n+80),s.right=-s.left,s.updateProjectionMatrix(),d.scale.setScalar(2*n/(n+80)),m.render(P,s))},N=function(t){if(u=0,!g||document.hidden||p.matches)return;let n=Math.min((t-T)/1e3||.016,.05);T=t,v+=n;let z=1-Math.exp(-n*5);e.x+=(e.tx-e.x)*z,e.y+=(e.ty-e.y)*z,e.hover+=(e.targetHover-e.hover)*z,h.uTime.value=v,h.uAmp.value=.13+e.hover*.045,h.uPhase.value=e.x*.14,h.uGlow.value=e.hover,h.uPointerUV.value.set(e.x,-e.y),d.rotation.x=-e.y*.045+Math.sin(v*.34)*.012,d.rotation.y=e.x*.07+Math.sin(v*.22)*.015,d.rotation.z=Math.sin(v*.3)*.005,d.position.y=Math.sin(v*.55)*.012,m.render(P,s),u=requestAnimationFrame(N)},x=function(){if(u&&cancelAnimationFrame(u),u=0,p.matches){f.removeAttribute("data-flow-ready"),i.dataset.flowState="static";return}f.dataset.flowReady="",i.dataset.flowState=g&&!document.hidden?"running":"paused",g&&!document.hidden&&(T=performance.now(),u=requestAnimationFrame(N))};if(r.complete||await new Promise((t,n)=>{r.addEventListener("load",t,{once:!0}),r.addEventListener("error",n,{once:!0})}),!r.naturalWidth)throw new Error("Project image unavailable");let l=document.createElement("canvas");l.className="project-flow-canvas",l.setAttribute("aria-hidden","true");let m=new a.WebGLRenderer({canvas:l,alpha:!0,antialias:!0,powerPreference:"low-power"});m.outputEncoding=a.sRGBEncoding,m.setPixelRatio(Math.min(devicePixelRatio||1,1.5));let o=document.createElement("canvas");o.width=r.naturalWidth+40,o.height=r.naturalHeight+40;let c=o.getContext("2d");c.beginPath(),c.roundRect(0,0,o.width,o.height,14),c.clip(),c.fillStyle="#f7f5ef",c.fillRect(0,0,o.width,o.height),c.drawImage(r,20,20);let y=new a.CanvasTexture(o);y.encoding=a.sRGBEncoding,y.anisotropy=4;let A=o.width/o.height,h={uTime:{value:0},uAmp:{value:.13},uFreq:{value:4.7},uTwist:{value:.7},uSize:{value:new a.Vector2(A,1)},uFlutter:{value:0},uPhase:{value:0},uGlow:{value:0},uPointerUV:{value:new a.Vector2}},E=new a.MeshBasicMaterial({map:y,side:a.DoubleSide,transparent:!0});E.onBeforeCompile=t=>{Object.assign(t.uniforms,h),t.vertexShader=t.vertexShader.replace("#include <common>",`#include <common>
`+M+`
varying vec3 vFlowNormal;`).replace("#include <begin_vertex>","vec3 flowP; vec3 flowN; sheetPoint(uv,flowP,flowN); vec3 transformed=flowP; vFlowNormal=normalize(normalMatrix*flowN);"),t.fragmentShader=t.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 vFlowNormal; uniform float uGlow; uniform vec2 uPointerUV;`).replace("#include <output_fragment>",`outgoingLight *= .97+.03*abs(normalize(vFlowNormal).z); float glow=exp(-10.0*distance(vUv,vec2(.5)+uPointerUV*.15)); outgoingLight += vec3(.018)*uGlow*glow;
#include <output_fragment>`)};let P=new a.Scene,s=new a.OrthographicCamera(-1,1,1,-1,.1,20);s.position.z=5;let R=new a.PlaneGeometry(A,1,36,24),d=new a.Mesh(R,E);P.add(d);let g=!1,u=0,T=0,v=0,e={x:0,y:0,tx:0,ty:0,hover:0,targetHover:0};i.addEventListener("pointermove",t=>{if(t.pointerType==="touch")return;let n=i.getBoundingClientRect();e.tx=((t.clientX-n.left)/n.width-.5)*2,e.ty=((t.clientY-n.top)/n.height-.5)*2,e.targetHover=1},{passive:!0}),i.addEventListener("pointerleave",()=>{e.tx=e.ty=e.targetHover=0}),new IntersectionObserver(t=>{g=t[0].isIntersecting,x()},{rootMargin:"80px"}).observe(i),new ResizeObserver(F).observe(f),document.addEventListener("visibilitychange",x),f.append(l),F(),w={sync:x},x(),window.addEventListener("pagehide",()=>{u&&cancelAnimationFrame(u)},{once:!0})}catch(l){i.dataset.flowState="fallback",console.warn("Project motion unavailable; original project image retained.",l)}}p.addEventListener("change",()=>w?w.sync():b()),b()})();})();
