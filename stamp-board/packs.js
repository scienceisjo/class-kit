/* ═══════════════════════════════════════════════════════════════════════════
   🏅 칭찬도장판 — 세계관 팩(packs.js)
   ───────────────────────────────────────────────────────────────────────────
   팩 = «같은 도장 수를 다른 그림·다른 이름으로 보여 주는 세계관». 도장 기록·역량
   코드 6종·단계 임계값(0/1/3/6/10/15/20)·서버는 팩과 무관하게 그대로다.

   팩 추가하는 법 — 이 파일 맨 아래에 registerPack({...}) 하나만 더한다:
     id       : 영문 소문자 (stamp_profiles.theme 에 저장되는 값. 나중에 바꾸지 말 것)
     emoji    : 고르기 화면에 쓰는 이모지
     name     : 팩 이름 (예: '공룡알')
     subject  : '공통' 또는 교과명 — 미리보기·가이드에서 분류용
     tagline  : 한 줄 소개
     stages   : 7단계 이름 배열 (도장 0·1·3·6·10·15·20개)
     species  : 6갈래 이름 {inquiry, analysis, concept, communicate, collaborate, responsible}
                — 코드는 역량 코드지만 이름은 팩 세계관의 낱말(티라노·개구리·해바라기…)
     words    : (선택) {branchBtn:'🦖 공룡 고르기', branchTitle:'어떤 공룡으로 자랄까요?'}
     base     : 반 공동 성장물 {title:'🦕 우리 반 공룡 공원', levels:[4단계 이름]}
                (반 합계 도장 30·80·150개에서 단계가 오른다)
     draw(st,b): 단계 st(0~6)·갈래 b({id,c,d,l,label,icon})를 받아 <svg viewBox="0 0 200 200"> 문자열을 돌려준다.
                wrapSvg(inner) 로 감싸면 된다. 그림 파일 금지 — 전부 SVG 코드.
     bg(st,b) : (선택) 캐릭터 뒤에 깔 배경 SVG 조각(래퍼 없이 inner 만). 단계에 따라 바뀌어도 좋다.
     baseDraw(level,total): (선택) 반 공동 성장물 장면 SVG(래퍼 포함). level 1~4.

   그리기 원칙
     · 6갈래는 색이 아니라 «실루엣»이 달라야 한다 (멀리서도 구분).
     · 갈래 색은 b.c(주색) b.d(짙은색) b.l(연한색) 을 쓴다 — 역량 색이 곧 갈래 색.
     · 성장은 «자라다·부화·피다» 계열 낱말로. «진화» 는 쓰지 않는다.
     · 문법은 ES5(var·function) — index.html 과 같은 스타일.
   ═══════════════════════════════════════════════════════════════════════════ */
var STAMP_PACKS = [];
function registerPack(p){
  if(!p || !p.id || typeof p.draw !== 'function') throw new Error('registerPack: id 와 draw 는 필수');
  for(var i=0;i<STAMP_PACKS.length;i++) if(STAMP_PACKS[i].id===p.id){ STAMP_PACKS[i]=p; return p; }
  STAMP_PACKS.push(p); return p;
}
function packById(id){ for(var i=0;i<STAMP_PACKS.length;i++) if(STAMP_PACKS[i].id===id) return STAMP_PACKS[i]; return null; }
/* 팩으로 그리기 — bg 가 있으면 <svg> 여는 태그 바로 뒤에 깐다 */
function drawPack(id, st, b){
  var p = packById(id) || STAMP_PACKS[0];
  var out = p.draw(st, b);
  if(typeof p.bg === 'function'){ var bgs = p.bg(st, b) || ''; if(bgs) out = out.replace(/^(<svg[^>]*>)/, function(m){ return m + bgs; }); }
  return out;
}

/* ═══════════════════════════════════════════════════════════════
   공통 SVG 조각
   ═══════════════════════════════════════════════════════════════ */
