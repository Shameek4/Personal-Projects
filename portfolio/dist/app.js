'use strict';
document.documentElement.classList.add('js');
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reduceMotion.matches;
let pausePreference = null;
try { pausePreference = localStorage.getItem('svb-motion'); } catch {}
if (pausePreference === 'paused') motionPaused = true;
const motionButton = $('#motion-toggle');
function syncMotion() {
  document.body.classList.toggle('motion-paused', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.setAttribute('aria-label', motionPaused ? 'Resume animations' : 'Pause animations');
  $('.motion-icon', motionButton).textContent = motionPaused ? '▷' : 'Ⅱ';
  $('.motion-label', motionButton).textContent = motionPaused ? 'Motion off' : 'Motion on';
}
syncMotion();
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused; syncMotion();
  try { localStorage.setItem('svb-motion', motionPaused ? 'paused' : 'playing'); } catch {}
});
reduceMotion.addEventListener('change', event => { motionPaused = event.matches; syncMotion(); });
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .08 });
$$('.reveal').forEach(el => observer.observe(el));
let scrollScheduled = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  $('.scroll-progress').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
  scrollScheduled = false;
}
addEventListener('scroll', () => { if (!scrollScheduled) { requestAnimationFrame(updateScroll); scrollScheduled = true; } }, { passive: true });
updateScroll();
$('#year').textContent = new Date().getFullYear();
let toastTimeout;
function toast(message) {
  const el = $('.toast'); el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove('visible'), 3500);
}
$('.copy-email').addEventListener('click', async () => {
  const address = 'shameekvardhanbhatt2004@gmail.com';
  try { await navigator.clipboard.writeText(address); toast('Email address copied. Let’s make something happen.'); }
  catch { toast('Please copy: ' + address); }
});

