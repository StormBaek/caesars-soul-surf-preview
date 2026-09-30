const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#mobile-nav');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.hidden=!open;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
matchMedia('(min-width: 761px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
const form=document.querySelector('#enquiry-form');
if(form){const interest=new URLSearchParams(location.search).get('experience');if(interest){const option=new Option(interest,interest,true,true);form.elements.experience.add(option);}
form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const message=`Hi Richard! My name is ${data.get('name')}. I’m interested in ${data.get('experience')}.\n\n${data.get('message')}`;location.href=`https://wa.me/51986031944?text=${encodeURIComponent(message)}`;});}
const reviewTrack=document.querySelector('#review-cards');
if(reviewTrack){
  const cards=[...reviewTrack.children];
  const status=document.querySelector('#review-status');
  document.querySelectorAll('.review-arrow').forEach(button=>{
    button.hidden=false;
    button.addEventListener('click',()=>{
      const direction=button.classList.contains('review-next')?1:-1;
      const gap=parseFloat(getComputedStyle(reviewTrack).gap)||0;
      const step=reviewTrack.firstElementChild.getBoundingClientRect().width+gap;
      const max=reviewTrack.scrollWidth-reviewTrack.clientWidth;
      if(max<=4){
        if(direction>0)reviewTrack.append(reviewTrack.firstElementChild);
        else reviewTrack.prepend(reviewTrack.lastElementChild);
        status.textContent='First review: '+reviewTrack.firstElementChild.querySelector('figcaption a').textContent;
      }else{
        const target=direction>0?(reviewTrack.scrollLeft>=max-4?0:Math.min(max,reviewTrack.scrollLeft+step)):(reviewTrack.scrollLeft<=4?max:Math.max(0,reviewTrack.scrollLeft-step));
        reviewTrack.scrollTo({left:target,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
        const index=Math.min(cards.length-1,Math.round(target/step));
        status.textContent='Review '+(index+1)+' of '+cards.length;
      }
    });
  });
}

// Local clips: one at a time, with replay and native sound/seek/fullscreen controls.
document.querySelectorAll('.surf-video-wrap').forEach(wrap=>{
 const video=wrap.querySelector('video'), button=wrap.querySelector('.surf-play');
 video.controls=false;
 button.addEventListener('click',()=>{if(video.ended)video.currentTime=Number(video.dataset.start)||0;video.play().catch(()=>{button.hidden=false;});});
 video.addEventListener('play',()=>{
  document.querySelectorAll('.surf-video').forEach(other=>{if(other!==video)other.pause();});
  button.hidden=true;video.controls=true;wrap.classList.add('is-playing');
 });
 video.addEventListener('ended',()=>{video.controls=false;button.hidden=false;button.setAttribute('aria-label','Replay '+video.getAttribute('aria-label'));button.querySelector('.surf-play-label').textContent='Watch again';});
 video.addEventListener('error',()=>{button.hidden=true;});
});

const lessonTrack=document.querySelector('.lesson-gallery-track');
if(lessonTrack){
 const dots=[...document.querySelectorAll('.lesson-gallery-dots button')];
 const showSlide=index=>lessonTrack.scrollTo({left:index*lessonTrack.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 dots.forEach((dot,index)=>dot.addEventListener('click',()=>showSlide(index)));
 lessonTrack.addEventListener('scroll',()=>{const index=Math.round(lessonTrack.scrollLeft/lessonTrack.clientWidth);dots.forEach((dot,i)=>{if(i===index)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});},{passive:true});
 lessonTrack.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const index=Math.round(lessonTrack.scrollLeft/lessonTrack.clientWidth);showSlide(Math.max(0,Math.min(dots.length-1,index+(event.key==='ArrowRight'?1:-1))));}});
}


// Muted ambient playback only while the feature is visible; respect motion/data preferences.
const momentVideo=document.querySelector('#surf-moment video[data-autoplay]');
if(momentVideo){
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,manuallyPaused=false,automaticPause=false;
 const syncMoment=()=>{
  const allowed=visible&&!document.hidden&&!reducedMotion.matches&&!navigator.connection?.saveData&&!manuallyPaused;
  if(allowed){automaticPause=false;momentVideo.play().catch(()=>{});}
  else if(!momentVideo.paused){automaticPause=true;momentVideo.pause();}
 };
 momentVideo.addEventListener('pause',()=>{if(!automaticPause)manuallyPaused=true;automaticPause=false;});
 momentVideo.addEventListener('play',()=>{manuallyPaused=false;});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;syncMoment();},{threshold:.3}).observe(momentVideo);
 document.addEventListener('visibilitychange',syncMoment);
 reducedMotion.addEventListener('change',syncMoment);
}

// Native dialog preserves keyboard focus and Escape dismissal.
const memoryDialog=document.querySelector('.memory-lightbox');
if(memoryDialog){
 const photo=memoryDialog.querySelector('img');
 const caption=memoryDialog.querySelector('p');
 document.querySelectorAll('[data-memory]').forEach(link=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  photo.src=link.href;photo.alt=link.querySelector('img').alt;
  caption.textContent=link.querySelector('span').textContent;
  memoryDialog.showModal();document.body.classList.add('memory-open');
 }));
 memoryDialog.querySelector('.memory-close').addEventListener('click',()=>memoryDialog.close());
 memoryDialog.addEventListener('click',event=>{if(event.target===memoryDialog){const r=memoryDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)memoryDialog.close();}});
 memoryDialog.addEventListener('close',()=>document.body.classList.remove('memory-open'));
}

