const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const easeOut = "cubic-bezier(0.16, 1, 0.3, 1)";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const icon = (id, cls = "ico") => `<svg class="${cls}"><use href="#${id}"/></svg>`;
const teamImg = (key) => (window.__TEAM && window.__TEAM[key]) || "assets/img/team/" + key + ".webp";
const avatar = (key) => `<img class="av" src="${teamImg(key)}" alt="" />`;

/* ---------- hero sequence ---------- */
const askText = $("#askText");
const omniText = $("#omniText");
const viewNewtab = $("#viewNewtab");
const viewChat = $("#viewChat");
const stepsBox = $("#steps");
const floatWin = $("#floatWin");
const fwBody = $("#fwBody");
const chatList = $("#chatList");
const agentCount = $("#agentCount");
const chatScroll = $("#chatScroll");
const chatFlow = $("#chatFlow");
const chatState = $("#chatState");
const navHome = $("#navHome");

const TASK = "다음 주 파트너 킥오프 준비해줘. 관련 메일이랑 지난 회의록 보고 안건 초안까지";
const HOME_OMNI = "메일, 일정, 파일 검색 또는 요청";

const DOC_PREVIEW =
  '<div class="fw-doc"><b>9월 파트너 회의록</b><small>Drive · 9월 23일 수정</small>' +
  '<i style="width:92%"></i><i style="width:80%"></i><i class="c" style="width:64%"></i><i style="width:86%"></i><i style="width:58%"></i><i class="c" style="width:72%"></i><i style="width:40%"></i></div>';
const SHEET_PREVIEW =
  '<div class="fw-sheet">' +
  '<span class="h"></span><span class="h">7월</span><span class="h">8월</span><span class="h">9월</span><span class="h">10월</span>' +
  '<span class="h">노출</span><span>1.2M</span><span>1.4M</span><span>1.3M</span><span>1.6M</span>' +
  '<span class="h">클릭</span><span>18K</span><span>21K</span><span>19K</span><span class="k">26K</span>' +
  "</div>" +
  '<div class="fw-spark"><i style="--h:40%"></i><i style="--h:55%"></i><i style="--h:48%"></i><i style="--h:62%"></i><i style="--h:58%"></i><i style="--h:84%" class="hi"></i></div>';

let runToken = 0;
let timerId = 0;

function setWorkTimer() {
  let secs = 228;
  clearInterval(timerId);
  timerId = setInterval(() => {
    secs += 1;
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, "0");
    $$(".work-timer").forEach((el) => (el.textContent = m + "m " + s + "s"));
  }, 1000);
}

async function typeInto(el, text, token, speed = 42) {
  el.textContent = "";
  for (let i = 1; i <= text.length; i++) {
    if (token !== runToken) return;
    el.textContent = text.slice(0, i);
    el.scrollLeft = el.scrollWidth;
    await wait(speed);
  }
}

function addStep(html, token, cls = "") {
  if (token !== runToken) return null;
  const div = document.createElement("div");
  div.className = "step " + cls;
  div.innerHTML = html;
  stepsBox.appendChild(div);
  const over = chatFlow.scrollHeight - (chatScroll.clientHeight - 16);
  chatFlow.style.transform = over > 0 ? "translateY(" + -over + "px)" : "none";
  return div;
}

function setState(text, cls) {
  chatState.textContent = text;
  chatState.className = "chat-state " + (cls || "");
}

function setWorking(n) {
  agentCount.textContent = String(n);
  agentCount.classList.remove("bump");
  void agentCount.offsetWidth;
  agentCount.classList.add("bump");
}

function showFloat(iconId, title, html) {
  $("#fwIco").innerHTML = '<use href="#' + iconId + '"/>';
  $("#fwTitle").textContent = title;
  fwBody.innerHTML = html;
  floatWin.classList.add("on");
}

function resetHero() {
  runToken += 1;
  const token = runToken;
  stepsBox.innerHTML = "";
  chatFlow.style.transform = "none";
  askText.textContent = "";
  omniText.textContent = HOME_OMNI;
  floatWin.classList.remove("on");
  agentCount.textContent = "2";
  setState("접수됨");
  viewChat.classList.remove("on");
  viewNewtab.classList.add("on");
  navHome.classList.add("active");
  const inserted = chatList.querySelector('[data-chat="kickoff"]');
  if (inserted) inserted.remove();
  $$(".s-item", chatList).forEach((n) => n.classList.remove("active"));
  $$(".mate").forEach((m) => m.classList.remove("lit"));
  $('.mate[data-mate="hana"] .st').classList.remove("on");
  const browser = $("#browser");
  if (browser) {
    browser.style.animation = "none";
    void browser.offsetWidth;
    browser.style.animation = "browserIn 1.1s " + easeOut + " both";
  }
  $$(".rt").forEach((el, i) => {
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "rise 0.55s " + easeOut + " " + i * 0.1 + "s both";
  });
  return token;
}