function wrapSvg(inner){ return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+inner+'</svg>'; }
function shadow(cx,cy,rx){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+(rx*0.17)+'" fill="rgba(90,70,40,.13)"/>'; }
function eye(x,y,r){
  return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#3A3226"/>'+
         '<circle cx="'+(x-r*0.3)+'" cy="'+(y-r*0.32)+'" r="'+(r*0.34)+'" fill="#fff"/>';
}
function sparkle(x,y,s,col){
  return '<path d="M'+x+','+(y-s)+' L'+(x+s*0.28)+','+(y-s*0.28)+' L'+(x+s)+','+y+' L'+(x+s*0.28)+','+(y+s*0.28)+
         ' L'+x+','+(y+s)+' L'+(x-s*0.28)+','+(y+s*0.28)+' L'+(x-s)+','+y+' L'+(x-s*0.28)+','+(y-s*0.28)+'Z" fill="'+(col||'#FCEE7B')+'"/>';
}
/* 전설 오라 */
function aura(cx,cy,r,col){
  return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="2.5" opacity=".28"/>'+
         '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.82)+'" fill="'+col+'" opacity=".10"/>'+
         sparkle(cx-r*0.75,cy-r*0.6,7)+sparkle(cx+r*0.78,cy-r*0.3,6)+sparkle(cx+r*0.35,cy+r*0.75,5.5);
}
/* 역량 상징 뱃지 — 머리 위 장식 */
function emblem(b,cx,cy,s){
  var g='<g transform="translate('+cx+','+cy+') scale('+s+')">';
  if(b.id==='inquiry'){ // 탐험 모자
    g+='<path d="M-16,2 Q0,-4 16,2 Q0,8 -16,2Z" fill="'+b.d+'"/>'+
       '<path d="M-10,1 Q-9,-11 0,-12 Q9,-11 10,1Z" fill="'+b.c+'"/>'+
       '<rect x="-10" y="-2" width="20" height="3.4" rx="1.7" fill="'+b.d+'"/>';
  } else if(b.id==='analysis'){ // 안경
    g+='<circle cx="-8" cy="0" r="7" fill="rgba(255,255,255,.55)" stroke="'+b.d+'" stroke-width="2.6"/>'+
       '<circle cx="8" cy="0" r="7" fill="rgba(255,255,255,.55)" stroke="'+b.d+'" stroke-width="2.6"/>'+
       '<path d="M-1,0 L1,0" stroke="'+b.d+'" stroke-width="2.6"/>';
  } else if(b.id==='concept'){ // 전구
    g+='<circle cx="0" cy="-3" r="9" fill="'+b.l+'" stroke="'+b.d+'" stroke-width="2.2"/>'+
       '<rect x="-4" y="5" width="8" height="5" rx="1.6" fill="'+b.d+'"/>'+
       '<path d="M-3,-3 L0,1 L3,-3" stroke="'+b.d+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
       sparkle(-13,-10,4,b.c)+sparkle(13,-9,3.5,b.c);
  } else if(b.id==='communicate'){ // 말풍선
    g+='<rect x="-13" y="-11" width="26" height="18" rx="8" fill="#fff" stroke="'+b.d+'" stroke-width="2.4"/>'+
       '<path d="M-3,7 L-1,13 L4,7Z" fill="#fff" stroke="'+b.d+'" stroke-width="2.4" stroke-linejoin="round"/>'+
       '<circle cx="-6" cy="-2" r="1.9" fill="'+b.d+'"/><circle cx="0" cy="-2" r="1.9" fill="'+b.d+'"/><circle cx="6" cy="-2" r="1.9" fill="'+b.d+'"/>';
  } else if(b.id==='collaborate'){ // 하트
    g+='<path d="M0,9 C-13,0 -11,-11 -4.5,-9 C-1.8,-8 0,-5.5 0,-5.5 C0,-5.5 1.8,-8 4.5,-9 C11,-11 13,0 0,9Z" fill="'+b.c+'" stroke="'+b.d+'" stroke-width="2"/>';
  } else { // 방패
    g+='<path d="M0,-11 L11,-7 Q11,5 0,11 Q-11,5 -11,-7Z" fill="'+b.c+'" stroke="'+b.d+'" stroke-width="2.2"/>'+
       '<path d="M-4.5,0 L-1,3.5 L5,-3.5" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  return g+'</g>';
}

/* ═══════════════════════════════════════════════════════════════
   ① 탐구생물
   ═══════════════════════════════════════════════════════════════ */
function drawCreature(st, b){
  var C = b.c, D = b.d, L = b.l, ID = b.id || 'inquiry';
  st = st|0; if(st<0) st=0; if(st>6) st=6;
  var uid = ID + '-' + st;
  var G = 'url(#bg' + uid + ')';
  var PUP = '#1f2430';
  var SHELL = '#fdf7ea';

  function E(x,y,rx,ry,f,sw,ex){ return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'"'+(sw?' stroke="'+D+'" stroke-width="'+sw+'"':'')+(ex||'')+'/>'; }
  function CI(x,y,r,f,sw,ex){ return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"'+(sw?' stroke="'+D+'" stroke-width="'+sw+'"':'')+(ex||'')+'/>'; }
  function P(dd,f,sw,ex){ return '<path d="'+dd+'" fill="'+f+'"'+(sw?' stroke="'+D+'" stroke-width="'+sw+'" stroke-linejoin="round" stroke-linecap="round"':'')+(ex||'')+'/>'; }
  function LN(dd,col,w,ex){ return '<path d="'+dd+'" fill="none" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"'+(ex||'')+'/>'; }
  function limb(dd,w){ return LN(dd,D,w+5.5,'') + LN(dd,C,w,''); }
  function shine(x,y,rx,ry,rot,op){ return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#ffffff" opacity="'+(op||0.33)+'" transform="rotate('+rot+' '+x+' '+y+')"/>'; }
  function eye(x,y,r){
    var t = E(x,y,r,r*1.12,'#ffffff',Math.max(1.8,r*0.24));
    t += E(x+r*0.10,y+r*0.14,r*0.52,r*0.62,PUP,0);
    t += CI(x-r*0.26,y-r*0.34,r*0.28,'#ffffff',0);
    t += CI(x+r*0.30,y+r*0.44,r*0.14,'#ffffff',0,' opacity=".75"');
    return t;
  }
  function eyes(x,y,gap,r){ return eye(x-gap,y,r) + eye(x+gap,y,r); }
  function blush(x,y,gap,r){
    return E(x-gap,y,r,r*0.66,'#ff7a95',0,' opacity=".42"') + E(x+gap,y,r,r*0.66,'#ff7a95',0,' opacity=".42"');
  }
  function smile(x,y,w){ return LN('M '+(x-w)+' '+y+' Q '+x+' '+(y+w*0.9)+' '+(x+w)+' '+y, D, 2.4); }
  function star(x,y,r,f,op){
    var dd = 'M '+x+' '+(y-r)+' Q '+x+' '+y+' '+(x+r)+' '+y+' Q '+x+' '+y+' '+x+' '+(y+r)+' Q '+x+' '+y+' '+(x-r)+' '+y+' Q '+x+' '+y+' '+x+' '+(y-r)+' Z';
    return '<path d="'+dd+'" fill="'+f+'" opacity="'+op+'"/>';
  }
  function sparkles(list){
    var t='', i;
    for(i=0;i<list.length;i++){ t += star(list[i][0],list[i][1],list[i][2],(i%2?L:'#ffffff'),0.9); }
    return t;
  }
  function ground(w){ return E(100,177.5,w,w*0.26,D,0,' opacity=".18"'); }

  var s = '';
  s += '<defs>';
  s += '<radialGradient id="bg'+uid+'" cx="34%" cy="26%" r="80%"><stop offset="0" stop-color="'+L+'"/><stop offset="1" stop-color="'+C+'"/></radialGradient>';
  s += '<radialGradient id="au'+uid+'" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="'+L+'" stop-opacity=".70"/><stop offset="0.55" stop-color="'+C+'" stop-opacity=".28"/><stop offset="1" stop-color="'+C+'" stop-opacity="0"/></radialGradient>';
  s += '</defs>';

  /* ================= AURA (st 6) ================= */
  if(st===6){
    s += '<circle cx="100" cy="110" r="82" fill="url(#au'+uid+')"/>';
    s += '<circle cx="100" cy="110" r="68" fill="none" stroke="'+L+'" stroke-width="2" opacity=".55" stroke-dasharray="7 9"/>';
    s += '<circle cx="100" cy="110" r="79" fill="none" stroke="#ffffff" stroke-width="1.5" opacity=".35" stroke-dasharray="3 12"/>';
  }

  /* ================= ST 0 : EGG ================= */
  if(st===0){
    s += ground(30);
    s += E(100,138,34,42,G,3.4);
    if(ID==='inquiry'){
      var li;
      for(li=0; li<3; li++){
        var ly = 122 + li*22, lx = (li===1? 112 : 88);
        s += P('M '+lx+' '+ly+' C '+(lx-13)+' '+(ly-9)+' '+(lx-13)+' '+(ly+7)+' '+lx+' '+(ly+4)+' C '+(lx+9)+' '+(ly+2)+' '+(lx+7)+' '+(ly-8)+' '+lx+' '+ly+' Z', L, 2.2);
      }
    } else if(ID==='analysis'){
      s += LN('M 70 126 Q 100 118 130 126', L, 6);
      s += LN('M 68 146 Q 100 138 132 146', L, 6);
      s += LN('M 74 164 Q 100 157 126 164', L, 6);
      s += CI(100,136,3.4,D,0,' opacity=".35"');
    } else if(ID==='concept'){
      s += LN('M 74 128 L 92 140 L 74 150 L 96 164', L, 6);
      s += LN('M 108 122 L 122 132 L 110 142 L 126 152', L, 5);
    } else if(ID==='communicate'){
      s += CI(86,126,7,L,2); s += CI(112,138,9,L,2); s += CI(82,154,6,L,2); s += CI(110,164,5,L,2); s += CI(118,116,4.5,L,2);
    } else if(ID==='collaborate'){
      s += CI(88,132,11,'none',2.8); s += CI(108,132,11,'none',2.8);
      s += CI(88,156,11,'none',2.8); s += CI(108,156,11,'none',2.8);
    } else {
      var hx,hy,hi, hp=[[100,124],[84,146],[116,146],[100,166]];
      for(hi=0;hi<4;hi++){
        hx=hp[hi][0]; hy=hp[hi][1];
        s += P('M '+hx+' '+(hy-11)+' L '+(hx+10)+' '+(hy-5)+' L '+(hx+10)+' '+(hy+5)+' L '+hx+' '+(hy+11)+' L '+(hx-10)+' '+(hy+5)+' L '+(hx-10)+' '+(hy-5)+' Z', L, 2.2);
      }
    }
    s += shine(87,116,8,13,-25,0.42);
    s += shine(93,104,4,5,-25,0.55);
    s += sparkles([[150,110,6],[52,132,5],[142,158,4]]);
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  }

  /* ================= ST 1 : HATCHING ================= */
  if(st===1){
    s += ground(32);
    /* species hint above head */
    if(ID==='inquiry'){
      s += LN('M 100 118 C 100 108 98 102 96 96', D, 3);
      s += P('M 96 96 C 85 90 84 79 95 78 C 102 79 103 91 96 96 Z', L, 2.6);
    } else if(ID==='analysis'){
      s += P('M 84 118 L 76 96 L 96 112 Z', C, 2.6);
      s += P('M 116 118 L 124 96 L 104 112 Z', C, 2.6);
    } else if(ID==='concept'){
      s += P('M 88 116 L 100 84 L 112 116 Z', L, 2.8);
    } else if(ID==='communicate'){
      s += P('M 84 118 L 62 96 L 76 86 L 96 108 Z', C, 2.8);
      s += P('M 116 118 L 138 96 L 124 86 L 104 108 Z', C, 2.8);
    } else if(ID==='collaborate'){
      s += CI(80,112,10,C,2.8); s += CI(120,112,10,C,2.8);
    } else {
      s += P('M 74 126 C 74 100 126 100 126 126 Z', C, 3);
      s += LN('M 100 102 L 100 126', D, 2, ' opacity=".4"');
    }
    /* head */
    s += E(100,136,27,25,G,3.2);
    s += E(100,144,15,10,L,0,' opacity=".8"');
    s += eyes(100,134,12,10);
    s += blush(100,146,20,6.5);
    s += smile(100,148,6);
    s += shine(88,126,7,9,-25,0.4);
    /* shell cup (front) */
    s += P('M 61 166 L 68 152 L 76 164 L 84 150 L 92 163 L 100 149 L 108 163 L 116 150 L 124 164 L 132 152 L 139 166 C 141 178 129 182 100 182 C 71 182 59 178 61 166 Z', SHELL, 3);
    s += LN('M 78 172 L 84 176', D, 1.8, ' opacity=".35"');
    s += LN('M 116 170 L 122 175', D, 1.8, ' opacity=".35"');
    /* shell cap on head */
    s += P('M 118 110 L 126 118 L 136 112 L 142 122 L 152 120 C 150 132 138 136 128 130 C 120 126 116 118 118 110 Z', SHELL, 2.8, ' transform="rotate(-8 134 120)"');
    s += sparkles([[52,120,7],[152,142,6],[62,152,4],[146,98,5]]);
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  }

  /* ================= ST 2 : BABY ================= */
  if(st===2){
    s += ground(36);
    /* behind-hints */
    if(ID==='inquiry'){
      s += limb('M 78 156 C 58 160 50 144 60 134', 8);
      s += LN('M 100 84 C 100 74 98 68 95 62', D, 3.2);
      s += P('M 95 62 C 82 55 81 42 94 41 C 102 43 103 57 95 62 Z', L, 2.8);
      s += P('M 104 76 C 114 70 124 74 120 82 C 114 87 105 83 104 76 Z', L, 2.4);
    } else if(ID==='analysis'){
      s += P('M 76 92 L 66 62 L 92 84 Z', C, 3);
      s += P('M 124 92 L 134 62 L 108 84 Z', C, 3);
      s += P('M 74 132 C 58 132 54 154 70 162 Z', C, 2.8);
      s += P('M 126 132 C 142 132 146 154 130 162 Z', C, 2.8);
    } else if(ID==='concept'){
      var ci2, cang;
      for(ci2=0; ci2<7; ci2++){
        cang = -90 + ci2*30;
        s += '<g transform="rotate('+cang+' 100 112)">' + P('M 93 88 L 100 68 L 107 88 Z', C, 2.6) + '</g>';
      }
      s += P('M 76 158 L 58 152 L 68 144 L 50 136 L 64 148 L 54 150 Z', L, 2.6);
    } else if(ID==='communicate'){
      s += P('M 86 96 L 64 72 L 80 62 L 98 88 Z', C, 3);
      s += P('M 114 96 L 136 72 L 120 62 L 102 88 Z', C, 3);
      s += E(72,67,13,7.5,L,2.8,' transform="rotate(-42 72 67)"');
      s += E(128,67,13,7.5,L,2.8,' transform="rotate(42 128 67)"');
    } else if(ID==='collaborate'){
      s += limb('M 80 140 C 62 138 54 148 54 158', 9); s += CI(54,158,9,C,3);
      s += limb('M 120 140 C 138 138 146 148 146 158', 9); s += CI(146,158,9,C,3);
      s += CI(80,90,11,C,3); s += CI(120,90,11,C,3);
    } else {
      s += P('M 62 150 C 62 108 138 108 138 150 Z', G, 3.2);
      s += P('M 100 128 L 109 133 L 109 143 L 100 148 L 91 143 L 91 133 Z', L, 2.2, ' opacity=".8"');
      s += E(100,150,40,9,L,3);
    }
    if(ID!=='responsible'){
      s += E(100,148,30,28,G,3.2);
      s += E(100,154,19,17,L,0,' opacity=".85"');
      s += E(86,171,11,8,C,3); s += E(114,171,11,8,C,3);
      s += E(100,112,28,26,G,3.2);
      s += eyes(100,110,12,10.5);
      s += blush(100,124,20,6.5);
      s += smile(100,124,7);
      s += shine(88,100,8,10,-25,0.36);
    } else {
      s += E(72,166,13,9,C,3); s += E(128,166,13,9,C,3);
      s += E(100,152,21,18,G,3.2);
      s += eyes(100,150,9,8.5);
      s += blush(100,160,15,5.5);
      s += smile(100,160,5.5);
    }
    s += sparkles([[46,116,6],[156,128,5]]);
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  }

  /* ================= ST 3~6 : SPECIES FORMS ================= */
  var g = st - 3;
  var K = [0.82,0.94,1.06,1.16][g];
  if(ID==='responsible') K *= 1.12;
  else if(ID==='communicate') K *= 0.88;
  else if(ID==='analysis') K *= 0.97;
  var body = '';

  /* ---------- inquiry : tall lizard-sprout ---------- */
  function buildInquiry(){
    var t = '';
    /* curling tail */
    t += limb('M 86 154 C 58 162 40 142 48 122 C 52 112 64 109 70 118', 11 + g*1.4);
    t += CI(70,118,5+g*0.6,C,3);
    /* back spikes */
    var i;
    for(i=0;i<3+g;i++){
      var sy = 128 - i*11;
      t += P('M 78 '+sy+' L '+(66-g*2)+' '+(sy-5)+' L 79 '+(sy-11)+' Z', L, 2.4);
    }
    /* arms */
    if(g>=1){
      t += limb('M 78 134 C 68 138 64 146 66 152', 8); t += CI(66,152,5.5,C,2.8);
      t += limb('M 122 134 C 132 138 136 146 134 152', 8); t += CI(134,152,5.5,C,2.8);
    }
    /* torso (tall) */
    t += E(100,140,25,34,G,3.2);
    t += E(100,146,15,24,L,0,' opacity=".9"');
    t += LN('M 90 132 Q 100 136 110 132', D, 2, ' opacity=".25"');
    t += LN('M 90 146 Q 100 150 110 146', D, 2, ' opacity=".25"');
    /* feet */
    t += E(84,172,13,9,C,3); t += E(116,172,13,9,C,3);
    t += LN('M 78 172 l -4 -2 M 78 175 l -4 1', D, 1.6, ' opacity=".45"');
    t += LN('M 122 172 l 4 -2 M 122 175 l 4 1', D, 1.6, ' opacity=".45"');
    /* head */
    t += E(100,96,27,25,G,3.2);
    t += E(100,105,14,9,L,0,' opacity=".85"');
    t += CI(95,103,1.7,D,0,' opacity=".55"'); t += CI(105,103,1.7,D,0,' opacity=".55"');
    t += eyes(100,93,12,10);
    t += blush(100,106,21,6);
    t += smile(100,108,6);
    t += shine(88,84,7,9,-25,0.36);
    /* leaf antenna */
    t += LN('M 100 72 C 100 64 98 58 95 53', D, 3.2);
    t += P('M 95 53 C 82 46 81 33 94 32 C 103 34 104 48 95 53 Z', L, 2.8);
    t += LN('M 92 48 L 97 37', D, 1.6, ' opacity=".45"');
    if(g>=1){
      t += P('M 104 66 C 117 58 130 63 125 73 C 118 79 106 74 104 66 Z', L, 2.6);
      t += LN('M 110 70 L 122 69', D, 1.5, ' opacity=".4"');
    }
    if(g>=2){
      t += P('M 96 66 C 83 58 70 63 75 73 C 82 79 94 74 96 66 Z', L, 2.6);
      t += P('M 78 120 C 84 110 92 108 100 112 C 108 108 116 110 122 120 C 112 126 88 126 78 120 Z', L, 2.6);
    }
    if(g>=3){
      t += P('M 108 44 C 120 37 130 43 124 53 C 116 58 108 51 108 44 Z', L, 2.6);
      t += P('M 82 44 C 70 37 60 43 66 53 C 74 58 82 51 82 44 Z', L, 2.6);
      t += CI(100,120,6,'#ffffff',2.4,' opacity=".9"');
      t += CI(100,120,3,L,0);
    }
    return t;
  }

  /* ---------- analysis : wide owl ---------- */
  function buildAnalysis(){
    var t = '';
    var ry = 46 + g*2;
    var rx = 34 + g*1.5;
    var cy = 170 - ry;
    var topY = cy - ry;
    var fy = topY + 28;
    var fr = 18 + g*0.8;
    var fo = 13 + g*0.4;
    var i, x, yy, off, wy;
    var ft = [88, 112];
    for(i=0;i<2;i++){
      x = ft[i];
      t += LN('M '+x+' 160 L '+x+' 171', '#F5A623', 7);
      t += LN('M '+(x-9)+' 176 L '+x+' 169 L '+(x+9)+' 176', '#F5A623', 5.5);
      t += LN('M '+x+' 169 L '+x+' 174', '#F5A623', 5.5);
    }
    if(g>=1){
      t += P('M 112 '+(cy+ry-16)+' L '+(130+g*2)+' '+(cy+ry+4)+' L 110 '+(cy+ry-2)+' Z', C, 2.8);
    }
    var ty = topY + 12;
    t += P('M 85 '+(ty-3)+' L '+(81-g*0.4)+' '+(ty-13)+' L 96 '+(ty-6)+' Z', C, 2.6);
    t += P('M 115 '+(ty-3)+' L '+(119+g*0.4)+' '+(ty-13)+' L 104 '+(ty-6)+' Z', C, 2.6);
    t += E(100, cy, rx, ry, G, 3.2);
    t += E(100, cy+12, rx*0.62, ry*0.52, L, 0, ' opacity=".92"');
    for(i=0;i<2+g;i++){
      yy = cy + 2 + i*7;
      off = (i%2===0) ? 7 : 0;
      t += E(96-off, yy, 3.4, 2.6, C, 0, ' opacity=".75"');
      t += E(104+off, yy, 3.4, 2.6, C, 0, ' opacity=".75"');
    }
    t += CI(100-fo, fy, fr, L, 0);
    t += CI(100+fo, fy, fr, L, 0);
    t += E(100, fy-2, fo+4, fr*0.9, L, 0);
    var wx = rx - 7;
    var wrx = 11 + g*0.6;
    var wry = 24 + g*1.5;
    var lwx = 100 - wx;
    var lwy = cy + 4;
    var ltf = ' transform="rotate(-9 '+lwx+' '+lwy+')"';
    t += E(lwx, lwy, wrx, wry, C, 3, ltf);
    for(i=0;i<2+g;i++){
      wy = lwy + 14 - i*8;
      t += LN('M '+(lwx-7)+' '+wy+' Q '+lwx+' '+(wy+6)+' '+(lwx+7)+' '+wy, D, 2.2, ltf);
    }
    var rw = (g>=2);
    var rwx = 100 + wx + (rw ? 4 : 0);
    var rwy = cy + (rw ? -8 : 4);
    var rtf = ' transform="rotate('+(rw ? 42 : 9)+' '+rwx+' '+rwy+')"';
    t += E(rwx, rwy, wrx, wry, C, 3, rtf);
    for(i=0;i<2+g;i++){
      wy = rwy + 14 - i*8;
      t += LN('M '+(rwx-7)+' '+wy+' Q '+rwx+' '+(wy+6)+' '+(rwx+7)+' '+wy, D, 2.2, rtf);
    }
    t += shine(92, topY+8, 9, 4, -12, 0.32);
    t += eyes(100, fy-5, fo, 11 + g*0.4);
    t += P('M 93 '+(fy+6)+' L 107 '+(fy+6)+' L 100 '+(fy+18)+' Z', '#F5A623', 2.6);
    t += blush(100, fy+9, 25, 5.5);
    if(g>=2){ t += sparkles([[100-rx-14, topY+24, 3],[100+rx+14, topY+18, 2.6]]); }
    if(g>=3){ t += star(100, topY-22, 7, '#FFE066', 1); }
    return t;
  }

  function buildConcept(){
    var t = '';
    var hr = 27 + g*1.2;                 /* head radius */
    var br = 26 + g*1.5;                 /* body radius */
    var cw = 12 + g*1.6;                 /* cheek pouch width */
    var ch = 10 + g*1.0;                 /* cheek pouch height */
    var cx = 22 + g*1.5;                 /* cheek offset from center */
    var er = 9 + g*0.6;                  /* ear radius */
    var py = 130 + g*0.8;                /* paw y */

    /* tiny stubby tail (behind body) */
    t += E(100 + br - 2, 152, 6 + g*0.4, 5 + g*0.3, C, 2.8);

    /* short round ears (behind head) */
    t += CI(100 - hr*0.74, 97 - hr*0.78, er, C, 2.8);
    t += CI(100 + hr*0.74, 97 - hr*0.78, er, C, 2.8);

    /* round little body */
    t += E(100, 143, br + 1, br, G, 3.2);
    t += E(100, 150, 15 + g, 16 + g, L, 0, ' opacity=".9"');

    /* short chubby hind feet */
    t += E(100 - 16, 170, 12, 7, C, 3);
    t += E(100 + 16, 170, 12, 7, C, 3);

    /* puffed cheek pouches (behind head so they bulge out to the sides) */
    t += E(100 - cx, 104, cw, ch, G, 3);
    t += E(100 + cx, 104, cw, ch, G, 3);

    /* head */
    t += CI(100, 97, hr, G, 3.2);

    /* inner ears */
    t += E(100 - hr*0.74, 97 - hr*0.86, 4.5 + g*0.2, 5 + g*0.2, L, 0, ' opacity=".85"');
    t += E(100 + hr*0.74, 97 - hr*0.86, 4.5 + g*0.2, 5 + g*0.2, L, 0, ' opacity=".85"');

    /* face */
    t += eyes(100, 93, 11 + g*0.4, 9);
    t += E(100, 102.5, 3, 2.4, D, 0);
    t += smile(100, 107, 5.5);

    /* short whiskers */
    var wx = 100 - cx - cw;
    t += LN('M ' + (wx + 1) + ' 100 L ' + (wx - 13) + ' 96', D, 2, ' opacity=".7"');
    t += LN('M ' + (wx + 1) + ' 106 L ' + (wx - 14) + ' 107', D, 2, ' opacity=".7"');
    t += LN('M ' + (200 - wx - 1) + ' 100 L ' + (200 - wx + 13) + ' 96', D, 2, ' opacity=".7"');
    t += LN('M ' + (200 - wx - 1) + ' 106 L ' + (200 - wx + 14) + ' 107', D, 2, ' opacity=".7"');

    /* blush on the pouches */
    t += blush(100, 108, cx*2, 5 + g*0.3);
    if(g >= 2){
      t += E(100 - cx, 99, cw*0.45, ch*0.35, L, 0, ' opacity=".35"');
      t += E(100 + cx, 99, cw*0.45, ch*0.35, L, 0, ' opacity=".35"');
    }

    /* tiny front paws held together at the chest */
    t += E(100 - 9, py, 6.5, 5.5, C, 2.8);
    t += E(100 + 9, py, 6.5, 5.5, C, 2.8);

    /* a little seed held in the paws */
    if(g >= 1){
      t += E(100, py + 1, 5.5, 5, L, 2.4);
      t += P('M 94.5 ' + (py - 1) + ' Q 100 ' + (py - 8) + ' 105.5 ' + (py - 1) + ' Z', D, 0);
    }

    t += shine(100 - 12, 86, 7, 9, -25, 0.36);

    if(g >= 3){
      t += sparkles([[76, 58, 3], [100, 52, 4], [124, 58, 3]]);
    }
    return t;
  }

  function buildCommunicate(){
  var t = '';
  var hrx = 26 + g*0.8, hry = 24 + g*0.7;
  var brx = 25 + g*1.1, bry = 31 + g*1.0;
  var er  = 26 + g*1.2;
  var ey  = 54 - g*0.8;
  var ex  = 14 + g*0.6;
  var elx = 100 - ex, erx = 100 + ex;
  var i;

  /* ---- cotton tail (behind body) ---- */
  var tx = 100 - brx - 4;
  t += CI(tx-6, 142, 5+g*0.3, L, 2.4);
  t += CI(tx-6, 156, 5+g*0.3, L, 2.4);
  t += CI(tx, 150, 10+g*0.7, L, 3);
  t += CI(tx-2, 146, 3.2, '#fff', 0, ' opacity=".5"');

  /* ---- ears (behind head) ---- */
  t += E(elx, ey, 9+g*0.4, er, G, 3, ' transform="rotate(-11 '+elx+' '+ey+')"');
  t += E(elx, ey+3, 4.6+g*0.2, er-9, L, 0, ' transform="rotate(-11 '+elx+' '+(ey+3)+')" opacity=".92"');
  if(g>=1){
    var fd = ' transform="translate('+(g*0.6)+','+(-g*1.2)+')"';
    t += P('M 106 82 C 103 64 105 48 112 41 C 121 32 137 39 134 52 C 131 63 119 65 113 58 C 114 68 116 76 117 82 Z', G, 3, fd);
    t += E(111, 66, 4.4, 11, L, 0, ' transform="translate('+(g*0.6)+','+(-g*1.2)+') rotate(-8 111 66)" opacity=".92"');
  } else {
    t += E(erx, ey, 9, er, G, 3, ' transform="rotate(11 '+erx+' '+ey+')"');
    t += E(erx, ey+3, 4.6, er-9, L, 0, ' transform="rotate(11 '+erx+' '+(ey+3)+')" opacity=".92"');
  }

  /* ---- torso ---- */
  t += E(100, 139, brx, bry, G, 3.2);
  t += E(100, 145, brx-10, bry-11, L, 0, ' opacity=".9"');

  /* ---- hind feet ---- */
  var fy = 168, fw = 13+g*0.6, fh = 7.5+g*0.2;
  var fxl = 83 - g*0.5, fxr = 117 + g*0.5;
  t += E(fxl, fy, fw, fh, C, 3);
  t += E(fxr, fy, fw, fh, C, 3);
  if(g>=1){
    t += LN('M '+(fxl-4)+' '+(fy-4)+' L '+(fxl-4)+' '+(fy+3), D, 1.8);
    t += LN('M '+(fxl+2)+' '+(fy-4.5)+' L '+(fxl+2)+' '+(fy+2.5), D, 1.8);
    t += LN('M '+(fxr+4)+' '+(fy-4)+' L '+(fxr+4)+' '+(fy+3), D, 1.8);
    t += LN('M '+(fxr-2)+' '+(fy-4.5)+' L '+(fxr-2)+' '+(fy+2.5), D, 1.8);
  }

  /* ---- short front paws ---- */
  var pxl = 100 - brx + 5, pxr = 100 + brx - 5, py = 150 + g*0.5;
  t += E(pxl, py, 7.5+g*0.3, 9.5+g*0.4, C, 3, ' transform="rotate(14 '+pxl+' '+py+')"');
  t += E(pxr, py, 7.5+g*0.3, 9.5+g*0.4, C, 3, ' transform="rotate(-14 '+pxr+' '+py+')"');

  /* ---- head ---- */
  t += E(100, 96, hrx, hry, G, 3.2);

  /* ---- whiskers ---- */
  var wx = hrx - 3;
  t += LN('M '+(100-wx)+' 103 L '+(100-wx-14)+' 100', D, 1.8, ' opacity=".7"');
  t += LN('M '+(100-wx)+' 107 L '+(100-wx-15)+' 108', D, 1.8, ' opacity=".7"');
  t += LN('M '+(100+wx)+' 103 L '+(100+wx+14)+' 100', D, 1.8, ' opacity=".7"');
  t += LN('M '+(100+wx)+' 107 L '+(100+wx+15)+' 108', D, 1.8, ' opacity=".7"');

  /* ---- face ---- */
  t += eyes(100, 92, 13+g*0.4, 9+g*0.3);
  t += blush(100, 107, 30+g, 5.5+g*0.2);
  t += P('M 95.5 100 L 104.5 100 L 100 105.5 Z', D, 0);
  t += LN('M 100 105 L 100 108.5', D, 2.2);
  t += LN('M 100 108.5 C 96.5 113 92.5 112 91.5 108', D, 2.2);
  t += LN('M 100 108.5 C 103.5 113 107.5 112 108.5 108', D, 2.2);
  /* two front teeth */
  t += E(96.7, 113, 3, 4.6, '#ffffff', 2.2);
  t += E(103.3, 113, 3, 4.6, '#ffffff', 2.2);
  t += shine(88, 84, 7, 9, -25, 0.34);

  /* ---- ribbon at neck ---- */
  if(g>=2){
    t += P('M 100 121 L 85 113 L 87 129 Z', L, 2.6);
    t += P('M 100 121 L 115 113 L 113 129 Z', L, 2.6);
    t += CI(100, 121, 4.2, L, 2.6);
  }

  /* ---- sparkles ---- */
  if(g>=3){
    t += sparkles([[40,60,3],[160,66,3.4],[46,124,2.6],[156,128,3]]);
    t += star(150, 40, 5, '#ffffff', 0.9);
  }
  return t;
}

  function buildCollaborate(){
  var t = '';
  var ORG = '#F5A623';
  var w = 34 + g*2;
  var top = 64 - g*3;
  var bot = 166;
  var hw = w*0.45;
  var midY = (top+bot)/2;
  var ey = top + 26;
  var body = function(cx,tp,bt,ww,hh){
    return 'M '+cx+' '+tp
      +' C '+(cx+hh)+' '+tp+' '+(cx+ww)+' '+(tp+(bt-tp)*0.45)+' '+(cx+ww)+' '+(bt-18)
      +' C '+(cx+ww)+' '+(bt+8)+' '+(cx-ww)+' '+(bt+8)+' '+(cx-ww)+' '+(bt-18)
      +' C '+(cx-ww)+' '+(tp+(bt-tp)*0.45)+' '+(cx-hh)+' '+tp+' '+cx+' '+tp+' Z';
  };
  var rot = function(a,cx,cy){ return ' transform="rotate('+a+' '+cx+' '+cy+')"'; };

  /* webbed feet (behind body, peeking out at the bottom) */
  t += E(100-13, 170, 12+g*0.6, 5.2, ORG, 2.8);
  t += E(100+13, 170, 12+g*0.6, 5.2, ORG, 2.8);

  /* flippers, flat against the sides */
  var fr = 8 + g*0.4, fl = 20 + g*1.2;
  t += E(100+w-2, midY+8, fr, fl, C, 3, rot(-14, 100+w-2, midY+8));
  if(g>=1){
    /* one flipper lifted in a wave */
    t += E(100-w-4, midY-18, fr, fl, C, 3, rot(-52, 100-w-4, midY-18));
  } else {
    t += E(100-w+2, midY+8, fr, fl, C, 3, rot(14, 100-w+2, midY+8));
  }

  /* one-piece teardrop body */
  t += P(body(100, top, bot, w, hw), G, 3.2);
  /* white front */
  t += E(100, midY+22, w-9, (bot-top)/2-22, L, 0);
  t += E(100, top+26, w-16, 11.5, L, 0);

  /* scarf */
  if(g>=2){
    var sy = ey + 30;
    t += E(100, sy, w-3, 6.5, '#FFD166', 2.8);
    t += P('M '+(100-w*0.5)+' '+sy+' L '+(100-w*0.5-12)+' '+(sy-3)+' L '+(100-w*0.5-13)+' '+(sy+16)+' L '+(100-w*0.5-1)+' '+(sy+13)+' Z', '#FFD166', 2.8);
  }

  /* face */
  t += eyes(100, ey, 19, 8.5+g*0.3);
  t += P('M 91 '+(ey+9)+' L 109 '+(ey+9)+' L 100 '+(ey+21)+' Z', ORG, 2.6);
  t += blush(100, ey+11, 30+g*2, 5);
  t += shine(100-w*0.42, top+10, 5.5, 8, -25, 0.28);

  /* a tiny chick standing alongside */
  if(g>=3){
    var bx = 160, bt = 116, bb = 168, bw = 16;
    t += E(bx-6, 173, 6.5, 4, ORG, 2.4);
    t += E(bx+6, 173, 6.5, 4, ORG, 2.4);
    t += E(bx-bw+1, 146, 4.5, 10, C, 2.4, rot(16, bx-bw+1, 146));
    t += E(bx+bw-1, 146, 4.5, 10, C, 2.4, rot(-16, bx+bw-1, 146));
    t += P(body(bx, bt, bb, bw, bw*0.45), G, 2.8);
    t += E(bx, 145, bw-5, 20, L, 0);
    t += E(bx, 132, bw-6, 7, L, 0);
    t += eyes(bx, 131, 9.5, 4.5);
    t += P('M '+(bx-4)+' 137 L '+(bx+4)+' 137 L '+bx+' 143 Z', ORG, 2.2);
    t += blush(bx, 139, 15, 3);
  }
  if(g>=2){ t += sparkles([[74,52,3],[128,56,2.6]]); }
  return t;
}

  function buildResponsible(){
    var t = '', i;
    /* shell spikes */
    if(g>=1){
      for(i=0;i<5;i++){
        var sx = 60 + i*20, sy = 108 + Math.abs(i-2)*9;
        t += P('M '+(sx-8)+' '+sy+' L '+sx+' '+(sy-14-g*3)+' L '+(sx+8)+' '+sy+' Z', L, 2.6);
      }
    }
    /* back legs */
    t += E(66,164,15,11,C,3.2); t += E(134,164,15,11,C,3.2);
    /* tail */
    t += P('M 146 152 L 160 148 L 148 142 Z', C, 2.8);
    /* dome */
    t += P('M 46 150 C 46 96 154 96 154 150 Z', G, 3.4);
    /* plates */
    var hp = [[100,127,13],[73,140,11],[127,140,11]];
    for(i=0;i<hp.length;i++){
      var hx=hp[i][0], hy=hp[i][1], hr=hp[i][2];
      t += P('M '+hx+' '+(hy-hr)+' L '+(hx+hr*0.88)+' '+(hy-hr*0.5)+' L '+(hx+hr*0.88)+' '+(hy+hr*0.5)+' L '+hx+' '+(hy+hr)+' L '+(hx-hr*0.88)+' '+(hy+hr*0.5)+' L '+(hx-hr*0.88)+' '+(hy-hr*0.5)+' Z', L, 2.4, ' opacity=".9"');
    }
    t += shine(74,128,9,12,-30,0.3);
    /* rim */
    t += E(100,150,54,11,L,3.2);
    t += LN('M 52 152 L 148 152', D, 2, ' opacity=".25"');
    /* front arms */
    t += E(64,158,16,11,C,3.2,' transform="rotate(-18 64 158)"');
    t += E(136,158,16,11,C,3.2,' transform="rotate(18 136 158)"');
    if(g>=1){
      t += LN('M 54 160 l -5 3 M 58 164 l -4 4', D, 2, ' opacity=".45"');
      t += LN('M 146 160 l 5 3 M 142 164 l 4 4', D, 2, ' opacity=".45"');
    }
    /* head */
    t += E(100,156,21,18,G,3.2);
    t += E(100,162,12,7,L,0,' opacity=".85"');
    t += eyes(100,153,9,8.5);
    t += blush(100,163,15,5.5);
    t += smile(100,163,5.5);
    t += shine(92,147,5,6,-25,0.34);
    if(g>=2){
      t += CI(100,113,5.5,'#ffffff',2.2,' opacity=".9"');
      t += CI(100,113,2.6,L,0);
    }
    if(g>=3){
      t += LN('M 46 150 C 46 96 154 96 154 150', '#ffffff', 3, ' opacity=".5"');
      t += star(56,104,7,L,0.9); t += star(144,104,7,L,0.9);
    }
    return t;
  }

  if(ID==='analysis') body = buildAnalysis();
  else if(ID==='concept') body = buildConcept();
  else if(ID==='communicate') body = buildCommunicate();
  else if(ID==='collaborate') body = buildCollaborate();
  else if(ID==='responsible') body = buildResponsible();
  else body = buildInquiry();

  s += ground(34*K + g*2);
  s += '<g transform="translate(100,176) scale('+K.toFixed(3)+') translate(-100,-176)">' + body + '</g>';

  /* stage effects */
  if(st===4) s += sparkles([[38,96,7],[164,110,6]]);
  if(st===5) s += sparkles([[32,92,8],[168,104,7],[46,58,5],[156,60,5]]);
  if(st===6){
    s += sparkles([[26,86,9],[174,96,8],[40,46,6],[160,44,6],[100,18,7],[22,140,5],[178,142,5]]);
    s += CI(58,168,4,L,0,' opacity=".8"');
    s += CI(142,170,3,L,0,' opacity=".8"');
    s += CI(150,60,3.5,'#ffffff',0,' opacity=".85"');
  }

  return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
}

/* ═══════════════════════════════════════════════════════════════
   ② 과학자 아바타
   ═══════════════════════════════════════════════════════════════ */
function drawScientist(st, b){
  st = st|0; if(st<0){st=0;} if(st>6){st=6;}
  var C=b.c, D=b.d, L=b.l, ID=b.id||'inquiry';
  var SK='#F5D9BC', SK2='#E3B896', WH='#FFFFFF', GW='#FBFCFF', GS='#D9E2EE', INK='#2B2B36', PANT='#5B6478', GOLD='#F7C948';
  var HC='#5A4030';
  if(ID==='analysis'){HC='#2F3B57';}
  else if(ID==='concept'){HC='#8A4A1E';}
  else if(ID==='communicate'){HC='#7E2F4D';}
  else if(ID==='collaborate'){HC='#4B3363';}
  else if(ID==='responsible'){HC='#2C4F4B';}
  var SCA=[0.62,0.70,0.78,0.86,0.94,1.02,1.10], SC=SCA[st];
  var uid='sci_'+ID+'_'+st;
  var s='';
  function E(x,y,rx,ry,f,sw,op){ return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'"'+(op!=null?' opacity="'+op+'"':'')+(sw?' stroke="'+D+'" stroke-width="'+sw+'" stroke-linejoin="round"':'')+'/>'; }
  function CI(x,y,r,f,sw,op){ return E(x,y,r,r,f,sw,op); }
  function R(x,y,w,h,rr,f,sw,op){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rr+'" fill="'+f+'"'+(op!=null?' opacity="'+op+'"':'')+(sw?' stroke="'+D+'" stroke-width="'+sw+'" stroke-linejoin="round"':'')+'/>'; }
  function P(d,f,sw,op){ return '<path d="'+d+'" fill="'+(f||'none')+'"'+(op!=null?' opacity="'+op+'"':'')+(sw?' stroke="'+D+'" stroke-width="'+sw+'" stroke-linejoin="round" stroke-linecap="round"':'')+'/>'; }
  function ST(d,col,w,op){ return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+w+'"'+(op!=null?' opacity="'+op+'"':'')+' stroke-linecap="round" stroke-linejoin="round"/>'; }
  function ARM(d){ var sl = (st>=1)?GW:C; return ST(d,D,8.4)+ST(d,sl,5); }
  function HAND(x,y,r){ return CI(x,y,r||4.6,SK,2.4); }
  function SPK(x,y,r,f,op){ var q=r*0.22; return '<path d="M'+x+','+(y-r)+' Q'+(x+q)+','+(y-q)+' '+(x+r)+','+y+' Q'+(x+q)+','+(y+q)+' '+x+','+(y+r)+' Q'+(x-q)+','+(y+q)+' '+(x-r)+','+y+' Q'+(x-q)+','+(y-q)+' '+x+','+(y-r)+' Z" fill="'+f+'"'+(op!=null?' opacity="'+op+'"':'')+'/>'; }

  /* ---------- defs / aura ---------- */
  if(st>=6){
    s+='<defs><radialGradient id="'+uid+'"><stop offset="0%" stop-color="'+L+'" stop-opacity="0.6"/><stop offset="62%" stop-color="'+C+'" stop-opacity="0.22"/><stop offset="100%" stop-color="'+C+'" stop-opacity="0"/></radialGradient></defs>';
    s+=E(100,112,64,74,'url(#'+uid+')',0);
    s+=ST('M52,152 Q100,138 148,152',L,2.6,0.8);
    s+=ST('M56,162 Q100,150 144,162',L,2,0.55);
  }

  /* ---------- ground shadow ---------- */
  s+='<ellipse cx="100" cy="177" rx="'+(24+st*2.6)+'" ry="'+(6+st*0.5)+'" fill="'+D+'" opacity="0.2"/>';

  s+='<g transform="translate(100,176) scale('+SC+') translate(-100,-176)">';

  /* ---------- back layer props ---------- */
  if(st>=6){ /* cape */
    s+=P('M86,102 Q58,128 64,162 Q84,153 100,155 Q116,153 136,162 Q142,128 114,102 Z',C,3);
    s+=P('M86,102 Q70,130 74,156 Q88,150 100,152 L100,104 Z',L,0,0.45);
  }
  if(ID==='inquiry'&&st>=4){ /* backpack behind */
    s+=R(64,108,22,30,7,C,3);
    s+=R(67,114,16,9,3,L,2.4);
    s+=ST('M78,108 Q88,112 92,122',D,3);
  }
  if(ID==='analysis'&&st>=4){ /* floating data panel */
    s+=R(30,86,30,26,4,L,2.6,0.95);
    s+=ST('M35,104 L42,96 L48,100 L55,90',D,2.4);
    s+=CI(42,96,1.8,D,0);
    s+=CI(55,90,1.8,D,0);
  }
  if(ID==='concept'&&st>=4){ /* cogs */
    s+=CI(58,116,10,L,2.8);
    s+=CI(58,116,3.6,GW,2.2);
    s+=ST('M58,104 L58,100 M58,132 L58,128 M46,116 L42,116 M70,116 L74,116',D,3);
  }
  if(ID==='communicate'&&st>=4){ /* speech bubble */
    s+=P('M28,80 Q28,66 44,66 Q60,66 60,80 Q60,92 46,92 L38,100 L38,92 Q28,91 28,80 Z',L,2.8);
    s+=ST('M36,76 L52,76 M36,84 L47,84',D,2.4);
  }
  if(ID==='collaborate'&&st>=4){ /* team badges */
    s+=CI(48,96,9,L,2.8);
    s+=CI(48,92.5,3.2,D,0);
    s+=P('M41,101 Q48,95 55,101 Q48,105 41,101 Z',D,0);
    s+=CI(64,78,6.5,L,2.6);
    s+=CI(64,75.6,2.3,D,0);
  }
  if(ID==='responsible'&&st>=4){ /* hazard sign */
    s+=P('M46,86 L60,112 L32,112 Z',GOLD,2.8);
    s+=ST('M46,94 L46,103',D,3);
    s+=CI(46,107.5,1.8,D,0);
  }

  /* ---------- legs ---------- */
  s+=R(87.5,144,10,25,4.5,PANT,2.8);
  s+=R(102.5,144,10,25,4.5,PANT,2.8);
  s+=E(90,170,8.5,5,'#4A4A55',2.6);
  s+=E(110,170,8.5,5,'#4A4A55',2.6);

  /* ---------- body ---------- */
  if(st===0){
    s+=P('M84,151 Q82,113 92,105 L108,105 Q118,113 116,151 Q100,157 84,151 Z',C,3);
    s+=E(100,136,12,10,L,0,0.6);
    s+=CI(100,120,4.5,L,0);
  } else {
    s+=P('M92,104 L100,120 L108,104 Z',C,0);
    var hem = (st>=4)?155:152;
    s+=P('M'+(st>=4?76:79)+','+hem+' Q80,113 91,103 Q100,111 109,103 Q120,113 '+(st>=4?124:121)+','+hem+' Q100,161 '+(st>=4?76:79)+','+hem+' Z',GW,3);
    s+=P('M84,'+(hem-4)+' Q80,124 84,108 Q88,124 90,'+(hem-2)+' Z',GS,0,0.75);
    s+=P('M91,103 L100,111 L96,124 Z',GS,0,0.9);
    s+=P('M109,103 L100,111 L104,124 Z',GS,0,0.9);
    if(st>=2){ s+=CI(100,130,2,D,0)+CI(100,140,2,D,0); }
    if(st>=3){ s+=R(106,133,12,11,2.5,'none',2.4); }
    if(st>=4){ s+=ST('M110,133 L110,126',C,3)+CI(110,124,2.2,C,0); }
    if(st>=4){ s+=P('M79,143 Q73,154 75,160 L84,151 Z',GW,2.8)+P('M121,143 Q127,154 125,160 L116,151 Z',GW,2.8); }
  }
  if(st>=5){ /* 견장 */
    s+=P('M83,105 Q90,100 97,101 L96,107 Q89,106 84,110 Z',GOLD,2.4);
    s+=P('M117,105 Q110,100 103,101 L104,107 Q111,106 116,110 Z',GOLD,2.4);
  }

  /* ---------- arms + species gear ---------- */
  var front='';
  if(st<3){
    s+=ARM('M88,108 Q78,118 78,128');
    s+=ARM('M112,108 Q122,118 122,128');
    s+=HAND(78,131);
    s+=HAND(122,131);
    if(st>=2){ s+=R(114,126,14,11,2.5,L,2.6)+ST('M118,131 L124,131',D,2.2); }
  } else if(ID==='inquiry'){
    s+=ARM('M112,108 Q124,102 128,98');
    s+=HAND(129,97);
    s+=ST('M134,128 L122,48',D,4.6);
    s+=ST('M134,128 L122,48','#C8955A',2.6);
    s+=P('M110,44 Q121,34 132,44 Q121,54 110,44 Z',GW,3,0.9);
    s+=ST('M112,45 Q121,60 130,45',GS,2.2);
    s+=ST('M115,44 L127,44 M118,40 L124,49',GS,1.8);
    s+=ARM('M88,108 Q76,116 74,124');
    s+=HAND(73,127);
    s+=CI(66,133,8.5,'#CFEBFF',3);
    s+=ST('M70,127 L73.5,124',D,3.4);
    s+=P('M61,130 Q64,127 68,128',WH,0,0.85);
  } else if(ID==='analysis'){
    s+=ARM('M88,108 Q80,118 78,124');
    s+=ARM('M112,108 Q120,118 122,124');
    s+=ST('M124,124 L137,110',D,4.4);
    s+=ST('M124,124 L137,110','#B9C4D4',2.4);
    s+=R(71,105,58,34,5,L,3);
    s+=R(76,110,48,24,3,GW,2.4);
    s+=ST('M82,130 L82,120 M92,130 L92,114 M102,130 L102,122 M112,130 L112,110',C,3.6);
    s+=ST('M78,132 L122,132',D,2.2);
    s+=HAND(74,127,4.6);
    s+=HAND(126,127,4.6);
  } else if(ID==='concept'){
    front+=ARM('M112,108 Q132,100 134,84');
    front+=HAND(135,81);
    front+=E(136,64,11.5,12.5,'#FFF3B0',3);
    front+=R(131,74,10,7,2,GS,2.4);
    front+=ST('M132,78 L140,78',D,1.8);
    front+=ST('M133,61 Q136,67 139,61',D,2.2);
    front+=ST('M136,44 L136,49 M121,50 L124,54 M151,50 L148,54',GOLD,3);
    front+=E(132,59,3,4,WH,0,0.8);
    s+=ARM('M88,108 Q74,112 76,124');
    s+=HAND(77,127);
  } else if(ID==='communicate'){
    front+=ARM('M112,108 Q131,98 133,82');
    front+=HAND(134,79);
    front+=ST('M134,78 L139,63',D,7);
    front+=ST('M134,78 L139,63','#B9C4D4',3.4);
    front+=CI(141,57,8,D,0);
    front+=CI(141,57,5.8,L,0);
    front+=ST('M137,55 L145,55 M137,59 L145,59',D,1.4);
    front+=ST('M152,48 Q158,57 152,66',C,2.6,0.95);
    front+=ST('M158,42 Q167,56 158,71',C,2.2,0.7);
    s+=ARM('M88,108 Q70,116 64,112');
    s+=P('M66,105 Q55,107 55,113 Q55,119 64,118 Q70,117 69,111 Z',SK,2.8);
    s+=ST('M61,108 L56,109 M61,112 L55,113 M61,116 L57,116',D,1.8);
  } else if(ID==='collaborate'){
    s+=ARM('M112,108 Q130,108 141,113');
    s+=P('M139,108 Q150,110 150,116 Q150,122 141,121 Q135,120 136,114 Z',SK,2.8);
    s+=ST('M143,111 L148,112 M143,115 L149,116 M143,119 L147,119',D,1.8);
    s+=ARM('M88,108 Q78,114 78,120');
    s+=R(62,110,26,34,3,L,3);
    s+=R(66,114,18,26,2,GW,2.2);
    s+=R(69,106,12,7,2,'#B9C4D4',2.4);
    s+=ST('M70,122 L80,122 M70,128 L80,128 M70,134 L77,134',D,2.2);
    s+=HAND(80,120,4.4);
  } else {
    front+=ARM('M112,108 Q132,106 135,94');
    front+=CI(136,89,6.2,SK,2.8);
    front+=ST('M132,88 L132,84 M136,86 L136,82 M140,88 L140,84',D,1.8);
    s+=ARM('M88,108 Q78,114 77,120');
    s+=R(64,112,18,34,8,'#E2503C',3);
    s+=R(67,118,12,10,2,WH,2,0.85);
    s+=R(69,104,8,9,2,'#8E9AAA',2.6);
    s+=P('M69,106 Q60,102 58,110',D,3);
    s+=HAND(80,122,4.4);
  }

  /* ---------- head ---------- */
  s+=R(94.5,94,11,9,3.5,SK,2.8);
  s+=E(76,80,5,6.5,SK,2.6);
  s+=E(124,80,5,6.5,SK,2.6);
  s+=E(100,76,25,23.5,SK,3);
  s+='<path d="M100,52.5 A25,23.5 0 0 0 100,99.5 A16,23.5 0 0 1 100,52.5 Z" fill="'+SK2+'" opacity="0.28"/>';

  var ey=79;
  s+=E(91,ey,5.6,6.8,INK,0);
  s+=E(109,ey,5.6,6.8,INK,0);
  s+=CI(89.2,ey-2.4,2.2,WH,0);
  s+=CI(107.2,ey-2.4,2.2,WH,0);
  s+=CI(92.6,ey+2.6,1.1,WH,0,0.75);
  s+=CI(110.6,ey+2.6,1.1,WH,0,0.75);
  if(st>=4){ s+=ST('M85.5,69 Q91,66 96,68.5',INK,2,0.85)+ST('M104,68.5 Q109,66 114.5,69',INK,2,0.85); }
  s+='<ellipse cx="82" cy="87" rx="5" ry="3.2" fill="#FF7E9B" opacity="0.5"/>';
  s+='<ellipse cx="118" cy="87" rx="5" ry="3.2" fill="#FF7E9B" opacity="0.5"/>';
  if(st>=5){ s+=P('M94,89 Q100,96.5 106,89 Q100,92 94,89 Z',INK,0); }
  else if(st>=1){ s+=ST('M95.5,89 Q100,94.5 104.5,89',INK,2.4); }
  else { s+=ST('M96,90 Q100,93 104,90',INK,2.2); }

  /* ---------- hair / headgear ---------- */
  if(st<3){
    s+=P('M75,73 Q77,49 100,49 Q123,49 125,73 Q119,61 111,58 Q105,64 95,58 Q84,60 75,73 Z',HC,2.8);
    s+=P('M84,55 Q92,50 101,51 Q92,52 86,58 Z',WH,0,0.28);
  } else if(ID==='inquiry'){
    s+=P('M76,74 Q78,58 100,56 Q122,58 124,74 Q118,66 100,64 Q82,66 76,74 Z',HC,2.6);
    s+=E(100,59,33,8.5,C,3);
    s+=P('M80,59 Q81,34 100,33 Q119,34 120,59 Z',L,3);
    s+=P('M80.5,52 Q100,58 119.5,52 L120,58 Q100,64 80,58 Z',(st>=5?GOLD:D),0);
    if(st>=4){ s+=P('M117,41 Q129,29 134,36 Q127,43 117,46 Z','#7FD48B',2.4); }
    s+=E(93,42,6,3.5,WH,0,0.35);
  } else if(ID==='analysis'){
    s+=P('M69,92 Q67,48 100,48 Q133,48 131,92 L119,92 Q122,68 114,63 Q107,59 100,61 Q93,59 86,63 Q78,68 81,92 Z',HC,2.8);
    s+=P('M84,58 Q100,50 116,58 Q100,55 84,58 Z',WH,0,0.3);
    s+='<rect x="79" y="69" width="21" height="18" rx="6" fill="#CFEBFF" fill-opacity="0.45" stroke="'+D+'" stroke-width="2.6"/>';
    s+='<rect x="100" y="69" width="21" height="18" rx="6" fill="#CFEBFF" fill-opacity="0.45" stroke="'+D+'" stroke-width="2.6"/>';
    s+=ST('M98,74 L102,74',D,2.4);
    s+=ST('M79,74 L73,72 M121,74 L127,72',D,2.4);
    s+=ST('M83,72 L88,78',WH,2,0.9);
  } else if(ID==='concept'){
    s+=P('M73,77 Q73,62 78,55 L79,45 L87,56 L91,44 L98,55 L104,42 L109,56 L117,48 L118,58 L126,53 Q127,63 127,77 Q113,62 100,61 Q86,62 73,77 Z',HC,2.8);
    s+=P('M84,53 Q93,48 100,52 Q92,52 87,58 Z',WH,0,0.26);
    s+=ST('M76,62 Q100,52 124,62',D,4.6);
    s+=ST('M76,62 Q100,52 124,62',C,2.6);
    s+=CI(89,60,7,'#CFEBFF',2.8);
    s+=CI(111,58,7,'#CFEBFF',2.8);
    s+=ST('M86,57 L90,61',WH,2,0.9);
  } else if(ID==='communicate'){
    s+=P('M75,72 Q77,48 100,48 Q123,48 125,72 Q118,60 105,57 Q100,64 92,58 Q83,60 75,72 Z',HC,2.8);
    s+=E(68,80,10.5,13,HC,2.8);
    s+=E(132,80,10.5,13,HC,2.8);
    s+=R(63,64,11,7,3,C,2.4);
    s+=R(126,64,11,7,3,C,2.4);
    s+=E(66,74,3.5,5,WH,0,0.28);
    if(st>=4){ s+=SPK(136,58,5,L,0.9)+SPK(64,54,4,L,0.8); }
  } else if(ID==='collaborate'){
    s+=P('M75,73 Q77,48 100,48 Q123,48 125,73 Q118,61 100,59 Q82,61 75,73 Z',HC,2.8);
    s+=CI(100,42,10,HC,2.8);
    s+=R(96,49,8,6,2.5,C,2.4);
    s+=ST('M75,66 Q100,55 125,66',D,5.2);
    s+=ST('M75,66 Q100,55 125,66',C,3);
    s+=E(88,53,6,3.2,WH,0,0.3);
  } else {
    s+=P('M77,72 Q79,60 100,58 Q121,60 123,72 Q116,66 100,65 Q84,66 77,72 Z',HC,2.6);
    s+=P('M77,60 Q79,33 100,33 Q121,33 123,60 Z',C,3);
    s+=E(100,60,32,7.5,L,3);
    s+=P('M96,34 Q100,32 104,34 L104,60 L96,60 Z',(st>=5?GOLD:L),2.4);
    s+='<rect x="77" y="67" width="46" height="16" rx="7" fill="#CFF3EE" fill-opacity="0.45" stroke="'+D+'" stroke-width="2.8"/>';
    s+=ST('M82,70 L88,78',WH,2.2,0.9);
    s+=E(88,44,7,4,WH,0,0.3);
  }

  /* 공통 고글(2단계) */
  if(st===2){
    s+=ST('M76,62 Q100,53 124,62',D,4.6);
    s+=ST('M76,62 Q100,53 124,62',C,2.6);
    s+=CI(89,60,7,'#CFEBFF',2.8);
    s+=CI(111,58,7,'#CFEBFF',2.8);
    s+=ST('M86,57 L90,61',WH,2,0.9);
  }

  /* ---------- 박사모 / 금장식 ---------- */
  if(st>=5 && (ID==='analysis' || ID==='communicate')){
    s+=P('M100,52 Q88,52 88,44 L112,44 Q112,52 100,52 Z',INK,2.6);
    s+=P('M68,44 L100,32 L132,44 L100,56 Z',INK,2.6);
    s+=ST('M130,45 L136,60',GOLD,2.6);
    s+=CI(136,62,3.4,GOLD,2.2);
    s+=P('M78,42 L100,34 L112,38',WH,0,0.18);
  }
  if(st>=5 && ID!=='analysis' && ID!=='communicate'){
    s+=ST('M126,50 L134,62',GOLD,2.6);
    s+=CI(135,64,3.4,GOLD,2.2);
  }

  /* ---------- 머리 앞으로 든 소품 ---------- */
  s+=front;

  /* ---------- 반짝임 / 이펙트 ---------- */
  if(st===1){ s+=SPK(140,72,6,L,0.95)+SPK(58,96,4.5,L,0.8); }
  if(st===2){ s+=SPK(142,86,5.5,L,0.9)+SPK(56,74,4,L,0.75); }
  if(st===3){ s+=SPK(46,70,5,L,0.85)+SPK(154,120,4.5,L,0.7); }
  if(st>=6){
    s+=SPK(34,68,8,WH,0.95)+SPK(166,84,7,WH,0.9)+SPK(150,44,6,L,0.95)+SPK(44,132,6,L,0.85)+SPK(160,150,5,WH,0.8)+SPK(30,110,5,WH,0.75);
    s+=CI(24,146,3,L,0,0.8)+CI(176,120,3.2,L,0,0.8)+CI(150,26,2.6,WH,0,0.85);
  }

  s+='</g>';
  return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
}

/* ═══════════════════════════════════════════════════════════════
   ③ 연구소 / 기지
   ═══════════════════════════════════════════════════════════════ */
function drawLab(st, b){
  var c = b.c, d = b.d, l = b.l, id = b.id || 'inquiry';
  st = st < 0 ? 0 : (st > 6 ? 6 : st);
  var GY = 176, LT = '#ffe08a', LG = '#fff3c4', GL = '#e9f6ff';
  function n(v){ return Math.round(v*100)/100; }
  function P(dd,f,sw){ return '<path d="'+dd+'" fill="'+(f||'none')+'" stroke="'+d+'" stroke-width="'+(sw==null?3:sw)+'" stroke-linejoin="round" stroke-linecap="round"/>'; }
  function PN(dd,f,op){ return '<path d="'+dd+'" fill="'+f+'"'+(op==null?'':' opacity="'+op+'"')+'/>'; }
  function PS(dd,col,sw,op){ return '<path d="'+dd+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"'+(op==null?'':' opacity="'+op+'"')+'/>'; }
  function R(x,y,w,h,f,rx,sw){ return '<rect x="'+n(x)+'" y="'+n(y)+'" width="'+n(w)+'" height="'+n(h)+'" rx="'+(rx||0)+'" fill="'+f+'" stroke="'+d+'" stroke-width="'+(sw==null?3:sw)+'" stroke-linejoin="round"/>'; }
  function RN(x,y,w,h,f,rx,op){ return '<rect x="'+n(x)+'" y="'+n(y)+'" width="'+n(w)+'" height="'+n(h)+'" rx="'+(rx||0)+'" fill="'+f+'"'+(op==null?'':' opacity="'+op+'"')+'/>'; }
  function E(cx,cy,rx,ry,f,sw){ return '<ellipse cx="'+n(cx)+'" cy="'+n(cy)+'" rx="'+n(rx)+'" ry="'+n(ry)+'" fill="'+f+'" stroke="'+d+'" stroke-width="'+(sw==null?3:sw)+'"/>'; }
  function EN(cx,cy,rx,ry,f,op){ return '<ellipse cx="'+n(cx)+'" cy="'+n(cy)+'" rx="'+n(rx)+'" ry="'+n(ry)+'" fill="'+f+'"'+(op==null?'':' opacity="'+op+'"')+'/>'; }
  function LN(x1,y1,x2,y2,col,sw,op){ return '<line x1="'+n(x1)+'" y1="'+n(y1)+'" x2="'+n(x2)+'" y2="'+n(y2)+'" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round"'+(op==null?'':' opacity="'+op+'"')+'/>'; }
  function W(x,y,w,h,rx){ var r = (rx==null?1.5:rx);
    return RN(x-2,y-2,w+4,h+4,LG,r+2,0.35)+R(x,y,w,h,LT,r,2)
      +PN('M'+n(x+1.6)+' '+n(y+h-1.6)+'L'+n(x+w*0.62)+' '+n(y+1.6)+'L'+n(x+w-1.6)+' '+n(y+1.6)+'Z','#ffffff',0.5); }
  function grid(gx,gy,gw,gh,cols,rows){ var q='',i,j,cw=gw/cols,ch=gh/rows,ww=Math.min(cw*0.58,12),hh=Math.min(ch*0.55,11);
    for(j=0;j<rows;j++){ for(i=0;i<cols;i++){ q+=W(gx+cw*(i+0.5)-ww/2, gy+ch*(j+0.5)-hh/2, ww, hh, 1.2); } } return q; }
  function star(x,y,r,col,op){ return PN('M'+n(x)+' '+n(y-r)+'Q'+n(x+r*0.18)+' '+n(y-r*0.18)+' '+n(x+r)+' '+n(y)
      +'Q'+n(x+r*0.18)+' '+n(y+r*0.18)+' '+n(x)+' '+n(y+r)
      +'Q'+n(x-r*0.18)+' '+n(y+r*0.18)+' '+n(x-r)+' '+n(y)
      +'Q'+n(x-r*0.18)+' '+n(y-r*0.18)+' '+n(x)+' '+n(y-r)+'Z',(col||'#ffffff'),(op==null?0.95:op)); }
  function gear(cx,cy,r,t,f){ var q='',i;
    for(i=0;i<t;i++){ q+='<rect x="-2.4" y="'+n(-r-4.2)+'" width="4.8" height="6.4" rx="1.4" fill="'+f+'" stroke="'+d+'" stroke-width="2" stroke-linejoin="round" transform="translate('+n(cx)+','+n(cy)+') rotate('+n(i*360/t)+')"/>'; }
    q+=E(cx,cy,r,r,f,2.6)+E(cx,cy,r*0.32,r*0.32,d,0)+EN(cx-r*0.32,cy-r*0.34,r*0.3,r*0.2,'#ffffff',0.4); return q; }
  function smoke(x,y,k){ return '<g opacity="0.9">'+E(x,y,5*k,4.2*k,'#ffffff',2)+E(x+5.5*k,y-9*k,6.6*k,5.4*k,'#ffffff',2)+E(x-1.5*k,y-19*k,8.2*k,6.4*k,'#ffffff',2)+'</g>'; }
  function tuft(x,y,k,col){ return PS('M'+n(x)+' '+n(y)+'Q'+n(x-2*k)+' '+n(y-6*k)+' '+n(x-4.5*k)+' '+n(y-8*k),col,2.4,0.95)
      +PS('M'+n(x)+' '+n(y)+'Q'+n(x+1.5*k)+' '+n(y-7*k)+' '+n(x+3.5*k)+' '+n(y-9*k),col,2.4,0.95)
      +PS('M'+n(x)+' '+n(y)+'L'+n(x)+' '+n(y-6.5*k),col,2.4,0.95); }
  function flag(x,y,h,fc,dir){ return LN(x,y,x,y-h,d,3.2)+P('M'+n(x)+' '+n(y-h)+'L'+n(x+19*dir)+' '+n(y-h+6.5)+'L'+n(x)+' '+n(y-h+13)+'Z',fc,2.5)+E(x,y-h-2,2.6,2.6,LT,2); }
  function door(cx,w,h){ return R(cx-w/2,GY-h,w,h,d,2)+RN(cx-w/2+2.5,GY-h+2.5,w-5,3.5,'#ffffff',1.5,0.2)
      +PN('M'+n(cx-w/2)+' '+n(GY)+'L'+n(cx+w/2)+' '+n(GY)+'L'+n(cx+w)+' '+n(GY+6)+'L'+n(cx-w)+' '+n(GY+6)+'Z',LG,0.28); }
  function lamp(x,h){ return LN(x,GY,x,GY-h,d,3.4)+E(x,GY-h-4,5,5,LT,2.5)+EN(x,GY-h-4,10,10,LG,0.28); }
  function plant(x,y,k,c1,c2){ return E(x,y,7*k,5.5*k,c1,2.4)+E(x-6*k,y+2*k,5*k,4*k,c2,2.4)+E(x+6*k,y+2.5*k,4.5*k,3.6*k,c2,2.4)+E(x,y-4*k,3.2*k,3.2*k,LT,2); }

  var s = '';

  /* ---------- st6 aura (behind everything) ---------- */
  if(st === 6){
    s += EN(100,126,82,60,l,0.20) + EN(100,130,64,48,'#ffffff',0.13);
    var ai, aa;
    for(ai=0; ai<9; ai++){
      aa = Math.PI + ai*Math.PI/8;
      s += PN('M'+n(100+Math.cos(aa)*44)+' '+n(126+Math.sin(aa)*38)
        +'L'+n(100+Math.cos(aa+0.055)*88)+' '+n(126+Math.sin(aa+0.055)*72)
        +'L'+n(100+Math.cos(aa-0.055)*88)+' '+n(126+Math.sin(aa-0.055)*72)+'Z','#ffffff',0.11);
    }
  }

  /* ---------- ground ---------- */
  s += EN(100, GY+2, 42+st*6, 8, l, 0.5);
  s += EN(100, GY+5, 34+st*5, 5.5, d, 0.18);
  s += PS('M'+n(100-(40+st*6))+' '+n(GY)+'L'+n(100+(40+st*6))+' '+n(GY), d, 2.4, 0.35);

  /* ================= st 0 : empty lot ================= */
  if(st === 0){
    s += PN('M64 171 L100 158 L136 171 L100 184 Z', l, 0.45);
    s += '<path d="M64 171 L100 158 L136 171 L100 184 Z" fill="none" stroke="'+d+'" stroke-width="2.5" stroke-dasharray="6 5" stroke-linejoin="round" opacity="0.7"/>';
    s += LN(100,172,100,134,d,5);
    s += R(73,106,54,32,c,5);
    s += RN(76,109,48,8,'#ffffff',3,0.35);
    s += E(88,124,8,8,l,2.5) + star(88,124,4.5,'#ffffff',0.9);
    s += RN(100,118,20,4.5,d,2,0.5) + RN(100,127,14,4.5,d,2,0.32);
    s += tuft(72,176,1,c) + tuft(130,175,0.85,c);
    s += EN(120,172,5,3,d,0.3) + EN(78,169,3.5,2.2,d,0.25);
    s += star(136,100,4.5,'#ffffff',0.85);
  }
  /* ================= st 1 : tent ================= */
  else if(st === 1){
    s += PN('M66 173 L100 112 L134 173 Z', l, 0.5);
    s += P('M66 173 L100 112 L134 173 Z', c, 3.2);
    s += PN('M100 112 L66 173 L86 173 Z', '#000', 0.10);
    s += P('M80 148 L120 148 L126 160 L74 160 Z', l, 2.5);
    s += P('M100 132 L89 173 L111 173 Z', d, 2.5);
    s += EN(100,166,7,7,LT,0.85) + E(100,164,4,4,LT,2);
    s += LN(100,113,100,95,d,3.2);
    s += P('M100 95 L120 101 L100 107 Z', l, 2.5);
    s += PS('M67 172 L58 177', d, 2.2, 0.6) + PS('M133 172 L142 177', d, 2.2, 0.6);
    s += R(128,159,16,15,l,2.5) + LN(128,166.5,144,166.5,d,2,0.55) + LN(136,159,136,174,d,2,0.55);
    s += tuft(62,175,0.85,c);
    s += star(58,112,5) + star(146,126,4,'#ffffff',0.85) + star(122,90,3.5,'#ffffff',0.8);
  }
  /* ================= st 2 : first small building ================= */
  else if(st === 2){
    s += R(70,138,60,38,c,3);
    s += RN(70,138,14,38,'#000', 0, 0.09);
    s += P('M62 140 L100 113 L138 140 Z', l, 3.2);
    s += PN('M100 113 L138 140 L124 140 Z', '#000', 0.12);
    s += LN(66,140,134,140,d,2,0.35);
    s += R(88,142,24,9,l,2.5) + RN(91,145.5,18,3,d,1.5,0.5);
    s += W(75,154,14,12) + W(111,154,14,12);
    s += door(100,17,22);
    s += tuft(64,176,0.9,c) + tuft(138,176,0.8,c);
    s += star(52,120,4,'#ffffff',0.8) + star(150,110,4.5,'#ffffff',0.85);
  }
  /* ================= st 3~6 : species-specific ================= */
  else {
    var lv = st - 3;
    var bw = [70,84,96,108][lv];
    var bh = [46,58,66,74][lv];
    var x0 = 100 - bw/2, x1 = 100 + bw/2, y0 = GY - bh;
    var i, j, k;

    /* ---------- INQUIRY : greenhouse lab ---------- */
    if(id === 'inquiry'){
      var hb = 20 + lv*5;
      var yv = GY - hb;
      var ya = y0 - (12 + lv*6);
      if(lv >= 1){
        var ax = x1 - 3, aw = 22 + lv*3, ah = 20 + lv*5;
        s += R(ax, GY-ah, aw, ah, l, 3);
        s += P('M'+n(ax-3)+' '+n(GY-ah)+'Q'+n(ax+aw/2)+' '+n(GY-ah-20)+' '+n(ax+aw+3)+' '+n(GY-ah)+'Z', GL, 2.8);
        s += LN(ax+aw/2, GY-ah, ax+aw/2, GY-ah-13, d, 1.8, 0.3);
        s += W(ax+aw/2-6, GY-ah+6, 12, 9);
      }
      s += P('M'+n(x0)+' '+n(yv)+'Q'+n(x0)+' '+n(ya)+' 100 '+n(ya)+'Q'+n(x1)+' '+n(ya)+' '+n(x1)+' '+n(yv)+'Z', GL, 3.2);
      var bn = 4 + lv, bx, tt, byt;
      for(i=1; i<bn; i++){
        bx = x0 + bw*i/bn; tt = Math.abs(bx-100)/(bw/2);
        byt = ya + tt*tt*(yv-ya)*0.92;
        s += LN(bx, yv, bx, byt+2, d, 1.8, 0.3);
      }
      s += PS('M'+n(x0+4)+' '+n(yv-(yv-ya)*0.40)+'Q100 '+n(ya+(yv-ya)*0.08)+' '+n(x1-4)+' '+n(yv-(yv-ya)*0.40), d, 1.8, 0.26);
      s += EN(100-bw*0.22, yv-8, 9, 7, c, 0.75) + EN(100+bw*0.20, yv-6, 7.5, 6, c, 0.68) + EN(100, yv-13, 6.5, 5.5, c, 0.6);
      s += PN('M'+n(x0+8)+' '+n(yv-2)+'L'+n(100-12)+' '+n(ya+6)+'L'+n(100-2)+' '+n(ya+6)+'L'+n(x0+18)+' '+n(yv-2)+'Z','#ffffff',0.42);
      s += R(x0, yv, bw, hb, c, 2);
      s += RN(x0+2.5, yv+2.5, bw-5, 4, '#ffffff', 2, 0.22);
      s += RN(x0+2.5, GY-4.5, bw-5, 3, '#000', 1.5, 0.12);
      s += W(x0+6, yv+hb*0.30, 11, Math.min(9, hb*0.45)) + W(x1-17, yv+hb*0.30, 11, Math.min(9, hb*0.45));
      s += P('M93 '+n(GY)+'L93 '+n(yv+hb*0.42)+'Q100 '+n(yv-1)+' 107 '+n(yv+hb*0.42)+'L107 '+n(GY)+'Z', d, 2.5);
      s += PN('M93 '+n(GY)+'L107 '+n(GY)+'L114 '+n(GY+6)+'L86 '+n(GY+6)+'Z', LG, 0.26);
      s += R(x0-21, GY-11, 21, 11, l, 3) + plant(x0-10.5, GY-14, 0.85, c, l);
      if(lv === 0){ s += R(x1, GY-11, 21, 11, l, 3) + plant(x1+10.5, GY-14, 0.8, c, l); }
      if(lv >= 2){
        s += LN(x0-13, GY-11, x0-13, GY-36, d, 5);
        s += E(x0-13, GY-46, 14, 12, c, 2.8) + E(x0-24, GY-38, 10, 9, l, 2.6) + E(x0-3, GY-38, 9, 8, l, 2.6);
        s += EN(x0-17, GY-49, 5, 3.5, '#ffffff', 0.35);
      }
      if(lv >= 3){
        s += P('M86 '+n(ya+2)+'Q100 '+n(ya-22)+' 114 '+n(ya+2)+'Z', GL, 3);
        s += LN(100, ya-16, 100, ya-26, d, 3.2) + E(100, ya-29, 4.5, 4.5, LT, 2.5);
        s += EN(100, ya-29, 10, 10, LG, 0.3);
        s += E(x0+12, ya+18, 7, 5.5, c, 2.4) + E(x1-12, ya+18, 7, 5.5, c, 2.4);
      }
      s += tuft(x0-26, GY, 0.9, c) + tuft(x1+16, GY, 0.85, c);
    }
    /* ---------- ANALYSIS : data centre ---------- */
    else if(id === 'analysis'){
      var aw2 = bw + 12, ax0 = 100 - aw2/2, ax1 = 100 + aw2/2;
      var ah2 = bh*0.84, ay0 = GY - ah2;
      var mx = ax1 - 12, my = ay0 - (26 + lv*9);
      s += LN(mx, ay0-6, mx, my, d, 3.6);
      s += LN(mx-6, ay0-6, mx, ay0-18, d, 2.2, 0.6) + LN(mx+6, ay0-6, mx, ay0-18, d, 2.2, 0.6);
      s += E(mx, my-3, 3.6, 3.6, '#ff8080', 2.4);
      s += PS('M'+n(mx-7)+' '+n(my-10)+'Q'+n(mx-12)+' '+n(my-3)+' '+n(mx-7)+' '+n(my+4), l, 2.2, 0.85);
      s += PS('M'+n(mx-13)+' '+n(my-16)+'Q'+n(mx-20)+' '+n(my-3)+' '+n(mx-13)+' '+n(my+10), l, 2.2, 0.55);
      if(lv >= 1){
        s += R(ax0-16, GY-ah2*0.62, 22, ah2*0.62, l, 2);
        s += R(ax0-19, GY-ah2*0.62-7, 28, 8, c, 2);
        s += grid(ax0-14, GY-ah2*0.62+5, 18, ah2*0.62-12, 2, 2);
      }
      s += R(ax0, ay0, aw2, ah2, c, 2);
      s += RN(ax0, ay0, 13, ah2, '#000', 0, 0.09);
      s += R(ax0-6, ay0-9, aw2+12, 10, l, 2);
      s += RN(ax0-3, ay0-6.5, aw2+6, 3, '#ffffff', 1.5, 0.3);
      s += RN(ax0+2.5, GY-13, aw2-5, 10, d, 2, 0.16);
      s += grid(ax0+7, ay0+7, aw2-14, ah2-24, 4+lv, (lv>=2?3:2));
      for(i=0; i<6+lv*2; i++){
        s += E(ax0+9+i*((aw2-18)/(5+lv*2)), GY-8, 2.1, 2.1, (i%3===0? '#8ef0c4' : LT), 1.6);
      }
      s += door(100, 15+lv, 15+lv*2);
      var dx = ax0 + aw2*0.26, dy = ay0 - 11;
      s += LN(dx-5, dy+9, dx, dy, d, 2.6) + LN(dx+5, dy+9, dx, dy, d, 2.6);
      s += '<g transform="translate('+n(dx)+','+n(dy-5)+') rotate(-26)">' + E(0,0,11+lv,8+lv*0.6,l,2.6)
        + EN(0,0,7+lv*0.6,5+lv*0.4,'#ffffff',0.4) + LN(0,0,4,-11,d,2.4) + E(4.5,-12,2.4,2.4,c,2) + '</g>';
      if(lv >= 2){
        for(i=0; i<3; i++){
          s += R(ax0+10+i*17, ay0-19, 13, 11, l, 2);
          s += E(ax0+16.5+i*17, ay0-13.5, 3.4, 3.4, c, 2);
        }
      }
      if(lv >= 3){
        var dx2 = ax0 + aw2*0.68;
        s += '<g transform="translate('+n(dx2)+','+n(ay0-22)+') rotate(22)">' + E(0,0,10,7.5,l,2.6) + EN(0,0,6,4.5,'#ffffff',0.4) + LN(0,0,-4,-10,d,2.4) + '</g>';
        s += R(ax0-8, GY-9, aw2+16, 9, l, 2.5);
        s += star(ax0-22, ay0-20, 5) + star(ax1+16, ay0-6, 4.5,'#ffffff',0.85);
      }
    }
    /* ---------- CONCEPT : inventor's workshop ---------- */
    else if(id === 'concept'){
      var hbody = bh*0.60, ybody = GY - hbody;
      var ytop = ybody - (28 + lv*9);
      var apex = 100 - bw*0.14;
      var chx = 100 + bw*0.24, chTop = ytop - (4 + lv*7);
      s += R(chx, chTop, 13+lv, ybody-chTop, l, 2);
      s += R(chx-3.5, chTop-8, 20+lv, 9, c, 2);
      s += LN(chx, chTop+9, chx+13+lv, chTop+9, d, 2, 0.4) + LN(chx, chTop+18, chx+13+lv, chTop+18, d, 2, 0.35);
      s += smoke(chx+7, chTop-13, 0.72+lv*0.1);
      if(lv >= 2){
        s += R(chx-26, chTop+12, 10, ybody-chTop-12, l, 2) + R(chx-28.5, chTop+5, 15, 8, c, 2);
        s += smoke(chx-21, chTop-2, 0.55);
      }
      s += P('M'+n(x0-8)+' '+n(ybody)+'L'+n(apex)+' '+n(ytop)+'L'+n(x1+8)+' '+n(ybody)+'Z', l, 3.2);
      s += PN('M'+n(apex)+' '+n(ytop)+'L'+n(x1+8)+' '+n(ybody)+'L'+n(apex+7)+' '+n(ybody)+'Z', '#000', 0.13);
      for(i=1; i<=2+lv; i++){
        s += LN(apex-(apex-x0+8)*i/(3+lv), ytop+(ybody-ytop)*i/(3+lv), apex+(x1+8-apex)*i/(3+lv), ytop+(ybody-ytop)*i/(3+lv), d, 1.6, 0.22);
      }
      s += R(x0, ybody, bw, hbody, c, 2);
      s += RN(x0, ybody, 12, hbody, '#000', 0, 0.09);
      s += RN(x0+2.5, ybody+2.5, bw-5, 4, '#ffffff', 2, 0.2);
      s += P('M86 '+n(GY)+'L86 '+n(ybody+hbody*0.42)+'Q100 '+n(ybody+hbody*0.14)+' 114 '+n(ybody+hbody*0.42)+'L114 '+n(GY)+'Z', d, 2.6);
      s += LN(88, GY-2, 112, ybody+hbody*0.44, d, 2, 0.4) + LN(112, GY-2, 88, ybody+hbody*0.44, d, 2, 0.4);
      s += W(x0+6, ybody+hbody*0.24, 12, 10) + W(x1-18, ybody+hbody*0.24, 12, 10);
      s += W(apex-8, ytop+(ybody-ytop)*0.42, 15, 11, 2);
      s += gear(apex+bw*0.20, ytop+(ybody-ytop)*0.30, 8+lv*1.6, 8, l);
      s += gear(x0-7, ybody-8, 7+lv, 7, c);
      if(lv >= 1){ s += gear(x1+7, ybody+hbody*0.34, 6+lv*0.8, 6, l); }
      if(lv >= 2){
        s += LN(x1+4, ytop+16, x1+26, ytop+8, d, 4);
        s += LN(x1+24, ytop+8, x1+24, ytop+22, d, 2.4) + R(x1+18, ytop+22, 13, 10, l, 2);
      }
      if(lv >= 3){
        s += gear(x0-16, ybody-30, 13, 9, l);
        s += R(88, ybody-14, 26, 11, l, 2.5) + RN(91, ybody-10.5, 20, 3.5, d, 1.5, 0.5);
        s += star(x1+20, ytop+2, 5) + star(x0-24, ytop+26, 4.5,'#ffffff',0.85);
      }
    }
    /* ---------- COMMUNICATE : lecture hall ---------- */
    else if(id === 'communicate'){
      var stepH = 16, drumH = bh*0.48, ydrum = GY - stepH - drumH;
      var domeR = bw*0.5 + 4, yapex = ydrum - domeR*0.90;
      s += flag(x0-16, GY-stepH, 46+lv*8, l, -1) + flag(x1+16, GY-stepH, 46+lv*8, l, 1);
      s += P('M'+n(100-domeR)+' '+n(ydrum)+'A'+n(domeR)+' '+n(domeR*0.90)+' 0 0 1 '+n(100+domeR)+' '+n(ydrum)+'Z', c, 3.2);
      for(i=1; i<=3+lv; i++){
        s += LN(100, yapex+3, 100-domeR+ (2*domeR)*i/(4+lv), ydrum, d, 1.8, 0.25);
      }
      s += PN('M'+n(100-domeR*0.72)+' '+n(ydrum-2)+'Q'+n(100-domeR*0.62)+' '+n(yapex+10)+' '+n(100-domeR*0.16)+' '+n(yapex+3)
        +'Q'+n(100-domeR*0.5)+' '+n(yapex+16)+' '+n(100-domeR*0.52)+' '+n(ydrum-2)+'Z', '#ffffff', 0.32);
      s += R(93, yapex-13, 15, 14, l, 2);
      s += P('M88 '+n(yapex-13)+'L100 '+n(yapex-25)+'L112 '+n(yapex-13)+'Z', c, 2.6);
      s += E(100, yapex-28, 3.6, 3.6, LT, 2.4) + EN(100, yapex-28, 9, 9, LG, 0.3);
      s += W(96.5, yapex-9, 8, 8, 1.5);
      s += R(x0-7, ydrum-7, bw+14, 9, l, 2.5);
      s += RN(x0-4, ydrum-4.5, bw+8, 3, '#ffffff', 1.5, 0.28);
      s += R(x0, ydrum, bw, drumH, c, 2);
      s += RN(x0, ydrum, 11, drumH, '#000', 0, 0.10);
      var nc = 3 + lv;
      for(i=0; i<nc; i++){
        var cx2 = x0 + bw*(i+0.5)/nc;
        s += R(cx2-4.5, ydrum+2, 9, drumH-2, l, 3, 2.4);
      }
      s += door(100, 17+lv*2, drumH*0.62 + stepH);
      var ns = 3 + lv, wk, yk;
      for(k=0; k<ns; k++){
        wk = bw*0.62 + bw*0.78*(k+1)/ns;
        yk = GY - stepH + stepH*k/ns;
        s += R(100-wk/2, yk, wk, stepH/ns + 3, l, 2, 2.6);
      }
      if(lv >= 2){
        s += P('M'+n(x0+9)+' '+n(ydrum+3)+'L'+n(x1-9)+' '+n(ydrum+3)+'L'+n(x1-9)+' '+n(ydrum+16)+'L100 '+n(ydrum+12)+'L'+n(x0+9)+' '+n(ydrum+16)+'Z', LT, 2.6);
        s += RN(x0+17, ydrum+7, bw-34, 3.5, d, 2, 0.5);
      }
      if(lv >= 3){
        s += lamp(x0-26, 26) + lamp(x1+26, 26);
        s += star(x0-30, yapex+6, 5) + star(x1+30, yapex+18, 4.5, '#ffffff', 0.85);
      }
    }
    /* ---------- COLLABORATE : twin towers + skybridge ---------- */
    else if(id === 'collaborate'){
      var gapw = 18 + lv*3;
      var tw = (bw - gapw)/2;
      var lxx = x0, rxx = x1 - tw;
      var lh = bh + 10 + lv*5, rh = bh - 2;
      var lyt = GY - lh, ryt = GY - rh;
      if(lv >= 2){
        s += R(100-11, GY-bh*0.55, 22, bh*0.55, l, 2);
        s += P('M'+n(100-14)+' '+n(GY-bh*0.55)+'L100 '+n(GY-bh*0.55-13)+'L'+n(100+14)+' '+n(GY-bh*0.55)+'Z', c, 2.6);
        s += W(94, GY-bh*0.55+8, 12, 10);
      }
      s += R(lxx, lyt, tw, lh, c, 2);
      s += RN(lxx, lyt, 9, lh, '#000', 0, 0.10);
      s += P('M'+n(lxx-6)+' '+n(lyt)+'L'+n(lxx+tw/2)+' '+n(lyt-17-lv*4)+'L'+n(lxx+tw+6)+' '+n(lyt)+'Z', l, 3.2);
      s += PN('M'+n(lxx+tw/2)+' '+n(lyt-17-lv*4)+'L'+n(lxx+tw+6)+' '+n(lyt)+'L'+n(lxx+tw/2+5)+' '+n(lyt)+'Z', '#000', 0.13);
      s += E(lxx+tw/2, lyt-20-lv*4, 3.4, 3.4, LT, 2.2);
      s += R(rxx, ryt, tw, rh, l, 2);
      s += RN(rxx+tw-9, ryt, 9, rh, '#000', 0, 0.08);
      s += R(rxx-6, ryt-8, tw+12, 9, c, 2.6);
      s += LN(rxx+tw/2-6, ryt-8, rxx+tw/2-6, ryt-16, d, 2.6) + LN(rxx+tw/2+6, ryt-8, rxx+tw/2+6, ryt-16, d, 2.6);
      s += E(rxx+tw/2, ryt-20, 9.5, 8, c, 2.8) + EN(rxx+tw/2-3.5, ryt-22, 3.6, 2.4, '#ffffff', 0.35);
      s += grid(lxx+4, lyt+8, tw-8, lh-26, 2, 2+lv);
      s += grid(rxx+4, ryt+7, tw-8, rh-24, 2, 1+lv);
      var byy = lyt + lh*0.34;
      s += PS('M'+n(lxx+tw)+' '+n(byy+15)+'Q100 '+n(byy+34)+' '+n(rxx)+' '+n(byy+15), d, 2.4, 0.4);
      s += R(lxx+tw-3, byy, (rxx-lxx-tw)+6, 16, l, 3);
      s += RN(lxx+tw-1, byy+11, (rxx-lxx-tw)+2, 4, d, 1.5, 0.35);
      for(i=0; i<2; i++){ s += W(lxx+tw+2 + i*((rxx-lxx-tw)-4)/2, byy+3, 8, 8, 1.2); }
      if(lv >= 1){
        var by2 = lyt + lh*0.68;
        s += R(lxx+tw-3, by2, (rxx-lxx-tw)+6, 12, l, 3);
        s += LN(lxx+tw+3, by2, rxx-3, by2, d, 2, 0.4);
      }
      s += door(lxx+tw/2, 13, 16) + door(rxx+tw/2, 13, 16);
      if(lv >= 3){
        s += R(lxx-11, GY-9, bw+22, 9, l, 2.5);
        s += lamp(lxx-19, 24) + lamp(rxx+tw+19, 24);
        s += star(lxx-22, lyt-6, 5) + star(rxx+tw+20, ryt-22, 4.5, '#ffffff', 0.85);
      }
    }
    /* ---------- RESPONSIBLE : safety HQ ---------- */
    else {
      var cf = 7 + lv*1.5;
      var tx = 100 + bw*0.20, tth = 24 + lv*9;
      var cabB = y0 - 8, cabT = cabB - tth - 16;
      if(lv >= 2){
        s += R(x0-20, GY-bh*0.55, 24, bh*0.55, l, 2.5);
        s += R(x0-23, GY-bh*0.55-7, 30, 8, c, 2.5);
        s += grid(x0-16, GY-bh*0.55+6, 16, bh*0.55-16, 2, 2);
      }
      s += R(tx-9, cabT+16, 18, tth, c, 2);
      s += RN(tx-9, cabT+16, 6, tth, '#000', 0, 0.10);
      s += P('M'+n(tx-16)+' '+n(cabT+17)+'L'+n(tx-11)+' '+n(cabT)+'L'+n(tx+11)+' '+n(cabT)+'L'+n(tx+16)+' '+n(cabT+17)+'Z', l, 3);
      s += W(tx-11, cabT+4, 9, 9, 1.5) + W(tx+1.5, cabT+4, 9, 9, 1.5);
      s += E(tx, cabT-5, 4.2, 4.2, '#ff8a8a', 2.4);
      s += PN('M'+n(tx)+' '+n(cabT-5)+'L'+n(tx-30)+' '+n(cabT-15)+'L'+n(tx-30)+' '+n(cabT-3)+'Z', '#fff0ee', 0.34);
      s += PN('M'+n(tx)+' '+n(cabT-5)+'L'+n(tx+30)+' '+n(cabT-13)+'L'+n(tx+30)+' '+n(cabT-4)+'Z', '#fff0ee', 0.2);
      s += P('M'+n(x0)+' '+n(GY)+'L'+n(x0)+' '+n(y0+cf)+'L'+n(x0+cf)+' '+n(y0)+'L'+n(x1-cf)+' '+n(y0)+'L'+n(x1)+' '+n(y0+cf)+'L'+n(x1)+' '+n(GY)+'Z', c, 3.2);
      s += PN('M'+n(x0)+' '+n(GY)+'L'+n(x0)+' '+n(y0+cf)+'L'+n(x0+cf)+' '+n(y0)+'L'+n(x0+cf+11)+' '+n(y0)+'L'+n(x0+11)+' '+n(y0+cf)+'L'+n(x0+11)+' '+n(GY)+'Z', '#000', 0.10);
      s += R(x0-5, y0-8, bw+10, 10, l, 2);
      s += RN(x0-2, y0-5.5, bw+4, 3, '#ffffff', 1.5, 0.3);
      s += grid(x0+8, y0+10, bw-16, bh*0.44, 3+lv, 1+Math.min(lv,2));
      s += R(x0-7, GY-15, bw+14, 15, l, 2.5);
      for(i=0; i<Math.floor((bw+14)/11); i++){
        s += PN('M'+n(x0-7+i*11)+' '+n(GY-1.5)+'L'+n(x0-7+i*11+5)+' '+n(GY-13.5)+'L'+n(x0-7+i*11+9.5)+' '+n(GY-13.5)+'L'+n(x0-7+i*11+4.5)+' '+n(GY-1.5)+'Z', d, 0.35);
      }
      s += R(x0-7, GY-15, bw+14, 15, 'none', 2.5);
      s += door(100, 18, 15);
      var fx0 = x0 - 18, fx1 = x1 + 18;
      s += LN(fx0, GY-13, 86, GY-13, d, 3, 0.9) + LN(114, GY-13, fx1, GY-13, d, 3, 0.9);
      s += LN(fx0, GY-6, 86, GY-6, d, 3, 0.9) + LN(114, GY-6, fx1, GY-6, d, 3, 0.9);
      var px;
      for(i=0; fx0 + i*13 <= fx1; i++){ px = fx0 + i*13; if(px > 86 && px < 114){ continue; } s += LN(px, GY, px, GY-18, d, 3.4, 0.9); }
      s += E(fx0, GY-20, 3, 3, LT, 2) + E(fx1, GY-20, 3, 3, LT, 2);
      if(lv >= 1){
        s += R(88, y0+2, 24, 10, l, 2.5) + RN(91, y0+5.2, 18, 3.5, d, 1.5, 0.5);
      }
      if(lv >= 3){
        s += lamp(fx0-10, 30) + lamp(fx1+10, 30);
        s += star(x0-16, y0-24, 5) + star(x1+16, y0-14, 4.5, '#ffffff', 0.85);
      }
    }

    /* ---------- shared upgrades ---------- */
    if(lv >= 2){ s += tuft(x0-30, GY+1, 0.9, c) + tuft(x1+30, GY+1, 0.85, c); }
    else { s += tuft(x0-14, GY+1, 0.85, c) + tuft(x1+14, GY+1, 0.8, c); }
    if(st === 6){
      s += star(46, 60, 6) + star(158, 52, 5, '#ffffff', 0.9) + star(30, 118, 4.5, '#ffffff', 0.8)
         + star(174, 108, 4, '#ffffff', 0.75) + star(100, 26, 5.5, '#ffffff', 0.9)
         + star(66, 34, 3.5, '#ffffff', 0.7) + star(140, 30, 4, '#ffffff', 0.8);
      s += EN(100, GY+4, 66, 9, LG, 0.3);
    }
  }

  return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
}

/* ═══════════════════════════════════════════════════════════════
   ④ 로봇
   ═══════════════════════════════════════════════════════════════ */
function drawRobot(st, b){
  var c = b.c, d = b.d, l = b.l, id = b.id || 'inquiry';
  var s = '';
  function n(v){ return Math.round(v*100)/100; }
  function R(x,y,w,h,rx,f,sw){ return '<rect x="'+n(x)+'" y="'+n(y)+'" width="'+n(w)+'" height="'+n(h)+'" rx="'+n(rx)+'" fill="'+f+'" stroke="'+d+'" stroke-width="'+(sw==null?3:sw)+'" stroke-linejoin="round"/>'; }
  function RF(x,y,w,h,rx,f,op){ return '<rect x="'+n(x)+'" y="'+n(y)+'" width="'+n(w)+'" height="'+n(h)+'" rx="'+n(rx)+'" fill="'+f+'" opacity="'+op+'"/>'; }
  function C(cx,cy,r,f,sw){ return '<circle cx="'+n(cx)+'" cy="'+n(cy)+'" r="'+n(r)+'" fill="'+f+'" stroke="'+d+'" stroke-width="'+(sw==null?3:sw)+'"/>'; }
  function CF(cx,cy,r,f,op){ return '<circle cx="'+n(cx)+'" cy="'+n(cy)+'" r="'+n(r)+'" fill="'+f+'" opacity="'+op+'"/>'; }
  function E(cx,cy,rx,ry,f,sw){ return '<ellipse cx="'+n(cx)+'" cy="'+n(cy)+'" rx="'+n(rx)+'" ry="'+n(ry)+'" fill="'+f+'" stroke="'+d+'" stroke-width="'+(sw==null?3:sw)+'"/>'; }
  function EF(cx,cy,rx,ry,f,op){ return '<ellipse cx="'+n(cx)+'" cy="'+n(cy)+'" rx="'+n(rx)+'" ry="'+n(ry)+'" fill="'+f+'" opacity="'+op+'"/>'; }
  function P(pts,f,sw){ return '<polygon points="'+pts+'" fill="'+f+'" stroke="'+d+'" stroke-width="'+(sw==null?3:sw)+'" stroke-linejoin="round"/>'; }
  function PA(dd,f,sw){ return '<path d="'+dd+'" fill="'+f+'" stroke="'+d+'" stroke-width="'+(sw==null?3:sw)+'" stroke-linejoin="round" stroke-linecap="round"/>'; }
  function LN(x1,y1,x2,y2,col,w,op){ return '<line x1="'+n(x1)+'" y1="'+n(y1)+'" x2="'+n(x2)+'" y2="'+n(y2)+'" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round" opacity="'+(op==null?1:op)+'"/>'; }
  function riv(x,y){ return '<circle cx="'+n(x)+'" cy="'+n(y)+'" r="1.7" fill="'+l+'" stroke="'+d+'" stroke-width="0.9"/>'; }
  function sheen(x,y,w,h,rx){ return RF(x+1.5,y+1.5,w*0.32,h-3,rx,'#ffffff',0.20)+RF(x+w*0.70,y+1.5,w*0.28,h-3,rx,d,0.17); }
  function limb(dd,w){ return '<path d="'+dd+'" fill="none" stroke="'+d+'" stroke-width="'+(w+2.4)+'" stroke-linecap="round" stroke-linejoin="round"/><path d="'+dd+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function star(x,y,r,op){
    var p='M'+n(x)+' '+n(y-r)+'L'+n(x+r*0.26)+' '+n(y-r*0.26)+'L'+n(x+r)+' '+n(y)+'L'+n(x+r*0.26)+' '+n(y+r*0.26)+'L'+n(x)+' '+n(y+r)+'L'+n(x-r*0.26)+' '+n(y+r*0.26)+'L'+n(x-r)+' '+n(y)+'L'+n(x-r*0.26)+' '+n(y-r*0.26)+'Z';
    return '<path d="'+p+'" fill="#ffffff" opacity="'+op+'"/>';
  }
  function eye(cx,cy,r){
    return C(cx,cy,r,'#1d2740',r*0.30)+CF(cx,cy,r*0.68,l,0.95)+CF(cx,cy,r*0.40,'#ffffff',0.85)+CF(cx-r*0.30,cy-r*0.32,r*0.26,'#ffffff',0.95);
  }
  function cheek(cx,cy,rx){ return '<ellipse cx="'+n(cx)+'" cy="'+n(cy)+'" rx="'+n(rx)+'" ry="'+n(rx*0.66)+'" fill="#ff90a8" opacity="0.5"/>'; }
  function grille(x,y,w,h){
    var g=R(x,y,w,h,h*0.42,'#1d2740',2), i;
    for(i=1;i<4;i++){ g+=LN(x+w*i/4,y+1.6,x+w*i/4,y+h-1.6,l,1.5,0.9); }
    return g;
  }
  function gear(cx,cy,r,t,f){
    var g='', i;
    for(i=0;i<t;i++){
      g+='<rect x="'+n(cx-2.7)+'" y="'+n(cy-r-4.4)+'" width="5.4" height="7.6" rx="1.6" fill="'+f+'" stroke="'+d+'" stroke-width="2" stroke-linejoin="round" transform="rotate('+n(i*360/t)+','+n(cx)+','+n(cy)+')"/>';
    }
    g+=C(cx,cy,r,f,2.6)+CF(cx,cy,r*0.36,d,0.85)+CF(cx-r*0.35,cy-r*0.35,r*0.30,'#ffffff',0.35);
    return g;
  }
  function chestIcon(cx,cy,k){
    var g='';
    if(id==='inquiry'){ g+='<circle cx="'+n(cx-1.5*k)+'" cy="'+n(cy-1.5*k)+'" r="'+n(4.5*k)+'" fill="none" stroke="'+d+'" stroke-width="2"/>'+LN(cx+2*k,cy+2*k,cx+6*k,cy+6*k,d,2.4); }
    else if(id==='analysis'){ g+=R(cx-6*k,cy-1*k,3.4*k,7*k,1,d,0)+R(cx-1.4*k,cy-6*k,3.4*k,12*k,1,d,0)+R(cx+3.2*k,cy-3.5*k,3.4*k,9.5*k,1,d,0); }
    else if(id==='concept'){ g+=gear(cx,cy,5*k,7,l); }
    else if(id==='communicate'){ g+='<path d="M'+n(cx-6*k)+' '+n(cy+5*k)+' A '+n(8*k)+' '+n(8*k)+' 0 0 1 '+n(cx+6*k)+' '+n(cy+5*k)+'" fill="none" stroke="'+d+'" stroke-width="2.2"/><path d="M'+n(cx-3*k)+' '+n(cy+5*k)+' A '+n(4*k)+' '+n(4*k)+' 0 0 1 '+n(cx+3*k)+' '+n(cy+5*k)+'" fill="none" stroke="'+d+'" stroke-width="2.2"/>'+CF(cx,cy+5*k,1.8*k,d,1); }
    else if(id==='collaborate'){ g+='<circle cx="'+n(cx-4*k)+'" cy="'+n(cy)+'" r="'+n(4.6*k)+'" fill="none" stroke="'+d+'" stroke-width="2.2"/><circle cx="'+n(cx+4*k)+'" cy="'+n(cy)+'" r="'+n(4.6*k)+'" fill="none" stroke="'+d+'" stroke-width="2.2"/>'; }
    else { g+=PA('M'+n(cx)+' '+n(cy-7*k)+'L'+n(cx+6*k)+' '+n(cy-4*k)+'L'+n(cx+6*k)+' '+n(cy+2*k)+'Q'+n(cx)+' '+n(cy+8*k)+' '+n(cx-6*k)+' '+n(cy+2*k)+'L'+n(cx-6*k)+' '+n(cy-4*k)+'Z',l,2.2); }
    return g;
  }

  /* ---------- ground shadow ---------- */
  s += EF(100,180,26+st*4,6.5,'#1b2430',0.17);

  /* ---------- st0 : parts crate ---------- */
  if(st===0){
    s += gear(58,166,7,7,l);
    s += P('146,160 152,163.5 152,170.5 146,174 140,170.5 140,163.5',l,2.4);
    s += R(68,130,64,44,7,c,3.2)+sheen(68,130,64,44,7);
    s += R(74,138,52,10,3,d,0);
    s += RF(74,138,52,10,3,'#ffffff',0.10);
    s += riv(74,135)+riv(126,135)+riv(74,169)+riv(126,169);
    s += LN(68,156,132,156,d,2,0.5);
    s += chestIcon(100,163,0.95);
    s += R(84,120,32,12,4,d,2.6);
    s += CF(100,126,4.5,l,0.95)+star(100,126,3.4,0.9);
    s += LN(92,120,90,112,d,2.6)+CF(90,110,3,l,1);
    s += star(140,128,4,0.8)+star(62,120,3,0.65);
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  }

  /* ---------- st1 : core ignition ---------- */
  if(st===1){
    s += R(64,142,72,32,7,c,3.2)+sheen(64,142,72,32,7);
    s += R(72,138,56,8,3,d,0);
    s += riv(70,168)+riv(130,168);
    s += CF(100,110,34,l,0.20)+CF(100,110,25,l,0.28);
    s += C(100,110,20,c,3.2);
    s += '<path d="M80 110 A 20 20 0 0 1 120 110 Z" fill="#ffffff" opacity="0.20"/>';
    s += C(100,110,12.5,l,2.6);
    s += eye(94,108,4.6)+eye(107,108,4.6);
    s += cheek(88,116,3.4)+cheek(112,116,3.4);
    s += LN(100,90,100,80,d,3)+C(100,76,4.6,l,2.4);
    s += chestIcon(100,132,0.7);
    s += star(66,96,5,0.9)+star(136,102,4.2,0.85)+star(122,78,3.4,0.75)+star(78,74,3,0.7);
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  }

  /* ---------- st2 : basic frame ---------- */
  if(st===2){
    s += R(83,150,13,20,4,c,3)+R(104,150,13,20,4,c,3);
    s += R(78,166,22,10,4,l,2.8)+R(100,166,22,10,4,l,2.8);
    s += limb('M78 124 L62 136',6)+C(60,138,5,l,2.6);
    s += limb('M122 124 L138 136',6)+C(140,138,5,l,2.6);
    s += R(76,112,48,42,11,c,3.2)+sheen(76,112,48,42,11);
    s += R(86,122,28,24,7,l,2.6);
    s += chestIcon(100,134,1);
    s += riv(81,117)+riv(119,117)+riv(81,149)+riv(119,149);
    s += R(92,104,16,10,3,l,2.6);
    s += R(73,70,54,40,13,c,3.2)+sheen(73,70,54,40,13);
    s += eye(88,88,8)+eye(112,88,8);
    s += cheek(80,99,4)+cheek(120,99,4);
    s += grille(92,100,16,7);
    s += LN(100,70,100,58,d,3)+C(100,55,5,l,2.6);
    s += star(58,72,4,0.7)+star(142,80,3.4,0.6);
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  }

  /* ---------- st3+ : type-specific chassis ---------- */
  var big = st>=4, full = st>=5, leg = st>=6;
  var k = st===3?0.94:(st===4?1.05:(st===5?1.13:1.20));
  var g = '';

  if(id==='inquiry'){
    /* ROVER : caterpillar base + pincer arms + searchlight cyclops */
    g += R(48,146,104,28,14,c,3.4)+sheen(48,146,104,28,14);
    var i;
    for(i=0;i<9;i++){ g += LN(56+i*11,147.5,56+i*11,172.5,d,2,0.45); }
    g += C(68,160,10,l,2.8)+CF(68,160,4,d,0.8);
    g += C(100,160,7.5,l,2.6)+CF(100,160,3,d,0.8);
    g += C(132,160,10,l,2.8)+CF(132,160,4,d,0.8);
    g += P('74,104 126,104 136,148 64,148',c,3.4);
    g += '<path d="M74 104 L92 104 L88 148 L64 148 Z" fill="#ffffff" opacity="0.18"/>';
    g += '<path d="M118 104 L126 104 L136 148 L118 148 Z" fill="'+d+'" opacity="0.16"/>';
    g += R(84,114,32,22,5,'#1d2740',2.6);
    g += LN(88,131,94,122,l,2.4)+LN(94,122,101,127,l,2.4)+LN(101,127,111,116,l,2.4);
    g += riv(70,143)+riv(130,143)+riv(78,109)+riv(122,109);
    g += limb('M72 112 L50 120 L44 132',7)+PA('M38 126 Q30 132 38 139',l,2.6)+PA('M50 128 Q56 133 50 140',l,2.6);
    g += limb('M128 112 L150 120 L156 132',7)+PA('M162 126 Q170 132 162 139',l,2.6)+PA('M150 128 Q144 133 150 140',l,2.6);
    g += R(93,94,14,12,3,l,2.6);
    g += '<path d="M100 78 L54 54 L54 72 Z" fill="'+l+'" opacity="0.38"/>';
    g += R(76,60,48,36,12,c,3.4)+sheen(76,60,48,36,12);
    g += C(100,78,14,'#1d2740',3)+CF(100,78,9.5,l,0.95)+CF(100,78,5.5,'#ffffff',0.9)+CF(96,74,3.2,'#ffffff',0.95);
    g += cheek(82,88,4.2)+cheek(118,88,4.2);
    g += LN(82,62,74,48,d,3)+C(72,45,4.6,l,2.6);
    g += LN(118,62,126,48,d,3)+C(128,45,4.6,l,2.6);
    if(big){ g += R(56,108,14,26,5,c,3)+R(130,108,14,26,5,c,3)+riv(63,113)+riv(137,113); }
    if(full){ g += R(84,42,32,12,5,c,3)+CF(92,48,2.6,l,1)+CF(100,48,2.6,l,1)+CF(108,48,2.6,l,1); }
  }
  else if(id==='analysis'){
    /* MONITOR : wide screen head + slim data body + thin legs */
    g += R(84,146,11,22,4,c,3)+R(105,146,11,22,4,c,3);
    g += R(76,164,26,11,5,l,2.8)+R(98,164,26,11,5,l,2.8);
    g += limb('M80 118 L62 128 L62 142',6.5)+R(56,142,13,11,3,l,2.6);
    g += limb('M120 118 L138 128 L138 142',6.5)+R(131,142,13,11,3,l,2.6);
    g += R(78,110,44,40,8,c,3.4)+sheen(78,110,44,40,8);
    g += R(86,118,28,20,4,'#1d2740',2.6);
    var j;
    for(j=0;j<4;j++){ g += R(89+j*6.5,132-((j%3)+1)*4.6,4.4,((j%3)+1)*4.6+2,1.4,l,0); }
    g += riv(83,115)+riv(117,115)+riv(83,145)+riv(117,145);
    g += R(94,102,12,10,3,l,2.6);
    g += R(52,54,96,52,10,c,3.5)+sheen(52,54,96,52,10);
    g += R(59,61,82,38,6,'#16233c',2.6);
    for(j=1;j<5;j++){ g += LN(59+j*16.4,62,59+j*16.4,98,l,1,0.25); }
    g += LN(60,96,141,96,l,1.4,0.35);
    g += R(64,84,7,12,2,l,0)+R(74,78,7,18,2,l,0)+R(120,80,7,16,2,l,0)+R(130,72,7,24,2,l,0);
    g += '<polyline points="63,90 76,80 90,86 104,72 118,78 134,66" fill="none" stroke="#ffffff" stroke-width="2.2" opacity="0.9" stroke-linejoin="round" stroke-linecap="round"/>';
    g += eye(90,80,9.5)+eye(112,80,9.5);
    g += cheek(80,93,4.2)+cheek(122,93,4.2);
    g += riv(56,58)+riv(144,58)+riv(56,102)+riv(144,102);
    g += LN(70,54,67,46,d,3)+C(66,43,4.4,l,2.6);
    if(big){ g += R(36,64,16,30,5,c,3)+R(148,64,16,30,5,c,3)+LN(40,72,48,72,l,2.2)+LN(40,80,48,80,l,2.2)+LN(152,72,160,72,l,2.2)+LN(152,80,160,80,l,2.2); }
    if(full){ g += R(84,40,32,12,4,c,3)+CF(92,46,2.6,l,1)+CF(100,46,2.6,l,1)+CF(108,46,2.6,l,1); }
  }
  else if(id==='concept'){
    /* MAKER : bulb head + barrel drum body + gears */
    g += R(76,156,20,18,6,c,3.2)+R(104,156,20,18,6,c,3.2);
    g += R(70,168,28,10,5,l,2.8)+R(102,168,28,10,5,l,2.8);
    g += R(68,102,64,58,16,c,3.4)+sheen(68,102,64,58,16);
    g += '<path d="M68 116 Q100 124 132 116" fill="none" stroke="'+d+'" stroke-width="2.2" opacity="0.5"/>';
    g += '<path d="M68 148 Q100 156 132 148" fill="none" stroke="'+d+'" stroke-width="2.2" opacity="0.5"/>';
    g += riv(74,109)+riv(126,109)+riv(74,153)+riv(126,153);
    g += gear(100,132,14,9,l);
    g += limb('M70 118 L50 128 L52 142',7)+PA('M44 138 L60 138 L60 148 L44 148 Z',l,2.6);
    g += limb('M130 118 L150 128 L148 142',7)+C(148,146,6.5,l,2.6)+LN(144,150,152,150,d,2.4);
    g += R(90,88,20,14,4,l,2.8)+LN(90,93,110,93,d,2)+LN(90,98,110,98,d,2);
    g += CF(100,67,27,l,0.22);
    g += C(100,67,24,c,3.4);
    g += '<path d="M79 58 A 24 24 0 0 1 107 46 L100 67 Z" fill="#ffffff" opacity="0.22"/>';
    g += PA('M92 79 L92 70 Q100 62 108 70 L108 79',l,2.6);
    g += eye(92,64,8)+eye(110,64,8);
    g += cheek(84,77,4)+cheek(118,77,4);
    if(big){ g += gear(56,96,9,7,c)+gear(144,96,9,7,c); }
    if(full){ g += R(60,110,10,34,4,c,3)+R(130,110,10,34,4,c,3)+CF(65,118,2.6,l,1)+CF(135,118,2.6,l,1); }
  }
  else if(id==='communicate'){
    /* RELAY : big parabolic dish + speaker cabinet + tripod */
    g += limb('M84 152 L66 174',7)+limb('M116 152 L134 174',7)+limb('M100 154 L100 174',7);
    g += R(58,170,22,8,4,l,2.6)+R(120,170,22,8,4,l,2.6)+R(90,170,20,8,4,l,2.6);
    g += R(72,120,56,44,10,c,3.4)+sheen(72,120,56,44,10);
    g += C(88,142,12,'#1d2740',2.6)+CF(88,142,6,l,0.9)+CF(85,139,2.4,'#ffffff',0.9);
    g += C(115,138,7,'#1d2740',2.4)+CF(115,138,3.2,l,0.9);
    g += R(108,148,16,9,3,d,2)+CF(112,152.5,1.7,l,1)+CF(117,152.5,1.7,l,1)+CF(122,152.5,1.7,l,0.6);
    g += riv(77,125)+riv(123,125)+riv(77,159)+riv(123,159);
    g += limb('M70 128 L54 138',6)+C(52,141,5,l,2.6);
    g += limb('M130 128 L146 138',6)+C(148,141,5,l,2.6);
    g += '<path d="M56 86 A 44 44 0 0 1 144 86 Z" fill="'+c+'" stroke="'+d+'" stroke-width="3.4" stroke-linejoin="round"/>';
    g += '<path d="M66 86 A 34 34 0 0 1 134 86 Z" fill="'+l+'" stroke="'+d+'" stroke-width="2.4" stroke-linejoin="round"/>';
    g += '<path d="M62 86 A 38 38 0 0 1 84 52 L100 86 Z" fill="#ffffff" opacity="0.28"/>';
    g += LN(100,86,100,58,d,3,0.65)+LN(70,80,130,80,d,2,0.4);
    g += C(100,54,7,l,2.8)+CF(98,52,2.4,'#ffffff',0.8);
    g += R(76,84,48,32,12,c,3.4)+sheen(76,84,48,32,12);
    g += eye(89,98,8.5)+eye(111,98,8.5);
    g += cheek(80,110,4)+cheek(120,110,4);
    g += grille(93,110,14,6);
    if(big){
      g += '<path d="M40 66 A 22 22 0 0 0 40 106" fill="none" stroke="'+l+'" stroke-width="3" stroke-linecap="round" opacity="0.85"/>';
      g += '<path d="M32 58 A 32 32 0 0 0 32 114" fill="none" stroke="'+l+'" stroke-width="2.6" stroke-linecap="round" opacity="0.5"/>';
      g += '<path d="M160 66 A 22 22 0 0 1 160 106" fill="none" stroke="'+l+'" stroke-width="3" stroke-linecap="round" opacity="0.85"/>';
      g += '<path d="M168 58 A 32 32 0 0 1 168 114" fill="none" stroke="'+l+'" stroke-width="2.6" stroke-linecap="round" opacity="0.5"/>';
    }
    if(full){ g += R(56,124,14,28,5,c,3)+R(130,124,14,28,5,c,3)+CF(63,132,2.8,l,1)+CF(137,132,2.8,l,1); }
  }
  else if(id==='collaborate'){
    /* TEAM UNIT : round body + FOUR arms + ball wheel */
    g += limb('M70 112 L46 100 L38 84',7)+C(36,80,7,l,2.8);
    g += limb('M130 112 L154 100 L162 84',7)+C(164,80,7,l,2.8);
    g += limb('M72 138 L48 146 L42 160',7)+C(40,164,6.5,l,2.8);
    g += limb('M128 138 L152 146 L158 160',7)+C(160,164,6.5,l,2.8);
    g += C(100,126,40,c,3.5);
    g += '<path d="M60 126 A 40 40 0 0 1 100 86 L100 126 Z" fill="#ffffff" opacity="0.18"/>';
    g += '<path d="M100 166 A 40 40 0 0 0 140 126 L100 126 Z" fill="'+d+'" opacity="0.15"/>';
    g += E(100,138,21,17,l,2.8);
    g += chestIcon(100,138,1.12);
    g += CF(74,110,3.2,l,0.9)+CF(126,110,3.2,l,0.9)+riv(78,152)+riv(122,152);
    g += C(100,166,13,l,3)+CF(100,166,5.5,d,0.8)+CF(96,162,2.8,'#ffffff',0.6);
    g += C(100,64,24,c,3.4);
    g += '<path d="M76 64 A 24 24 0 0 1 100 40 L100 64 Z" fill="#ffffff" opacity="0.20"/>';
    g += R(78,52,44,9,4,l,2.6);
    g += eye(90,68,8.5)+eye(111,68,8.5);
    g += cheek(81,80,4.2)+cheek(120,80,4.2);
    g += C(100,44,5.5,l,2.6);
    if(big){ g += '<circle cx="36" cy="80" r="11" fill="none" stroke="'+l+'" stroke-width="3" opacity="0.85"/><circle cx="164" cy="80" r="11" fill="none" stroke="'+l+'" stroke-width="3" opacity="0.85"/>'; }
    if(full){ g += '<circle cx="100" cy="126" r="48" fill="none" stroke="'+l+'" stroke-width="2.6" stroke-dasharray="7 9" opacity="0.7"/>'; }
  }
  else {
    /* GUARDIAN : angular pauldrons + heavy plate + shield */
    g += R(72,148,22,24,5,c,3.2)+R(106,148,22,24,5,c,3.2);
    g += R(66,166,30,12,5,l,2.8)+R(104,166,30,12,5,l,2.8);
    g += P('76,100 124,100 132,150 68,150',c,3.5);
    g += '<path d="M76 100 L94 100 L90 150 L68 150 Z" fill="#ffffff" opacity="0.18"/>';
    g += '<path d="M114 100 L124 100 L132 150 L114 150 Z" fill="'+d+'" opacity="0.16"/>';
    g += P('80,108 120,108 124,132 76,132',l,2.8);
    g += chestIcon(100,120,1.05);
    g += R(78,136,44,9,3,d,2);
    var q;
    for(q=0;q<5;q++){ g += '<polygon points="'+n(83+q*8.6)+',137.5 '+n(88+q*8.6)+',137.5 '+n(84+q*8.6)+',143.5 '+n(79+q*8.6)+',143.5" fill="'+l+'" opacity="0.9"/>'; }
    g += riv(73,146)+riv(127,146);
    g += P('52,98 82,90 84,116 54,122',c,3.4)+riv(62,102)+riv(74,100);
    g += P('148,98 118,90 116,116 146,122',c,3.4)+riv(138,102)+riv(126,100);
    g += limb('M60 116 L48 132 L48 146',7.5);
    g += limb('M140 116 L152 132 L152 146',7.5)+R(145,144,15,12,4,l,2.6);
    g += PA('M46 106 L74 114 L74 140 Q46 154 30 138 L30 114 Z',c,3.4);
    g += '<path d="M46 106 L60 110 L60 148 Q44 150 32 140 L30 114 Z" fill="#ffffff" opacity="0.16"/>';
    g += PA('M50 118 L60 122 L60 134 L50 138 L42 132 L42 124 Z',l,2.4);
    g += riv(36,116)+riv(36,140);
    g += R(94,92,12,10,3,l,2.6);
    g += PA('M74 66 Q74 54 100 54 Q126 54 126 66 L126 90 L74 90 Z',c,3.4);
    g += '<path d="M74 68 Q76 56 96 54 L96 90 L74 90 Z" fill="#ffffff" opacity="0.18"/>';
    g += R(78,70,44,14,6,'#1d2740',2.8);
    g += RF(81,74,38,6,3,l,0.95)+CF(89,77,2.6,'#ffffff',0.95)+CF(111,77,2.6,'#ffffff',0.8);
    g += cheek(83,88,4)+cheek(117,88,4);
    g += P('96,54 100,40 104,54',l,2.6);
    if(big){ g += P('52,98 46,80 66,88',c,3)+P('148,98 154,80 134,88',c,3); }
    if(full){ g += R(84,144,32,10,4,c,3)+CF(92,149,2.6,l,1)+CF(100,149,2.6,l,1)+CF(108,149,2.6,l,1); }
  }

  if(st===3){ s += star(46,64,4,0.55)+star(156,74,3.4,0.5); }

  s += '<g transform="translate(100,176) scale('+k+') translate(-100,-176)">'+g+'</g>';

  /* ---------- legendary aura ---------- */
  if(leg){
    s += '<circle cx="100" cy="104" r="80" fill="none" stroke="'+l+'" stroke-width="3" stroke-dasharray="4 12" opacity="0.55"/>';
    s += '<circle cx="100" cy="104" r="70" fill="none" stroke="'+l+'" stroke-width="2" opacity="0.35"/>';
    s += EF(100,178,54,9,l,0.28);
    s += star(28,72,7,0.95)+star(172,66,6,0.9)+star(40,140,5,0.8)+star(162,142,5.5,0.85)+star(100,14,6.5,0.95)+star(56,34,4.5,0.75)+star(146,30,4,0.7);
    s += CF(30,110,4,l,0.8)+CF(170,104,4,l,0.8)+CF(18,88,2.6,l,0.6)+CF(182,92,2.6,l,0.6);
  } else if(full){
    s += star(30,80,5,0.75)+star(170,88,4.4,0.7)+star(44,44,3.6,0.6)+star(154,40,3.2,0.55);
  } else if(big){
    s += star(36,76,4.4,0.6)+star(164,84,3.8,0.55);
  }

  return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
}

/* 탐구생물 — 그린 그림 27장(알 s0~s2, 분화 뒤 s3~s6 × 6갈래).
   파일이 없거나 못 불러오면 예전에 코드로 그리던 캐릭터로 조용히 되돌아간다. */
function drawCreaturePhoto(st, b){
  st = st|0; if(st<0) st=0; if(st>6) st=6;
  var id = (b && b.id) || 'inquiry';
  var f  = (st < 3) ? ('s' + st) : ('s' + st + '-' + id);
  var alt = (STAGE_NAME[st] || '') + ' 단계 탐구생물';
  return '<img class="charimg" src="images/' + f + '.png" alt="' + alt + '"' +
         ' loading="lazy" decoding="async"' +
         ' onerror="this.outerHTML=drawCreature(' + st + ',branchOf(&quot;' + id + '&quot;))">';
}


/* ═══════════════════════════════════════════════════════════════════════════
   새 팩용 그리기 도구 — 갈래 색(C 주색 · D 짙은색 · L 연한색)에 묶인 짧은 함수들
   ═══════════════════════════════════════════════════════════════════════════ */
function pkTools(b){
  var C=b.c, D=b.d, L=b.l, t={C:C, D:D, L:L, ID:(b.id||'inquiry')};
  t.E  = function(x,y,rx,ry,f,sw,ex){ return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'"'+(sw?' stroke="'+D+'" stroke-width="'+sw+'"':'')+(ex||'')+'/>'; };
  t.CI = function(x,y,r,f,sw,ex){ return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"'+(sw?' stroke="'+D+'" stroke-width="'+sw+'"':'')+(ex||'')+'/>'; };
  t.P  = function(d,f,sw,ex){ return '<path d="'+d+'" fill="'+f+'"'+(sw?' stroke="'+D+'" stroke-width="'+sw+'" stroke-linejoin="round" stroke-linecap="round"':'')+(ex||'')+'/>'; };
  t.LN = function(d,col,w,ex){ return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"'+(ex||'')+'/>'; };
  t.R  = function(x,y,w,h,r,f,sw,ex){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(r||0)+'" fill="'+f+'"'+(sw?' stroke="'+D+'" stroke-width="'+sw+'"':'')+(ex||'')+'/>'; };
  t.T  = function(x,y,size,txt,col,w){ return '<text x="'+x+'" y="'+y+'" font-size="'+size+'" text-anchor="middle" font-weight="'+(w||800)+'" font-family="Pretendard,Malgun Gothic,system-ui,sans-serif" fill="'+(col||D)+'">'+txt+'</text>'; };
  t.limb = function(d,w){ return t.LN(d,D,w+5) + t.LN(d,C,w); };             /* 테두리 있는 굵은 선(팔·다리·꼬리) */
  t.eye = function(x,y,r){ return t.E(x,y,r,r*1.1,'#fff',Math.max(1.6,r*0.22)) + t.E(x+r*0.1,y+r*0.12,r*0.5,r*0.6,'#1f2430',0) + t.CI(x-r*0.25,y-r*0.3,r*0.26,'#fff',0); };
  t.G  = function(inner,x,y,s){ return '<g transform="translate('+x+' '+y+') scale('+s+') translate('+(-x)+' '+(-y)+')">'+inner+'</g>'; };   /* (x,y) 를 고정점으로 확대·축소 */
  t.ground = function(w){ return '<ellipse cx="100" cy="177.5" rx="'+w+'" ry="'+(w*0.2)+'" fill="'+D+'" opacity=".16"/>'; };
  t.aura = function(){ return aura(100,108,84,C); };
  t.star = function(x,y,r,col){ return sparkle(x,y,r,col||'#FCEE7B'); };
  return t;
}
/* 공룡알 — 개별 생성 이미지 27장. 공통 3장 + 6갈래 × 4단계.
   3: 갑옷 없음 / 4: 가죽 보호구 / 5: 금속 갑옷 / 6: 전설 갑옷.
   원본 PNG는 따로 보관하고, 웹에서는 가벼운 WebP 파일을 읽는다. */
var DINO_IMAGE_IDS = ['inquiry','analysis','concept','communicate','collaborate','responsible'];
var DINO_IMAGE_NAMES = ['티라노','랩터','트리케라톱스','프테라노돈','브라키오','안킬로'];
var DINO_IMAGE_STAGES = ['알','금 간 알','부화','새끼','청소년','성체','전설의 공룡'];
var DINO_IMAGE_GEAR = ['','','','갑옷 없는 모습','가죽 보호구','금속 갑옷','전설 갑옷'];
var DINO_IMAGE_SCALE = [0.92,0.92,0.92,0.68,0.80,0.91,1];
function drawDino(st, b){
  st=st|0; if(st<0) st=0; if(st>6) st=6;
  var i=DINO_IMAGE_IDS.indexOf(b && b.id), file, alt;
  if(i<0) i=0;
  file='s'+st+(st<3?'':'-'+DINO_IMAGE_IDS[i]);
  alt=st<3 ? '공룡 '+DINO_IMAGE_STAGES[st] :
    DINO_IMAGE_NAMES[i]+' · '+DINO_IMAGE_STAGES[st]+' · '+DINO_IMAGE_GEAR[st];
  return '<img class="charimg" src="images/dino-armor-v1/'+file+'.webp"'+
    ' alt="'+alt+'" width="640" height="640" loading="lazy" decoding="async"'+
    ' style="aspect-ratio:1/1;object-fit:contain;transform:scale('+DINO_IMAGE_SCALE[st]+');transform-origin:50% 90%">';
}

/* ═══════════════════════════════════════════════════════════════════════════
   🏡 동물마을 — 동물 주민이 집을 짓고, 반 전체가 한 마을을 이룬다
   6종: 개구리 · 다람쥐 · 부엉이 · 여우 · 곰 · 토끼
   ═══════════════════════════════════════════════════════════════════════════ */
function villageAnimal(k){
  var C=k.C, D=k.D, L=k.L, s='';
  switch(k.ID){
    case 'inquiry':     /* 개구리 */
      s += k.E(100,150,34,26,C,3) + k.E(100,160,20,10,L,0);
      s += k.E(70,166,14,8,C,3) + k.E(130,166,14,8,C,3);
      s += k.CI(84,122,12,C,3) + k.CI(116,122,12,C,3) + k.eye(84,122,7) + k.eye(116,122,7);
      s += k.LN('M 78 148 Q 100 162 122 148', D, 2.6) + k.E(90,140,3,2,'#ff7a95',0,' opacity=".5"') + k.E(110,140,3,2,'#ff7a95',0,' opacity=".5"');
      break;
    case 'analysis':    /* 다람쥐 */
      s += k.P('M 118 170 Q 166 154 146 96 Q 138 122 118 142 Z', C, 3) + k.P('M 124 160 Q 150 150 140 112 Q 136 130 124 146 Z', L, 0);
      s += k.E(98,148,24,28,C,3) + k.E(100,156,13,16,L,0);
      s += k.CI(98,112,19,C,3) + k.P('M 82 100 L 86 84 L 94 98 Z', C, 2.5) + k.P('M 114 100 L 110 84 L 102 98 Z', C, 2.5);
      s += k.eye(91,110,4.5) + k.eye(105,110,4.5) + k.CI(98,120,2.6,D,0) + k.E(98,126,8,5,L,0);
      s += k.limb('M 86 160 L 80 176', 6) + k.limb('M 110 160 L 114 176', 6);
      break;
    case 'concept':     /* 부엉이 */
      s += k.E(100,140,30,38,C,3) + k.E(100,150,18,22,L,0);
      s += k.E(74,144,9,22,D,0,' opacity=".55"') + k.E(126,144,9,22,D,0,' opacity=".55"');
      s += k.P('M 76 108 L 72 88 L 90 104 Z', C, 2.5) + k.P('M 124 108 L 128 88 L 110 104 Z', C, 2.5);
      s += k.CI(88,118,12,'#fff',2.4) + k.CI(112,118,12,'#fff',2.4) + k.CI(89,119,6,'#1f2430',0) + k.CI(113,119,6,'#1f2430',0) + k.CI(86,116,2,'#fff',0) + k.CI(110,116,2,'#fff',0);
      s += k.P('M 96 126 L 104 126 L 100 134 Z', '#f0b040', 1.6);
      s += k.limb('M 90 176 L 90 170', 4) + k.limb('M 110 176 L 110 170', 4);
      break;
    case 'communicate': /* 여우 */
      s += k.P('M 112 168 Q 160 176 158 140 Q 150 160 118 152 Z', C, 3) + k.CI(154,142,9,'#fff',0);
      s += k.E(100,150,26,26,C,3) + k.E(100,160,14,12,'#fff',0);
      s += k.CI(100,116,20,C,3);
      s += k.P('M 84 108 L 80 78 L 96 100 Z', C, 2.5) + k.P('M 116 108 L 120 78 L 104 100 Z', C, 2.5) + k.P('M 86 104 L 84 88 L 94 100 Z', L, 0) + k.P('M 114 104 L 116 88 L 106 100 Z', L, 0);
      s += k.P('M 88 124 Q 100 142 112 124 Z', '#fff', 0) + k.CI(100,128,3,D,0);
      s += k.eye(92,114,4.2) + k.eye(108,114,4.2);
      s += k.limb('M 88 170 L 86 176', 6) + k.limb('M 112 170 L 114 176', 6);
      break;
    case 'collaborate': /* 곰 */
      s += k.E(100,148,34,30,C,3) + k.E(100,158,20,16,L,0);
      s += k.CI(100,108,25,C,3) + k.CI(80,90,9,C,3) + k.CI(120,90,9,C,3) + k.CI(80,90,4.5,L,0) + k.CI(120,90,4.5,L,0);
      s += k.E(100,118,11,8,L,0) + k.E(100,114,4,3,'#1f2430',0) + k.LN('M 96 122 Q 100 126 104 122', D, 2);
      s += k.eye(90,104,4) + k.eye(110,104,4);
      s += k.E(70,150,10,20,C,3) + k.E(130,150,10,20,C,3);
      s += k.limb('M 86 172 L 84 176', 8) + k.limb('M 114 172 L 116 176', 8);
      break;
    default:            /* 토끼 */
      s += k.E(100,152,24,26,C,3) + k.E(100,160,13,14,'#fff',0);
      s += k.CI(100,120,18,C,3);
      s += k.E(90,84,7,24,C,3) + k.E(110,84,7,24,C,3) + k.E(90,86,3.5,17,'#ffb3c6',0) + k.E(110,86,3.5,17,'#ffb3c6',0);
      s += k.eye(92,118,4.2) + k.eye(108,118,4.2) + k.CI(100,126,2.4,'#ff7a95',0);
      s += k.LN('M 86 128 L 74 126', D, 1.4) + k.LN('M 86 130 L 74 134', D, 1.4) + k.LN('M 114 128 L 126 126', D, 1.4) + k.LN('M 114 130 L 126 134', D, 1.4);
      s += k.E(84,176,10,5,C,3) + k.E(116,176,10,5,C,3);
      break;
  }
  return s;
}
function villageHouse(k, st){
  var C=k.C, D=k.D, L=k.L, s='';
  if(st===1){
    s += k.P('M 100 78 L 52 170 L 148 170 Z', C, 3) + k.P('M 100 100 L 82 170 L 118 170 Z', D, 0, ' opacity=".55"') + k.LN('M 100 78 L 100 62', D, 3) + k.P('M 100 62 L 116 68 L 100 74 Z', L, 1.5);
    return s;
  }
  if(st===2){
    s += k.R(62,116,76,56,6,L,3) + k.P('M 54 120 L 100 76 L 146 120 Z', C, 3);
    s += k.R(88,138,24,34,4,D,0) + k.CI(94,152,4,'#fff',0) + k.CI(106,152,4,'#fff',0) + k.CI(95,153,2,'#1f2430',0) + k.CI(107,153,2,'#1f2430',0);
    s += k.LN('M 68 172 L 132 172', D, 3);
    return s;
  }
  /* st 3~6: 본집 */
  s += k.R(52,108,96,66,6,L,3) + k.P('M 44 112 L 100 60 L 156 112 Z', C, 3);
  if(st>=4) s += k.R(120,72,12,26,2,D,0) + k.LN('M 126 70 Q 132 62 128 54', D, 2.2, ' opacity=".5"');
  s += k.R(66,122,22,20,3,'#dff0ff',2.4) + k.LN('M 77 122 L 77 142 M 66 132 L 88 132', D, 1.6);
  s += k.R(112,122,22,20,3,'#dff0ff',2.4) + k.LN('M 123 122 L 123 142 M 112 132 L 134 132', D, 1.6);
  s += k.R(88,146,24,28,4,D,0) + k.CI(106,161,2.2,L,0);
  if(st>=5){
    var i, x;
    for(i=0;i<6;i++){ x = 60 + i*13.5; s += k.R(x,100,13.5,10,0,(i%2?'#fff':C),0); }
    s += k.R(58,98,84,4,2,D,0);
    s += k.R(62,80,36,16,4,'#fff',2.4) + k.T(80,92,9,'OPEN',D,900);
    s += k.CI(150,124,6,'#ffd166',2) + k.LN('M 150 112 L 150 118', D, 2);
  }
  if(st>=4){
    s += k.LN('M 22 176 L 46 176 M 26 162 L 26 176 M 36 162 L 36 176 M 46 162 L 46 176 M 22 168 L 46 168', D, 2.4);
    s += k.LN('M 154 176 L 178 176 M 158 162 L 158 176 M 168 162 L 168 176 M 178 162 L 178 176 M 154 168 L 178 168', D, 2.4);
    [[30,158,'#ff7a95'],[40,156,'#ffd166'],[166,158,'#ff7a95'],[174,156,'#ffd166']].forEach(function(f){ s += k.CI(f[0],f[1],4,f[2],0) + k.LN('M '+f[0]+' '+(f[1]+4)+' L '+f[0]+' 166', '#5aa15a', 2); });
  }
  if(st===6){ s += k.LN('M 100 60 L 100 36', D, 3) + k.P('M 100 36 L 124 44 L 100 52 Z', '#ffd166', 1.5) + k.star(36,70,7) + k.star(166,66,6) + k.star(150,150,5); }
  return s;
}
function drawVillage(st, b){
  var k = pkTools(b), s='';
  st = st|0; if(st<0) st=0; if(st>6) st=6;
  if(st===6) s += k.aura();
  s += k.ground(50);
  if(st===0){
    s += k.E(100,148,30,26,k.C,3) + k.LN('M 78 132 Q 100 112 122 132', k.D, 3) + k.CI(100,118,7,k.L,2.4) + k.LN('M 92 148 L 108 148 M 100 140 L 100 156', k.L, 3);
    s += k.E(60,172,4,2.5,k.D,0,' opacity=".4"') + k.E(52,166,4,2.5,k.D,0,' opacity=".4"') + k.E(44,172,4,2.5,k.D,0,' opacity=".4"');
  } else {
    s += villageHouse(k, st);
    if(st>=3) s += k.G(villageAnimal(k), 100, 176, 0.5).replace('translate(100 176) scale(0.5) translate(-100 -176)', 'translate(160 176) scale(0.46) translate(-100 -176)');
  }
  return wrapSvg(s);
}

/* ═══════════════════════════════════════════════════════════════════════════
   🌱 텃밭 — 씨앗 하나가 열매까지
   6종: 해바라기 · 토마토 · 나팔꽃 · 선인장 · 벼 · 사과나무
   ═══════════════════════════════════════════════════════════════════════════ */
var GARDEN_GREEN = '#5aa15a', GARDEN_DARK = '#3d7a3d', GARDEN_SOIL = '#8a6a45';
function gardenLeaf(k, x, y, w, flip){
  var d = flip ? ('M '+x+' '+y+' Q '+(x-w)+' '+(y-w*0.9)+' '+(x-w*1.6)+' '+(y-w*0.2)+' Q '+(x-w*0.7)+' '+(y+w*0.25)+' '+x+' '+y+' Z')
               : ('M '+x+' '+y+' Q '+(x+w)+' '+(y-w*0.9)+' '+(x+w*1.6)+' '+(y-w*0.2)+' Q '+(x+w*0.7)+' '+(y+w*0.25)+' '+x+' '+y+' Z');
  return '<path d="'+d+'" fill="'+GARDEN_GREEN+'" stroke="'+GARDEN_DARK+'" stroke-width="2" stroke-linejoin="round"/>';
}
function gardenPlant(k, st){
  var C=k.C, D=k.D, L=k.L, ID=k.ID, s='', i;
  var stem = function(d,w){ return k.LN(d, GARDEN_DARK, w+3) + k.LN(d, GARDEN_GREEN, w); };
  var petals = function(x,y,r,n,col){ var t='', a; for(i=0;i<n;i++){ a = i*(360/n); t += '<ellipse cx="'+x+'" cy="'+(y-r)+'" rx="'+(r*0.42)+'" ry="'+(r*0.62)+'" fill="'+col+'" stroke="'+D+'" stroke-width="1.6" transform="rotate('+a+' '+x+' '+y+')"/>'; } return t; };
  if(ID==='inquiry'){            /* 해바라기 — 곧게 자라 큰 꽃 */
    var top = [0,0,0,120,100,84,76][st];
    s += stem('M 100 172 L 100 '+top, 6) + gardenLeaf(k,100,150,16) + gardenLeaf(k,100,136,15,true);
    if(st===3) s += k.CI(100,top,7,GARDEN_GREEN,2);
    if(st===4) s += k.CI(100,top,11,GARDEN_GREEN,2.4) + k.P('M 92 '+(top-6)+' Q 100 '+(top-22)+' 108 '+(top-6)+' Z', L, 1.6);
    if(st>=5) s += petals(100,top,st===6?30:24,12,st===6?C:L) + k.CI(100,top,st===6?15:11,'#6b4423',2.4);
    if(st===6) for(i=0;i<9;i++) s += k.CI(100+((i%3)-1)*7, top+(Math.floor(i/3)-1)*7, 2, '#3a2416', 0);
  } else if(ID==='analysis'){    /* 토마토 — 지주대에 기댄 덤불 */
    s += k.LN('M 118 176 L 118 '+[0,0,0,116,100,90,84][st], '#a0713d', 4);
    s += stem('M 100 172 Q 96 150 104 '+[0,0,0,124,108,98,92][st], 5) + stem('M 100 160 Q 84 150 78 '+[0,0,0,136,126,120,116][st], 4) + stem('M 102 150 Q 116 140 118 '+[0,0,0,128,116,108,102][st], 4);
    s += gardenLeaf(k,80,140,12,true) + gardenLeaf(k,104,132,12) + gardenLeaf(k,118,120,11);
    if(st===4) s += k.CI(80,124,4,'#ffd166',1.4) + k.CI(106,112,4,'#ffd166',1.4) + k.CI(120,104,4,'#ffd166',1.4);
    if(st>=5){ var col = st===6 ? C : GARDEN_GREEN; s += k.CI(80,124,9,col,2.2) + k.CI(106,110,10,col,2.2) + k.CI(120,100,8,col,2.2) + k.P('M 76 116 L 80 120 L 84 116', GARDEN_DARK, 0) + k.P('M 102 102 L 106 106 L 110 102', GARDEN_DARK, 0); }
    if(st===6) s += k.CI(92,144,8,C,2.2) + k.CI(88,120,3,'#fff',0,' opacity=".6"') + k.CI(114,106,3,'#fff',0,' opacity=".6"');
  } else if(ID==='concept'){     /* 나팔꽃 — 격자 위를 감고 올라간다 */
    s += k.LN('M 70 176 L 70 90 M 100 176 L 100 90 M 130 176 L 130 90 M 64 110 L 136 110 M 64 140 L 136 140', '#c9a978', 3);
    var h = [0,0,0,150,128,108,92][st];
    s += stem('M 100 172 Q 80 160 96 '+(h+20)+' Q 118 '+(h+8)+' 92 '+h, 3.5);
    s += gardenLeaf(k,92,156,10,true) + gardenLeaf(k,100,134,10);
    if(st>=4){ var fl = function(x,y,r){ return k.P('M '+(x-r)+' '+y+' Q '+x+' '+(y-r*1.3)+' '+(x+r)+' '+y+' Q '+x+' '+(y+r*0.5)+' '+(x-r)+' '+y+' Z', C, 2) + k.CI(x,y-r*0.15,r*0.35,'#fff',0,' opacity=".85"'); };
      if(st===4) s += k.E(84,122,5,9,L,1.8) + k.E(112,104,5,9,L,1.8);
      if(st>=5) s += fl(84,122,11) + fl(112,104,11);
      if(st===6) s += fl(70,146,10) + fl(126,132,10) + k.CI(100,90,4,'#3a2416',0) + k.CI(108,94,3,'#3a2416',0); }
  } else if(ID==='communicate'){ /* 선인장 — 화분에서 팔을 뻗는다 */
    s += k.P('M 70 146 L 130 146 L 124 178 L 76 178 Z', '#c8734a', 2.6) + k.R(66,140,68,10,3,'#d98a5b',2.6);
    var ch = [0,0,0,112,96,84,78][st];
    s += k.R(88,ch,24,146-ch,12,GARDEN_GREEN,2.6);
    if(st>=4) s += k.R(70,114,12,30,6,GARDEN_GREEN,2.6) + k.R(70,108,30,12,6,GARDEN_GREEN,2.6) + k.R(118,124,12,22,6,GARDEN_GREEN,2.6) + k.R(100,118,30,12,6,GARDEN_GREEN,2.6);
    for(i=0;i<5;i++) s += k.LN('M 92 '+(ch+14+i*20)+' L 88 '+(ch+10+i*20)+' M 108 '+(ch+14+i*20)+' L 112 '+(ch+10+i*20), '#fff', 1.6);
    if(st>=5) s += petals(100,ch,10,8,C) + k.CI(100,ch,4,'#ffd166',1.4);
    if(st===6) s += k.CI(76,104,5,C,1.6) + k.CI(124,116,5,C,1.6) + k.CI(98,ch-12,4,'#fff',0,' opacity=".5"');
  } else if(ID==='collaborate'){ /* 벼 — 포기가 자라 이삭이 고개 숙인다 */
    var bh = [0,0,0,126,108,96,90][st];
    [[84,bh+14],[92,bh+4],[100,bh],[108,bh+4],[116,bh+14]].forEach(function(p,j){ s += k.LN('M '+(94+j*3)+' 176 Q '+(p[0])+' '+(p[1]+30)+' '+p[0]+' '+p[1], GARDEN_GREEN, 3.2); });
    if(st>=5){ var gc = st===6 ? C : L, gd = st===6 ? D : GARDEN_DARK;
      [[84,bh+14],[92,bh+4],[100,bh],[108,bh+4],[116,bh+14]].forEach(function(p){ var t2=''; for(i=0;i<5;i++){ t2 += '<ellipse cx="'+(p[0]+(i%2?4:-4))+'" cy="'+(p[1]+i*5)+'" rx="3.2" ry="4.4" fill="'+gc+'" stroke="'+gd+'" stroke-width="1.2"/>'; } s += (st===6 ? '<g transform="rotate(28 '+p[0]+' '+p[1]+')">'+t2+'</g>' : t2); }); }
  } else {                       /* 사과나무 — 줄기와 둥근 수관 */
    var tw = [0,0,0,8,10,12,14][st], th = [0,0,0,128,112,100,92][st], cr = [0,0,0,16,26,32,36][st];
    s += k.R(100-tw/2,th,tw,176-th,3,'#8a5a32',2.4);
    s += k.CI(100,th,cr,GARDEN_GREEN,2.6) + k.CI(100-cr*0.5,th+cr*0.2,cr*0.62,GARDEN_GREEN,2.6) + k.CI(100+cr*0.5,th+cr*0.2,cr*0.62,GARDEN_GREEN,2.6);
    if(st===4) [[88,104],[110,100],[100,90],[118,116],[84,120]].forEach(function(p){ s += k.CI(p[0],p[1],3.2,'#ffb3c6',1.2); });
    if(st>=5) [[88,104],[112,98],[100,88],[120,116],[82,120],[104,118]].forEach(function(p,j){ if(st===6 || j<4) s += k.CI(p[0],p[1],st===6?6.5:5,C,1.8) + k.LN('M '+p[0]+' '+(p[1]-(st===6?6.5:5))+' L '+(p[0]+2)+' '+(p[1]-(st===6?10:8)), GARDEN_DARK, 1.4); });
  }
  return s;
}
function drawGarden(st, b){
  var k = pkTools(b), s='';
  st = st|0; if(st<0) st=0; if(st>6) st=6;
  if(st===6) s += k.aura();
  s += '<ellipse cx="100" cy="176" rx="44" ry="10" fill="'+GARDEN_SOIL+'"/>' + '<ellipse cx="100" cy="174" rx="40" ry="7" fill="#a8845c"/>';
  if(st===0){ s += k.E(100,170,7,5,k.D,0) + k.E(98,169,2,1.5,'#fff',0,' opacity=".4"'); }
  else if(st===1){ s += k.LN('M 100 172 L 100 152', GARDEN_GREEN, 4) + gardenLeaf(k,100,156,8) + gardenLeaf(k,100,158,8,true); }
  else if(st===2){ s += k.LN('M 100 172 L 100 138', GARDEN_GREEN, 4.5) + k.E(88,140,11,7,GARDEN_GREEN,2) + k.E(112,140,11,7,GARDEN_GREEN,2) + k.CI(100,132,3.5,k.L,1.4); }
  else { s += gardenPlant(k, st); if(st===6) s += k.star(44,62,7) + k.star(158,58,6) + k.star(160,150,5); }
  return wrapSvg(s);
}

/* ═══════════════════════════════════════════════════════════════════════════
   🛂 여권 — 도장이 곧 세계 여행 스탬프 (교과 무관)
   6갈래(여행 스타일): 탐험가 · 기록가 · 길잡이 · 통역가 · 팀장 · 안전요원
   ═══════════════════════════════════════════════════════════════════════════ */
var PASSPORT_STAMPS = [
  {t:'아시아',   x:52,  y:86,  r:-12},
  {t:'유럽',     x:80,  y:122, r:8},
  {t:'아프리카', x:54,  y:150, r:-6},
  {t:'아메리카', x:130, y:86,  r:10},
  {t:'오세아니아', x:154, y:122, r:-9},
  {t:'남극',     x:130, y:152, r:6}
];
function drawPassport(st, b){
  var k = pkTools(b), C=k.C, D=k.D, L=k.L, s='', i;
  st = st|0; if(st<0) st=0; if(st>6) st=6;
  if(st===6) s += k.aura();
  s += k.ground(60);
  /* 펼친 여권 */
  s += k.R(22,54,78,116,8,C,0) + k.R(100,54,78,116,8,C,0);
  s += k.R(28,60,70,104,5,'#fbf7ec',2) + k.R(102,60,70,104,5,'#fbf7ec',2);
  s += k.LN('M 100 56 L 100 168', D, 3);
  for(i=0;i<4;i++) s += k.LN('M 36 '+(78+i*24)+' L 90 '+(78+i*24)+' M 110 '+(78+i*24)+' L 164 '+(78+i*24), '#e6dfcf', 1.2);
  /* 표지 스티커 = 여행 스타일 */
  s += k.CI(160,46,15,'#fff',2.4) + emblem(b,160,46,0.72);
  /* 도장 */
  for(i=0;i<st && i<6;i++){
    var p = PASSPORT_STAMPS[i], col = (i%2 ? D : C);
    s += '<g transform="rotate('+p.r+' '+p.x+' '+p.y+')">' +
         k.CI(p.x,p.y,16,'none',0,' stroke="'+col+'" stroke-width="2.6" opacity=".85"') +
         k.CI(p.x,p.y,12.5,'none',0,' stroke="'+col+'" stroke-width="1" opacity=".7"') +
         k.T(p.x,p.y+3,p.t.length>4?6.2:7.5,p.t,col,900) + '</g>';
  }
  if(st===0) s += k.CI(100,112,22,'none',0,' stroke="'+L+'" stroke-width="2" stroke-dasharray="4 4" opacity=".9"') + k.LN('M 78 112 Q 100 100 122 112 M 78 112 Q 100 124 122 112 M 100 90 L 100 134', L, 1.6, ' opacity=".9"');
  if(st===6){ s += k.P('M 36 172 L 164 172 L 158 186 L 42 186 Z', '#ffd166', 2) + k.T(100,182,9,'세계 일주 완주',D,900) + k.star(30,40,7) + k.star(176,70,6) + k.star(180,160,5); }
  return wrapSvg(s);
}

/* ═══════════════════════════════════════════════════════════════════════════
   팩 등록 — 새 팩은 이 아래에 registerPack({...}) 하나만 더하면 된다
   ═══════════════════════════════════════════════════════════════════════════ */
registerPack({ id:'creature', emoji:'🦎', name:'탐구생물', subject:'과학', tagline:'알에서 깨어난 생물이 여섯 갈래로 자란다',
  stages:['알','부화!','아기','갈래 나눔','성숙기','완전체','전설'],
  species:{inquiry:'탐험형', analysis:'분석형', concept:'발명형', communicate:'전달형', collaborate:'동료형', responsible:'수호형'},
  base:{title:'🏕️ 우리 반 탐구기지', levels:['⛺ 텐트','🏚️ 오두막','🏫 연구소','🏛️ 대형 연구단지']},
  draw:function(st,b){ return drawCreaturePhoto(st,b); } });
registerPack({ id:'scientist', emoji:'🧑‍🔬', name:'과학자', subject:'과학', tagline:'빈손 신입이 석학이 되기까지',
  stages:['빈손 신입','가운 지급','고글 착용','전공 결정','연구원','박사','석학'],
  species:{inquiry:'실험과학자', analysis:'데이터과학자', concept:'이론과학자', communicate:'커뮤니케이터', collaborate:'팀리더', responsible:'안전관리자'},
  base:{title:'🔬 우리 반 연구실', levels:['⛺ 텐트','🏚️ 오두막','🏫 연구소','🏛️ 대형 연구단지']},
  draw:function(st,b){ return drawScientist(st,b); } });
registerPack({ id:'lab', emoji:'🏛️', name:'연구소', subject:'과학', tagline:'빈 터에 연구소가 선다',
  stages:['빈 터','텐트','작업대','연구동 특화','2층 증축','관측탑','대형 연구소'],
  species:{inquiry:'실험동', analysis:'데이터센터', concept:'발명공방', communicate:'강연홀', collaborate:'협력연구동', responsible:'안전관리동'},
  base:{title:'🏛️ 우리 반 연구단지', levels:['⛺ 텐트','🏚️ 오두막','🏫 연구소','🏛️ 대형 연구단지']},
  draw:function(st,b){ return drawLab(st,b); } });
registerPack({ id:'robot', emoji:'🤖', name:'로봇', subject:'공통', tagline:'부품상자에서 전설의 기체까지',
  stages:['부품상자','코어 점등','몸통 결합','기체 타입','팔·다리','완성체','전설기체'],
  species:{inquiry:'탐사로봇', analysis:'분석로봇', concept:'제작로봇', communicate:'통신로봇', collaborate:'협동로봇', responsible:'방호로봇'},
  base:{title:'🤖 우리 반 정비창', levels:['📦 부품창고','🔧 정비소','🏭 조립공장','🚀 발사기지']},
  draw:function(st,b){ return drawRobot(st,b); } });
registerPack({ id:'dino', emoji:'🥚', name:'공룡알', subject:'공통', tagline:'알을 품어 공룡을 키우고, 마지막엔 전설이 된다',
  stages:['알','금 간 알','부화','새끼','청소년','성체','전설의 공룡'],
  species:{inquiry:'티라노', analysis:'랩터', concept:'트리케라톱스', communicate:'프테라노돈', collaborate:'브라키오', responsible:'안킬로'},
  words:{branchBtn:'🦖 공룡 고르기', branchTitle:'어떤 공룡으로 자랄까요?'},
  base:{title:'🦕 우리 반 공룡 공원', levels:['🥚 알 둥지','🌿 늪지','🌋 화산 계곡','🏛️ 자연사 박물관']},
  draw:drawDino });
registerPack({ id:'village', emoji:'🏡', name:'동물마을', subject:'공통', tagline:'동물 주민이 집을 짓고, 반 전체가 한 마을을 이룬다',
  stages:['이사 준비','텐트','오두막','내 집','꽃밭 마당','가게 개업','마을의 전설'],
  species:{inquiry:'개구리', analysis:'다람쥐', concept:'부엉이', communicate:'여우', collaborate:'곰', responsible:'토끼'},
  words:{branchBtn:'🐾 주민 고르기', branchTitle:'어떤 동물 주민이 될까요?'},
  base:{title:'🏡 우리 반 마을', levels:['⛺ 야영지','🏘️ 작은 마을','🏪 장터','🎡 마을 광장']},
  draw:drawVillage });
registerPack({ id:'garden', emoji:'🌱', name:'텃밭', subject:'공통', tagline:'씨앗 하나가 열매까지',
  stages:['씨앗','싹','떡잎','줄기','봉오리','꽃','열매'],
  species:{inquiry:'해바라기', analysis:'토마토', concept:'나팔꽃', communicate:'선인장', collaborate:'벼', responsible:'사과나무'},
  words:{branchBtn:'🌿 작물 고르기', branchTitle:'어떤 작물로 자랄까요?'},
  base:{title:'🌻 우리 반 텃밭', levels:['🌱 모종판','🪴 화단','🌼 꽃밭','🍎 과수원']},
  draw:drawGarden });
registerPack({ id:'passport', emoji:'🛂', name:'세계 여행 여권', subject:'공통', tagline:'도장이 곧 여권 스탬프 — 대륙을 하나씩',
  stages:['빈 여권','아시아','유럽','아프리카','아메리카','오세아니아','세계 일주'],
  species:{inquiry:'탐험가', analysis:'기록가', concept:'길잡이', communicate:'통역가', collaborate:'팀장', responsible:'안전요원'},
  words:{branchBtn:'🧳 여행 스타일 고르기', branchTitle:'어떤 여행자가 될까요?'},
  base:{title:'🌏 우리 반 세계 일주', levels:['🛫 출국장','🗺️ 한 대륙','🌍 세 대륙','🏆 세계 일주']},
  draw:drawPassport });

/* 개별 생성 이미지: 공통 3장 + 갈래별 성장 24장. 원본은 outputs/all-pack-images에 보관. */
function worldPackImageDraw(p){
  return function(st,b){
    st=st|0; if(st<0)st=0; if(st>6)st=6;
    var ids=["inquiry","analysis","concept","communicate","collaborate","responsible"], i=ids.indexOf(b && b.id);
    if(i<0)i=0;
    var file="s"+st+(st<3?"":"-"+ids[i]);
    var alt=(st<3?p.name:p.species[ids[i]])+" · "+p.stages[st];
    var scales=[0.60,0.65,0.70,0.76,0.84,0.92,1];
    return '<img class="charimg" src="images/world-packs-v1/'+p.id+'/'+file+'.webp" alt="'+alt.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")+'" width="640" height="640" loading="lazy" decoding="async" style="aspect-ratio:1/1;object-fit:contain;transform:scale('+scales[st]+');transform-origin:50% 90%">';
  };
}
packById("scientist").draw=worldPackImageDraw(packById("scientist"));
packById("lab").draw=worldPackImageDraw(packById("lab"));
packById("robot").draw=worldPackImageDraw(packById("robot"));
packById("village").draw=worldPackImageDraw(packById("village"));
packById("garden").draw=worldPackImageDraw(packById("garden"));
packById("passport").draw=worldPackImageDraw(packById("passport"));
(function(){var p={"id":"ocean","name":"수족관","emoji":"🐠","tagline":"작은 알에서 풍성한 바다로","subject":"공통","stages":["알","치어","어린 개체","성체","무리","산호초","바다의 전설"],"species":{"inquiry":"해마","analysis":"문어","concept":"바다거북","communicate":"돌고래","collaborate":"상어","responsible":"흰동가리"},"words":{"branchBtn":"캐릭터 고르기","branchTitle":"어떤 모습으로 자랄까요?"},"base":{"title":"🐠 우리 반 어항","levels":["빈 어항","수초","산호초","바다"]}};p.draw=worldPackImageDraw(p);registerPack(p);}());
(function(){var p={"id":"space","name":"우주 탐사","emoji":"🚀","tagline":"작은 비행기에서 화성 기지까지","subject":"공통","stages":["종이비행기","물로켓","모형로켓","인공위성","탐사선","달 기지","화성 기지"],"species":{"inquiry":"지구관측선","analysis":"달 탐사선","concept":"화성 로버","communicate":"소행성 탐사선","collaborate":"목성 탐사선","responsible":"심우주선"},"words":{"branchBtn":"캐릭터 고르기","branchTitle":"어떤 모습으로 자랄까요?"},"base":{"title":"🚀 우리 반 발사대","levels":["발사대","궤도","달","화성"]}};p.draw=worldPackImageDraw(p);registerPack(p);}());
(function(){var p={"id":"bakery","name":"빵집","emoji":"🍞","tagline":"반죽이 자라 나만의 빵집으로","subject":"공통","stages":["밀가루","반죽","발효","굽기","빵","진열","빵집 개업"],"species":{"inquiry":"식빵","analysis":"크루아상","concept":"바게트","communicate":"도넛","collaborate":"케이크","responsible":"프레첼"},"words":{"branchBtn":"캐릭터 고르기","branchTitle":"어떤 모습으로 자랄까요?"},"base":{"title":"🍞 우리 반 빵집","levels":["반죽통","오븐","진열대","빵집"]}};p.draw=worldPackImageDraw(p);registerPack(p);}());
(function(){var p={"id":"orchestra","name":"오케스트라","emoji":"🎼","tagline":"첫 소리가 멋진 공연으로","subject":"공통","stages":["소리","음","리듬","선율","화음","합주","공연"],"species":{"inquiry":"바이올린","analysis":"플루트","concept":"트럼펫","communicate":"북","collaborate":"피아노","responsible":"성악"},"words":{"branchBtn":"캐릭터 고르기","branchTitle":"어떤 모습으로 자랄까요?"},"base":{"title":"🎼 우리 반 무대","levels":["연습실","소극장","공연장","콘서트홀"]}};p.draw=worldPackImageDraw(p);registerPack(p);}());
(function(){var p={"id":"puzzle","name":"명화 퍼즐","emoji":"🧩","tagline":"조각을 모아 한 폭의 그림으로","subject":"공통","stages":["조각 0","조각 3","조각 6","조각 9","조각 12","조각 16","조각 20 · 완성"],"species":{"inquiry":"별이 빛나는 밤","analysis":"해바라기","concept":"진주 귀걸이","communicate":"모나리자","collaborate":"파도","responsible":"절규"},"words":{"branchBtn":"캐릭터 고르기","branchTitle":"어떤 모습으로 자랄까요?"},"base":{"title":"🧩 우리 반 미술관","levels":["벽","액자","전시실","미술관"]}};p.draw=worldPackImageDraw(p);registerPack(p);}());
(function(){var p={"id":"crystal","name":"결정 키우기","emoji":"🧊","tagline":"작은 결정이 빛나는 표본으로","subject":"과학","stages":["용액","핵","작은 결정","결정","결정 무리","표본 전시","표본"],"species":{"inquiry":"소금","analysis":"명반","concept":"눈결정","communicate":"수정","collaborate":"황철석","responsible":"자수정"},"words":{"branchBtn":"캐릭터 고르기","branchTitle":"어떤 모습으로 자랄까요?"},"base":{"title":"🧊 우리 반 표본실","levels":["비커","선반","진열장","광물 박물관"]}};p.draw=worldPackImageDraw(p);registerPack(p);}());
