(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page = location.pathname.split('/').pop() || 'index.html';
  const isLiteViewport = window.matchMedia && window.matchMedia('(max-width: 720px), (pointer: coarse)').matches;
  let motionPrepared = false;
  let motionStarted = false;
  let observer = null;

  function track(name, data){
    if(window.dhTrack) window.dhTrack(name, data || {});
  }

  if(!prefersReduced && !isLiteViewport){
    document.addEventListener('pointermove', function(e){
      document.documentElement.style.setProperty('--mx', e.clientX + 'px');
      document.documentElement.style.setProperty('--my', e.clientY + 'px');
    }, {passive:true});
  }

  function hideLoader(){
    const loader = document.getElementById('whLoader');
    if(loader){
      loader.classList.add('is-hidden');
      setTimeout(()=>loader.remove(), isLiteViewport ? 50 : 900);
    }
    document.body && document.body.classList.add('wh-motion-started');
    startMotion();
    track('wh_intro_complete', {page});
  }
  window.whSkipIntro = hideLoader;

  function setDelay(el, delay){
    el.style.setProperty('--wh-delay', delay + 'ms');
  }

  function mark(el, motion, delay){
    if(!el || el.classList.contains('wh-no-motion')) return;
    el.classList.add('wh-motion');
    if(motion) el.dataset.motion = motion;
    if(typeof delay === 'number') setDelay(el, delay);
  }

  function prepareMotion(){
    if(motionPrepared) return;
    motionPrepared = true;
    if(prefersReduced){
      document.querySelectorAll('body *').forEach(el=>el.classList.add('wh-visible'));
      return;
    }

    // Hero: dibuat muncul berurutan seperti video referensi, bukan muncul serentak.
    const heroSeq = [
      '.wh-cinema-logo', '.hero .eyebrow', '.hero h1', '.hero .sub', '.hero-cta', '.mobile-promise', '.goal-cards', '.wh-hero-microflow', '.hero-media'
    ];
    heroSeq.forEach((sel, i)=>{
      document.querySelectorAll(sel).forEach(el=>mark(el, i === heroSeq.length-1 ? 'right' : 'up', 120 + i*130));
    });

    // Section besar: reveal saat scroll.
    document.querySelectorAll('main > section, .wh-fast-lane, .retention-cockpit, .dashboard, .app-shell, .app-main').forEach((el,i)=>{
      if(!el.closest('.hero')) mark(el, 'up', Math.min(120, i*20));
    });

    // Kartu dan elemen kecil: staggered reveal.
    const groups = [
      '.wh-fast-card', '.goal-card', '.feature-card', '.problem-card', '.product-card', '.tool-card', '.article-card', '.mini-card', '.suite-card', '.cta-panel', '.panel', '.product-panel', '.story-left', '.story-quote', '.story-portrait',
      '.retention-main', '.retention-side', '.mission-card-ret', '.wallet-card', '.reward-card-ret', '.quick-tools-dock', '.score-card', '.progress-card', '.bottom-nav', '.dh-dashboard-emblem', '.mood-card', '.task-row'
    ];
    groups.forEach(sel=>{
      document.querySelectorAll(sel).forEach((el,i)=>mark(el, i % 2 ? 'up' : 'soft', (i % 8) * 85));
    });

    // Text block anak section: masuk halus satu-satu.
    document.querySelectorAll('section h2, section .section-kicker, section .section-sub, .article-section h2, .article-section p').forEach((el,i)=>{
      mark(el, 'text', (i % 4) * 70);
    });

    // Parallax ringan untuk visual besar.
    document.querySelectorAll('.hero-media, .wh-cinema-logo, .product-panel, .story-portrait').forEach((el,i)=>{
      el.classList.add('wh-parallax');
      el.style.setProperty('--parallax-depth', (i % 2 ? -0.018 : 0.022));
    });
  }

  function startMotion(){
    if(motionStarted) return;
    motionStarted = true;
    prepareMotion();
    if(prefersReduced){
      document.querySelectorAll('.wh-motion').forEach(el=>el.classList.add('wh-visible'));
      return;
    }

    observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('wh-visible');
          entry.target.classList.add('wh-play');
          observer.unobserve(entry.target);
        }
      });
    }, {root:null, threshold:0.12, rootMargin:'0px 0px -8% 0px'});

    document.querySelectorAll('.wh-motion').forEach(el=>observer.observe(el));

    // Paksa item viewport pertama muncul setelah overlay hilang, jadi efeknya keliatan.
    requestAnimationFrame(()=>{
      setTimeout(()=>{
        const vh = window.innerHeight || 800;
        document.querySelectorAll('.wh-motion').forEach(el=>{
          const r = el.getBoundingClientRect();
          if(r.top < vh * 0.92 && r.bottom > 0) el.classList.add('wh-visible','wh-play');
        });
      }, 80);
    });
  }

  function initParallax(){
    if(prefersReduced || isLiteViewport) return;
    let ticking = false;
    const update = ()=>{
      ticking = false;
      const y = window.scrollY || 0;
      document.documentElement.style.setProperty('--wh-scroll', y.toFixed(0));
      document.querySelectorAll('.wh-parallax').forEach(el=>{
        const depth = parseFloat(el.style.getPropertyValue('--parallax-depth') || '0.018');
        const move = Math.max(-22, Math.min(22, y * depth));
        el.style.setProperty('--wh-parallax-y', move.toFixed(2) + 'px');
      });
    };
    window.addEventListener('scroll', ()=>{
      if(!ticking){
        ticking = true;
        requestAnimationFrame(update);
      }
    }, {passive:true});
    update();
  }

  document.addEventListener('DOMContentLoaded', function(){
    prepareMotion();
    initParallax();
    // App page pakai intro sendiri, jadi reveal dimulai setelah intro app selesai.
    if(page === 'app.html'){
      setTimeout(startMotion, 1550);
    }
  });

  function scheduleBrandIntroExit(){
    if(page === 'app.html') return;
    setTimeout(hideLoader, isLiteViewport ? 90 : 1150);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', scheduleBrandIntroExit, {once:true});
  }else{
    scheduleBrandIntroExit();
  }

  window.addEventListener('load',()=>{
    if(page === 'app.html') return;
    setTimeout(hideLoader, isLiteViewport ? 30 : 120);
  });
  setTimeout(()=>{
    if(page === 'app.html') startMotion();
    else hideLoader();
  }, page==='app.html'?2100:(isLiteViewport ? 420 : 1600));
})();
