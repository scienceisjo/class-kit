/* 우리 반 과학 시간 입구 — 설정 담기·풀기 (make.html · index.html 공용)
   설정은 서버 없이 주소 뒤 #c=… 에 압축해 담는다. 내려받은 HTML 에는 window.ENTRANCE_CONFIG 로 박힌다. */
(function(){
'use strict';
const b64u = {
  enc: bytes => { let s = ''; bytes.forEach(b => s += String.fromCharCode(b)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec: str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(s.length); for(let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
};
async function pipe(bytes, stream){ return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
const canZip = typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

window.EntranceCfg = {
  /* 기본값 — 켜고 끄고, 이름·주소만 바꿔 쓰면 된다 */
  defaults: () => ({
    v:1,
    kick:'OUR SCIENCE CLASS · 2026',
    t1:'우리 반과 선생님이',
    t2:'함께하는 과학 시간',
    sub:'○○중학교 2학년 과학',
    rooms:[
      { id:'sheet', on:true,  type:'list', ic:'📄', name:'학습지',      sub:'차시별 학습지·개념 정리·문제지', items:[] },
      { id:'eval',  on:true,  type:'eval', ic:'📅', name:'평가 일정',   sub:'수행평가·지필 범위·준비물', items:[] },
      { id:'less',  on:true,  type:'list', ic:'📚', name:'수업 페이지', sub:'단원별 수업 자료와 가상 실험실', items:[] },
      { id:'tree',  on:false, type:'link', ic:'🌳', name:'질문나무',    sub:'궁금한 것을 질문으로 키우기', url:'' },
      { id:'stamp', on:false, type:'link', ic:'🏅', name:'칭찬 도장판', sub:'내 도장 확인하고 교환소 가기', url:'' },
      { id:'map',   on:true,  type:'link', ic:'🗺️', name:'과학 지도',   sub:'지금 배우는 게 어디서 와서 어디로', url:'https://scienceisjo.github.io/teacher-toolkit/science-curriculum-map/' }
    ]
  }),
  async pack(cfg){
    const raw = new TextEncoder().encode(JSON.stringify(cfg));
    if(canZip){ try { return 'c=' + b64u.enc(await pipe(raw, new CompressionStream('deflate-raw'))); } catch(e){} }
    return 'j=' + b64u.enc(raw);
  },
  async unpack(hash){
    const m = /[#&](c|j)=([A-Za-z0-9_-]+)/.exec(hash || ''); if(!m) return null;
    let bytes = b64u.dec(m[2]);
    if(m[1] === 'c'){ if(!canZip) throw new Error('이 브라우저는 압축된 설정을 풀지 못해요. 크롬·웨일·엣지 최신판으로 열어 주세요.'); bytes = await pipe(bytes, new DecompressionStream('deflate-raw')); }
    return JSON.parse(new TextDecoder().decode(bytes));
  },
  /* 빠진 칸은 기본값으로 채워 둔다 (옛 링크도 열리게) */
  fix(c){
    const d = this.defaults(); c = Object.assign({}, d, c || {});
    if(!Array.isArray(c.rooms)) c.rooms = d.rooms;
    c.rooms = c.rooms.filter(r => r && r.id).map(r => Object.assign({ on:true, type:'link', ic:'🔗', name:'새 방', sub:'', url:'', items:[] }, r));
    return c;
  },
  safeUrl: u => { u = String(u || '').trim(); return /^(https?:)?\/\//i.test(u) || /^\.{0,2}\//.test(u) ? u : (u && /^[\w.-]+\.[a-z]{2,}/i.test(u) ? 'https://' + u : ''); }
};
})();
