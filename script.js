(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress=$('[data-progress]');
function paintProgress(){if(!progress)return;const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?Math.min(100,Math.max(0,scrollY/max*100)):0)+'%'}
paintProgress();addEventListener('scroll',paintProgress,{passive:true});addEventListener('resize',paintProgress);

const mast=$('[data-masthead]'),menu=$('.menu-button');
if(mast&&menu){menu.addEventListener('click',()=>{const open=mast.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Index'});$$('.main-nav a',mast).forEach(a=>a.addEventListener('click',()=>{mast.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Index'}))}

const clock=$('[data-clock]');
function tick(){if(!clock)return;const t=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit'}).format(new Date());clock.textContent='ARCHIVE ONLINE / '+t}
tick();setInterval(tick,30000);

const book=$('[data-parallax]');
if(book&&!reduced&&matchMedia('(pointer:fine)').matches){
  book.addEventListener('pointermove',e=>{const r=book.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;book.style.transform='rotate('+(1.2+x*1.4)+'deg) translate3d('+(x*5)+'px,'+(y*5)+'px,0)'});
  book.addEventListener('pointerleave',()=>book.style.transform='rotate(1.2deg)');
}

const fallback=[
{code:'01',short:'Witness',status:'WITNESS / OPEN',title:'The wrong man for easy belief.',deck:'The testimony begins with the person giving it.',quote:'“I do not ask you to believe me. I ask you to check my work.”',body:'A professional skeptic, historian, and systems investigator becomes part of the evidence. Before the death event is allowed to carry meaning, the witness is audited.',route:'START / THE MAN I WAS'},
{code:'02',short:'Five minutes',status:'DEATH EVENT / OPEN',title:'The body stops. The record continues.',deck:'The ambulance is the threshold.',quote:'“No light. No voice.”',body:'Pain ends, the body remains below, and the witness enters the event that drives the rest of the book. The account is presented as testimony to be examined, not a demand for instant belief.',route:'NEXT / THE THRESHOLD'},
{code:'03',short:'Review',status:'ACCOUNTING / OPEN',title:'Not comfort. Accounting.',deck:'The life review is the moral center of the book.',quote:'“The review is not watched. It is felt.”',body:'The record is experienced from inside the people who carried the cost. Reputation falls away. Intention and consequence remain.',route:'NEXT / THE LEDGER'},
{code:'11',short:'Field nights',status:'FIELD / OPEN',title:'The hotel floor that stopped taking guests.',deck:'A physical place replaces abstraction.',quote:'“Investigation is the wrong word. Search and rescue.”',body:'A downtown hotel, an empty corridor, solo controls, a protected source, and a method intended to resist suggestion. The field material treats anomaly as a responsibility before it treats it as spectacle.',route:'NEXT / THE 24TH FLOOR'},
{code:'12',short:'Digital séance',status:'MACHINE / OPEN',title:'The newest machine asks the oldest question.',deck:'A simulation can sound sincere without being alive.',quote:'“The dead in the box are perfectly agreeable.”',body:'AI grief technology can reconstruct voice, style, memory fragments, and conversational habits. The book asks how evidence of survival can be protected when imitation becomes emotionally convincing.',route:'NEXT / THE MACHINE AGE'}];

function renderArchive(files){
  const root=$('[data-archive]');if(!root||!files.length)return;
  const index=$('[data-archive-index]',root),sheet=$('[data-archive-sheet]',root),next=$('[data-next-file]',root);let active=0;
  function show(i,focus=false){
    active=(i+files.length)%files.length;const f=files[active];
    $$('button',index).forEach((b,n)=>{b.setAttribute('aria-selected',String(n===active));b.tabIndex=n===active?0:-1});
    $('[data-file-code]',sheet).textContent='FILE '+f.code;$('[data-file-status]',sheet).textContent=f.status;$('[data-file-title]',sheet).textContent=f.title;$('[data-file-deck]',sheet).textContent=f.deck;$('[data-file-quote]',sheet).textContent=f.quote;$('[data-file-body]',sheet).textContent=f.body;$('[data-file-route]',sheet).textContent=f.route;
    history.replaceState(null,'','#archive-file-'+f.code);if(focus)sheet.focus({preventScroll:true});
  }
  index.innerHTML=files.map((f,i)=>'<button type="button" role="tab" aria-selected="'+(i===0)+'" data-index="'+i+'"><span>'+f.code+'</span><span>'+f.short+'</span></button>').join('');
  $$('button',index).forEach(b=>{b.addEventListener('click',()=>show(+b.dataset.index,true));b.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(e.key))return;e.preventDefault();show(active+(['ArrowDown','ArrowRight'].includes(e.key)?1:-1));$$('button',index)[active]?.focus()})});
  next?.addEventListener('click',()=>show(active+1,true));
  const code=location.hash.match(/archive-file-(\d+)/)?.[1],start=code?files.findIndex(f=>f.code===code):0;show(start>=0?start:0);
}
if($('[data-archive]'))fetch('archive.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>renderArchive(Array.isArray(d.files)?d.files:fallback)).catch(()=>renderArchive(fallback));

const angles={
'Near-death experience':'A historian who had spent his career weighing documents becomes the primary document after a five-minute cardiac arrest. The interview angle is not reassurance; it is what happens when a trained skeptic has to audit his own most consequential testimony.',
'AI and the dead':'Synthetic voice and personality systems are turning grief into an interface. The conversation is about the line between memorial, simulation, evidence, and a product that can answer in the voice of someone who died.',
'Evidence protocols':'Paranormal claims become interesting only after suggestion, contamination, memory drift, and incentives are treated as problems. The angle is method: what controls can and cannot establish.',
'Mediumship testing':'The book treats mediumship as a claim that deserves structure rather than automatic belief or automatic ridicule. The interview can focus on information controls, cueing, expectations, and evidential weight.',
'Paranormal ethics':'If an investigator believes even a fraction of the testimony may involve distressed consciousness, entertainment stops being a harmless frame. The question becomes what duty the living have when entering places associated with trauma and death.',
'History of contact technology':'From spirit photography and electronic voice phenomena to chatbots trained on the dead, every generation builds a new machine around the same human question: can technology mediate contact, or does it mostly teach us how badly we want an answer?'
};
const brief=$('[data-media-brief]');
$$('[data-topic]').forEach(b=>b.addEventListener('click',()=>{$$('[data-topic]').forEach(x=>x.classList.toggle('active',x===b));if(brief)brief.innerHTML='<span>'+b.dataset.topic.toUpperCase()+'</span><p>'+angles[b.dataset.topic]+'</p>'}));

const pitch='Ghosts in the Code follows historian and systems investigator Dr. Stephen Dietrich-Kolokouris from a five-minute cardiac arrest and life review into field investigation, evidential mediumship, and the emerging AI grief industry. The book asks one difficult question across all of those worlds: what survives, what only imitates survival, and how can we tell the difference?';
const copy=$('[data-copy-pitch]');
copy?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pitch);const old=copy.textContent;copy.textContent='Pitch copied';setTimeout(()=>copy.textContent=old,1800)}catch{prompt('Copy the book pitch:',pitch)}});

const state=$('[data-build-state]');
if(state)fetch('https://api.github.com/repos/skdietrich/ghosts-in-the-code/commits/main',{headers:{Accept:'application/vnd.github+json'}}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{const sha=String(d.sha||'').slice(0,7);if(sha)state.textContent='LIVE / '+sha}).catch(()=>{});
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();