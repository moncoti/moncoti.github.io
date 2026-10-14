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
    // bottom.css loads without blocking, so the row can still change size after this runs: re-measure when it does
    if ('ResizeObserver' in window) new ResizeObserver(() => sizeAcc()).observe(acc);
    addEventListener('load', sizeAcc);

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

  /* ---------- Capabilities: live MonCoti screens ---------- */
  const capCard = (name) => q(`[data-cap="${name}"]`);
  const setChip = (chip, c, text) => {
    if (!chip) return;
    chip.dataset.c = c;
    const t = q('[data-chip]', chip);
    if (t && text) t.textContent = text;
  };
  const press = async (el, ms = 170) => {
    el.classList.add('is-pressed');
    await sleep(ms);
    el.classList.remove('is-pressed');
  };
  const instant = (el, fn) => {
    const prev = el.style.transition;
    el.style.transition = 'none';
    fn();
    void el.offsetWidth;
    el.style.transition = prev;
  };

  // 1. browser use: read the table row by row, then download the PDF
  (() => {
    const card = capCard('web');
    if (!card) return;
    const media = q('.tcard__media', card);
    const chip = q('.mk-chip', card);
    const table = q('.mk-web__table', card);
    const rows = qa('[data-row]', card);
    const hl = q('[data-hl]', card);
    const read = q('[data-step="read"]', card);
    const get = q('[data-step="get"]', card);
    const dl = q('[data-dl]', card);
    const file = q('[data-file]', card);
    const fill = q('[data-file-fill]', card);
    const cur = makeCursor(media);
    const hlTo = (row) => {
      const t = table.getBoundingClientRect();
      const r = row.getBoundingClientRect();
      hl.style.top = (r.top - t.top) + 'px';
      hl.style.height = r.height + 'px';
    };
    const reset = () => {
      setChip(chip, 'run', '읽는 중');
      read.dataset.s = 'run';
      get.dataset.s = 'wait';
      hl.classList.remove('is-on');
      file.classList.remove('is-on');
      instant(fill, () => { fill.style.width = '0'; });
    };
    if (still) {
      setChip(chip, 'ok', '완료');
      read.dataset.s = 'ok';
      get.dataset.s = 'ok';
      file.classList.add('is-on');
      fill.style.width = '100%';
      return;
    }
    whileVisible(media, async (cancelled) => {
      while (!cancelled()) {
        reset();
        cur.hide();
        cur.rest();
        await sleep(900); if (cancelled()) return;
        instant(hl, () => hlTo(rows[0]));
        hl.classList.add('is-on');
        for (const r of rows) {
          hlTo(r);
          await sleep(780); if (cancelled()) return;
        }
        hl.classList.remove('is-on');
        read.dataset.s = 'ok';
        await sleep(350);
        cur.show();
        await sleep(200);
        cur.to(dl);
        await sleep(1000); if (cancelled()) return;
        await cur.click();
        await press(dl);
        get.dataset.s = 'run';
        setChip(chip, 'run', '받는 중');
        file.classList.add('is-on');
        await sleep(300);
        fill.style.width = '100%';
        cur.rest();
        cur.hide();
        await sleep(1250); if (cancelled()) return;
        get.dataset.s = 'ok';
        setChip(chip, 'ok', '완료');
        await sleep(3000);
      }
    });
  })();

  // 2. pc use: approve the folder, make a copy, pick the copy's window, fill the cells
  (() => {
    const card = capCard('pc');
    if (!card) return;
    const media = q('.tcard__media', card);
    const ask = q('[data-ask]', card);
    const allow = q('[data-allow]', card);
    const files = q('[data-files]', card);
    const src = q('[data-src]', card);
    const copy = q('[data-copy]', card);
    const sheet = q('[data-sheet]', card);
    const cells = qa('[data-cell]', card);
    const saved = q('[data-saved]', card);
    const cur = makeCursor(media);
    const reset = () => {
      ask.classList.remove('is-ok', 'is-gone');
      files.classList.remove('is-on');
      src.classList.remove('is-sel');
      copy.classList.remove('is-on', 'is-sel');
      sheet.classList.remove('is-on', 'is-picked');
      cells.forEach((c) => c.classList.remove('is-typing', 'is-done'));
      saved.classList.remove('is-on');
    };
    if (still) {
      ask.classList.add('is-gone');
      files.classList.add('is-on');
      copy.classList.add('is-on');
      sheet.classList.add('is-on', 'is-picked');
      cells.forEach((c) => c.classList.add('is-done'));
      saved.classList.add('is-on');
      return;
    }
    whileVisible(media, async (cancelled) => {
      while (!cancelled()) {
        reset();
        cur.hide();
        cur.rest();
        await sleep(1100); if (cancelled()) return;
        cur.show();
        await sleep(200);
        cur.to(allow);
        await sleep(1000); if (cancelled()) return;
        await cur.click();
        await press(allow);
        ask.classList.add('is-ok');
        await sleep(650);
        ask.classList.add('is-gone');
        cur.rest();
        cur.hide();
        files.classList.add('is-on');
        await sleep(800); if (cancelled()) return;
        src.classList.add('is-sel');
        await sleep(600);
        copy.classList.add('is-on');
        await sleep(450);
        src.classList.remove('is-sel');
        copy.classList.add('is-sel');
        await sleep(700); if (cancelled()) return;
        sheet.classList.add('is-on');
        await sleep(450);
        sheet.classList.add('is-picked');
        await sleep(650);
        for (const c of cells) {
          c.classList.add('is-typing');
          await sleep(430); if (cancelled()) return;
          c.classList.remove('is-typing');
          c.classList.add('is-done');
        }
        await sleep(250);
        saved.classList.add('is-on');
        await sleep(3200);
      }
    });
  })();

  // 3. workflows: start from the suggestion, run the steps in order
  (() => {
    const card = capCard('flow');
    if (!card) return;
    const media = q('.tcard__media', card);
    const chip = q('.mk-chip', card);
    const sug = q('[data-sug]', card);
    const start = q('[data-start]', card);
    const steps = qa('.mk-flow__steps .mk-step', card);
    const out = q('[data-out]', card);
    const cur = makeCursor(media);
    const reset = () => {
      setChip(chip, 'idle', '제안');
      sug.classList.remove('is-gone');
      steps.forEach((s) => { s.dataset.s = 'wait'; });
      out.classList.remove('is-on');
    };
    if (still) {
      setChip(chip, 'ok', '완료');
      sug.classList.add('is-gone');
      steps.forEach((s) => { s.dataset.s = 'ok'; });
      out.classList.add('is-on');
      return;
    }
    whileVisible(media, async (cancelled) => {
      while (!cancelled()) {
        reset();
        cur.hide();
        cur.rest();
        await sleep(1200); if (cancelled()) return;
        cur.show();
        await sleep(200);
        cur.to(start);
        await sleep(1000); if (cancelled()) return;
        await cur.click();
        await press(start);
        sug.classList.add('is-gone');
        setChip(chip, 'run', '진행 중');
        cur.rest();
        cur.hide();
        await sleep(350);
        for (const s of steps) {
          s.dataset.s = 'run';
          await sleep(950); if (cancelled()) return;
          s.dataset.s = 'ok';
          await sleep(160);
        }
        out.classList.add('is-on');
        setChip(chip, 'ok', '완료');
        await sleep(3400);
      }
    });
  })();

  // 4. parallel runs: two lanes move at once, a correction lands mid-run
  (() => {
    const card = capCard('par');
    if (!card) return;
    const media = q('.tcard__media', card);
    const lane = (k) => {
      const el = q(`[data-lane="${k}"]`, card);
      return { el, fill: q('[data-fill]', el), st: q('[data-st]', el), lines: qa('.lane__lines i', el), fix: q('[data-fix]', el) };
    };
    const A = lane('a');
    const B = lane('b');
    const comp = q('.mk-par__composer', card);
    const input = q('.mk-par__input', card);
    const send = q('[data-send]', card);
    const WIDTHS = ['92%', '76%', '54%'];
    const setSt = async (L, text) => {
      L.st.style.opacity = '0';
      await sleep(160);
      L.st.textContent = text;
      L.st.style.opacity = '1';
    };
    const setFill = (L, pct, ms) => { L.fill.style.transitionDuration = ms + 'ms'; L.fill.style.width = pct + '%'; };
    const lines = (L, n) => L.lines.forEach((i, k) => { i.style.width = k < n ? WIDTHS[k] : '0'; });
    const reset = () => {
      [A, B].forEach((L) => {
        L.el.classList.remove('is-done');
        setFill(L, 0, 0);
        L.lines.forEach((i) => instant(i, () => { i.style.width = '0'; }));
      });
      A.st.textContent = '채널별 수치 모으는 중';
      B.st.textContent = '제안 포인트 정리 중';
      A.fix.classList.remove('is-on');
      input.textContent = '';
      comp.classList.remove('is-focus');
      send.classList.remove('is-ready');
    };
    if (still) {
      [A, B].forEach((L) => { L.el.classList.add('is-done'); setFill(L, 100, 0); lines(L, 3); });
      A.st.textContent = '완료 · 표 1개';
      B.st.textContent = '완료 · 초안 1개';
      return;
    }
    whileVisible(media, async (cancelled) => {
      while (!cancelled()) {
        reset();
        await sleep(700); if (cancelled()) return;
        setFill(A, 38, 2400);
        setFill(B, 30, 2400);
        lines(A, 1);
        lines(B, 1);
        await sleep(1300); if (cancelled()) return;
        comp.classList.add('is-focus');
        await typeText(input, input.dataset.typed, cancelled, [45, 85]); if (cancelled()) return;
        send.classList.add('is-ready');
        await sleep(350);
        await press(send);
        input.textContent = '';
        send.classList.remove('is-ready');
        comp.classList.remove('is-focus');
        A.fix.classList.add('is-on');
        setSt(A, '지난달 대비 표로 바꾸는 중');
        setSt(B, '메일 본문 쓰는 중');
        setFill(A, 70, 2200);
        setFill(B, 64, 2200);
        lines(A, 2);
        lines(B, 2);
        await sleep(2400); if (cancelled()) return;
        A.fix.classList.remove('is-on');
        setFill(A, 100, 1500);
        setFill(B, 100, 1900);
        lines(A, 3);
        lines(B, 3);
        await sleep(1550); if (cancelled()) return;
        A.el.classList.add('is-done');
        setSt(A, '완료 · 표 1개');
        await sleep(420);
        B.el.classList.add('is-done');
        setSt(B, '완료 · 초안 1개');
        await sleep(3200);
      }
    });
  })();

  // 5. files: a big upload drops, resumes, finishes; the result goes to Drive
  (() => {
    const card = capCard('file');
    if (!card) return;
    const media = q('.tcard__media', card);
    const chip = q('.mk-chip', card);
    const pages = qa('.pdfv__page', card);
    const pg = q('[data-pg]', card);
    const up = q('[data-up]', card);
    const upFill = q('[data-up-fill]', card);
    const upSt = q('[data-up-st]', card);
    const ex = q('[data-ex]', card);
    const exBtn = q('[data-export]', card);
    const cur = makeCursor(media);
    const showPage = (k) => {
      pages.forEach((p, i) => p.classList.toggle('on', i === k));
      pg.textContent = (k + 1) + ' / 12';
    };
    const upTo = (pct, ms) => { upFill.style.transitionDuration = ms + 'ms'; upFill.style.width = pct + '%'; };
    const count = async (from, to, ms, label, cancelled) => {
      const n = 14;
      for (let i = 1; i <= n; i++) {
        if (cancelled()) return;
        upSt.textContent = label + ' ' + Math.round(from + (to - from) * i / n) + '%';
        await sleep(ms / n);
      }
    };
    const reset = () => {
      up.classList.remove('is-warn', 'is-done');
      upTo(0, 0);
      upSt.textContent = '올리는 중 0%';
      ex.classList.remove('is-done');
      setChip(chip, 'run', '올리는 중');
      showPage(0);
    };
    if (still) {
      up.classList.add('is-done');
      upTo(100, 0);
      upSt.textContent = '올렸어요 · 1.2GB';
      ex.classList.add('is-done');
      setChip(chip, 'ok', '완료');
      return;
    }
    whileVisible(media, async (cancelled) => {
      while (!cancelled()) {
        reset();
        cur.hide();
        cur.rest();
        await sleep(700); if (cancelled()) return;
        upTo(46, 1800);
        await count(0, 46, 1800, '올리는 중', cancelled); if (cancelled()) return;
        showPage(1);
        up.classList.add('is-warn');
        upSt.textContent = '연결이 끊겼어요 · 46%에서 멈춤';
        setChip(chip, 'warn', '끊김');
        await sleep(1500); if (cancelled()) return;
        up.classList.remove('is-warn');
        setChip(chip, 'run', '이어서');
        upTo(100, 2000);
        await count(46, 100, 2000, '이어서 올리는 중', cancelled); if (cancelled()) return;
        up.classList.add('is-done');
        upSt.textContent = '올렸어요 · 1.2GB';
        showPage(2);
        await sleep(700);
        cur.show();
        await sleep(200);
        cur.to(exBtn);
        await sleep(1000); if (cancelled()) return;
        await cur.click();
        await press(exBtn);
        ex.classList.add('is-done');
        setChip(chip, 'ok', '완료');
        cur.rest();
        cur.hide();
        await sleep(3200);
      }
    });
  })();

  // 6. reuse: fill a new conversation from the result's prompt (draft only)
  (() => {
    const card = capCard('reuse');
    if (!card) return;
    const media = q('.tcard__media', card);
    const btn = q('[data-fill-btn]', card);
    const cmp = q('[data-cmp]', card);
    const txt = q('[data-cmp-text]', card);
    const note = q('[data-cmp-note]', card);
    const cur = makeCursor(media);
    const reset = () => {
      txt.textContent = '';
      note.classList.remove('is-on');
      cmp.classList.remove('is-focus');
    };
    if (still) {
      txt.textContent = cmp.dataset.typed;
      note.classList.add('is-on');
      return;
    }
    whileVisible(media, async (cancelled) => {
      while (!cancelled()) {
        reset();
        cur.hide();
        cur.rest();
        await sleep(1100); if (cancelled()) return;
        cur.show();
        await sleep(200);
        cur.to(btn);
        await sleep(1000); if (cancelled()) return;
        await cur.click();
        await press(btn);
        cur.rest();
        cur.hide();
        cmp.classList.add('is-focus');
        await typeText(txt, cmp.dataset.typed, cancelled, [26, 52]); if (cancelled()) return;
        note.classList.add('is-on');
        await sleep(3400);
      }
    });
  })();

  // swipe strip arrows (tablet / mobile only; the strip is a plain 2x2 grid on desktop)
  (() => {
    const grid = q('.cpb-grid');
    const prev = q('[data-cpb-prev]');
    const next = q('[data-cpb-next]');
    if (!grid || !prev || !next) return;
    const step = () => {
      const c = q('.cpb-card', grid);
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 16;
      return c ? c.getBoundingClientRect().width + gap : grid.clientWidth * 0.8;
    };
    const cards = qa('.cpb-card', grid);
    let target = 0;
    let lastTap = 0;
    const sync = () => {
      const max = grid.scrollWidth - grid.clientWidth - 2;
      prev.disabled = grid.scrollLeft <= 2;
      next.disabled = max <= 0 || grid.scrollLeft >= max;
    };
    // quick taps add up: while a slide is still running, count from its target card instead of the current position
    const go = (dir) => {
      const now = performance.now();
      const s = step();
      const max = grid.scrollWidth - grid.clientWidth;
      const base = now - lastTap < 900 ? target : Math.round(grid.scrollLeft / s);
      target = Math.max(0, Math.min(cards.length - 1, base + dir));
      lastTap = now;
      grid.scrollTo({ left: Math.min(max, target * s), behavior: still ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    grid.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  })();
  /* ---------- /Capabilities ---------- */
})();
