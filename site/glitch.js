(()=>{
'use strict';
const hero=document.getElementById('landing'),root=document.getElementById('portal'),canvas=root.querySelector('canvas');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),cursor=hero.querySelector('.signal-cursor'),reveal=hero.querySelector('.signal-reveal'),tc=document.getElementById('signal-timecode');
document.getElementById('signal-years').textContent=`${new Date().getFullYear()-2016} YEARS IN MOTION`;
hero.classList.add('signal-pending');
const gl=canvas.getContext('webgl',{alpha:false,antialias:false});
function fallback(){hero.classList.remove('signal-pending');hero.classList.add('signal-interactive');root.classList.add('glitch-unavailable');}
const vs=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fs=`precision highp float;
varying vec2 uv;uniform sampler2D artwork;uniform float elapsed;uniform vec4 box;uniform vec4 trails[12];
float hash(float n){return fract(sin(n*127.1)*43758.5453);}
vec3 logo(vec2 q){if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec3(0.);vec2 st=vec2(q.x,1.-q.y);vec3 c=texture2D(artwork,st).rgb;float edge=smoothstep(0.,.045,q.x)*smoothstep(0.,.045,1.-q.x)*smoothstep(0.,.05,q.y)*smoothstep(0.,.04,1.-q.y);return c*edge*smoothstep(.018,.055,max(c.r,max(c.g,c.b)));}
void main(){
vec2 p=vec2(uv.x,1.-uv.y),q=(p-box.xy)/box.zw;
vec3 clean=logo(q);
if(elapsed<.6){gl_FragColor=vec4(0.,0.,0.,1.);return;}
vec2 glass=abs((q-vec2(.5,.468))/vec2(.302,.361));
float screen=1.-smoothstep(.94,1.,pow(glass.x,8.)+pow(glass.y,8.));
if(screen<.5){gl_FragColor=vec4(clean,1.);return;}
float tick=floor(elapsed*24.),band=floor(q.y*150.);
float local=0.;
for(int i=0;i<12;i++){
 vec4 t=trails[i];
 float r=hash(band*11.+t.w*37.);
 float reach=.026+r*.105;
 float center=t.x+(hash(band+t.w*9.)-.5)*.055;
 float horizontal=1.-smoothstep(reach*.6,reach,abs(q.x-center));
 float vertical=1.-smoothstep(.003,.032+r*.018,abs(q.y-t.y));
 local=max(local,t.z*horizontal*vertical*step(.22,r));
}
float intro=1.-smoothstep(.9,2.85,elapsed);
float strength=max(intro,local);
float rnd=hash(band+tick*13.),gate=step(.4,rnd);
float shift=(hash(band*3.+tick*7.)-.5)*.18*strength*gate;
vec2 displaced=clamp(q+vec2(shift,0.),vec2(.200,.110),vec2(.800,.826));
float split=(.002+.010*hash(band+tick))*strength*gate;
vec3 corrupt=vec3(logo(displaced+vec2(split,0.)).r,logo(displaced-vec2(split,0.)).g,logo(displaced-vec2(split*1.2,0.)).b);
corrupt*=1.-.25*strength*step(.78,fract(q.y*360.));
corrupt+=vec3(.10,.035,.008)*strength*gate*step(.84,rnd)*step(.12,max(clean.r,max(clean.g,clean.b)));
vec3 result=mix(clean,corrupt,max(intro,local));
if(elapsed<2.5){float formation=clamp((elapsed-.75)/1.75,0.,1.);float show=step(hash(band*2.+17.),formation);if(elapsed<.9)show=step(.97,rnd);result=corrupt*show;}
gl_FragColor=vec4(mix(clean,result,screen),1.);
}`;
let program,u={},box=[0,0,1,1],mask,ready=false,visible=true,frame=0,start=0,clockStart=0,lastTC=-1,dirty=true,trail=[],lastPoint=0,lastLabel=0,lastRegion=-1,seq=0;
const packed=new Float32Array(48),fine=matchMedia('(hover:hover) and (pointer:fine)');
function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function begin(){start=performance.now();clockStart=start+4500;hero.classList.remove('signal-pending');hero.classList.add('signal-start');document.body.classList.add('signal-intro');setTimeout(()=>document.body.classList.remove('signal-intro'),3600);wake();}
function resize(){if(!gl||!ready)return;const r=root.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));gl.viewport(0,0,canvas.width,canvas.height);const w=r.width<650?1:.98,h=w*r.width*9/16/r.height;box=[(1-w)/2,(1-h)/2,w,h];dirty=true;wake();}
function timecode(now){if(now<clockStart)return;const f=Math.floor((now-clockStart)*.03);if(f===lastTC)return;lastTC=f;const pad=n=>String(n).padStart(2,'0');tc.textContent=`TC ${pad(Math.floor(f/108000)%24)}:${pad(Math.floor(f/1800)%60)}:${pad(Math.floor(f/30)%60)}:${pad(f%30)}`;}
function draw(now){frame=0;if(!visible||document.hidden)return;timecode(now);const elapsed=reduced.matches?10:(now-start)/1000;if(elapsed>=4.5)hero.classList.add('signal-interactive');
 if(ready){const had=trail.length;trail=trail.filter(p=>now-p.time<450);packed.fill(0);trail.forEach((p,i)=>{const age=Math.min(1,(now-p.time)/450),decay=1-age*age*(3-2*age);packed.set([p.x,p.y,reduced.matches?0:decay,p.seed],i*4);});if(dirty||elapsed<3||had){gl.uniform1f(u.elapsed,elapsed);gl.uniform4fv(u.box,box);gl.uniform4fv(u.trails,packed);gl.drawArrays(gl.TRIANGLES,0,6);dirty=false;}}
 frame=requestAnimationFrame(draw);
}
function wake(){if(!frame&&visible&&!document.hidden&&start)frame=requestAnimationFrame(draw);}
const destinations=[...reveal.querySelectorAll('[data-signal]')];
let activeRegion=-1,hideLabelTimer,press;
function regionAt(qx,qy){return qx<.46?0:qx<.56?1:2;}
function showLabel(region){
 clearTimeout(hideLabelTimer);activeRegion=region;
 const r=root.getBoundingClientRect(),anchors=[[.33,.48],[.50,.67],[.66,.25]];
 destinations.forEach((link,i)=>{
  const [x,y]=anchors[i];link.style.left=`${(box[0]+x*box[2])*100}%`;link.style.top=`${(box[1]+y*box[3])*100}%`;
  link.classList.toggle('is-discovered',i===region);
 });
}
function hideLabel(){clearTimeout(hideLabelTimer);hideLabelTimer=setTimeout(()=>{activeRegion=-1;destinations.forEach(link=>link.classList.remove('is-discovered'));},450);}
function activate(region){cursor.classList.remove('is-visible');if(region===0)document.getElementById('openMotion').click();else destinations[region].click();}
function point(e){const r=canvas.getBoundingClientRect(),qx=((e.clientX-r.left)/r.width-box[0])/box[2],qy=((e.clientY-r.top)/r.height-box[1])/box[3],x=Math.floor(qx*315),y=Math.floor(qy*166),i=(y*315+x)*4;
 return {qx,qy,hit:mask&&x>63&&x<252&&y>19&&y<136&&Math.max(mask[i],mask[i+1],mask[i+2])>65};}
