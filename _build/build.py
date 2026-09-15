# -*- coding: utf-8 -*-
"""
🧰 class-kit 빌드 — 원본 앱(승재쌤 배포본)에서 배포판을 찍어낸다.

  원본(source of truth)                      →  배포판(class-kit/)
  ─────────────────────────────────────────────────────────────────
  질문나무/index.html                        →  question-tree/index.html
  질문나무/teacher-dashboard.html            →  question-tree/teacher.html
  질문나무/assets/(참조 파일만)              →  question-tree/assets/
  질문나무/stamp-board/index.html            →  stamp-board/index.html
  질문나무/stamp-board/{audio,images}/       →  stamp-board/{audio,images}/
  (진도 트래커는 scratchpad/build_progress.py 가 별도로 만든다 — progress/index.html)

  하는 일
  ① <head> 에 ../config.js 와 «설정 없음» 안내 오버레이 스크립트를 끼운다
  ② 원본에 남아 있는 우리 학교 기본값(Supabase 주소·키·이메일 도메인·학교명)을 빈 값/일반값으로 바꾼다
     → 다른 학교가 config.js 를 빼먹어도 우리 DB 에 절대 붙지 않게
  ③ 잔재(우리 프로젝트 ref·키·학교명·배포 URL)가 0건인지 검사하고, 인라인 스크립트 문법을 node 로 검사한다

  실행:  python class-kit/_build/build.py
"""
import pathlib, re, shutil, subprocess, sys, json

ROOT = pathlib.Path(__file__).resolve().parents[2]          # …/dev/apps (Desktop)
KIT  = ROOT / "class-kit"

OUR_URL    = "https://hmzklbrksfdhzsgwzfyg.supabase.co"
OUR_KEY    = "sb_publishable_OFVhbjVPbJiMWXVz2nKQuw_m6RmVVZE"
OUR_DOMAIN = "haenuri.app"

INJECT = """<script src="../config.js"></script>
<script>
/* 🧰 class-kit: config.js 가 없거나 Supabase 값이 비어 있으면 앱 대신 안내를 띄운다 */
(function(){
  var c = window.CLASS_KIT_CONFIG, sb = c && c.supabase || {};
  var bad = !c ? 'config.js 를 찾지 못했어요.' : (!sb.url || !sb.key || /xxxx/.test(sb.url + sb.key)) ? 'config.js 의 supabase.url / key 가 아직 비어 있어요.' : '';
  if(!bad) return;
  document.addEventListener('DOMContentLoaded', function(){
    var d = document.createElement('div');
    d.setAttribute('style', 'position:fixed;inset:0;z-index:2147483647;background:#fffdf7;color:#2a2a2a;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,"Malgun Gothic",sans-serif;line-height:1.7');
    d.innerHTML = '<div style="max-width:560px;background:#fff;border:1.5px solid #e6dfcf;border-radius:16px;padding:28px 30px;box-shadow:0 8px 30px rgba(0,0,0,.08)">'
      + '<div style="font-size:1.4rem;font-weight:800;margin-bottom:8px">🧰 아직 설정이 없어요</div>'
      + '<p style="margin:0 0 10px"><b>' + bad + '</b></p>'
      + '<p style="margin:0 0 14px;color:#555">꾸러미 폴더 맨 위의 <code>config.js</code> 를 열어 학교 이름과 Supabase 주소·키를 넣으면 이 화면이 사라지고 앱이 열립니다. 학생에게 주소를 알려주기 전에 먼저 해 주세요.</p>'
      + '<a href="../setup/guide.html" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#1E5C2D;color:#fff;text-decoration:none;font-weight:700">📘 설치 가이드 열기</a>'
      + ' <a href="../" style="display:inline-block;padding:10px 16px;border-radius:10px;border:1.5px solid #ccc;color:#333;text-decoration:none;margin-left:6px">🏠 꾸러미 홈</a>'
      + '</div>';
    document.body.appendChild(d);
  });
})();
</script>"""