async function runHero() {
  const token = resetHero();
  setWorkTimer();

  await wait(2200);
  if (token !== runToken) return;

  // 1. type the request on Home
  await typeInto(askText, TASK, token, 40);
  await wait(900);
  if (token !== runToken) return;

  // 2. the request becomes a conversation with Luna
  const item = document.createElement("div");
  item.className = "s-item active fresh";
  item.dataset.chat = "kickoff";
  item.innerHTML = "파트너 킥오프 준비 <i class=\"spin\"></i>";
  chatList.prepend(item);
  navHome.classList.remove("active");
  $('.mate[data-mate="luna"]').classList.add("lit");
  omniText.innerHTML = '<span class="acc">MonCoti</span> <span class="sep">/</span> 파트너 킥오프 준비 · 대화';
  viewNewtab.classList.remove("on");
  viewChat.classList.add("on");
  setState("접수됨");
  await wait(1100);
  if (token !== runToken) return;

  addStep('<div class="say">' + avatar("luna") + '<div><b>루나</b>좋아요, 이 일 제가 맡을게요. 먼저 필요한 것부터 정리할게요.</div></div>', token);
  await wait(1000);
  if (token !== runToken) return;

  // 3. gather related material
  addStep(
    '<div class="tool">' + icon("i-search") + '<span class="link">파트너 킥오프</span> 관련 자료를 모았어요<span class="up">&#9650;</span></div>' +
      '<div class="panel indent" style="margin-top:7px">' +
      '<div class="row">' + icon("i-mail") + 'Re: 킥오프 일정 확정 <span class="sub">Gmail · 박서준</span><span class="when">2일 전</span></div>' +
      '<div class="row">' + icon("i-cal") + '파트너 킥오프 <span class="sub">Calendar · 10월 21일 10:00</span><span class="when">다음 주</span></div>' +
      "</div>",
    token
  );
  await wait(1300);
  if (token !== runToken) return;

  // 4. open last meeting notes in a side window
  addStep(
    '<div class="tool">' + icon("i-doc") + '지난 회의록 열기<span class="up">&#9650;</span></div>' +
      '<div class="shot indent" style="margin-top:7px"><div class="doc-mini"><b>9월 파트너 회의록</b><i style="width:90%"></i><i class="c" style="width:62%"></i><i style="width:84%"></i><i style="width:70%"></i><i class="c" style="width:48%"></i></div></div>',
    token
  );
  showFloat("i-doc", "Docs · 9월 파트너 회의록", DOC_PREVIEW);
  await wait(1400);
  if (token !== runToken) return;

  addStep('<div class="tool">' + icon("i-doc") + '안건 초안 작성 · <span class="link">킥오프 안건</span></div>', token);
  await wait(1000);
  if (token !== runToken) return;

  addStep('<div class="say">' + avatar("luna") + '<div><b>루나</b>안건 초안을 만들었어요. 참석자 5명에게 보낼 메일은 보내기 전에 확인받을게요.</div></div>', token);
  await wait(900);
  if (token !== runToken) return;

  // 5. anything that leaves the workspace waits for a person
  addStep(
    '<div class="approve"><div class="ap-top">' + icon("i-hand") + "검토 필요 · 메일 보내기</div>" +
      "<p>받는 사람 5명 · 제목: 10/21 파트너 킥오프 안건</p>" +
      '<div class="ap-btns"><span class="primary">검토하기</span><span>보류</span></div></div>',
    token
  );
  setState("검토 대기", "wait");
  await wait(1400);
  if (token !== runToken) return;

  addStep('<div class="tool">' + icon("i-doc") + "회의록 닫기</div>", token);
  floatWin.classList.remove("on");
  await wait(600);
  if (token !== runToken) return;

  // 6. hand part of the work to another teammate
  addStep(
    '<div class="tool">' + icon("i-arrow") + '<span class="link">@하나</span>에게 넘김<span class="up">&#9650;</span></div>' +
      '<div class="spawn" style="margin-top:7px">' + avatar("hana") + '하나가 맡음 <b style="font-weight:600;color:#111">지난 캠페인 성과 기준선</b></div>',
    token
  );
  setWorking(3);
  $('.mate[data-mate="hana"] .st').classList.add("on");
  $('.mate[data-mate="hana"]').classList.add("lit");
  await wait(400);
  showFloat("i-sheet", "Sheets · 캠페인 성과 기준선", SHEET_PREVIEW);
  await wait(1500);
  if (token !== runToken) return;

  // 7. wrap up
  addStep('<div class="say">' + avatar("luna") + '<div><b>루나</b>하나가 성과 기준선을 정리하면 안건에 같이 붙여 둘게요.</div></div>', token);
  setState("반영됨", "done");

  await wait(6000);
  if (token !== runToken) return;
  runHero();
}