destinations.forEach((link,i)=>{
 link.addEventListener('pointerenter',()=>showLabel(i));link.addEventListener('pointerleave',hideLabel);
 link.addEventListener('focus',()=>showLabel(i));link.addEventListener('blur',hideLabel);
 link.addEventListener('click',e=>{cursor.classList.remove('is-visible');hideLabel();if(i===0){e.preventDefault();e.stopPropagation();document.getElementById('openMotion').click();}});
});
function move(e){if(!hero.classList.contains('signal-interactive'))return;const {qx,qy,hit}=point(e);
 if(e.pointerType==='mouse'&&fine.matches){cursor.classList.add('is-visible');cursor.style.transform=`translate3d(${e.clientX-6}px,${e.clientY-8}px,0)`;cursor.lastElementChild.textContent=hit?'SIGNAL FOUND':'EXPLORE';}
 if(hit){const now=performance.now();if(now-lastPoint>34||e.type==='pointerdown'){trail.push({x:qx,y:qy,time:now,seed:++seq});if(trail.length>12)trail.shift();lastPoint=now;}showLabel(regionAt(qx,qy));wake();}else hideLabel();
}
canvas.addEventListener('pointermove',move,{passive:true});canvas.addEventListener('pointerdown',move,{passive:true});canvas.addEventListener('pointerleave',()=>{cursor.classList.remove('is-visible');hideLabel();});canvas.addEventListener('pointercancel',()=>cursor.classList.remove('is-visible'));canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')cursor.classList.remove('is-visible');});
canvas.addEventListener('pointerdown',e=>{press={x:e.clientX,y:e.clientY};},{passive:true});
canvas.addEventListener('pointercancel',()=>{press=null;hideLabel();});
canvas.addEventListener('pointerup',e=>{
 if(!press||!hero.classList.contains('signal-interactive'))return;
 const tap=Math.hypot(e.clientX-press.x,e.clientY-press.y)<10;press=null;
 const p=point(e);if(tap&&p.hit)activate(regionAt(p.qx,p.qy));
},{passive:true});
const categories=hero.querySelector('.signal-categories'),labels=[...categories.querySelectorAll('span')];categories.addEventListener('pointermove',e=>{labels.forEach(el=>{const r=el.getBoundingClientRect(),d=Math.abs(e.clientX-r.left-r.width/2);el.style.setProperty('--proximity',String(.45+.55*Math.max(0,1-d/100)));});},{passive:true});categories.addEventListener('pointerleave',()=>labels.forEach(el=>el.style.removeProperty('--proximity')));
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;cursor.classList.remove('is-visible');trail=[];}},{threshold:0}).observe(hero);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});reduced.addEventListener('change',()=>{dirty=true;wake();});
if(!gl){fallback();begin();return;}
try{program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);['artwork','elapsed','box'].forEach(k=>u[k]=gl.getUniformLocation(program,k));u.trails=gl.getUniformLocation(program,'trails[0]');}catch(e){fallback();begin();return;}
const image=new Image();image.onload=()=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(u.artwork,0);const off=document.createElement('canvas');off.width=315;off.height=166;const c=off.getContext('2d');c.drawImage(image,0,0,image.width,image.height,0,0,315,166);mask=c.getImageData(0,0,315,166).data;ready=true;resize();begin();};image.onerror=()=>{fallback();begin();};image.src='assets/vd-vintage-clean.webp';new ResizeObserver(resize).observe(root);
})();
