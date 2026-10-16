/* MonCoti v3: mascot section in the Introducing block */
(() => {
  const panel = document.querySelector('[data-mx-panel]');
  if (!panel) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Today gauge: a 270-degree ring made of six segments */
  const gauge = panel.querySelector('[data-mx-gauge]');
  const svg = gauge && gauge.querySelector('svg');
  const num = gauge && gauge.querySelector('[data-mx-num]');
  const SEGMENTS = 6;
  const TARGET = 3;
  const segs = [];
  if (svg) {
    const cx = 60, cy = 60, r = 46, sweep = 270, gapDeg = 6;
    const pt = (deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
    for (let i = 0; i < SEGMENTS; i++) {
      const a0 = 135 + (sweep / SEGMENTS) * i + gapDeg / 2;
      const a1 = 135 + (sweep / SEGMENTS) * (i + 1) - gapDeg / 2;
      const [x0, y0] = pt(a0);
      const [x1, y1] = pt(a1);
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`);
      svg.appendChild(p);
      segs.push(p);
    }
  }
  const runGauge = () => {
    if (!segs.length) return;
    if (still) { segs.slice(0, TARGET).forEach((s) => s.classList.add('is-on')); num.textContent = TARGET; return; }
    segs.forEach((s) => s.classList.remove('is-on'));
    num.textContent = '0';
    for (let i = 0; i < TARGET; i++) {
      setTimeout(() => { segs[i].classList.add('is-on'); num.textContent = String(i + 1); }, 350 + i * 320);
    }
  };

  new IntersectionObserver((entries, io) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      panel.classList.add('is-on');
      runGauge();
      io.disconnect();
    });
  }, { threshold: 0.35 }).observe(panel);

  /* preview: ?mx=2 shows the magic mascot (pull-out loop) instead of the wave; the default stays the wave */
  if (/[?&]mx=2(?:&|$)/.test(location.search)) {
    const mxStill = document.querySelector('.mx-still');
    const mxVideo = document.querySelector('.mx-video');
    if (mxStill) mxStill.src = 'assets/img/mascot-magic-poster.webp?v=7498cb37';
    if (mxVideo) mxVideo.src = 'assets/video/mascot-magic.mp4?v=0f08df72';
  }
  /* /preview */
  /* mascot loop: only play while visible; keep the still for reduced motion */
  const video = document.querySelector('.mx-video');
  if (video) {
    if (still || (navigator.connection && navigator.connection.saveData)) { video.remove(); return; }
    // warm up the loop shortly before it scrolls into view (the html says preload="none")
    new IntersectionObserver((entries, io) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      video.preload = 'auto';
      video.load();
    }, { rootMargin: '900px 0px' }).observe(video);
    const figure = video.closest('.mx-figure');
    video.addEventListener('playing', () => figure.classList.add('has-video'), { once: true });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { const p = video.play(); if (p && p.catch) p.catch(() => {}); }
      else video.pause();
    }, { threshold: 0.2 }).observe(video);
  }
})();