const replayBtn = $("#replay");
if (replayBtn) replayBtn.addEventListener("click", () => runHero());
if (viewNewtab) runHero();

/* ---------- teammates tabs ---------- */
const TEAMS = {
  plan: [
    ["luna", "루나", "Luna", "캠페인 리드", "#E0508C", "오늘 캠페인 하나 띄워볼까요?", ["요청 정리", "기획 초안"]],
    ["rian", "리안", "Rian", "전략 기획자", "#2E7A59", "잠깐, 우리가 진짜 풀려는 문제가 뭐죠?", ["문제 정의", "우선순위"]],
    ["poppy", "포피", "Poppy", "서비스·프로덕트 기획자", "#E8787E", "스토리보드부터 붙여볼까요?", ["스토리보드", "기능 기획"]],
    ["seon", "세온", "Seon", "비즈니스 디벨롭먼트", "#2C4A94", "이번 분기 파이프라인 정리해 왔어요.", ["제안 메일", "미팅 후속"]],
    ["noa", "노아", "Noa", "UX 리서처", "#1F9E95", "사용자한테 직접 물어봤어요?", ["인터뷰 정리", "설문 분석"]],
  ],
  build: [
    ["hana", "하나", "Hana", "성과 분석가", "#3E6FD8", "그 증가, 진짜 원인부터 볼까요?", ["성과 예측", "원인 분석"]],
    ["koda", "코다", "Koda", "프론트엔드 개발자", "#5A5BD6", "빌드 끝나면 알려드릴게요.", ["단계별 실행", "배포 확인"]],
    ["jin", "진", "Jin", "백엔드·데이터 엔지니어", "#138BA8", "파이프라인은 정상입니다.", ["데이터 추출", "연동 점검"]],
    ["ben", "벤", "Ben", "인프라·보안 엔지니어", "#4F5866", "권한부터 다시 확인할게요.", ["권한 점검", "보안 알림"]],
    ["teo", "테오", "Teo", "CS·QA 담당", "#2F8FDB", "그 문제, 지금 바로 재현해볼게요.", ["문제 재현", "품질 체크"]],
  ],
  design: [
    ["miro", "미로", "Miro", "UI·프로덕트 디자이너", "#E0483E", "이 여백, 한 칸만 더 줄여볼게요.", ["화면 시안", "디자인 리뷰"]],
    ["yui", "유이", "Yui", "일러스트레이터", "#EE7F4F", "잠깐만요, 한 장 그려서 보여드릴게요.", ["배너 콘셉트", "무드보드"]],
    ["ivy", "아이비", "Ivy", "브랜드 디자이너", "#2FA772", "이 팔레트, 다섯 번째가 제일 좋죠?", ["브랜드 가이드", "톤앤매너 검수"]],
    ["lavi", "라비", "Lavi", "콘텐츠·지식 매니저", "#8C78D4", "그 문서, 제가 정리해둔 게 있어요.", ["문서 정리", "FAQ 작성"]],
    ["rena", "레나", "Rena", "일정·커뮤니케이션 비서", "#A8385E", "다음 미팅 15분 전에 브리핑 드릴게요.", ["메일 분류", "미팅 브리핑"]],
  ],
  ops: [
    ["soy", "소이", "Soy", "운영 코디네이터", "#A2673A", "체크리스트 먼저 돌려볼게요.", ["회의록 정리", "체크리스트"]],
    ["jian", "지안", "Jian", "프로젝트 매니저", "#D9A11A", "리스크 먼저 공유드릴게요.", ["일정 관리", "주간 보고"]],
    ["doyun", "도윤", "Doyun", "총무·인사 운영", "#8B4E9E", "이번 주 일정과 규정 정리해둘게요.", ["사내 공지", "온보딩 준비"]],
    ["max", "맥스", "Max", "재무·정산 컨트롤러", "#C88A12", "영수증 한 장에도 스토리가 있어요.", ["예산안", "비용 분석"]],
    ["kai", "카이", "Kai", "법무·컴플라이언스 담당", "#6E7F2A", "계약서 세 번째 조항, 잠깐만요.", ["계약서 검토", "개인정보 점검"]],
  ],
};

