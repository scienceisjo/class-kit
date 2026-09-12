-- ═══════════════════════════════════════════════════════════════════════════
--  🧰 우리 반 도구 꾸러미 — 관리 레시피 (필요한 조각만 골라 실행하세요)
--
--  실행하는 곳: Supabase → SQL Editor → New query → 조각 하나를 붙여넣고 Run
--  ⚠️ 이 파일을 «통째로» Run 하지 마세요. 지우는 조각이 들어 있습니다.
--     조각마다 «-- ▶ 여기부터 / -- ◀ 여기까지» 표시가 있습니다.
--  ⚠️ 삭제 조각은 먼저 «① 현황 보기»로 숫자를 확인한 뒤 실행하세요. 되돌릴 수 없습니다.
--
--  학생 로그인 아이디 형식 = s{학년}_{반}_{번호}@{studentEmailDomain}
--  (config.js 의 studentEmailDomain, 기본 student.school)
-- ═══════════════════════════════════════════════════════════════════════════


-- ▶ ① 현황 보기 — 학년·반별 학생 수 / 질문 / 도장, 교사 목록 ────────────────
select p.grade as 학년, p.class_no as 반, count(*) as 학생수,
       coalesce(sum((select count(*) from public.questions q where q.user_id = p.id)), 0)    as 질문수,
       coalesce(sum((select count(*) from public.observations o where o.student_id = p.id
                                                                 and o.voided_at is null)), 0) as 도장수
  from public.profiles p
 where not exists (select 1 from public.teachers t where t.auth_id = p.id)
 group by p.grade, p.class_no
 order by p.grade, p.class_no;

select t.id, t.name as 교사, t.subject_label as 과목, t.grade as 담당학년, u.email, t.created_at
  from public.teachers t join auth.users u on u.id = t.auth_id
 order by t.id;
-- ◀ ①


-- ▶ ② 교사 초대코드 보기 / 바꾸기 ─────────────────────────────────────────
--    (교사 대시보드 ⚙️ 관리 에서도 됩니다)
select value as 현재_초대코드 from public.kit_settings where key = 'teacher_invite_code';

-- 바꾸려면 아래 따옴표 안을 고쳐서 실행
update public.kit_settings set value = '새-초대코드', updated_at = now()
 where key = 'teacher_invite_code';
-- ◀ ②


-- ▶ ③ 하루 질문 상한 보기 / 바꾸기 ────────────────────────────────────────
--    new_per_day = 하루 새 질문 수, seeds_per_day = 도토리 하루 상한, per_unit = 한 차시당
select * from public.app_limits where id = 1;

update public.app_limits set new_per_day = 8, seeds_per_day = 8, per_unit = 3 where id = 1;
-- ◀ ③


-- ▶ ④ 학생 한 명 비밀번호 초기화 ─────────────────────────────────────────
--    (교사 대시보드 학생 목록의 🔑 단추가 같은 일을 합니다)
--    아래 학년_반_번호 와 도메인, 새 비밀번호를 고쳐서 실행
update auth.users
   set encrypted_password = extensions.crypt('1234', extensions.gen_salt('bf')),
       updated_at = now()
 where email = 's2_3_15@student.school';
-- ◀ ④


-- ▶ ⑤ 학생 한 명 삭제 (질문·나무·도장·쿠폰이 모두 함께 지워집니다) ────────
delete from auth.users u
 where u.email = 's2_3_15@student.school'
   and not exists (select 1 from public.teachers t where t.auth_id = u.id);
-- ◀ ⑤


-- ▶ ⑥ 한 학년 학생 전부 삭제 — 학년 말 정리·졸업 처리 ─────────────────────
--    학년 숫자(아래 3 두 곳)를 고쳐서 실행. 교사 계정은 건드리지 않습니다.
--    ※ 진급은 «삭제 후 새 학년에 재가입»이 가장 깔끔합니다. 아이디에 학년·반·번호가
--      들어 있어서, 반이 바뀌면 어차피 새 아이디가 필요하기 때문입니다.
--      기록을 남기고 싶으면 먼저 ⑧ 백업으로 CSV 를 내려받으세요.
-- 삭제 전 개수
select count(*) as 삭제될_학생수
  from auth.users u
 where exists (select 1 from public.profiles p where p.id = u.id and p.grade = 3)
   and not exists (select 1 from public.teachers t where t.auth_id = u.id);

-- 삭제 실행
delete from auth.users u
 where exists (select 1 from public.profiles p where p.id = u.id and p.grade = 3)
   and not exists (select 1 from public.teachers t where t.auth_id = u.id);
-- ◀ ⑥


-- ▶ ⑦ 학생 전부 삭제 — 새 학년도 시작 전 완전 초기화 (교사 계정은 남김) ───
select count(*) as 삭제될_학생수
  from auth.users u
 where not exists (select 1 from public.teachers t where t.auth_id = u.id);

delete from auth.users u
 where not exists (select 1 from public.teachers t where t.auth_id = u.id);
-- ◀ ⑦


-- ▶ ⑧ 백업 — 결과표 오른쪽 위 «Download CSV» 로 내려받기 ───────────────────
--    (Supabase SQL Editor 는 한 번에 최대 1000행쯤 보여 줍니다. 학년·반으로 나눠 받으세요)
-- 질문 전체
select p.grade as 학년, p.class_no as 반, p.number as 번호, p.name as 이름,
       q.text as 질문, q.refined_text as 다듬은질문, q.unit as 차시, q.teacher_nudge as 되묻기,
       q.finding as 알게된것, q.still_wondering as 아직궁금한것, q.is_picked as 대표질문,
       q.teacher_labels as 교사라벨, q.created_at as 작성일
  from public.questions q join public.profiles p on p.id = q.user_id
 where p.grade = 2                       -- 학년을 고치세요
 order by p.class_no, p.number, q.created_at;

-- 도장(관찰 기록) 전체 — behavior 가 세특 근거 문장입니다
select o.school_year as 학년도, o.semester as 학기, p.grade as 학년, o.class_no_snap as 반,
       o.number_snap as 번호, p.name as 이름, o.category as 역량, o.behavior as 관찰행동,
       o.lesson_note as 차시, o.observed_on as 관찰일, o.voided_at as 회수일
  from public.observations o join public.profiles p on p.id = o.student_id
 where o.school_year = 2026             -- 학년도를 고치세요
 order by o.class_no_snap, o.number_snap, o.observed_on;
-- ◀ ⑧


-- ▶ ⑨ 교사 한 명 삭제 (전근 등) — 그 교사가 찍은 도장·자료는 남습니다 ────
--    ① 현황 보기에서 id 를 확인한 뒤 숫자를 고쳐서 실행
delete from public.teachers where id = 99;
-- 로그인 계정까지 지우려면 (이메일을 고쳐서)
delete from auth.users where email = 'teacher@school.ac.kr'
   and not exists (select 1 from public.teachers t where t.auth_id = auth.users.id);
-- ◀ ⑨


-- ▶ ⑩ 설치 상태 다시 점검 ─────────────────────────────────────────────────
--    01_설치.sql 맨 아래 «확인» 조각을 그대로 다시 실행하면 됩니다.
--    ❌ 가 있으면 01_설치.sql 전체를 다시 Run 하세요 (여러 번 실행해도 안전).
-- ◀ ⑩
