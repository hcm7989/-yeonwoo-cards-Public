import { SEED, SEED_VERSION, SITUATIONS } from "./seed.js";

/* firebase-config.js 는 사용자가 직접 고치는 유일한 파일이라, 붙여넣다 문법이
   깨질 수 있습니다. 정적 import 로 두면 그때 앱 전체가 안 뜨고 흰 화면이 되므로
   따로 떼어 읽고, 실패해도 로컬 전용으로 계속 돌아가게 합니다. */
let FIREBASE_CONFIG = {};
let FIREBASE_VERSION = "12.18.0";
let configError = "";
try{
  const mod = await import("./firebase-config.js");
  FIREBASE_CONFIG  = mod.FIREBASE_CONFIG || {};
  FIREBASE_VERSION = mod.FIREBASE_VERSION || FIREBASE_VERSION;
}catch(e){
  configError = "firebase-config.js 를 읽지 못했습니다";
}

/* ────────────────────────────────────────────────────────────
   연우 말 카드 — 담기 / 복습 / 모아보기 / 설정

   저장은 두 가지 모드로 돌아갑니다.
     local  : 이 기기에만 (firebase-config.js 가 비어 있을 때)
     cloud  : Firestore 로 두 사람이 실시간 공유

   어느 모드든 카드는 "먼저 폰에" 저장됩니다. 공유 모드에서는
   그 뒤에 업로드를 시도하고, 실패하거나 오프라인이면 아웃박스에
   남겨 두었다가 연결이 돌아오는 순간 올립니다.
   복습 진도만은 항상 기기별로 따로 둡니다.
   ──────────────────────────────────────────────────────────── */

const CHILD = "연우";
const STEPS = [1,3,7,16,35,90];
const MIC_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"'
  + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<rect x="9" y="2" width="6" height="11" rx="3"></rect>'
  + '<path d="M5 10v1a7 7 0 0 0 14 0v-1"></path><path d="M12 18v4"></path></svg>';

/* ───────────────── storage ───────────────── */
const LS = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
const SS = {
  get(k, d){ try{ const v = sessionStorage.getItem(k); return v == null ? d : v; }catch(e){ return d; } },
  set(k, v){ try{ sessionStorage.setItem(k, String(v)); }catch(e){} },
  del(k){ try{ sessionStorage.removeItem(k); }catch(e){} }
};

/* ───────────────── app state ───────────────── */
let cards      = LS.get("ycard.cards", null);
let firstRun   = false;
if(!Array.isArray(cards)){
  cards = SEED.slice(); firstRun = true;
}else if(LS.get("ycard.seedVer", 1) < SEED_VERSION){
  // 기본 카드가 늘었을 때: 지운 적 없는 새 카드만 얹습니다.
  const have = new Set(cards.map(c => c.id));
  const removed = new Set(LS.get("ycard.removedSeeds", []));
  SEED.forEach(s => { if(!have.has(s.id) && !removed.has(s.id)) cards.push(s); });
}
LS.set("ycard.seedVer", SEED_VERSION);
LS.set("ycard.cards", cards);

// 오프라인 안전망: 아직 클라우드가 못 받은 변경분
let outbox = LS.get("ycard.outbox", []);   // [{card, rev}] 업로드 대기
let tombs  = LS.get("ycard.tombs", []);    // 삭제 대기 중인 id

let who        = LS.get("ycard.who", null);
let family     = LS.get("ycard.family", null);
let tab        = SS.get("ycard.tab", "add");
let filter     = SS.get("ycard.filter", "전체");
let draftKo    = SS.get("ycard.draftKo", "");
let draftNote  = SS.get("ycard.draftNote", "");
let draftSit   = null;
let openId     = null;
let flipped    = false;
let reviewIdx  = 0;
let syncMode   = "local";      // local | connecting | cloud | pending | error
let syncNote   = "";
let installEvt = null;

const esc = t => String(t == null ? "" : t)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const today = () => new Date().toISOString().slice(0,10);
const pendingCards = () => cards.filter(c => c.status !== "done");
const readyCards   = () => cards.filter(c => c.status === "done");
const byNewest     = () => cards.slice().sort((a,b) => (b.seq||0) - (a.seq||0));

function persistLocal(){ LS.set("ycard.cards", cards); }