const mateRows = $("#mateRows");
function rowInner(m) {
  const [key, kr, en, role, , line, work] = m;
  return (
    '<span class="m-av swap"><img src="' + teamImg(key) + '" alt="' + kr + '" /></span>' +
    '<div class="m-name swap"><b>' + kr + "</b><span>" + en + " · " + role + "</span></div>" +
    '<p class="m-line swap">“' + line + "”</p>" +
    '<div class="m-work swap">' + work.map((w) => "<span>" + w + "</span>").join("") + "</div>" +
    '<i class="m-bar"></i>'
  );
}
function renderTeam(key, animate) {
  const data = TEAMS[key];
  if (!mateRows || !data) return;
  if (!mateRows.children.length) {
    mateRows.innerHTML = data.map((m) => '<div class="mate-row" style="--c:' + m[4] + '">' + rowInner(m) + "</div>").join("");
    $$(".mate-row", mateRows).forEach((r, i) => setTimeout(() => r.classList.add("lit"), 160 + i * 90));
    return;
  }
  $$(".mate-row", mateRows).forEach((row, i) => {
    const m = data[i];
    const delay = animate ? i * 55 : 0;
    setTimeout(() => {
      row.classList.add("out");
      row.classList.remove("lit");
      setTimeout(() => {
        row.style.setProperty("--c", m[4]);
        row.innerHTML = rowInner(m);
        row.classList.add("out");
        void row.offsetWidth;
        setTimeout(() => {
          row.classList.remove("out");
          row.classList.add("lit");
        }, 30);
      }, 170);
    }, delay);
  });
}
function selectTeam(key) {
  $$("[data-team]").forEach((b) => b.classList.toggle("active", b.dataset.team === key));
  renderTeam(key, true);
}
renderTeam("plan", false);
$$("[data-team]").forEach((btn) => btn.addEventListener("click", () => selectTeam(btn.dataset.team)));
$$("[data-team-link]").forEach((a) => a.addEventListener("click", () => selectTeam(a.dataset.teamLink)));

/* ---------- letter reveal ---------- */
function scrambleReveal(el, finalText, duration = 1400) {
  if (!el) return;
  if (reduceMotion) { el.textContent = finalText; return; }
  const chars = finalText.split("");
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = chars
      .map((ch, i) => {
        if (ch === " " || ch === ".") return ch;
        const unlock = (i + 0.4) / chars.length;
        return t >= unlock ? ch : "*";
      })
      .join("");
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  }
  requestAnimationFrame(frame);
}

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      if (entry.target.dataset.reveal && !entry.target.dataset.done) {
        entry.target.dataset.done = "1";
        scrambleReveal(entry.target, entry.target.dataset.reveal, 1600);
      }
      io.unobserve(entry.target);
    });
  },
  { threshold: 0.35 }
);
$$(".reveal-up, [data-reveal]").forEach((el) => io.observe(el));

/* ---------- editorial parallax ---------- */
const parallax = $$("[data-parallax]");
if (parallax.length && !reduceMotion) {
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    parallax.forEach((img) => {
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) return;
      const progress = (box.top + box.height / 2 - vh / 2) / vh;
      const k = parseFloat(img.dataset.parallax) || 0.08;
      img.style.transform = "translate3d(0," + (-8 - progress * k * 100).toFixed(2) + "%,0)";
    });
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

/* ---------- download ---------- */
$$("[data-download]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const label = $(".btn-label", btn) || btn;
    if (btn.dataset.busy) return;
    btn.dataset.busy = "1";
    const prev = label.textContent;
    label.textContent = "곧 공개됩니다";
    btn.classList.add("done");
    setTimeout(() => {
      label.textContent = prev;
      btn.classList.remove("done");
      delete btn.dataset.busy;
    }, 1800);
  });
});
