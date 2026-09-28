'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const projectNav = $('#projectNav');
const content = $('#projectContent');
let currentProject = 'centurion';
let sectionObserver;
const identityMeta = {
  alaya: {name:'Ālaya',headline:'A place to belong.',intro:'A hospitality philosophy for Century Real Estate, where every preference is quietly understood and every interaction feels as natural as being at home.',hero:'assets/alaya/alaya-hero-source.jpg',statement:'Luxury, lived.',statementText:'Familiarity over formality. Intuition over instruction. Living over staying. Warmth over grandeur.',tag:'HOSPITALITY / BELONGING / PEOPLE',sections:[['alaya-editorial','Name Story','name'],['alaya-doctrine','The Doctrine','doctrine'],['alaya-colour','Colour System','colour'],['alaya-type','Typography','type'],['alaya-voice','Brand Voice','voice'],['alaya-experience','Brand Experience','experience'],['alaya-close','Closing Statement','closing']]},
  cente: {name:'Centé',headline:'Everything.<br>Exactly right.',intro:'A precision-led hospitality identity created for Century Real Estate. A model of luxury defined by consistency, control and considered detail.',hero:'assets/identities/cente/cente-hero-source.jpg',statement:'Nothing left to chance.',statementText:'Every touchpoint is considered. Precision, design and discipline create an experience that feels flawlessly complete.',tag:'HOSPITALITY / PRECISION / DESIGN',sections:[['cp-name','Name Story','name'],['cp-doctrine','The Doctrine','doctrine'],['cp-colour','Colour System','colour'],['cp-type','Typography','type'],['cp-voice','Brand Voice','voice'],['cp-experience','Brand Experience','experience'],['cp-close','Closing Statement','closing']]}
};
projectNav.innerHTML = projects.map(p=>`<button data-identity="${p.id}" aria-current="${p.id===currentProject?'true':'false'}"><span class="project-number">${p.n}</span><span>${p.title}</span><i aria-hidden="true">↗</i></button>`).join('');
function photo(src, label, cls='') {return `<figure class="${cls}"><img src="${src}" alt="${label}" loading="lazy" decoding="async"><figcaption>${label}</figcaption></figure>`;}
function gallery(id) {
  if(id==='alaya') return photo('assets/alaya/alaya-wayfinding.jpg','Wayfinding','gallery-anchor')+photo('assets/alaya/alaya-uniforms.jpg','Uniforms','gallery-one')+photo('assets/alaya/alaya-guest-amenities.jpg','Amenities','gallery-two')+photo('assets/alaya/alaya-dining-setting.jpg','Dining','gallery-three')+photo('assets/alaya/alaya-hospitality-service.jpg','Service','gallery-four');
  return photo('assets/identities/cente/cente-uniforms.jpg','Uniforms','gallery-anchor')+photo('assets/identities/cente/cente-service-tray.jpg','Service','gallery-one')+photo('assets/identities/cente/cente-guest-amenities.jpg','Amenities','gallery-two')+photo('assets/identities/cente/cente-dining-setting.jpg','Dining','gallery-wide');
}
function detailSections(id,meta) {
  const tmp=document.createElement('div'); tmp.innerHTML=id==='alaya'?alayaCase():centeCase();
  return meta.sections.filter(s=>s[2]!=='experience').map(([cls,label,key],i)=>{
    const section=$('.'+cls,tmp); section.id=`${id}-${key}`;section.classList.add('story-section');
    const number=$('.case-index,.cp-num',section);if(number)number.textContent=`${String(i+2).padStart(2,'0')} / ${label.toUpperCase()}`;
    if(key==='type'){
      if(id==='cente') {const grid=$('.cp-type-grid',section);grid.innerHTML='<img class="type-reference" src="assets/identities/cente/Cente_Typography_Reference.png" alt="Original Centé typography system: Roman Serif and DM Sans" loading="lazy">';}
      else $$('.type-split strong',section).forEach(el=>el.remove());
    }
    $$('img',section).forEach(img=>{img.loading='lazy';img.decoding='async';});
    return section.outerHTML;
  }).join('');
}
function hospitalityCase(p) {
 const m=identityMeta[p.id];
 return `<div class="identity-case ${p.id}-identity"><section id="${p.id}-intro" class="identity-hero"><div class="brand-image"><img src="${m.hero}" alt="${m.name} by Century hospitality identity" fetchpriority="high"></div><div class="brand-intro"><p class="overline">${p.n} / ${m.name.toUpperCase()} BY CENTURY</p><div class="short-rule"></div><h2 tabindex="-1">${m.headline}</h2><p>${m.intro}</p><a class="discover-link" href="#${p.id}-name">DISCOVER THE BRAND <span>↗</span></a></div></section>
 <nav class="section-index" aria-label="${m.name} case study sections">${m.sections.map(([cls,label,key],i)=>`<a href="#${p.id}-${key}" data-section="${key}" ${key==='experience'?'aria-current="true"':''}><small>${String(i+2).padStart(2,'0')}</small><span>${label}</span></a>`).join('')}</nav>
 ${detailSections(p.id,m)}
 ${p.id==='cente'?`<section class="story-section submark-section"><div><p class="overline">07 / BRAND MARK</p><h3>The Centé mark.</h3><p>The standalone Centé monogram brings the identity into a compact signature for smaller brand touchpoints.</p></div><img src="assets/restored/cente-submark.png" alt="Centé standalone brand mark"></section>`:''}
 <section id="${p.id}-experience" class="experience-board" aria-label="Brand experience"><div class="experience-statement"><span class="overline">BRAND EXPERIENCE</span><h3>${m.statement}</h3><p>${m.statementText}</p><span class="experience-tag">${m.tag}</span></div><div class="experience-gallery">${gallery(p.id)}</div></section></div>`;
}
function brandLogo(p){return p.id==='centurion'?`<img src="${p.logo}" alt="${p.title} logo" loading="lazy">`:`<span class="restored-logo logo-${p.id}" role="img" aria-label="${p.title} restored original logo"></span>`;}
function otherCase(p) {
 const d={
 centurion:{hero:'Standards become culture.',intro:'Created for Century Real Estate as a shared framework for strong standards, shared responsibility and collective progress.',story:'The identity is built around the idea that excellence is never achieved in isolation. Individual actions connect to create a unified system, turning standards into habits, values into actions and alignment into culture.',mark:'The interlinked CC monogram represents individual actions connecting into one system. Its continuous structure conveys stability and reliability; forward-opening forms indicate movement and advancement. Symmetry expresses fairness, discipline and consistency.',palette:[['ENERGY','#F06A55'],['PROGRESS','#B55392'],['ALIGNMENT','#6254A6'],['STABILITY','#253D79'],['FOUNDATION','#111522']],type:'Neue Alte Grotesk',voice:['ACCOUNTABLE — own the standard and follow through','COLLABORATIVE — individual actions strengthen the whole','CONSISTENT — repeat the right behaviours until they become habit'],close:'Doing things the right way, every day — and raising the bar together.'},
 daksha:{hero:'Made for moments that matter.',intro:'An event identity developed primarily around weddings, designed to stay bold and recognisable across celebration communication and on-ground branding.',story:'Daksha balances energy with structure. Its interlocking geometry creates a memorable visual centre while the orange, white and black contrast gives the identity strong presence in event environments.',mark:'The original Daksha symbol remains the hero of the system. Rounded and angular forms meet in one compact signature, giving the identity enough presence to work from intimate communication to large-format event graphics.',palette:[['ORANGE','#D88A32'],['WARM GOLD','#E2A54A'],['NIGHT','#0B0B0B'],['WHITE','#F5F3EE']],type:'Montserrat / Cormorant Garamond',voice:['PERSONAL','CELEBRATORY','CONFIDENT'],close:'A flexible identity built to frame the celebration — never compete with it.'},
 grove:{hero:'For a tranquil stay.',intro:'A hospitality identity developed for The Grove Hotel in Bournemouth, UK, with a relaxed coastal visual language.',story:'Palm, horizon and wave cues come together in a compact badge that connects the hotel to a sense of coastal escape while remaining clear enough for everyday hospitality touchpoints.',mark:'The original badge combines a leaning palm, horizon and wave elements with the hotel name and “For a tranquil stay” proposition. The supplied mark is preserved exactly throughout the case study.',palette:[['COASTAL CYAN','#29B8C8'],['DEEP TEAL','#16798B'],['NIGHT','#0B0D0E'],['SEA MIST','#E9F3F3'],['WHITE','#FFFFFF']],type:'Bebas Neue / Poppins',voice:['TRANQUIL','WELCOMING','COASTAL'],close:'A calm visual identity for a relaxed Bournemouth stay.'},
 comenwish:{hero:'Always a reason to celebrate.',intro:'Come N Wish is an events identity for celebrations across all ages — energetic and flexible enough for birthdays and personalised gatherings.',story:'The open circular symbol creates a sense of movement and togetherness. Its vivid gradient gives the brand instant energy while the restrained uppercase wordmark keeps the identity contemporary rather than child-specific.',mark:'The original circular mark is preserved exactly. Its continuous curved form creates a recognisable device that can anchor event graphics and celebratory environments.',palette:[['PINK','#E33A9A'],['VIOLET','#8A43C6'],['PURPLE','#5C2C91'],['NIGHT','#111014'],['SOFT WHITE','#F6F2F7']],type:'Montserrat',voice:['CELEBRATE','TOGETHER','ALL AGES'],close:'A celebration identity designed for every age and every reason to gather.'},
 homeey:{hero:'From property to home.',intro:'HOMEEY extends the Century Real Estate customer journey beyond registration into interior and home services.',story:'The brand sits at the point where ownership becomes everyday living. Its identity combines architectural order with a warmer domestic character, keeping a connection to Century while occupying its own space.',mark:'The original HOMEEY mark combines a structured H with roof and window cues. Copper warmth softens the geometry, creating a bridge between property, interiors and the feeling of home.',palette:[['COPPER','#D08160'],['WARM BEIGE','#C5B4A5'],['SLATE','#303B47'],['CREAM','#EFE7DE'],['WHITE','#FAF8F5']],type:'Montserrat',voice:['DESIGN','CARE','AT HOME'],close:'A service identity for the journey from owning a property to making it yours.'}}
 [p.id];
 const sw=d.palette.map(([n,c])=>`<i style="--brand:${c}"><b>${n}</b><small>${c}</small></i>`).join('');
 const labels={centurion:'Office wall · Handbook · Hard hat · Hoarding · Event backdrop',daksha:'Wedding entrance · Invitations · Event credentials',grove:'Entrance signage · Guest keycards · Dining stationery',comenwish:'Celebration backdrop · Invitations · Party favours',homeey:'Consultation folder · Material sample kit · Welcome packaging'};
 const experience=`<figure class="application-board"><a href="assets/applications/${p.id}.png" target="_blank" rel="noopener" aria-label="View ${p.title} mockups at full size"><img src="assets/applications/${p.id}.png" alt="${labels[p.id]}" loading="lazy" decoding="async"></a><figcaption>${labels[p.id]}<a href="assets/applications/${p.id}.png" target="_blank" rel="noopener">View full size ↗</a></figcaption></figure>${p.id==='grove'?`<div class="property-context"><h4>The place behind the identity.</h4><p>Original photographs supplied for The Grove Hotel, Bournemouth.</p><div class="brand-photo-grid">${[1,2,4].map((n,i)=>photo('assets/grove-hotel/grove-'+n+'.jpg',['Garden and conservatory','Hotel entrance','Guest lounge'][i],i===0?'wide':'')).join('')}</div></div>`:''}`;

 return `<div class="identity-case expanded-case ${p.id}-identity"><section id="${p.id}-intro" class="identity-hero expanded-hero"><div class="brand-image logo-image">${brandLogo(p)}</div><div class="brand-intro"><p class="overline">${p.n} / ${p.sub}</p><div class="short-rule"></div><h2 tabindex="-1">${d.hero}</h2><p>${d.intro}</p><a class="discover-link" href="#${p.id}-story">DISCOVER THE BRAND <span>↘</span></a></div></section>
 <nav class="section-index"><a href="#${p.id}-story"><small>02</small><span>Story</span></a><a href="#${p.id}-mark"><small>03</small><span>Logo Story</span></a><a href="#${p.id}-colour"><small>04</small><span>Colour</span></a><a href="#${p.id}-type"><small>05</small><span>Typography</span></a><a href="#${p.id}-voice"><small>06</small><span>Character</span></a><a href="#${p.id}-experience"><small>07</small><span>Experience</span></a></nav>
 <section id="${p.id}-story" class="story-section simple-story"><div><p class="overline">02 / BRAND STORY</p><h3>${d.hero}</h3></div><p>${d.story}</p></section>
 <section id="${p.id}-mark" class="story-section mark-section"><div><p class="overline">03 / LOGO STORY</p><h3>The mark.</h3><p>${d.mark}</p></div>${brandLogo(p)}</section>
${p.id==='centurion'?`<section class="cc-anatomy-section"><div class="cc-anatomy-head"><p class="overline">THE MARK / ANATOMY</p><h3>Where the two C’s connect.</h3><p>Follow each numbered line to the part of the mark it describes.</p></div><svg class="cc-diagram" viewBox="0 0 800 465" role="img" aria-labelledby="cc-title cc-desc"><title id="cc-title">Centurion Code logo anatomy</title><desc id="cc-desc">Leader lines identify the intersection, continuous outer curve, forward-facing opening and balanced lower forms.</desc><defs><clipPath id="cc-symbol-only"><rect x="130" y="120" width="540" height="222"/></clipPath></defs><image class="diagram-logo" href="assets/logos-clean/centurion.png" x="130" y="120" width="540" height="349" clip-path="url(#cc-symbol-only)"/><g class="diagram-lines"><path d="M145 78 H390 L411 291"/><path d="M145 400 H200 L265 221"/><path d="M655 78 H600 L535 230"/><path d="M655 400 H565 L335 322"/></g><g class="diagram-points"><circle cx="411" cy="291" r="5"/><circle cx="265" cy="221" r="5"/><circle cx="535" cy="230" r="5"/><circle cx="335" cy="322" r="5"/></g><g class="diagram-labels"><text x="25" y="65">01 / INTERSECTION</text><text x="25" y="435">02 / CONTINUITY</text><text x="775" y="65" text-anchor="end">03 / FORWARD FORM</text><text x="775" y="435" text-anchor="end">04 / BALANCE</text></g></svg><ol class="anatomy-key"><li><b>Intersection</b><p>The overlapping C forms bring individual actions into one shared standard.</p></li><li><b>Continuity</b><p>The continuous outer curve expresses a reliable framework across teams.</p></li><li><b>Forward form</b><p>The open right-facing forms suggest progress and advancement.</p></li><li><b>Balance</b><p>The paired forms convey fairness, discipline and consistency.</p></li></ol></section>`:''}
 <section id="${p.id}-colour" class="story-section custom-colour"><div><p class="overline">04 / COLOUR SYSTEM</p><h3>A palette with purpose.</h3></div><div class="custom-swatches">${sw}</div></section>
 <section id="${p.id}-type" class="story-section custom-type"><div><p class="overline">05 / TYPOGRAPHY</p><h3>${d.type}</h3></div>${p.id==='centurion'?`<div class="type-spec centurion-type-reference"><p>Neue Alte Grotesk gives the code a direct, contemporary voice. Strong headings establish the standard; lighter supporting text keeps communication approachable.</p><img src="assets/logos-clean/centurion.png" alt="Original Centurion Code wordmark and tagline as a lettering reference" loading="lazy"></div>`:`<div class="type-spec"><strong>Aa</strong><span>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</span></div>`}</section>
 <section id="${p.id}-voice" class="story-section custom-voice"><p class="overline">06 / BRAND CHARACTER</p>${p.id==='centurion'?`<h3>Clear standards.<br>Shared responsibility.</h3><p class="character-intro">Centurion Code speaks like a dependable colleague: direct about expectations, open to collaboration and consistent in action.</p><div class="character-cards"><article><small>01 / ACCOUNTABLE</small><h4>Own the outcome.</h4><p>Make commitments clear and follow through. If something changes, communicate early.</p><blockquote>“I’ll take responsibility and keep you updated.”</blockquote></article><article><small>02 / COLLABORATIVE</small><h4>Connect the team.</h4><p>Share context, listen across functions and make every handover easier for the next person.</p><blockquote>“Let’s agree on the standard together.”</blockquote></article><article><small>03 / CONSISTENT</small><h4>Make quality a habit.</h4><p>Apply the same care to everyday tasks and major milestones. Check the details before calling work complete.</p><blockquote>“The same care, every time.”</blockquote></article></div>`:`<div>${d.voice.map((x,i)=>`<span><small>0${i+1}</small>${x}</span>`).join('')}</div>`}</section>

 <section id="${p.id}-experience" class="story-section custom-experience"><div class="experience-heading"><p class="overline">07 / BRAND EXPERIENCE</p><h3>${p.id==='centurion'?'The code, applied.':'The identity, applied.'}</h3><p>Concept mockups exploring how the identity works across ${p.id==='centurion'?'workplace, site and team touchpoints':p.id==='grove'?'the guest experience':'everyday brand touchpoints'}.</p></div>${experience}</section>
 <section class="custom-close">${brandLogo(p)}<blockquote>${d.close}</blockquote></section></div>`;
}