/* ───────────────── review schedule (per device, per person) ───────────────── */
const srsKey = () => "ycard.srs." + (who || "나");
const srs    = () => LS.get(srsKey(), {});
function dueCards(){
  const s = srs(), t = today();
  return readyCards().filter(c => { const r = s[c.id]; return !r || !r.due || r.due <= t; });
}
function grade(id, ok){
  const s = srs();
  const r = s[id] || { step: -1 };
  if(ok){
    r.step = Math.min(r.step + 1, STEPS.length - 1);
    const d = new Date(); d.setDate(d.getDate() + STEPS[r.step]);
    r.due = d.toISOString().slice(0,10);
  }else{
    r.step = -1; r.due = today();
  }
  s[id] = r; LS.set(srsKey(), s);
}

/* ───────────────── cloud sync ───────────────── */
let fb = null;   // { db, ops }

function familyCode(){
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const a = new Uint8Array(12);
  (self.crypto || window.crypto).getRandomValues(a);
  return Array.from(a, b => alphabet[b % alphabet.length]).join("");
}
const prettyCode = c => c ? c.replace(/(.{4})(?=.)/g, "$1-") : "";

function configured(){ return !!(FIREBASE_CONFIG && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.apiKey); }

function saveQueues(){ LS.set("ycard.outbox", outbox); LS.set("ycard.tombs", tombs); }

/* 클라우드에서 온 목록과 아직 못 올린 내 변경분을 합칩니다.
   이게 없으면 비행기 모드에서 담은 카드가 재연결 순간 지워집니다. */
let firstSnapshot = true;

function mergeSnapshot(cloud){
  const byId = new Map(cloud.map(c => [c.id, c]));

  // 처음 붙는 순간: 클라우드에 없는 내 카드는 지워질 대상이 아니라 올릴 대상입니다.
  // (가족 코드를 갓 만들어 클라우드가 비어 있는 경우가 여기 걸립니다)
  if(firstSnapshot){
    firstSnapshot = false;
    cards.forEach(c => {
      if(!byId.has(c.id) && !tombs.includes(c.id) && !outbox.some(o => o.card.id === c.id)){
        c.rev = c.rev || Date.now();
        outbox.push({ card: c, rev: c.rev });
      }
    });
  }

  // 클라우드가 내 버전 이상을 받았으면 아웃박스에서 뺍니다
  outbox = outbox.filter(o => {
    const live = byId.get(o.card.id);
    return !(live && (live.rev || 0) >= o.rev);
  });
  // 클라우드에서 사라졌으면 삭제가 반영된 것
  tombs = tombs.filter(id => byId.has(id));

  const merged = cloud.filter(c => !tombs.includes(c.id));
  const mergedIds = new Set(merged.map(c => c.id));
  outbox.forEach(o => {
    if(mergedIds.has(o.card.id)){
      const i = merged.findIndex(c => c.id === o.card.id);
      merged[i] = o.card;              // 내 최신본이 이김
    }else{
      merged.push(o.card);             // 아직 안 올라간 새 카드
    }
  });

  cards = merged.sort((a,b) => (a.seq||0) - (b.seq||0));
  persistLocal(); saveQueues();
}

async function flushQueues(){
  if(!fb) return;
  for(const o of outbox.slice()){ try{ await fb.put(o.card); }catch(e){ return; } }
  for(const id of tombs.slice()){ try{ await fb.drop(id); }catch(e){ return; } }
}

