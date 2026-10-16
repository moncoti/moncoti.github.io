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

/* ---------- workspace points (01-03): looping card visuals ---------- */
(() => {
  const cards = [...document.querySelectorAll('[data-pt]')];
  if (!cards.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const stage = (el, n) => { for (let i = 1; i <= 6; i++) el.classList.toggle('s' + i, i <= n); };

  const runSteps = (el) => [...el.querySelectorAll('[data-step]')];
  const runReset = (el) => {
    el.classList.remove('is-done');
    runSteps(el).forEach((s) => { s.className = ''; });
    el.querySelector('[data-run-bar]').style.width = '0%';
    el.querySelector('[data-run-n]').textContent = '0';
    el.querySelector('[data-run-state]').textContent = '진행 중';
  };
  const runFinal = (el) => {
    const steps = runSteps(el);
    steps.forEach((s) => { s.className = 'is-ok'; });
    el.querySelector('[data-run-bar]').style.width = '100%';
    el.querySelector('[data-run-n]').textContent = String(steps.length);
    el.querySelector('[data-run-state]').textContent = '완료';
    el.classList.add('is-done');
  };

  const plays = {
    // 01: one request -> plan, read, fetch, build, review; each step spins then ticks
    async run(el, alive) {
      runReset(el);
      await wait(800);
      const steps = runSteps(el);
      for (let i = 0; i < steps.length; i++) {
        if (!alive()) return;
        steps[i].className = 'is-run';
        await wait(i === 0 ? 700 : 950);
        if (!alive()) return;
        steps[i].className = 'is-ok';
        el.querySelector('[data-run-n]').textContent = String(i + 1);
        el.querySelector('[data-run-bar]').style.width = ((i + 1) / steps.length) * 100 + '%';
        await wait(200);
      }
      el.querySelector('[data-run-state]').textContent = '완료';
      el.classList.add('is-done');
      await wait(3000);
    },
    // 02: a decision in someone's message is spotted, then filed into the team's playbook
    async know(el, alive) {
      stage(el, 0);
      const beats = [700, 700, 650, 450, 450, 500];
      for (let i = 0; i < beats.length; i++) {
        await wait(beats[i]);
        if (!alive()) return;
        stage(el, i + 1);
      }
      await wait(3200);
    },
    // 03: the user fixes a draft, the fix is kept, the same correction stops coming back
    async learn(el, alive) {
      stage(el, 0);
      const beats = [800, 700, 900, 700, 800];
      for (let i = 0; i < beats.length; i++) {
        await wait(beats[i]);
        if (!alive()) return;
        stage(el, i + 1);
      }
      await wait(3200);
    },
  };
  const finals = { run: runFinal, know: (el) => stage(el, 6), learn: (el) => stage(el, 5) };

  cards.forEach((el) => {
    const kind = el.dataset.pt;
    if (!plays[kind]) return;
    if (reduce) { finals[kind](el); return; }
    let visible = false;
    let running = false;
    const loop = async () => {
      if (running) return;
      running = true;
      while (visible) await plays[kind](el, () => visible);
      running = false;
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) loop();
    }, { threshold: 0.35 }).observe(el);
  });
})();
/* ---------- /workspace points ---------- */
