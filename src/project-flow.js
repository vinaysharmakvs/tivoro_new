import BEND from './paper-wave.js';
(() => {
  const T = window.THREE;
  const stage = document.querySelector('[data-project-flow]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const capture = new URLSearchParams(location.search).has('capture');
  if (!T || !stage || capture) return;
  let controller, starting = false;
  async function start() {
    if (starting || controller || reduced.matches) return;
    starting = true;
    const host = stage.querySelector('.project-screen');
    const image = host.querySelector('img');
    try {
      if (!image.complete) await new Promise((resolve,reject) => {image.addEventListener('load',resolve,{once:true});image.addEventListener('error',reject,{once:true});});
      if (!image.naturalWidth) throw new Error('Project image unavailable');
      const canvas = document.createElement('canvas');
      canvas.className = 'project-flow-canvas';canvas.setAttribute('aria-hidden','true');
      const renderer = new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.5));
      const art = document.createElement('canvas');art.width=image.naturalWidth+40;art.height=image.naturalHeight+40;
      const ctx=art.getContext('2d');
      ctx.beginPath();ctx.roundRect(0,0,art.width,art.height,14);ctx.clip();
      ctx.fillStyle='#f7f5ef';ctx.fillRect(0,0,art.width,art.height);ctx.drawImage(image,20,20);
      const texture = new T.CanvasTexture(art);texture.encoding=T.sRGBEncoding;texture.anisotropy=4;
      const ratio=art.width/art.height;
      const uniforms={uTime:{value:0},uAmp:{value:.13},uFreq:{value:4.7},uTwist:{value:.7},uSize:{value:new T.Vector2(ratio,1)},uFlutter:{value:0},uPhase:{value:0},uGlow:{value:0},uPointerUV:{value:new T.Vector2()}};
      const material = new T.MeshBasicMaterial({map:texture,side:T.DoubleSide,transparent:true});
      material.onBeforeCompile=shader=>{
        Object.assign(shader.uniforms,uniforms);
        shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n'+BEND+'\nvarying vec3 vFlowNormal;').replace('#include <begin_vertex>','vec3 flowP; vec3 flowN; sheetPoint(uv,flowP,flowN); vec3 transformed=flowP; vFlowNormal=normalize(normalMatrix*flowN);');
        shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vFlowNormal; uniform float uGlow; uniform vec2 uPointerUV;').replace('#include <output_fragment>','outgoingLight *= .97+.03*abs(normalize(vFlowNormal).z); float glow=exp(-10.0*distance(vUv,vec2(.5)+uPointerUV*.15)); outgoingLight += vec3(.018)*uGlow*glow;\n#include <output_fragment>');
      };
      const scene=new T.Scene();
      const camera=new T.OrthographicCamera(-1,1,1,-1,.1,20);camera.position.z=5;
      const geometry=new T.PlaneGeometry(ratio,1,36,24);
      const mesh=new T.Mesh(geometry,material);scene.add(mesh);
      let visible=false, frame=0, previous=0, time=0;
      const pointer={x:0,y:0,tx:0,ty:0,hover:0,targetHover:0};
      function resize(){
        const w=image.clientWidth,h=image.clientHeight;
        if(!w||!h)return;
        renderer.setSize(w+80,h+80,false);
        camera.left=-(w+80)/(h+80);camera.right=-camera.left;camera.updateProjectionMatrix();
        mesh.scale.setScalar(2*h/(h+80));
        renderer.render(scene,camera);
      }
      function tick(now){
        frame=0;
        if(!visible||document.hidden||reduced.matches)return;
        const dt=Math.min((now-previous)/1000||.016,.05);previous=now;time+=dt;
        const damping=1-Math.exp(-dt*5);
        pointer.x+=(pointer.tx-pointer.x)*damping;pointer.y+=(pointer.ty-pointer.y)*damping;pointer.hover+=(pointer.targetHover-pointer.hover)*damping;
        uniforms.uTime.value=time;uniforms.uAmp.value=.13+pointer.hover*.045;uniforms.uPhase.value=pointer.x*.14;uniforms.uGlow.value=pointer.hover;uniforms.uPointerUV.value.set(pointer.x,-pointer.y);
        mesh.rotation.x=-pointer.y*.045+Math.sin(time*.34)*.012;mesh.rotation.y=pointer.x*.07+Math.sin(time*.22)*.015;mesh.rotation.z=Math.sin(time*.3)*.005;mesh.position.y=Math.sin(time*.55)*.012;
        renderer.render(scene,camera);frame=requestAnimationFrame(tick);
      }
      function sync(){
        if(frame)cancelAnimationFrame(frame);frame=0;
        if(reduced.matches){host.removeAttribute('data-flow-ready');stage.dataset.flowState='static';return;}
        host.dataset.flowReady='';
        stage.dataset.flowState=visible&&!document.hidden?'running':'paused';
        if(visible&&!document.hidden){previous=performance.now();frame=requestAnimationFrame(tick);}
      }
      stage.addEventListener('pointermove',event=>{
        if(event.pointerType==='touch')return;
        const rect=stage.getBoundingClientRect();pointer.tx=((event.clientX-rect.left)/rect.width-.5)*2;pointer.ty=((event.clientY-rect.top)/rect.height-.5)*2;pointer.targetHover=1;
      },{passive:true});
      stage.addEventListener('pointerleave',()=>{pointer.tx=pointer.ty=pointer.targetHover=0;});
      const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'80px'});visibility.observe(stage);
      new ResizeObserver(resize).observe(host);
      document.addEventListener('visibilitychange',sync);
      host.append(canvas);resize();
      controller={sync};sync();
      window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);},{once:true});
    } catch(error) {stage.dataset.flowState='fallback';console.warn('Project motion unavailable; original project image retained.',error);}
  }
  reduced.addEventListener('change',()=>controller?controller.sync():start());
  start();
})();
