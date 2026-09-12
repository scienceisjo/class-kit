# 🧰 우리 반 도구 꾸러미 (class-kit)

질문나무(학생 앱 + 교사 대시보드) · 칭찬도장판 · 진도 트래커를 **선생님 각자의 Supabase(무료)** 에 붙여 쓰는 배포판입니다.
학생 데이터는 선생님 학교 프로젝트에만 남습니다. 설치 프로그램은 없고, 전부 브라우저에서 합니다.

**📘 설치 가이드 → [setup/guide.html](setup/guide.html)** (GitHub Pages 에 올린 뒤 `…/setup/guide.html` 로 열어도 됩니다)

## 무엇이 들어 있나

| 폴더 | 앱 | 누가 |
|---|---|---|
| `question-tree/index.html` | 🌳 질문 과수원 — 질문 심기·다듬기·스스로 해결하기, 질문이 쌓이면 나무가 자람 | 학생 |
| `question-tree/teacher.html` | 🧑‍🏫 교사 대시보드 — 반별 질문, 되묻기, 대표 질문, 지금 차시, 리포트, ⚙️ 관리 | 교사 |
| `stamp-board/` | 🏅 칭찬도장판 — 캐릭터가 자라는 도장판, 속은 «관찰된 행동» 기록부(세특 근거) | 학생·교사 |
| `progress/` | 📊 진도 트래커 — 반 × 차시 체크표, 여러 기기 동기화 | 교사 |
| `setup/01_설치.sql` | Supabase 에 한 번 실행 (표·함수·보안규칙 전부) | 설치 때 |
| `setup/02_관리_레시피.sql` | 초기화·백업·비밀번호 등 필요할 때 조각만 실행 | 관리 때 |
| `config.js` | **고치는 파일은 이것 하나** — 학교 이름·Supabase 키·앱 이름·색·역량·보상·과목·진도표 | 설치 때 |

## 설치 요약 (처음 한 번, 40~60분)

1. **Supabase** 프로젝트 만들기 → Authentication → Email → *Confirm email* 끄기 → API 의 URL·publishable 키 복사
2. `setup/01_설치.sql` 맨 위 **교사 초대코드** 바꾸기 → SQL Editor 에 전체 붙여넣고 Run → 결과표 전부 ✅
3. 이 저장소를 **Use this template**(또는 Fork) → Settings → Pages → main / root
4. `config.js` 에 학교 이름·URL·키 넣기 (가이드 4단계의 **설정 생성기**가 만들어 줍니다)
5. 교사 대시보드에서 **회원가입**(초대코드) → 학생은 학생 앱에서 **학년·반·번호·이름·비밀번호**로 스스로 가입

꾸러미 홈(`index.html`)이 설치 상태를 자동으로 점검해 줍니다.

## 커스터마이징

전부 `config.js` 입니다. 학교 이름·로고·색, 앱 이름, 칭찬도장판 역량 6종의 이름·아이콘·행동 칩·보상 목록, 질문나무 과목 목록·AI 프롬프트 학년 표현, 진도 트래커 기본 반·차시 뱅크. 자세한 설명은 파일 안 주석과 가이드 7단계.

## 원본과의 관계 (개발자 메모)

이 폴더는 승재쌤 배포본(질문나무 `index.html`·`teacher-dashboard.html`·`stamp-board/`)에서 `_build/build.py` 로 찍어낸 산출물입니다.
원본은 `window.CLASS_KIT_CONFIG` 가 있으면 그 값을, 없으면 우리 학교 기본값을 쓰도록 되어 있고, 빌드는 ① `config.js` 로더와 «설정 없음» 안내를 끼우고 ② 우리 학교 기본값(Supabase 주소·키·도메인·학교명)을 비우고 ③ 잔재 0건·문법 검사를 합니다.
**원본을 고치면 `python class-kit/_build/build.py` 로 다시 찍으면 됩니다.** `progress/index.html` 은 `scienceclass/index.html` 의 진도 트래커 부분에서 별도 스크립트로 떼어낸 독립 파일입니다.

## 라이선스

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ko) — © 2026 조승재(과학이조선생), 해누리중학교.
비영리 교육 목적이라면 자유롭게 쓰고 고쳐 나누세요. 푸터의 이름은 `config.js` 의 `credits` 에서 선생님 것으로 바꿔도 괜찮습니다. 고쳐서 나눌 때는 같은 조건(CC BY-NC-SA)으로.