function showProject(id,{scroll=true,focus=false,history=true}={}) {
 const p=projects.find(x=>x.id===id);if(!p)return;
 currentProject=id;
 if(sectionObserver)sectionObserver.disconnect();
 content.innerHTML=identityMeta[id]?hospitalityCase(p):otherCase(p);
 content.setAttribute('aria-label',p.title+' identity case study');
 $$('[data-identity]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.identity===id)));
 const i=projects.indexOf(p),prev=projects[(i+projects.length-1)%projects.length],next=projects[(i+1)%projects.length];
 $('#prevLabel').textContent=prev.title;$('#nextLabel').textContent=next.title;
 $('#prevProject').dataset.identity=prev.id;$('#nextProject').dataset.identity=next.id;
 if(history)window.history.replaceState(null,'',`#identity-${id}`);
 if(scroll)$('#identities').scrollIntoView({behavior:'instant'});
 if(focus)$('h2',content)?.focus({preventScroll:true});
 observeSections();
}
function observeSections(){
 const observed=$$('section[id]',content);const links=$$('.section-index a',content);
 sectionObserver=new IntersectionObserver(entries=>{
  const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
  if(!visible.length)return;
  const id=visible[0].target.id;
  links.forEach(a=>{const active=a.hash==='#'+id;a.setAttribute('aria-current',String(active));if(active && matchMedia('(max-width: 800px)').matches){const nav=a.parentElement;nav.scrollTo({left:a.offsetLeft-nav.offsetLeft-16,behavior:'smooth'});}});
 },{rootMargin:'-180px 0px -40% 0px',threshold:0});
 observed.forEach(s=>sectionObserver.observe(s));
}
function routeHash(){
 const h=decodeURIComponent(location.hash.slice(1));
 const id=h.startsWith('identity-')?h.slice(9):projects.find(p=>h.startsWith(p.id+'-'))?.id;
 if(id&&projects.some(p=>p.id===id)){
  showProject(id,{scroll:false,history:false});
  requestAnimationFrame(()=>{(document.getElementById(h)||$('#identities')).scrollIntoView({behavior:'instant'});});
 }
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-identity]');if(b){showProject(b.dataset.identity,{focus:e.detail===0});return;}
 const a=e.target.closest('a[href^="#"]');
 if(a&&a.hash&&!a.hash.startsWith('#identity-')){
  const target=document.getElementById(a.hash.slice(1));if(target){e.preventDefault();window.history.replaceState(null,'',a.hash);target.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});}
 }
});
showProject(currentProject,{scroll:false,history:false});routeHash();
addEventListener('hashchange',routeHash);
// A single scroll-driven portal; the original complete mark is contain-scaled.
const landing=$('#landing'),portal=$('#portal');let framePending=false;
function updatePortal(){
 framePending=false;
 const y=scrollY,travel=Math.max(1,innerHeight*.95);
 const progress=Math.max(0,Math.min(1,y/travel));
 document.documentElement.style.setProperty('--journey',progress.toFixed(4));
 document.body.classList.toggle('inside-work',y>innerHeight*.6);
 portal.style.transform='none';
 portal.style.opacity=reducedMotion.matches?"1":String(1-Math.pow(progress,2)*.85);
 $('.portal-sticky').style.visibility=y>landing.offsetHeight?'hidden':'visible';
}
addEventListener('scroll',()=>{if(!framePending){framePending=true;requestAnimationFrame(updatePortal);}},{passive:true});
addEventListener('resize',updatePortal);updatePortal();
// Native dialogs retain focus, keyboard dismissal, and inert backgrounds.
const infoDialog=$('#infoDialog');
const panelContent={
 about:`<span class="overline">ABOUT / VAISHNAV DEVADAS</span><h2>Ideas into<br><em>identities.</em></h2><p class="panel-lead">Visual designer working across identity, campaigns, motion and image-making.</p><p>8+ years of experience across India and the UK. Senior Visual Designer at Century Real Estate, with work spanning brand identities, marketing campaigns, print, presentations, motion graphics and video.</p><div class="panel-details"><span>EDUCATION</span><p>Master’s in Digital Effects and Production<br>Bournemouth University, UK</p><span>TOOLS</span><p>Photoshop · Illustrator · InDesign · After Effects · Premiere Pro · Blender · Firefly</p></div>`,
 contact:`<span class="overline">LET’S WORK TOGETHER</span><h2>A good idea<br>starts with<br><em>a conversation.</em></h2><p>For branding, visual design, motion graphics and freelance collaborations.</p><div class="contact-links"><a href="mailto:vaishnav.devadas@gmail.com">vaishnav.devadas@gmail.com <span>↗</span></a><a href="tel:+917736684399">+91 77366 84399 <span>↗</span></a></div>`
};
$$('[data-panel]').forEach(b=>b.addEventListener('click',()=>{$('#infoContent').innerHTML=panelContent[b.dataset.panel];infoDialog.showModal();}));
$$('dialog').forEach(d=>{
 $('.dialog-close',d).addEventListener('click',()=>d.close());
 d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();});
});