def read(p):  return pathlib.Path(p).read_text(encoding="utf-8")
def write(p, s):
    pathlib.Path(p).parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(p).write_text(s, encoding="utf-8", newline="\n")

def must(s, old, new, cnt=1, label=""):
    n = s.count(old)
    if n != cnt:
        raise SystemExit(f"❌ {label}: '{old[:70]}' 일치 {n}회 (기대 {cnt})")
    return s.replace(old, new)

def inject_head(s, label):
    # <meta charset> 바로 뒤에 config.js + 안내 스크립트
    m = re.search(r'<meta charset="?UTF-8"?\s*/?>', s, re.I)
    if not m: raise SystemExit(f"❌ {label}: <meta charset> 을 못 찾음")
    return s[:m.end()] + "\n" + INJECT + s[m.end():]

def neutralize(s, label):
    """우리 학교 기본값 → 빈 값/일반값 (config.js 가 채운다)"""
    s = s.replace("\r\n", "\n")
    s = s.replace(f"'{OUR_URL}'", "''")
    s = s.replace(f"'{OUR_KEY}'", "''")
    s = s.replace(f"'{OUR_DOMAIN}'", "'student.school'")
    s = s.replace("teacher@haenuri.app", "teacher@school.ac.kr")
    s = s.replace("'해누리중학교'", "'우리 학교'")
    s = s.replace("해누리 질문 과수원", "질문 과수원")
    s = s.replace("해누리중학교 로고", "학교 로고").replace('alt="해누리"', 'alt="로고"').replace("해누리중학교", "우리 학교")
    s = s.replace("해누리 학급 리포트", "학급 리포트")
    s = s.replace("haenuri-logo", "school-logo").replace("/* 해누리 로고 */", "/* 학교 로고 */")
    s = s.replace("<h1>Haenuri Teacher</h1>", "<h1>Teacher Dashboard</h1>").replace("Haenuri Orchard", "Question Orchard")
    s = s.replace("a.download=`haenuri_${type}_${today()}.csv`", "a.download=`${SCHOOL_SHORT}_${type}_${today()}.csv`")
    s = s.replace("@haenuri.app 가짜 이메일", "@(학생 도메인) 가짜 이메일")
    # 승재쌤 배포 URL(og 태그) 제거
    s = re.sub(r'<meta property="og:(image|url)" content="https://scienceisjo\.github\.io/[^"]*">\n?', "", s)
    # 정적 푸터 → 원작 표기 + 라이선스 (config.js 가 있으면 kitFooter 가 덮어쓴다)
    s = s.replace("© 2026 조승재(과학이조선생) · 우리 학교 · All rights reserved",
                  '원작 © 2026 조승재(과학이조선생) · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ko" target="_blank" rel="noopener" style="color:inherit">CC BY-NC-SA 4.0</a>')
    return s

def check_residue(s, label):
    bad = []
    for pat in ["hmzklbrksfdhzsgwzfyg", "sb_publishable_OFV", "haenuri", "Haenuri", "해누리", "scienceisjo.github.io"]:
        for m in re.finditer(pat, s):
            line = s.count("\n", 0, m.start()) + 1
            bad.append(f"{pat} @{line}")
    if bad:
        raise SystemExit(f"❌ {label} 잔재: " + ", ".join(bad[:12]))

def jscheck(paths):
    js = r"""
const fs=require('fs'), vm=require('vm'); let bad=0;
for(const f of process.argv.slice(2)){
  const html=fs.readFileSync(f,'utf8'); let n=0;
  const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi; let m;
  while((m=re.exec(html))){ n++; try{ new vm.Script(m[1], {filename:f+'#'+n}); }catch(e){ bad++; console.log('❌', f, '#'+n, e.message); } }
  console.log(bad?'❌':'✅', f.split(/[\\/]/).slice(-2).join('/'), n+' scripts');
}
process.exit(bad?1:0);
"""
    tmp = KIT / "_build" / "_jscheck.js"; write(tmp, js)
    r = subprocess.run(["node", str(tmp)] + [str(p) for p in paths], capture_output=True, text=True, encoding="utf-8")
    print(r.stdout.strip()); tmp.unlink(missing_ok=True)
    if r.returncode != 0: raise SystemExit("❌ 문법 오류")