async function connect(){
  if(!configured() || !family){ syncMode = "local"; return; }
  syncMode = "connecting"; firstSnapshot = true; render();
  try{
    const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
    const [{ initializeApp }, { getAuth, signInAnonymously }, fs] = await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`)
    ]);
    const app = initializeApp(FIREBASE_CONFIG);

    // 앱을 껐다 켜도 못 올린 쓰기가 살아남도록 디스크 캐시를 씁니다
    let db;
    try{
      db = fs.initializeFirestore(app, {
        localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() })
      });
    }catch(e){ db = fs.getFirestore(app); }

    await signInAnonymously(getAuth(app));
    const col = fs.collection(db, "families", family, "cards");
    fb = {
      put:  c  => fs.setDoc(fs.doc(col, c.id), c),
      drop: id => fs.deleteDoc(fs.doc(col, id))
    };

    fs.onSnapshot(col,
      snap => {
        const cloud = [];
        snap.forEach(d => cloud.push(d.data()));
        mergeSnapshot(cloud);
        syncMode = (outbox.length || tombs.length) ? "pending" : "cloud";
        syncNote = "";
        render();
        if(outbox.length || tombs.length) flushQueues();
      },
      err => { syncMode = "error"; syncNote = err && err.code ? err.code : "연결 실패"; render(); }
    );

    syncMode = "cloud";
    flushQueues();
  }catch(err){
    syncMode = "error";
    const msg = String((err && err.message) || "");
    syncNote = /dynamically imported module|Failed to fetch|NetworkError/i.test(msg) ? "인터넷 연결 또는 SDK 주소 확인"
             : /api-key|invalid-api-key/i.test(msg)                                  ? "apiKey 값 확인"
             : /permission|insufficient/i.test(msg)                                  ? "Firestore 보안 규칙 확인"
             : /auth\/admin-restricted|operation-not-allowed/i.test(msg)             ? "익명 로그인이 꺼져 있어요"
             : msg.slice(0, 60) || "연결 실패";
  }
  render();
}

/* 저장은 언제나 폰이 먼저입니다. 업로드는 그 다음이고, 실패하면 줄을 섭니다. */
function queue(card){
  card.rev = Date.now();
  outbox = outbox.filter(o => o.card.id !== card.id);
  outbox.push({ card, rev: card.rev });
  tombs = tombs.filter(id => id !== card.id);
  saveQueues();
}
async function pushCard(c){
  persistLocal();
  if(!family || !configured()) return;
  queue(c);
  if(fb){
    try{ await fb.put(c); }
    catch(e){ syncMode = "pending"; render(); }
  }
}
async function dropCard(id){
  const wasSeed = /^s\d+$/.test(id);
  if(wasSeed){
    const removed = LS.get("ycard.removedSeeds", []);
    if(!removed.includes(id)){ removed.push(id); LS.set("ycard.removedSeeds", removed); }
  }
  persistLocal();
  outbox = outbox.filter(o => o.card.id !== id);
  if(!family || !configured()){ saveQueues(); return; }
  if(!tombs.includes(id)) tombs.push(id);
  saveQueues();
  if(fb){
    try{ await fb.drop(id); }
    catch(e){ syncMode = "pending"; render(); }
  }
}
async function pushAll(list){
  persistLocal();
  if(!family || !configured()) return;
  list.forEach(queue);
  if(!fb) return;
  for(const c of list){
    try{ await fb.put(c); }
    catch(e){ syncMode = "pending"; render(); return; }
  }
}

// 연결이 돌아오면 밀린 것부터 올립니다
window.addEventListener("online", () => {
  if(fb && (outbox.length || tombs.length)) flushQueues();
  else if(family && configured() && syncMode === "error") connect();
});

/* ───────────────── voice ───────────────── */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let micState  = SR ? SS.get("ycard.mic", "ok") : "none";
let rec = null, listening = false, heardFinal = "", draftBase = "";

function setDraftKo(v){
  draftKo = v; SS.set("ycard.draftKo", v);
  const el = document.getElementById("in-ko");
  if(el && el.value !== v) el.value = v;
}
function micBlocked(){
  listening = false; micState = "none"; SS.set("ycard.mic", "none");
  toast("마이크를 쓸 수 없어요. 키보드 마이크 키를 써 보세요");
  render();
}
function startListening(){
  if(!SR || listening) return;
  heardFinal = "";
  try{ rec = new SR(); }catch(e){ micBlocked(); return; }
  rec.lang = "ko-KR"; rec.continuous = true; rec.interimResults = true;
  rec.onresult = ev => {
    let interim = "";
    for(let i = ev.resultIndex; i < ev.results.length; i++){
      const r = ev.results[i];
      if(r.isFinal) heardFinal += r[0].transcript; else interim += r[0].transcript;
    }
    setDraftKo(((draftBase ? draftBase + " " : "") + heardFinal + interim).trim());
  };
  rec.onerror = ev => {
    const e = ev && ev.error;
    if(e === "not-allowed" || e === "service-not-allowed" || e === "audio-capture"){ micBlocked(); return; }
    listening = false; render();
    if(e === "no-speech") toast("소리가 안 들렸어요");
  };
  rec.onend = () => { if(listening){ listening = false; render(); } };
  draftBase = draftKo;
  try{ rec.start(); }catch(e){ micBlocked(); return; }
  listening = true; render();
}
function stopListening(){
  listening = false;
  if(rec){ try{ rec.stop(); }catch(e){} }
  render();
  const el = document.getElementById("in-ko");
  if(el){ el.focus(); try{ el.setSelectionRange(el.value.length, el.value.length); }catch(e){} }
}

/* ───────────────── views ───────────────── */
function header(){
  return `<div class="top">
    <div class="brand"><h1>${CHILD} 말 카드</h1><span class="sub">말로 담고, 나중에 카드로</span></div>
    <div class="who" role="group" aria-label="지금 누구세요">
      <button data-who="아빠" aria-pressed="${who==="아빠"}">아빠</button>
      <button data-who="엄마" aria-pressed="${who==="엄마"}">엄마</button>
    </div></div>`;
}

function addView(){
  let h = "";
  if(configError) h += `<div class="banner warn"><div><b>공유 설정을 읽지 못했습니다.</b>
    카드는 이 기기에 정상적으로 저장되니 계속 쓰셔도 됩니다. 고치는 방법은 <b>설정</b> 탭에 적어 두었습니다.</div></div>`;
  if(!who) h +=`<div class="banner"><div>먼저 오른쪽 위에서 <b>아빠 / 엄마</b>를 골라 주세요. 누가 담은 카드인지 표시되고, 복습 진도도 각자 따로 갑니다.</div></div>`;

  h += `<div class="sheet">
    <h2>방금 뭐라고 하셨어요?</h2>
    <p class="hint">마이크를 누르고 그냥 말하면 글로 받아 적힙니다. 상황 태그는 건너뛰어도 되고, 영어와 뉘앙스 설명은 나중에 채워집니다.</p>`;

  if(micState !== "none"){
    h += `<button class="mic" id="btn-mic" data-on="${listening?1:0}">`
      + (listening ? `<span class="dot"></span><span>듣는 중… 눌러서 멈추기</span>`
                   : `${MIC_SVG}<span>말로 담기</span>`)
      + `</button>`;
  }else{
    h += `<p class="mic-hint">이 기기에서는 앱 안의 음성 인식이 안 돼요. 아래 칸을 누르고 <b>키보드의 마이크 키</b>로 받아쓰기하면 똑같이 빠릅니다.</p>`;
  }

  h += `<label class="fld"><span class="lb">한국어 표현</span>
      <textarea id="in-ko" class="${listening?"listening":""}" placeholder="${listening?"말씀하세요…":"예: 아이고, 우리 연우 기특하네"}">${esc(draftKo)}</textarea></label>
    <label class="fld"><span class="lb">어떤 상황이었나요 (선택)</span>
      <input type="text" id="in-note" value="${esc(draftNote)}" placeholder="예: 혼자 신발 신고 나왔을 때"></label>
    <div class="fld"><span class="lb">상황</span><div class="tags" id="sit-tags">
      ${SITUATIONS.map(s => `<button class="tag" data-sit="${esc(s)}" aria-pressed="${draftSit===s}">${esc(s)}</button>`).join("")}
    </div></div>
    <button class="cta" id="btn-add">카드로 담기</button>
  </div>`;

  const recent = byNewest().slice(0,4);
  if(recent.length){
    h += `<div class="sheet"><h2>최근에 담은 것</h2><div class="recent">`
      + recent.map(c => `<div class="r"><span class="ko">${esc(c.ko)}</span>
          <span class="pill ${c.status==="done"?"done":"wait"}">${c.status==="done"?"준비됨":"영어 대기"}</span></div>`).join("")
      + `</div></div>`;
  }
  return h;
}

function reviewView(){
  const due = dueCards();
  if(!readyCards().length){
    return `<div class="empty"><span class="big">아직 복습할 카드가 없어요</span>
      <p>표현을 담으면 영어와 뉘앙스가 채워진 뒤에 여기로 올라옵니다.</p></div>`;
  }
  if(!due.length){
    return `<div class="empty"><span class="big">오늘 몫은 끝!</span>
      <p>${readyCards().length}장 모두 복습했어요. 내일 다시 열면 잊어버릴 때가 된 카드만 골라서 보여드릴게요.</p></div>`;
  }
  if(reviewIdx >= due.length) reviewIdx = 0;
  const c = due[reviewIdx];
  const pct = Math.round((reviewIdx / due.length) * 100);

  let h = `<div class="progress"><div class="pbar"><i style="width:${pct}%"></i></div>
    <span class="n">${reviewIdx+1} / ${due.length}</span></div>`;

  if(!flipped){
    h += `<button class="flip" id="btn-flip">
      <span class="sit-line"><span class="pill sit">${esc(c.situation||"기타")}</span></span>
      <span class="ko">${esc(c.ko)}</span>
      ${c.note ? `<span class="note">${esc(c.note)}</span>` : ""}
      <span class="turn">눌러서 영어 보기</span></button>`;
  }else{
    h += `<div class="back-wrap"><div class="back">
        <div class="ask">${esc(c.ko)}</div>
        <div class="en">${esc(c.en)}</div>
        <div class="blk"><span class="lb">알아둘 점</span><p>${esc(c.nuance)}</p></div>
        <div class="blk"><span class="lb">${CHILD}에게 이렇게</span>
          <p class="ex-en">${esc(c.exEn)}</p><p>${esc(c.exKo)}</p></div>
      </div></div>
      <div class="judge"><button data-grade="0">다시 볼래요</button>
      <button class="yes" data-grade="1">알겠어요</button></div>`;
  }
  return h;
}

function listView(){
  const p = pendingCards();
  let h = "";
  if(p.length){
    h += `<div class="banner warn"><div><b>${p.length}장</b>이 영어를 기다리고 있어요.
      설정 탭의 <b>영어 채우기</b>에서 목록을 복사해 Claude에 붙여넣으면 채워집니다.</div></div>`;
  }
  const opts = ["전체","영어 대기"].concat(SITUATIONS);
  h += `<div class="tags">` + opts.map(o =>
    `<button class="tag" data-filter="${esc(o)}" aria-pressed="${filter===o}">${esc(o)}</button>`).join("") + `</div>`;

  const rows = byNewest().filter(c =>
    filter === "전체" ? true : filter === "영어 대기" ? c.status !== "done" : c.situation === filter);

  if(!rows.length){
    return h + `<div class="empty"><span class="big">여기엔 아직 없어요</span><p>다른 상황을 골라 보세요.</p></div>`;
  }

  h += `<div class="list">` + rows.map(c => {
    const open = c.id === openId;
    let s = `<div class="item"><button class="hd" data-open="${esc(c.id)}">
        <span class="ko">${esc(c.ko)}</span>
        <span class="pill ${c.status==="done"?"done":"wait"}">${c.status==="done"?"준비됨":"대기"}</span></button>`;
    if(c.status === "done") s += `<div class="en">${esc(c.en)}</div>`;
    s += `<div class="meta">${esc(c.situation||"기타")} · ${esc(c.by||"—")} · ${esc(c.at||"")}</div>`;
    if(open){
      s += `<div class="det">`;
      if(c.status === "done"){
        s += `<div><span class="lb">알아둘 점</span><p>${esc(c.nuance)}</p></div>
              <div><span class="lb">${CHILD}에게 이렇게</span>
                <p class="ex-en">${esc(c.exEn)}</p><p>${esc(c.exKo)}</p></div>`;
      }else{
        if(c.note) s += `<div><span class="lb">상황 메모</span><p>${esc(c.note)}</p></div>`;
        s += `<div><span class="lb">상태</span><p>영어와 뉘앙스 설명을 기다리는 중이에요.</p></div>`;
      }
      s += `<button class="del" data-del="${esc(c.id)}">이 카드 지우기</button></div>`;
    }
    return s + `</div>`;
  }).join("") + `</div>`;
  return h;
}

function settingsView(){
  const p = pendingCards();
  const waiting = outbox.length + tombs.length;
  const led = syncMode === "cloud" ? "on" : syncMode === "local" ? "" : "off";
  const label = {
    cloud:      "공유 중 — 두 기기가 같은 카드를 봅니다",
    pending:    `폰에 저장됨 · ${waiting}건이 업로드를 기다리는 중`,
    local:      "이 기기에만 저장 중",
    connecting: "연결하는 중…",
    error:      "공유 연결 실패 — 이 기기에는 계속 저장됩니다"
  }[syncMode];

  let h = `<div class="sheet">
    <h2>공유</h2>
    <div class="status"><span class="led ${led}"></span><span>${esc(label)}</span></div>`;
  if(syncMode === "error"){
    h += `<p class="hint">확인할 것: <b>${esc(syncNote)}</b></p>
          <button class="ghost full" id="btn-retry">다시 연결해 보기</button>`;
  }

  if(configError){
    h += `<p class="hint"><b>firebase-config.js 를 읽지 못했습니다.</b> 중괄호 { } 안에는
      <b>apiKey: "..."</b> 같은 줄만 들어가야 합니다. 콘솔에서 복사할 때 딸려 오는
      <b>const firebaseConfig =</b> 와 맨 끝 <b>;</b> 는 빼고 넣어 주세요.</p>`;
  }else if(!configured()){
    h += `<p class="hint">아직 <b>firebase-config.js</b> 가 비어 있어서 공유가 꺼져 있습니다. README 의 순서대로 설정값을 넣으면 이 화면에서 가족 코드를 만들 수 있어요.</p>`;
  }else if(!family){
    h += `<p class="hint">한 사람이 <b>가족 코드 만들기</b>를 누르고, 나온 코드나 링크를 배우자에게 보내세요. 상대는 <b>코드로 참여</b>에 그 코드를 넣으면 됩니다.</p>
      <div class="rowbtns">
        <button class="ghost accent" id="btn-newfam">가족 코드 만들기</button>
        <button class="ghost" id="btn-joinfam">코드로 참여</button>
      </div>`;
  }else{
    h += `<div class="fld"><span class="lb">우리 가족 코드</span><div class="code">${esc(prettyCode(family))}</div></div>
      <div class="rowbtns">
        <button class="ghost" id="btn-copycode">코드 복사</button>
        <button class="ghost" id="btn-copylink">참여 링크 복사</button>
      </div>
      <button class="ghost full" id="btn-leave">이 기기에서 공유 끊기</button>
      <p class="hint">코드를 아는 사람은 카드를 보고 고칠 수 있습니다. 두 분 사이에서만 주고받으세요.</p>`;
  }
  h += `</div>`;

  h += `<div class="sheet">
    <h2>영어 채우기</h2>
    <p class="hint">담아 둔 표현 ${p.length}장이 영어를 기다리고 있어요. 아래 버튼으로 복사해 Claude에 붙여넣고, 돌아온 JSON을 다시 여기에 붙여넣으면 카드가 완성됩니다.</p>
    <button class="ghost full ${p.length?"accent":""}" id="btn-copy" ${p.length?"":"disabled"}>대기 중인 표현 복사하기</button>
    <label class="fld"><span class="lb">Claude가 준 JSON 붙여넣기</span>
      <textarea id="in-json" class="mono" placeholder='[{"id":"c123","en":"...","nuance":"...","exEn":"...","exKo":"..."}]'></textarea></label>
    <button class="ghost full" id="btn-apply">붙여넣은 내용으로 채우기</button>
  </div>`;

  h += `<div class="sheet">
    <h2>앱</h2>`;
  if(installEvt){
    h += `<button class="ghost full accent" id="btn-install">홈 화면에 추가</button>`;
  }else{
    h += `<p class="hint">아이폰은 사파리 하단 <b>공유 → 홈 화면에 추가</b>, 안드로이드는 크롬 메뉴의 <b>앱 설치</b>를 누르면 홈 화면 아이콘이 생깁니다.</p>`;
  }
  h += `<button class="ghost full" id="btn-export">카드 전체 내려받기 (JSON)</button>
    <p class="hint">카드 ${cards.length}장 · 복습 진도는 기기마다 따로 저장됩니다.</p>
  </div>`;
  return h;
}

function navView(){
  const d = dueCards().length, p = pendingCards().length;
  return [
    {k:"add", n:"담기",    c: p ? p + " 대기" : ""},
    {k:"rev", n:"복습",    c: d ? d + "장" : "완료"},
    {k:"all", n:"모아보기", c: cards.length + "장"},
    {k:"set", n:"설정",    c: syncMode === "pending" ? (outbox.length + tombs.length) + " 대기"
                            : syncMode === "cloud" ? "공유" : ""}
  ].map(t => `<button role="tab" data-tab="${t.k}" aria-selected="${tab===t.k}">
      <span>${t.n}</span><span class="cnt">${t.c ? esc(t.c) : "&nbsp;"}</span></button>`).join("");
}

function render(){
  const body = tab === "add" ? addView()
             : tab === "rev" ? reviewView()
             : tab === "all" ? listView()
             : settingsView();
  document.getElementById("root").innerHTML = header() + `<div class="panel">${body}</div>`;
  document.getElementById("nav").innerHTML = navView();
}

/* ───────────────── toast ───────────────── */
let toastTimer;
function toast(m){
  const el = document.getElementById("toast");
  el.textContent = m; el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
async function copy(text, ok){
  try{ await navigator.clipboard.writeText(text); toast(ok); }
  catch(e){ toast("복사가 안 됐어요. 길게 눌러 직접 복사해 주세요"); }
}

/* ───────────────── actions ───────────────── */
function addCard(){
  if(listening) stopListening();
  const koEl = document.getElementById("in-ko");
  const ko = ((koEl ? koEl.value : draftKo) || "").trim();
  if(!ko){ toast("표현을 적어 주세요"); return; }
  const noteEl = document.getElementById("in-note");
  const card = {
    id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    seq: Date.now(),
    ko,
    note: ((noteEl ? noteEl.value : draftNote) || "").trim(),
    situation: draftSit || "기타",
    by: who || "—",
    at: today(),
    status: "pending"
  };
  cards.push(card);
  draftSit = null; draftKo = ""; draftNote = ""; heardFinal = ""; draftBase = "";
  SS.set("ycard.draftKo",""); SS.set("ycard.draftNote","");
  render();
  toast("담았어요 · " + (ko.length > 14 ? ko.slice(0,14) + "…" : ko));
  pushCard(card);
}

function applyJson(){
  const el = document.getElementById("in-json");
  const raw = (el ? el.value : "").trim();
  if(!raw){ toast("붙여넣은 내용이 없어요"); return; }
  let arr;
  try{
    arr = JSON.parse(raw.replace(/^```(?:json)?/i, "").replace(/```$/,"").trim());
  }catch(e){ toast("JSON 형식이 아니에요"); return; }
  if(!Array.isArray(arr)) arr = [arr];

  let n = 0;
  const touched = [];
  for(const item of arr){
    if(!item || !item.en) continue;
    const c = cards.find(x => x.id === item.id) || cards.find(x => x.ko === item.ko);
    if(!c) continue;
    c.en = item.en;
    c.nuance = item.nuance || "";
    c.exEn = item.exEn || "";
    c.exKo = item.exKo || "";
    c.status = "done";
    touched.push(c); n++;
  }
  persistLocal();
  if(el) el.value = "";
  render();
  toast(n ? `${n}장 채웠어요` : "맞는 카드를 못 찾았어요");
  pushAll(touched);
}

function exportJson(){
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `연우말카드-${today()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function createFamily(){
  family = familyCode(); LS.set("ycard.family", family);
  await connect();          // 첫 스냅샷이 내 카드를 전부 업로드 대기로 잡습니다
  render();
  toast("가족 코드를 만들었어요");
}
async function joinFamily(){
  const input = prompt("배우자에게 받은 가족 코드를 붙여넣으세요");
  if(!input) return;
  const code = input.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if(code.length < 8){ toast("코드가 짧아요"); return; }
  family = code; LS.set("ycard.family", family);
  await connect();          // 상대가 이미 올려둔 카드는 그대로 받고, 내 것만 올라갑니다
  render();
  toast("가족 코드에 참여했어요");
}
function leaveFamily(){
  family = null; fb = null; syncMode = "local"; syncNote = "";
  LS.del("ycard.family");
  render();
  toast("이 기기에서만 저장합니다");
}

/* ───────────────── events ───────────────── */
document.addEventListener("click", e => {
  const t = e.target.closest("button");
  if(!t) return;

  if(t.dataset.tab){ tab = t.dataset.tab; SS.set("ycard.tab", tab); flipped = false; reviewIdx = 0; render(); return; }
  if(t.dataset.who){ who = t.dataset.who; LS.set("ycard.who", who); render(); return; }
  if(t.dataset.sit){
    draftSit = draftSit === t.dataset.sit ? null : t.dataset.sit;
    document.querySelectorAll("#sit-tags .tag").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.sit === draftSit)));
    return;
  }
  if(t.dataset.filter){ filter = t.dataset.filter; SS.set("ycard.filter", filter); openId = null; render(); return; }
  if(t.dataset.open){ openId = openId === t.dataset.open ? null : t.dataset.open; render(); return; }
  if(t.dataset.del){
    const id = t.dataset.del;
    cards = cards.filter(c => c.id !== id);
    openId = null; render(); dropCard(id); return;
  }
  if(t.dataset.grade){
    const c = dueCards()[reviewIdx];
    if(c) grade(c.id, t.dataset.grade === "1");
    flipped = false;
    if(t.dataset.grade === "0") reviewIdx += 1;
    render(); return;
  }

  switch(t.id){
    case "btn-mic":   listening ? stopListening() : startListening(); return;
    case "btn-flip":  flipped = true; render(); return;
    case "btn-add":   addCard(); return;
    case "btn-apply": applyJson(); return;
    case "btn-export": exportJson(); return;
    case "btn-newfam":  createFamily(); return;
    case "btn-joinfam": joinFamily(); return;
    case "btn-leave":   leaveFamily(); return;
    case "btn-retry":   connect(); return;
    case "btn-copycode": copy(family, "코드를 복사했어요"); return;
    case "btn-copylink":
      copy(location.origin + location.pathname + "#f=" + family, "참여 링크를 복사했어요"); return;
    case "btn-install":
      if(installEvt){ installEvt.prompt(); installEvt = null; }
      return;
    case "btn-copy": {
      const lines = pendingCards().map(c =>
        `- id: ${c.id} | [${c.situation||"기타"}] ${c.ko}${c.note ? "  (상황: " + c.note + ")" : ""}`).join("\n");
      const prompt = `연우 말 카드에 담아둔 표현들이야. ${CHILD}(43개월, 영어 유치원 다니는 중)에게 실제로 쓸 수 있는 영어로 채워줘.\n`
        + `아래 형식의 JSON 배열만 답으로 줘. id는 그대로 유지해줘.\n`
        + `[{"id":"...","en":"영어 표현","nuance":"왜 한국어 그대로는 안 옮겨지는지","exEn":"아이에게 쓰는 영어 예문","exKo":"그 예문의 한국어"}]\n\n`
        + lines;
      copy(prompt, "복사했어요. Claude에 붙여넣으세요"); return;
    }
  }
});