const memoryNext=document.querySelector('.memory-next');
if(memoryNext){
 const photos=JSON.parse(document.querySelector('#memory-photo-data').textContent);
 const prints=[...document.querySelectorAll('.memory-board [data-memory]')];
 let memoryPage=0;
 memoryNext.hidden=false;
 memoryNext.addEventListener('click',async()=>{
  memoryNext.disabled=true;
  const nextPage=(memoryPage+1)%(photos.length/6);
  const nextPhotos=photos.slice(nextPage*6,nextPage*6+6);
  try{
   await Promise.all(nextPhotos.map(p=>new Promise((resolve,reject)=>{
    const image=new Image();image.onload=resolve;image.onerror=reject;image.src='/caesars-soul-surf-preview/media/memories/memory-'+p.file+'.jpg';
   })));
   const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const board=document.querySelector('.memory-board');
   board.classList.add('is-changing');
   board.setAttribute('aria-busy','true');
   try{
    await Promise.all(prints.map(async(link,i)=>{
     const p=nextPhotos[i],image=link.querySelector('img');
     const tilt=getComputedStyle(link).getPropertyValue('--tilt').trim()||'0deg';
     const rest='perspective(900px) rotate('+tilt+')';
     let peel;
     if(!reducedMotion){
      peel=link.animate([
       {offset:0,opacity:1,transform:rest,boxShadow:'0 5px 12px #123c4818'},
       {offset:.3,opacity:1,transform:rest+' rotateX(12deg) translateY(-3px)',boxShadow:'0 18px 24px #123c4830'},
       {offset:1,opacity:0,transform:rest+' translateY(-36px) rotateX(30deg) rotateZ(-5deg) scale(1.04)',boxShadow:'0 30px 36px #123c4800'}
      ],{duration:360,delay:i*90,fill:'forwards',easing:'cubic-bezier(.45,0,.8,.35)'});
      await peel.finished;
     }
     link.href='/caesars-soul-surf-preview/media/memories/memory-'+p.file+'.jpg';
     link.setAttribute('aria-label','Open photo: '+p.alt);
     image.src=link.href;image.alt=p.alt;image.style.objectFit=p.fit||'cover';
     link.querySelector('span').textContent=p.caption;
     if(!reducedMotion){
      const stick=link.animate([
       {offset:0,opacity:0,transform:rest+' translateY(-30px) rotateX(24deg) rotateZ(5deg) scale(1.05)',boxShadow:'0 28px 35px #123c4830'},
       {offset:.2,opacity:1,transform:rest+' translateY(-18px) rotateX(15deg) rotateZ(3deg) scale(1.035)',boxShadow:'0 20px 28px #123c4830'},
       {offset:.7,opacity:1,transform:rest+' scale(.985)',boxShadow:'0 1px 3px #123c4820'},
       {offset:.86,opacity:1,transform:rest+' scale(1.007)',boxShadow:'0 7px 14px #123c4818'},
       {offset:1,opacity:1,transform:rest,boxShadow:'0 5px 12px #123c4818'}
      ],{duration:620,fill:'both',easing:'cubic-bezier(.2,.7,.3,1)'});
      peel.cancel();
      await stick.finished;
      stick.cancel();
     }
    }));
   }finally{
    board.classList.remove('is-changing');
    board.removeAttribute('aria-busy');
   }
   memoryPage=nextPage;
   document.querySelector('#memory-page-status').textContent='Showing photo set '+(memoryPage+1)+' of '+(photos.length/6)+'.';
  }catch{
   document.querySelector('#memory-page-status').textContent='Could not load these photos. Please try again.';
  }finally{memoryNext.disabled=false;}
 });
}

// Keep the floating contact shortcut out of the hero, in both scroll directions.
const floatingContact=document.querySelector('.floating-whatsapp');
const pageHero=document.querySelector('.hero');
if(floatingContact){
 if(pageHero){
  const heroObserver=new IntersectionObserver(([entry])=>{
   const visible=!entry.isIntersecting&&entry.boundingClientRect.bottom<=0;
   floatingContact.classList.toggle('is-visible',visible);
  },{threshold:0});
  heroObserver.observe(pageHero);
 }else floatingContact.classList.add('is-visible');
}

// Compact mobile choices; preserve the expanded desktop overview.
const experienceCards=[...document.querySelectorAll('details.soft-card')];
const compactExperiences=matchMedia('(max-width:760px)');
function sizeExperienceCards(){experienceCards.forEach(card=>{card.open=!compactExperiences.matches;});}
sizeExperienceCards();
compactExperiences.addEventListener('change',sizeExperienceCards);
experienceCards.forEach(card=>{
 card.querySelector('summary').addEventListener('click',event=>{
  if(!compactExperiences.matches){event.preventDefault();return;}
  if(!card.open)experienceCards.forEach(other=>{if(other!==card)other.open=false;});
 });
});