def clear_dir(d):
    """OneDrive 가 폴더를 잠그는 일이 있어 폴더는 두고 안의 파일만 비운다 (하위 폴더까지)"""
    d = pathlib.Path(d); d.mkdir(parents=True, exist_ok=True)
    for p in d.rglob("*"):
        if p.is_file(): p.unlink()

def copy_tree(src, dst, exts=None):
    """하위 폴더째 복사 — 세계관 팩 그림은 images/world-packs-v1/<팩>/ 처럼 두 단계 아래에 있다"""
    src, dst = pathlib.Path(src), pathlib.Path(dst)
    clear_dir(dst)
    n = 0
    for p in src.rglob("*"):
        if p.is_file() and (exts is None or p.suffix.lower() in exts):
            out = dst / p.relative_to(src)
            out.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, out); n += 1
    return n

def main():
    outs = []
    # ── 1) 질문나무 학생 앱 ──────────────────────────────────────────────────
    s = read(ROOT / "index.html")
    s = neutralize(s, "index.html"); s = inject_head(s, "index.html"); check_residue(s, "question-tree/index.html")
    write(KIT / "question-tree/index.html", s); outs.append(KIT / "question-tree/index.html")
    # ── 2) 교사 대시보드 ─────────────────────────────────────────────────────
    s = read(ROOT / "teacher-dashboard.html")
    s = neutralize(s, "teacher-dashboard.html"); s = inject_head(s, "teacher-dashboard.html"); check_residue(s, "question-tree/teacher.html")
    write(KIT / "question-tree/teacher.html", s); outs.append(KIT / "question-tree/teacher.html")
    # ── 3) assets (두 HTML 이 실제로 참조하는 파일만) ────────────────────────
    used = set(re.findall(r'assets/([A-Za-z0-9_\-.]+)', read(ROOT/"index.html") + read(ROOT/"teacher-dashboard.html")))
    adst = KIT / "question-tree/assets"
    clear_dir(adst)
    miss = []
    for f in sorted(used):
        src = ROOT / "assets" / f
        if src.exists(): shutil.copy2(src, adst / f)
        else: miss.append(f)
    print(f"assets: {len(used)-len(miss)}개 복사" + (f", 없음: {miss}" if miss else ""))
    # ── 4) 칭찬도장판 ────────────────────────────────────────────────────────
    s = read(ROOT / "stamp-board/index.html")
    s = neutralize(s, "stamp-board/index.html"); s = inject_head(s, "stamp-board/index.html"); check_residue(s, "stamp-board/index.html")
    write(KIT / "stamp-board/index.html", s); outs.append(KIT / "stamp-board/index.html")
    for extra in ["packs.js", "packs-preview.html"]:
        src = ROOT / "stamp-board" / extra
        txt = neutralize(read(src), extra); check_residue(txt, "stamp-board/" + extra)
        write(KIT / "stamp-board" / extra, txt)
    na = copy_tree(ROOT / "stamp-board/audio",  KIT / "stamp-board/audio",  {".mp3", ".ogg", ".wav"})
    ni = copy_tree(ROOT / "stamp-board/images", KIT / "stamp-board/images", {".png", ".webp", ".jpg", ".svg"})
    print(f"stamp-board: audio {na}개, images {ni}개")
    # ── 5) 진도 트래커·허브·가이드는 이미 kit 안에 있음 — 문법만 같이 검사 ───
    for extra in ["progress/index.html", "index.html", "setup/guide.html"]:
        p = KIT / extra
        if p.exists(): outs.append(p)
    jscheck(outs)
    # ── 6) 크기 보고 ─────────────────────────────────────────────────────────
    total = sum(p.stat().st_size for p in KIT.rglob("*") if p.is_file() and ".git" not in p.parts)
    print(f"✅ 빌드 완료 — class-kit 총 {total/1024/1024:.1f} MB")

if __name__ == "__main__":
    main()
