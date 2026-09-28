
(()=>{
const root=document.getElementById('portal'),canvas=root.querySelector('canvas');
const gl=canvas.getContext('webgl',{alpha:false,antialias:false});
if(!gl){root.classList.add('particle-fallback');return;}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const img=new Image();img.onerror=()=>root.classList.add('particle-fallback');let ready=false,visible=true,frame=0,start=0,last=0,program,count=0,ratio=1,scale=1,dpr=1;
const pointer={x:-5,y:-5,tx:-5,ty:-5,power:0,active:false};
const vertex=`precision highp float;
attribute vec2 home;attribute vec3 color;
uniform float pointScale;
varying vec3 rgb;varying float opacity;
void main(){gl_Position=vec4(home.x*2.-1.,1.-home.y*2.,0.,1.);gl_PointSize=max(1.,pointScale);rgb=color;opacity=1.;}`;
let positionBuffer,colorBuffer,positions,shades,grains=[],rows=[];
let elapsed=0;
const wind={x:0,y:0,lastX:-5,lastY:-5};
function simulate(dt){
 elapsed+=dt;
 const dx=pointer.active&&wind.lastX>-1?Math.max(-.12,Math.min(.12,pointer.tx-wind.lastX)):0;
 const dy=pointer.active&&wind.lastY>-1?Math.max(-.12,Math.min(.12,pointer.ty-wind.lastY)):0;
 wind.lastX=pointer.active?pointer.tx:-5;wind.lastY=pointer.active?pointer.ty:-5;
 wind.x+=(dx/Math.max(dt,.001)-wind.x)*(1-Math.exp(-dt*8));
 wind.y+=(dy/Math.max(dt,.001)-wind.y)*(1-Math.exp(-dt*8));
 for(let k=0;k<grains.length;k++){
  const p=grains[k],row=rows[p.row],n=row.length;
  // Each grain advances through a spatial streamline, never a timed form/leave loop.
  if(!reduced)p.phase+=dt*(5.2+1.7*Math.sin(elapsed*.217+p.row*.07))*(1+1.25*Math.max(0,Math.min(1,(elapsed-7.75)/2)));
  const index=p.phase%n,j=Math.floor(index),f=index-j;
  const a=row[j],b=row[(j+1)%n];
  let x=a[0]+(b[0]-a[0])*f,y=p.row*2/img.height;
  if(j===n-1)x=a[0]+f*.08;
  // Each grain travels continuously along a curved current into its moving
  // streamline. Independent arrival times avoid a shared horizontal reveal edge.
  if(!reduced && elapsed<p.delay+p.duration){
   const u=Math.max(0,Math.min(1,(elapsed-p.delay)/p.duration));
   const t=1-Math.pow(1-u,2.4),v=1-t;
   const inlet=.48+.20*Math.sin(p.row*.027+p.lane*1.4);
   const curl=.14*Math.sin(p.row*.019+p.lane*2.1);
   const sx=-.16-p.seed*.38;
   const c1x=.13+p.lane*.04,c1y=inlet+curl;
   const c2x=x-.19,c2y=y-curl*.75;
   x=v*v*v*sx+3*v*v*t*c1x+3*v*t*t*c2x+t*t*t*x;
   y=v*v*v*inlet+3*v*v*t*c1y+3*v*t*t*c2y+t*t*t*y;
  }
  const px=x+p.ox,py=y+p.oy;
  const mx=px-pointer.tx,my=(py-pointer.ty)/ratio;
  const influence=pointer.active?Math.exp(-(mx*mx+my*my)/.0011):0;
  if(!reduced){
   const breeze=Math.max(0,Math.min(1,(elapsed-7.75)/2));
   const turbulence=Math.sin(y*23+elapsed*.71)+Math.sin(x*17-elapsed*.43);
   const eddy=Math.sin(mx*115+elapsed*5.2+p.lane*2)*Math.cos(my*130-elapsed*4.1);
   const localX=influence*(wind.x*1.35-my*9.0+eddy*.105);
   const localY=influence*(wind.y*1.35+mx*9.0+Math.cos(mx*95+elapsed*4.3+p.lane)*.054);
   p.vx+=(localX-p.ox*10.0-p.vx*5.2)*dt;
   p.vy+=(localY*ratio-p.oy*10.0-p.vy*5.2)*dt;
   p.ox+=p.vx*dt;p.oy+=p.vy*dt;
   y+=turbulence*.0014;
   // Travelling wind ripples strengthen only after the approved entrance ends.
   y+=breeze*.0018*Math.sin(x*24-elapsed*2.1+y*9);
   x+=breeze*.0012*Math.sin(x*18-elapsed*1.8+y*13);
  }
  positions[k*2]=x+p.ox;positions[k*2+1]=y+p.oy;
  // Do not stretch illuminated samples across empty gaps into flat patches.
  const gap=Math.abs(b[0]-a[0]);
  const distanceToGrain=Math.min(f,1-f)*gap;
  const light=gap>.016?Math.exp(-Math.pow(distanceToGrain/.004,2)):1;
  for(let c=0;c<3;c++){
   const background=c===0?8:c===1?7:4;
   shades[k*3+c]=(background+((a[c+1]+(b[c+1]-a[c+1])*f)-background)*light)/255;
  }
 }
 gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,positions);
 gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,shades);
}
const fragment=`precision mediump float;varying vec3 rgb;varying float opacity;void main(){gl_FragColor=vec4(rgb,opacity);}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Particle program did not link');gl.useProgram(program);
const uniforms={};['time','aspect','pointScale','mouse','force','still'].forEach(k=>uniforms[k]=gl.getUniformLocation(program,k));
function attribute(name,size,values){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,values,gl.DYNAMIC_DRAW);const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,0,0);return b;}
function resize(){const r=root.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ratio=r.width/r.height;scale=canvas.width/1536;gl.viewport(0,0,canvas.width,canvas.height);}
function render(now){frame=0;if(!visible||!ready)return;const dt=Math.min(.06,(now-last)/1000||.016);last=now;pointer.power+=(Number(pointer.active)-pointer.power)*(1-Math.exp(-dt*2.7));pointer.x+=(pointer.tx-pointer.x)*(1-Math.exp(-dt*14));pointer.y+=(pointer.ty-pointer.y)*(1-Math.exp(-dt*14));
simulate(dt);gl.clearColor(8/255,7/255,4/255,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(uniforms.time,(now-start)/1000);gl.uniform1f(uniforms.aspect,ratio);gl.uniform1f(uniforms.pointScale,Math.max(1,scale*2.08));gl.uniform2f(uniforms.mouse,pointer.x,pointer.y);gl.uniform1f(uniforms.force,pointer.power);gl.uniform1f(uniforms.still,reduced?1:0);gl.drawArrays(gl.POINTS,0,count);if(!reduced)frame=requestAnimationFrame(render);}
function wake(){if(ready&&visible&&!frame)frame=requestAnimationFrame(render);}
function move(e){const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;if(!pointer.active&&pointer.power<.01){pointer.x=x;pointer.y=y;}pointer.tx=x;pointer.ty=y;pointer.active=true;wake();}
canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerdown',move);canvas.addEventListener('pointerleave',()=>pointer.active=false);canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')pointer.active=false});canvas.addEventListener('pointercancel',()=>pointer.active=false);
new ResizeObserver(()=>{resize();wake()}).observe(root);new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}}).observe(root);
img.onload=()=>{
const off=document.createElement('canvas');off.width=img.width;off.height=img.height;const c=off.getContext('2d');c.drawImage(img,0,0);const pixels=c.getImageData(0,0,img.width,img.height).data;
for(let y=0;y<img.height;y+=2){
 const row=[];rows.push(row);
 for(let x=0;x<img.width;x+=2){
  const i=(y*img.width+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
  const ui=(x<520&&y<123)||(x<300&&y>370&&y<532)||(x>1320&&y>385&&y<496)||(x>1450&&y<85)||(x>654&&x<890&&y>715);
  if(r<14||r-b<8||(ui&&(r-g<24||g-b<24)))continue;
  row.push([(x+.5)/img.width,r,g,b]);
 }
 if(!row.length)continue;
 // Dark offscreen portions join the flow without a visible reset.
 row.unshift([-.09,8,7,4]);row.push([1.09,8,7,4]);
 for(let j=0;j<row.length;j++){
  const seed=((j*1664525+(rows.length*1013904223))>>>0)/4294967296;
  const lane=Math.sin(j*12.9898+rows.length*78.233)*43758.5453;
  const variation=lane-Math.floor(lane);
  grains.push({row:rows.length-1,phase:j,ox:0,oy:0,vx:0,vy:0,
   seed,lane:variation,delay:variation*1.15,
   duration:3.5+seed*2.4+variation*.7});
 }
}
count=grains.length;positions=new Float32Array(count*2);shades=new Float32Array(count*3);
positionBuffer=attribute('home',2,positions);colorBuffer=attribute('color',3,shades);
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);resize();ready=true;start=performance.now();wake();
};
img.src='assets/vd-particle-source.jpg';
})();
