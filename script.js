(()=>{'use strict';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

const progress=$('[data-progress]');
const updateProgress=()=>{
  if(!progress)return;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.width=(max>0?Math.min(100,(window.scrollY/max)*100):0)+'%';
};
updateProgress();
window.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress,{passive:true});

const header=$('[data-header]');
const toggle=$('.nav-toggle');
if(header&&toggle){
  toggle.addEventListener('click',()=>{
    const open=header.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.textContent=open?'Close':'Menu';
  });
  $$('.site-nav a',header).forEach(a=>a.addEventListener('click',()=>{
    header.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    toggle.textContent='Menu';
  }));
}

const revealTargets=$$('.reveal');
if('IntersectionObserver'in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  revealTargets.forEach(el=>observer.observe(el));
}else{
  revealTargets.forEach(el=>el.classList.add('in'));
}

const recordData={
  death:{
    label:'01 / DEATH',
    title:'The body stops. The story does not.',
    quote:'“No light. No voice.”',
    copy:'A five-minute cardiac arrest becomes the engine of the book. Not certainty. Not reassurance. A boundary event that leaves the witness with a problem he cannot file away.',
    route:'CHAPTER PATH / THE THRESHOLD'
  },
  review:{
    label:'02 / REVIEW',
    title:'The review is not watched. It is felt.',
    quote:'“Not comfort. Accounting.”',
    copy:'The moral center of the book is an accounting experienced from inside the people who carried the cost. Reputation drops away. Intention and consequence remain.',
    route:'CHAPTER PATH / THE LEDGER'
  },
  field:{
    label:'03 / FIELD',
    title:'The rooms become part of the record.',
    quote:'“Investigation is the wrong word. Search and rescue.”',
    copy:'Field nights introduce place, method, access, witness controls, empty hours and the discipline of refusing to turn atmosphere into proof just because the story wants it.',
    route:'CHAPTER PATH / FIELD NIGHTS'
  },
  medium:{
    label:'04 / MEDIUMSHIP',
    title:'A claim is only useful if the conditions matter.',
    quote:'“Belief is not a protocol.”',
    copy:'The mediumship material is treated as something to examine under limits rather than accept or dismiss by reflex. Information control, cueing, contamination and evidential weight all matter.',
    route:'CHAPTER PATH / TESTING THE CLAIM'
  },
  machine:{
    label:'05 / MACHINE',
    title:'The newest machine asks the oldest question.',
    quote:'“The dead in the box are perfectly agreeable.”',
    copy:'AI can reconstruct voice, personality cues and memory fragments well enough to create emotional presence. The problem is no longer only whether the dead can speak. It is whether imitation can be mistaken for contact.',
    route:'CHAPTER PATH / THE DIGITAL SÉANCE'
  }
};

const record=$('[data-record]');
if(record){
  const tabs=$$('[data-record-tab]',record);
  const label=$('[data-record-label]',record);
  const title=$('[data-record-title]',record);
  const quote=$('[data-record-quote]',record);
  const copy=$('[data-record-copy]',record);
  const route=$('[data-record-route]',record);

  const activate=key=>{
    const item=recordData[key]||recordData.death;
    tabs.forEach(tab=>{const selected=tab.dataset.recordTab===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
    if(label)label.textContent=item.label;
    if(title)title.textContent=item.title;
    if(quote)quote.textContent=item.quote;
    if(copy)copy.textContent=item.copy;
    if(route)route.textContent=item.route;
  };

  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activate(tab.dataset.recordTab));
    tab.addEventListener('keydown',e=>{
      if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key))return;
      e.preventDefault();
      const forward=['ArrowRight','ArrowDown'].includes(e.key);
      const next=(index+(forward?1:-1)+tabs.length)%tabs.length;
      tabs[next].focus();
      activate(tabs[next].dataset.recordTab);
    });
  });
}

const topics={
  nde:'A historian who spent his career weighing documents becomes the primary document after a five-minute cardiac arrest. The interview is about what happens when a trained skeptic has to audit his own most consequential testimony.',
  ai:'Synthetic voice and personality systems are turning grief into an interface. The conversation is about the line between memorial, simulation, evidence, and a product that can answer in the voice of someone who died.',
  evidence:'Paranormal claims become interesting only after suggestion, contamination, memory drift and incentives are treated as problems. The angle is method: what controls can and cannot establish.',
  mediumship:'The book treats mediumship as a claim that deserves structure rather than automatic belief or ridicule. The conversation can focus on information controls, cueing, expectation and evidential weight.',
  ethics:'If an investigator believes even a fraction of the testimony may involve distressed consciousness, entertainment stops being a harmless frame. The question becomes what duty the living have when entering places associated with trauma and death.',
  history:'From spirit photography and electronic voice phenomena to chatbots trained on the dead, every generation builds a new machine around the same human question: can technology mediate contact, or does it mostly teach us how badly we want an answer?'
};

const brief=$('[data-media-brief]');
$$('[data-topic]').forEach(button=>{
  button.addEventListener('click',()=>{
    $$('[data-topic]').forEach(b=>b.classList.toggle('active',b===button));
    const text=topics[button.dataset.topic]||'';
    if(brief)brief.innerHTML='<span>'+button.textContent.toUpperCase()+'</span><p>'+text+'</p>';
  });
});

const pitch='Ghosts in the Code follows historian and systems investigator Dr. Stephen Dietrich-Kolokouris from a five-minute cardiac arrest and life review into field investigation, evidential mediumship, and the emerging AI grief industry. The book asks one difficult question across all of those worlds: what survives, what only imitates survival, and how can we tell the difference?';
const copyButton=$('[data-copy-pitch]');
if(copyButton){
  copyButton.addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(pitch);
      const previous=copyButton.textContent;
      copyButton.textContent='Pitch copied';
      setTimeout(()=>copyButton.textContent=previous,1800);
    }catch{
      window.prompt('Copy the book pitch:',pitch);
    }
  });
}

})();