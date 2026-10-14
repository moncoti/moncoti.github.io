/* MonCoti v3, bottom half: Workspace accordion, Today live card, review / run cards, background themes */
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = q('.v3b');
  if (!root) return;

  /* ---------- background theme ---------- */
  const THEMES = [
    ['soft', '최종 A+B'],
    ['neutral', 'A 뉴트럴'],
    ['apple', 'B 애플'],
    ['google', 'C 구글'],
    ['aurora', 'D 오로라'],
  ];
  const fromUrl = new URLSearchParams(location.search).get('bg');
  if (THEMES.some(([k]) => k === fromUrl)) root.dataset.bg = fromUrl;
  if (document.body.hasAttribute('data-draft')) {
    const bar = document.createElement('div');
    bar.className = 'bg-switch';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', '배경 시안 바꾸기');
    bar.innerHTML = '<b>배경 시안</b>' + THEMES.map(([k, label]) => `<button type="button" data-bg-set="${k}">${label}</button>`).join('');
    root.appendChild(bar);
    const sync = () => qa('[data-bg-set]', bar).forEach((b) => b.classList.toggle('is-on', b.dataset.bgSet === root.dataset.bg));
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-bg-set]');
      if (!b) return;
      root.dataset.bg = b.dataset.bgSet;
      const u = new URL(location.href);
      u.searchParams.set('bg', b.dataset.bgSet);
      try { history.replaceState(null, '', u); } catch (err) { /* about:blank previews */ }
      sync();
    });
    sync();
    // only show the switcher while the redesigned bottom half is on screen
    new IntersectionObserver(([e]) => bar.classList.toggle('is-show', e.isIntersecting), { rootMargin: '0px 0px -30% 0px' }).observe(root);
  }

  /* run a loop only while its element is on screen */
  function whileVisible(el, run, threshold = 0.3) {
    if (!el) return;
    let token = 0;
    let on = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) {
        on = true;
        const t = ++token;
        run(() => t !== token);
      } else if (!e.isIntersecting && on) {
        on = false;
        token++;
      }
    }, { threshold }).observe(el);
  }

  async function typeText(el, text, cancelled, speed = [90, 140]) {
    el.textContent = '';
    for (const ch of text) {
      if (cancelled()) return;
      el.textContent += ch;
      await sleep(speed[0] + Math.random() * (speed[1] - speed[0]));
    }
  }

  /* ---------- Workspace accordion ---------- */
  const acc = q('[data-acc]');
  if (acc) {
    const wrap = acc.closest('.acc-wrap');
    const items = qa('.acc-item', acc);
    const dots = qa('.acc-dot', wrap);
    const playBtn = q('[data-acc-play]', wrap);
    const canHover = matchMedia('(hover: hover) and (pointer: fine)');
    let active = Math.max(0, items.findIndex((i) => i.classList.contains('is-active')));
    let typeToken = 0;

    const sizeAcc = () => {
      const cs = getComputedStyle(acc);
      const cw = parseFloat(cs.getPropertyValue('--cw')) || 104;
      const gap = parseFloat(cs.columnGap) || 16;
      acc.style.setProperty('--open-w', Math.max(320, Math.round(acc.clientWidth - (items.length - 1) * (cw + gap))) + 'px');
    };
    sizeAcc();
    addEventListener('resize', sizeAcc);

    const typeDrive = (item) => {
      const field = q('.gd__q', item);
      if (!field) return;
      const t = ++typeToken;
      field.textContent = '';
      if (still) { field.textContent = field.dataset.typed; return; }
      sleep(650).then(() => typeText(field, field.dataset.typed, () => t !== typeToken || !item.classList.contains('is-active')));
    };

    const setActive = (i) => {
      if (i === active || i < 0) return;
      active = i;
      items.forEach((it, k) => {
        it.classList.toggle('is-active', k === i);
        q('.acc-hit', it).setAttribute('aria-expanded', String(k === i));
      });
      dots.forEach((d, k) => {
        d.classList.toggle('is-on', k === i);
        d.setAttribute('aria-current', k === i ? 'true' : 'false');
      });
      typeDrive(items[i]);
    };

    // hover follows real pointer movement only, so cards sliding under a resting cursor do not chain-activate
    let lx = -1;
    let ly = -1;
    acc.addEventListener('mousemove', (e) => {
      if (!canHover.matches || (e.clientX === lx && e.clientY === ly)) return;
      lx = e.clientX;
      ly = e.clientY;
      const it = e.target.closest('.acc-item');
      if (it) setActive(items.indexOf(it));
    });

    items.forEach((it, i) => {
      const hit = q('.acc-hit', it);
      hit.addEventListener('click', () => setActive(i));
      hit.addEventListener('focus', () => setActive(i));
      hit.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); q('.acc-hit', items[(i + 1) % items.length]).focus(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); q('.acc-hit', items[(i - 1 + items.length) % items.length]).focus(); }
      });
    });

    // Apple-style control: the active dot stretches and fills; when it is full, the next card opens
    dots.forEach((d, i) => {
      d.addEventListener('click', () => setActive(i));
      q('i', d).addEventListener('animationend', () => {
        if (still || !d.classList.contains('is-on') || wrap.classList.contains('is-stopped')) return;
        setActive((i + 1) % items.length);
      });
    });
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const stopped = wrap.classList.toggle('is-stopped');
        playBtn.setAttribute('aria-label', stopped ? '자동 넘김 다시 시작' : '자동 넘김 멈추기');
      });
    }
    if (still) wrap.classList.add('is-stopped');

    acc.addEventListener('mouseenter', () => { if (canHover.matches) wrap.classList.add('is-paused'); });
    acc.addEventListener('mouseleave', () => wrap.classList.remove('is-paused'));
    acc.addEventListener('focusin', () => wrap.classList.add('is-paused'));
    acc.addEventListener('focusout', () => wrap.classList.remove('is-paused'));
    if (!still) new IntersectionObserver(([e]) => wrap.classList.toggle('is-auto', e.isIntersecting), { threshold: 0.35 }).observe(acc);
    typeDrive(items[active]);
  }

  /* ---------- fake cursor helper for the control cards ---------- */
  function makeCursor(media) {
    const c = q('[data-cursor]', media);
    const place = (x, y) => { c.style.setProperty('--cx', x + 'px'); c.style.setProperty('--cy', y + 'px'); };
    const rest = () => place(media.clientWidth * 0.82, media.clientHeight * 0.86);
    rest();
    return {
      hide() { c.classList.remove('is-on'); },
      show() { c.classList.add('is-on'); },
      rest,
      to(el) {
        const m = media.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        place(r.left - m.left + r.width * 0.55, r.top - m.top + r.height * 0.55);
      },
      async click() {
        c.classList.remove('is-click');
        void c.offsetWidth;
        c.classList.add('is-click');
        await sleep(120);
      },
    };
  }

  /* ---------- Today (TestSprite-style live card) ---------- */
  const today = q('[data-today]');
  if (today) {
    const row = (k) => q(`[data-row="${k}"]`, today);
    const rows = { fresh: row('new'), a: row('a'), b: row('b'), toast: row('toast') };
    const list = q('.today__list', today);
    const ack = q('[data-t-ack]', today);
    const pillText = q('[data-t-new] span', today);
    const status = q('[data-t-status]', today);
    const setStatus = async (text) => {
      status.style.opacity = '0';
      await sleep(180);
      status.textContent = text;
      status.style.opacity = '1';
    };
    const reset = () => {
      today.classList.add('no-anim');
      rows.fresh.classList.add('is-hidden');
      rows.toast.classList.add('is-hidden');
      rows.a.classList.remove('is-hidden', 'is-selected');
      rows.b.classList.remove('is-hidden');
      pillText.textContent = '새 상황 2개';
      status.textContent = '확인할 상황 2개';
      void today.offsetHeight;
      today.classList.remove('no-anim');
    };
    reset();
    if (!still) {
      whileVisible(today, async (cancelled) => {
        reset();
        let first = true;
        while (!cancelled()) {
          if (!first) {
            list.classList.add('is-fade');
            await sleep(320);
            reset();
            list.classList.remove('is-fade');
          }
          first = false;
          await sleep(2400); if (cancelled()) return;
          rows.a.classList.add('is-selected');
          setStatus('선택한 상황 1개');
          await sleep(2000); if (cancelled()) return;
          ack.classList.add('is-pressed');
          await sleep(240);
          ack.classList.remove('is-pressed');
          rows.a.classList.add('is-hidden');
          rows.toast.classList.remove('is-hidden');
          pillText.textContent = '새 상황 1개';
          setStatus('확인할 상황 1개 · 처리 기록 5');
          await sleep(2600); if (cancelled()) return;
          rows.toast.classList.add('is-hidden');
          rows.fresh.classList.remove('is-hidden');
          pillText.textContent = '새 상황 2개';
          setStatus('확인할 상황 2개 · 처리 기록 5');
          await sleep(3400);
        }
      });
    }
  }

  /* ---------- Asks before it acts ---------- */
  const rv = q('[data-review]');
  if (rv) {
    const media = rv.closest('.tcard__media');
    const send = q('[data-rv-send]', rv);
    const state = q('[data-rv-state]', rv);
    const cur = makeCursor(media);
    const reset = () => { rv.dataset.state = 'wait'; state.textContent = '확인 대기'; };
    reset();
    if (still) {
      rv.dataset.state = 'sent';
      state.textContent = '보냄';
    } else {
      whileVisible(media, async (cancelled) => {
        while (!cancelled()) {
          reset();
          cur.hide();
          cur.rest();
          await sleep(1500); if (cancelled()) return;
          cur.show();
          await sleep(250);
          cur.to(send);
          await sleep(1000); if (cancelled()) return;
          await cur.click();
          send.classList.add('is-pressed');
          await sleep(180);
          send.classList.remove('is-pressed');
          rv.dataset.state = 'sent';
          state.textContent = '보냄';
          await sleep(700);
          cur.rest();
          cur.hide();
          await sleep(3000);
        }
      });
    }
  }

  /* ---------- Stops when you say ---------- */
  const run = q('[data-run]');
  if (run) {
    const media = run.closest('.tcard__media');
    const fill = q('[data-run-fill]', run);
    const st = q('[data-run-state]', run);
    const msg = q('[data-run-status]', run);
    const stop = q('[data-run-stop]', run);
    const resume = q('[data-run-resume]', run);
    const cur = makeCursor(media);
    const setState = (s, label, text) => {
      run.dataset.state = s;
      st.textContent = label;
      msg.style.opacity = '0';
      setTimeout(() => { msg.textContent = text; msg.style.opacity = '1'; }, 160);
    };
    const fillTo = (pct, ms) => { fill.style.transitionDuration = ms + 'ms'; fill.style.width = pct + '%'; };
    const freeze = () => { const w = fill.getBoundingClientRect().width / fill.parentElement.getBoundingClientRect().width * 100; fillTo(w, 0); };
    if (still) {
      setState('done', '완료', '견적서 표 정리를 마쳤어요');
      fillTo(100, 0);
    } else {
      whileVisible(media, async (cancelled) => {
        while (!cancelled()) {
          cur.hide();
          cur.rest();
          fillTo(0, 0);
          setState('running', '진행 중', '표 서식을 맞추는 중이에요');
          await sleep(120);
          fillTo(52, 2800);
          await sleep(1500); if (cancelled()) return;
          cur.show();
          await sleep(200);
          cur.to(stop);
          await sleep(1000); if (cancelled()) return;
          await cur.click();
          stop.classList.add('is-pressed');
          await sleep(160);
          stop.classList.remove('is-pressed');
          freeze();
          setState('paused', '멈춤', '멈췄어요. 이어서 맡기거나 직접 하셔도 돼요.');
          await sleep(1900); if (cancelled()) return;
          cur.to(resume);
          await sleep(1000); if (cancelled()) return;
          await cur.click();
          resume.classList.add('is-pressed');
          await sleep(160);
          resume.classList.remove('is-pressed');
          setState('running', '진행 중', '다시 이어서 하는 중이에요');
          fillTo(100, 2200);
          await sleep(400);
          cur.rest();
          cur.hide();
          await sleep(1900); if (cancelled()) return;
          setState('done', '완료', '견적서 표 정리를 마쳤어요');
          await sleep(2800);
        }
      });
    }
  }
})();