document.addEventListener("input", e => {
  if(e.target.id === "in-ko"){ draftKo = e.target.value; SS.set("ycard.draftKo", draftKo); }
  if(e.target.id === "in-note"){ draftNote = e.target.value; SS.set("ycard.draftNote", draftNote); }
});

document.addEventListener("keydown", e => {
  if((e.metaKey || e.ctrlKey) && e.key === "Enter" && tab === "add"){ e.preventDefault(); addCard(); }
});

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault(); installEvt = e;
  if(tab === "set") render();
});

/* ───────────────── boot ───────────────── */
// 홈 화면 아이콘 길게 눌러 쓰는 바로가기 (#add / #rev)
const short = location.hash.replace("#","");
if(short === "add" || short === "rev" || short === "all" || short === "set"){
  tab = short; SS.set("ycard.tab", tab);
  history.replaceState(null, "", location.pathname);
}

render();

// 참여 링크(#f=코드)로 열렸을 때
const m = location.hash.match(/f=([a-z0-9]+)/i);
if(m && m[1] && m[1] !== family){
  const code = m[1].toLowerCase();
  history.replaceState(null, "", location.pathname);
  if(confirm("이 링크의 가족 카드에 참여할까요?")){
    family = code; LS.set("ycard.family", family);
    connect();
  }
}else if(family){
  connect();
}

if(firstRun){ tab = "add"; SS.set("ycard.tab", "add"); }

if("serviceWorker" in navigator){
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
