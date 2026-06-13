// THE VAULT - interactive layer
document.addEventListener('DOMContentLoaded',function(){
  // Solid nav on scroll
  var nav=document.querySelector('.nav');
  if(nav){
    var onScroll=function(){ if(window.scrollY>40){nav.classList.add('solid');}else{nav.classList.remove('solid');} };
    window.addEventListener('scroll',onScroll); onScroll();
  }
  // Mobile menu
  var menuBtn=document.querySelector('.menu-btn');
  var links=document.querySelector('.nav-links');
  if(menuBtn&&links){ menuBtn.addEventListener('click',function(){links.classList.toggle('open');}); }
  // Reveal on scroll
  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    },{threshold:.15});
    reveals.forEach(function(r){io.observe(r);});
  } else { reveals.forEach(function(r){r.classList.add('in');}); }
  // Animated stat counters
  var nums=document.querySelectorAll('.stat .num[data-count]');
  if(nums.length&&'IntersectionObserver' in window){
    var io2=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var el=e.target; var target=parseInt(el.getAttribute('data-count'),10); var suffix=el.getAttribute('data-suffix')||'';
          var cur=0; var step=Math.max(1,Math.floor(target/60));
          var t=setInterval(function(){ cur+=step; if(cur>=target){cur=target;clearInterval(t);} el.textContent=cur.toLocaleString()+suffix; },20);
          io2.unobserve(el);
        }
      });
    },{threshold:.5});
    nums.forEach(function(n){io2.observe(n);});
  }
});

// Ambient engine sound (WebAudio - no external files needed)
(function(){
  var ctx=null, running=false, nodes=[];
  function start(){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    var master=ctx.createGain(); master.gain.value=0.0; master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime+1.2);
    // low rumble
    var o1=ctx.createOscillator(); o1.type='sawtooth'; o1.frequency.value=58;
    var g1=ctx.createGain(); g1.gain.value=0.5;
    var lfo=ctx.createOscillator(); lfo.frequency.value=6; var lg=ctx.createGain(); lg.gain.value=14;
    lfo.connect(lg); lg.connect(o1.frequency);
    var o2=ctx.createOscillator(); o2.type='sine'; o2.frequency.value=92; var g2=ctx.createGain(); g2.gain.value=0.25;
    var filt=ctx.createBiquadFilter(); filt.type='lowpass'; filt.frequency.value=220;
    o1.connect(g1); o2.connect(g2); g1.connect(filt); g2.connect(filt); filt.connect(master);
    o1.start(); o2.start(); lfo.start();
    nodes=[o1,o2,lfo,master];
  }
  function stop(){ if(ctx){ try{nodes[3].gain.linearRampToValueAtTime(0,ctx.currentTime+0.4);}catch(e){} var c=ctx; setTimeout(function(){c.close();},600); ctx=null; } }
  window.__toggleAmbient=function(btn){
    if(!running){ start(); running=true; btn.textContent='II'; btn.title='Pause ambient idle'; }
    else { stop(); running=false; btn.textContent='\u266A'; btn.title='Play ambient idle'; }
  };
})();

// Exhaust rev (one-shot WebAudio burst) for detail pages
window.__rev=function(){
  var ctx=new (window.AudioContext||window.webkitAudioContext)();
  var master=ctx.createGain(); master.gain.value=0.0001; master.connect(ctx.destination);
  var o=ctx.createOscillator(); o.type='sawtooth';
  var filt=ctx.createBiquadFilter(); filt.type='lowpass'; filt.frequency.value=400;
  o.connect(filt); filt.connect(master);
  var t=ctx.currentTime;
  o.frequency.setValueAtTime(70,t);
  o.frequency.exponentialRampToValueAtTime(260,t+0.35);
  o.frequency.exponentialRampToValueAtTime(90,t+1.1);
  filt.frequency.setValueAtTime(300,t);
  filt.frequency.exponentialRampToValueAtTime(1800,t+0.35);
  filt.frequency.exponentialRampToValueAtTime(400,t+1.1);
  master.gain.exponentialRampToValueAtTime(0.18,t+0.08);
  master.gain.exponentialRampToValueAtTime(0.12,t+0.5);
  master.gain.exponentialRampToValueAtTime(0.0001,t+1.3);
  o.start(t); o.stop(t+1.35);
  setTimeout(function(){ctx.close();},1600);
};
