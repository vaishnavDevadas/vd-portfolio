(()=>{
const dialog=document.getElementById('motionDialog'),track=dialog.querySelector('.motion-track'),projects=[...track.children],buttons=[...dialog.querySelectorAll('[data-motion]')],reduce=matchMedia('(prefers-reduced-motion: reduce)');
let selected=0;
function select(index){selected=index;track.scrollTo({left:projects[index].offsetLeft-track.offsetLeft,behavior:reduce.matches?'instant':'smooth'});}
document.getElementById('openMotion').addEventListener('click',()=>{dialog.showModal();document.body.classList.add('motion-open');select(selected);});
buttons.forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.motion))));
dialog.addEventListener('close',()=>{document.body.classList.remove('motion-open');dialog.querySelectorAll('video').forEach(v=>v.pause());});
track.addEventListener('wheel',e=>{if(e.ctrlKey||e.target.closest('video'))return;if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){const atStart=track.scrollLeft<1,atEnd=track.scrollLeft>=track.scrollWidth-track.clientWidth-1;if((e.deltaY<0&&atStart)||(e.deltaY>0&&atEnd))return;e.preventDefault();track.scrollLeft+=e.deltaY;}},{passive:false});
dialog.addEventListener('keydown',e=>{if(e.target.closest('video'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(Math.max(0,Math.min(1,selected+(e.key==='ArrowRight'?1:-1))));}});
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){selected=projects.indexOf(entry.target);buttons.forEach(b=>{if(Number(b.dataset.motion)===selected)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});projects.forEach((p,i)=>{if(i!==selected)p.querySelector('video').pause();});}},{root:track,threshold:.6});projects.forEach(p=>observer.observe(p));
dialog.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>dialog.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();})));
})();