// A real-time, locally rendered torus knot. No external graphics dependency.
const canvas = $('#sculpture');
const artwork = $('#artwork');
let drawSculpture = () => {};
let rotation = [0.38, -0.35, -0.35];
let pointerOffset = [0, 0], pointerSmooth = [0, 0];
let dragging = false, lastPointer = null, inView = true;
new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }).observe(canvas);
try {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power', premultipliedAlpha: false });
  if (!gl) throw new Error('WebGL unavailable');
  const vertex = `attribute vec3 aPosition; attribute vec3 aNormal; uniform vec3 uRotation; uniform float uAspect;
  varying vec3 vNormal; varying vec3 vPosition;
  void main(){ vec3 a=uRotation; mat3 rx=mat3(1.,0.,0.,0.,cos(a.x),sin(a.x),0.,-sin(a.x),cos(a.x));
  mat3 ry=mat3(cos(a.y),0.,-sin(a.y),0.,1.,0.,sin(a.y),0.,cos(a.y));
  mat3 rz=mat3(cos(a.z),sin(a.z),0.,-sin(a.z),cos(a.z),0.,0.,0.,1.);
  mat3 model=rz*ry*rx; vec3 p=model*aPosition; vNormal=model*aNormal; vPosition=p; p.z-=8.;
  gl_Position=vec4(p.x*2.15/uAspect,p.y*2.15,-1.002*p.z-.2002,-p.z); }`;
  const fragment = `precision mediump float; varying vec3 vNormal; varying vec3 vPosition;
  void main(){vec3 n=normalize(vNormal);vec3 view=normalize(vec3(0.,0.,8.)-vPosition);
  vec3 light=normalize(vec3(-3.,5.,6.)-vPosition);float diffuse=max(dot(n,light),0.);
  float fill=max(dot(n,normalize(vec3(4.,-1.,3.))),0.);float spec=pow(max(dot(n,normalize(light+view)),0.),65.);
  float rim=pow(1.-max(dot(n,view),0.),3.);
  vec3 base=vec3(.945,.318,.322);vec3 col=base*(.24+.8*diffuse+.15*fill)+vec3(1.,.72,.64)*spec*.64;
  col+=vec3(.44,.13,.22)*rim*.36;gl_FragColor=vec4(col,1.);}`;
  function shader(type, source) { const s=gl.createShader(type); gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader failed');return s; }
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Program failed'); gl.useProgram(program);
  const point = t => [(2+Math.cos(3*t))*Math.cos(2*t)*.8,(2+Math.cos(3*t))*Math.sin(2*t)*.8,Math.sin(3*t)*.8];
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);const norm=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const positions=[], normals=[], indices=[]; const rings=280,sides=36;
  for(let i=0;i<=rings;i++){
    const t=i/rings*Math.PI*2,p=point(t),prev=point(t-.003),next=point(t+.003);
    const tangent=norm(sub(next,prev));const curvature=norm(next.map((v,k)=>v-2*p[k]+prev[k]));
    const binormal=norm(cross(tangent,curvature)), normal=norm(cross(binormal,tangent));
    for(let j=0;j<=sides;j++){
      const a=j/sides*Math.PI*2,n=normal.map((v,k)=>v*Math.cos(a)+binormal[k]*Math.sin(a));
      positions.push(...p.map((v,k)=>v+n[k]*.47));normals.push(...n);
      if(i<rings&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
    }
  }
  function attribute(name,data){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);}
  attribute('aPosition',positions);attribute('aNormal',normals);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  const rotationUniform=gl.getUniformLocation(program,'uRotation'), aspectUniform=gl.getUniformLocation(program,'uAspect');
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  let dirty=true;
  const resize = () => {const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);gl.viewport(0,0,canvas.width,canvas.height);dirty=true;};
  new ResizeObserver(resize).observe(canvas);resize();
  let renderedRotation = '';
  drawSculpture = dt => {
    if(!inView||document.hidden)return;
    if(!motionPaused&&!dragging)rotation[1]+=dt*.00017;
    pointerSmooth=pointerSmooth.map((v,i)=>v+(pointerOffset[i]-v)*.04);
    const r=[rotation[0]+pointerSmooth[1]*.12,rotation[1]+pointerSmooth[0]*.12,rotation[2]];
    const key=r.map(v=>v.toFixed(4)).join(',');if(motionPaused&&!dirty&&key===renderedRotation)return;
    renderedRotation=key;dirty=false;
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform3fv(rotationUniform,r);gl.uniform1f(aspectUniform,canvas.width/canvas.height);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
  };
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();artwork.classList.add('no-webgl');drawSculpture=()=>{};});
} catch { artwork.classList.add('no-webgl'); }
canvas.addEventListener('pointerdown',event=>{dragging=true;lastPointer=[event.clientX,event.clientY];canvas.setPointerCapture(event.pointerId);});
canvas.addEventListener('pointermove',event=>{
  const r=canvas.getBoundingClientRect();pointerOffset=[(event.clientX-r.left)/r.width-.5,(event.clientY-r.top)/r.height-.5];
  if(dragging&&lastPointer){rotation[1]+=(event.clientX-lastPointer[0])*.006;rotation[0]+=(event.clientY-lastPointer[1])*.006;lastPointer=[event.clientX,event.clientY];}
});
['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,()=>{dragging=false;lastPointer=null;}));
canvas.addEventListener('pointerleave',()=>{pointerOffset=[0,0];});
canvas.addEventListener('keydown',event=>{
  const moves={ArrowLeft:[1,-.15],ArrowRight:[1,.15],ArrowUp:[0,-.15],ArrowDown:[0,.15]};
  if(moves[event.key]){event.preventDefault();const [i,d]=moves[event.key];rotation[i]+=d;}
});

const projectDialog=$('#project-dialog');const reelDialog=$('#reel-dialog');
let activeOpener=null;
function openDialog(dialog,opener){activeOpener=opener;dialog.showModal();document.body.classList.add('modal-open');}
$$('dialog').forEach(dialog=>{
  $('[data-close]',dialog).addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');activeOpener?.focus({preventScroll:true});});
});
// Resume-backed project showcases are initialized in projects.js.

let reelElapsed=0,reelPlaying=false,reelScene=-1;
const scenes=[{word:'DATA.',bg:'#311847',fg:'#dad7cd',accent:'#f15152'},{word:'INSIGHT.',bg:'#3a5a40',fg:'#dad7cd',accent:'#dad7cd'},{word:'CODE.',bg:'#283845',fg:'#ffa649',accent:'#ffa649'},{word:'CRAFT.',bg:'#f15152',fg:'#311847',accent:'#311847'},{word:'IMPACT.',bg:'#ffa649',fg:'#283845',accent:'#283845'},{word:'LET’S TALK.',bg:'#311847',fg:'#dad7cd',accent:'#f15152'}];
function setReelButton(){$('#reel-toggle').innerHTML=reelPlaying?'Pause <span aria-hidden="true">Ⅱ</span>':'Play <span aria-hidden="true">▷</span>';}
function renderReel(){const sceneIndex=Math.min(5,Math.floor(reelElapsed/2000));if(sceneIndex!==reelScene){reelScene=sceneIndex;const scene=scenes[sceneIndex];$('.reel-stage').style.background=scene.bg;$('.reel-stage').style.color=scene.fg;$('.reel-symbol').style.color=scene.accent;$('#reel-word').textContent=scene.word;if(!motionPaused&&!reduceMotion.matches)$('#reel-word').animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});}$('.reel-track i').style.width=`${reelElapsed/12000*100}%`;$('#reel-time').textContent=`${String(Math.floor(reelElapsed/1000)).padStart(2,'0')} / 12`;$('.reel-symbol').style.transform=`rotate(${reelElapsed/100}deg)`;}
$('#reel-open').addEventListener('click',e=>{reelElapsed=0;reelScene=-1;reelPlaying=!motionPaused;renderReel();setReelButton();openDialog(reelDialog,e.currentTarget);});
$('#reel-toggle').addEventListener('click',()=>{if(reelElapsed>=12000)reelElapsed=0;reelPlaying=!reelPlaying;setReelButton();});
$('#reel-replay').addEventListener('click',()=>{reelElapsed=0;reelScene=-1;reelPlaying=true;setReelButton();renderReel();});
reelDialog.addEventListener('close',()=>{reelPlaying=false;});
let lastFrame=performance.now();
function tick(now){const dt=Math.min(now-lastFrame,50);lastFrame=now;drawSculpture(dt);if(reelDialog.open&&reelPlaying&&!document.hidden){reelElapsed=Math.min(12000,reelElapsed+dt);renderReel();if(reelElapsed>=12000){reelPlaying=false;setReelButton();}}requestAnimationFrame(tick);}
requestAnimationFrame(tick);
