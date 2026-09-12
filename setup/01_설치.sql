-- ═══════════════════════════════════════════════════════════════════════════
--  🧰 우리 반 도구 꾸러미(class-kit) — 설치 SQL (이 파일 하나면 됩니다)
--
--  질문나무(학생앱+교사 대시보드) · 칭찬도장판 · 진도 트래커가 쓰는
--  표·함수·보안규칙(RLS)을 빈 Supabase 프로젝트에 한 번에 만듭니다.
--  여러 번 돌려도 안전합니다(전부 if not exists / or replace / drop if exists).
--
--  ┌ 설치 순서 ────────────────────────────────────────────────────┐
--  │ 1. supabase.com 가입 → New project (Region: Northeast Asia)     │
--  │ 2. Authentication → Sign In / Providers → Email →               │
--  │    «Confirm email» 끄기 (학생은 가짜 이메일로 가입합니다)        │
--  │ 3. 아래 ▶ 초대코드 한 줄을 원하는 말로 바꾸기                    │
--  │ 4. SQL Editor → New query → 이 파일 전체 붙여넣고 Run           │
--  │ 5. 맨 아래 결과표가 전부 ✅ 인지 확인                           │
--  │ 6. Project Settings → API 의 URL·publishable key 를 config.js 에 │
--  └───────────────────────────────────────────────────────────────┘
--
--  ※ Edge Function·CLI 설치가 필요 없습니다. 교사 등록은 아래 초대코드로,
--     학생은 앱에서 스스로 가입합니다(학년·반·번호·이름·비밀번호).
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
--  PART 0 — 꾸러미 설정표 · ▶ 교사 초대코드
--    선생님이 교사 대시보드에서 «교사 등록» 할 때 입력하는 암호입니다.
--    설치 뒤에도 대시보드 ⚙️ 관리 탭에서 언제든 바꿀 수 있습니다.
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.kit_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);
alter table public.kit_settings enable row level security;

-- ▶▶▶ 여기 따옴표 안을 우리 학교만의 초대코드로 바꾸세요 ◀◀◀
insert into public.kit_settings (key, value) values ('teacher_invite_code', '우리학교-교사-2026')
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.kit_settings (key, value) values ('installed_version', '2026.09')
on conflict (key) do update set value = excluded.value, updated_at = now();

create extension if not exists pgcrypto with schema extensions;


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 1 — 표
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 사람 ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  name             text,
  grade            integer,
  class_no         integer,
  number           integer,
  seeds            integer default 0,
  unlocked_items   text[]  default array['default'::text],
  active_tree      text    default 'default',
  active_companion text,
  streak_days      integer default 0,
  last_active      date,
  waters_given     integer default 0,
  active_sub       text,
  fruit_emoji      text    default '🍎',
  season           text    default 'spring',
  teacher_id       bigint,
  created_at       timestamptz default now(),
  login_count      integer default 0,
  last_login       timestamptz,
  teacher_ids      bigint[] default '{}'::bigint[]
);

create table if not exists public.teachers (
  id            bigint generated always as identity primary key,
  auth_id       uuid not null unique,
  name          text not null,
  subject_id    text not null,
  subject_label text,
  subject_icon  text default '📚',
  grade         integer,
  created_at    timestamptz default now(),
  join_code     text
);

-- ── 나무와 질문 ───────────────────────────────────────────────────────────
create table if not exists public.subjects (
  id         text primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  label      text not null,
  icon       text,
  color      text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.trees (
  id         bigint generated always as identity primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  subject_id text not null,
  name       text not null,
  icon       text default '🌳',
  sort_order integer default 1,
  created_at timestamptz default now()
);

create table if not exists public.lesson_materials (
  id            bigint generated always as identity primary key,
  teacher_id    bigint not null references public.teachers(id) on delete cascade,
  teacher_name  text not null,
  subject_id    text,
  subject_label text,
  title         text not null,
  description   text,
  files         jsonb,
  target_grade  integer,
  target_class  integer,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  unit          text,
  video_url     text,
  due_date      date,
  is_homework   boolean not null default false,
  body_text     text,
  source_note   text,
  yt_start      integer,
  yt_end        integer
);

-- ★ 어떤 옛 SQL 에도 없던 표 — 라이브 질문 세션
create table if not exists public.live_sessions (
  id            bigint generated always as identity primary key,
  teacher_id    bigint not null references public.teachers(id) on delete cascade,
  teacher_name  text,
  subject_id    text,
  subject_label text,
  prompt        text not null,
  target_grade  integer,
  target_class  integer,
  status        text default 'open',
  created_at    timestamptz default now(),
  closed_at     timestamptz,
  material_id   bigint references public.lesson_materials(id) on delete set null
);

create table if not exists public.questions (
  id              bigint generated always as identity primary key,
  user_id         uuid references public.profiles(id) on delete cascade,
  subject_id      text,
  text            text not null,
  resolved        boolean default false,
  question_date   date default current_date,
  tags            text[] default array[]::text[],
  fruit_emoji     text,
  is_anonymous    boolean default false,
  water_count     integer default 0,
  watered_by      uuid[] default array[]::uuid[],
  branch_count    integer default 0,
  fruit_x         numeric,
  fruit_y         numeric,
  tree_id         bigint references public.trees(id) on delete cascade,
  starred         boolean default false,
  answer_text     text,
  answer_files    jsonb,
  hint            text,
  material_id     bigint references public.lesson_materials(id) on delete set null,
  phase           text default 'before',
  parent_id       bigint references public.questions(id) on delete set null,
  self_check      jsonb,
  created_at      timestamptz default now(),
  finding         text,          -- ★ 없던 것
  still_wondering text,          -- ★ 없던 것
  teacher_nudge   text,          -- ★ 없던 것
  unit            text,          -- ★ 없던 것
  explore_votes   integer default 0,          -- ★ 없던 것
  explore_voters  uuid[] default '{}'::uuid[],-- ★ 없던 것
  session_id      bigint,
  answer_source   text,
  teacher_stamp   text
);

create table if not exists public.branches (
  id          bigint generated always as identity primary key,
  question_id bigint references public.questions(id) on delete cascade,
  author_id   uuid   references public.profiles(id) on delete cascade,
  author_name text,
  text        text not null,
  answer      text,
  created_at  timestamptz default now()
);

create table if not exists public.peer_answers (
  id          bigint generated always as identity primary key,
  question_id bigint not null references public.questions(id) on delete cascade,
  user_id     uuid   not null references auth.users(id) on delete cascade,
  author_name text not null,
  text        text not null,
  created_at  timestamptz default now()
);

create table if not exists public.tree_state (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  stickers   jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.student_notes (
  id             bigint generated always as identity primary key,
  student_id     uuid   not null references public.profiles(id) on delete cascade,
  author_id      bigint not null references public.teachers(id) on delete cascade,
  author_name    text not null,
  author_subject text,
  text           text not null,
  created_at     timestamptz default now()
);

-- ── 하루 제한 ─────────────────────────────────────────────────────────────
create table if not exists public.app_limits (
  id            integer primary key default 1,
  new_per_day   integer not null default 8,   -- 하루 총량
  seeds_per_day integer not null default 8,   -- 도토리 하루 상한
  per_unit      integer not null default 3,   -- 한 차시당
  constraint app_limits_single check (id = 1)
);
-- 이미 있는 프로젝트에 나중에 돌려도 되게
alter table public.app_limits add column if not exists per_unit integer not null default 3;

create table if not exists public.daily_counts (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  kst_day       date not null,
  planted       integer not null default 0,
  planted_after integer not null default 0,
  grown         integer not null default 0,
  seeds         integer not null default 0,
  primary key (user_id, kst_day)
);

create table if not exists public.site_stats (
  key   text primary key,
  count bigint default 0
);

-- ── 칭찬 도장판 (교사 대시보드가 함께 씁니다) ─────────────────────────────
create table if not exists public.lesson_plans (
  id         bigint generated always as identity primary key,
  teacher_id uuid not null default auth.uid(),
  title      text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_sessions (
  id           bigint generated always as identity primary key,
  teacher_id   uuid not null default auth.uid(),
  school_year  integer not null,
  semester     integer not null,
  class_no     integer not null,
  lesson_note  text not null,
  session_date date not null default current_date,
  created_at   timestamptz not null default now()
);

create table if not exists public.observations (
  id            bigint generated always as identity primary key,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  school_year   integer not null,
  semester      integer not null,
  class_no_snap integer,
  number_snap   integer,
  category      text not null,
  behavior      text not null,
  lesson_note   text,
  observed_on   date not null default current_date,
  source        text not null default 'teacher',
  status        text not null default 'approved',
  given_by      uuid not null default auth.uid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  voided_at     timestamptz,
  void_reason   text
);

create table if not exists public.stamp_profiles (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  theme      text not null default 'creature',
  branch     text,
  nickname   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stamp_rewards (
  id          bigint generated always as identity primary key,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  reward_code text not null,
  reward_name text not null,
  cost        integer not null,
  status      text not null default 'issued',
  issued_at   timestamptz not null default now(),
  expires_on  date not null default (current_date + 7),
  done_at     timestamptz,
  done_by     uuid
);


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 2 — 값 검사(CHECK) · 인덱스
-- ═══════════════════════════════════════════════════════════════════════════
do $$
begin
  if not exists (select 1 from pg_constraint where conname='questions_phase_check') then
    alter table public.questions add constraint questions_phase_check
      check (phase = any (array['before','after']));
  end if;
  if not exists (select 1 from pg_constraint where conname='questions_teacher_stamp_chk') then
    alter table public.questions add constraint questions_teacher_stamp_chk
      check (teacher_stamp is null or teacher_stamp = any
             (array['observe','testable','unknown','connect','onemore','pick']));
  end if;
  if not exists (select 1 from pg_constraint where conname='questions_text_len_chk') then
    alter table public.questions add constraint questions_text_len_chk
      check (char_length(text) >= 1 and char_length(text) <= 500) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='live_sessions_status_check') then
    alter table public.live_sessions add constraint live_sessions_status_check
      check (status = any (array['open','closed']));
  end if;
  if not exists (select 1 from pg_constraint where conname='lesson_materials_title_check') then
    alter table public.lesson_materials add constraint lesson_materials_title_check
      check (length(title) >= 1 and length(title) <= 120);
    alter table public.lesson_materials add constraint lesson_materials_description_check
      check (description is null or length(description) <= 1000);
    alter table public.lesson_materials add constraint lesson_materials_body_len
      check (body_text is null or length(body_text) <= 20000);
    alter table public.lesson_materials add constraint lesson_materials_yt_range
      check ((yt_start is null or yt_start >= 0) and (yt_end is null or yt_end >= 0)
             and (yt_start is null or yt_end is null or yt_end > yt_start));
  end if;
  if not exists (select 1 from pg_constraint where conname='peer_answers_text_check') then
    alter table public.peer_answers add constraint peer_answers_text_check
      check (length(text) >= 1 and length(text) <= 500);
  end if;
  if not exists (select 1 from pg_constraint where conname='student_notes_text_check') then
    alter table public.student_notes add constraint student_notes_text_check
      check (length(text) >= 1 and length(text) <= 500);
  end if;
  if not exists (select 1 from pg_constraint where conname='lesson_plans_title_check') then
    alter table public.lesson_plans add constraint lesson_plans_title_check
      check (char_length(title) >= 1 and char_length(title) <= 60);
  end if;
  if not exists (select 1 from pg_constraint where conname='observations_behavior_check') then
    alter table public.observations add constraint observations_behavior_check
      check (char_length(behavior) >= 2 and char_length(behavior) <= 300);
  end if;
  if not exists (select 1 from pg_constraint where conname='stamp_profiles_nickname_check') then
    alter table public.stamp_profiles add constraint stamp_profiles_nickname_check
      check (nickname is null or char_length(nickname) <= 12);
  end if;
  if not exists (select 1 from pg_constraint where conname='stamp_rewards_cost_check') then
    alter table public.stamp_rewards add constraint stamp_rewards_cost_check check (cost > 0);
  end if;
end $$;

create index if not exists idx_profiles_grade_class    on public.profiles (grade, class_no);
create index if not exists idx_profiles_teacher_ids    on public.profiles using gin (teacher_ids);
create index if not exists idx_teachers_auth           on public.teachers (auth_id);
create unique index if not exists teachers_join_code_idx on public.teachers (join_code) where join_code is not null;
create index if not exists idx_questions_user_subject  on public.questions (user_id, subject_id);
create index if not exists idx_questions_subject       on public.questions (subject_id);
create index if not exists idx_questions_tree          on public.questions (tree_id);
create index if not exists idx_questions_created_at    on public.questions (created_at desc);
create index if not exists idx_questions_material      on public.questions (material_id);
create index if not exists idx_questions_parent        on public.questions (parent_id);
create index if not exists idx_questions_phase         on public.questions (phase);
create index if not exists idx_questions_session       on public.questions (session_id);
create index if not exists idx_questions_starred       on public.questions (starred) where starred = true;
create index if not exists questions_unstamped_idx     on public.questions (created_at) where teacher_stamp is null;
create index if not exists idx_trees_user_subject      on public.trees (user_id, subject_id);
create index if not exists idx_branches_question       on public.branches (question_id);
create index if not exists idx_branches_author         on public.branches (author_id);
create index if not exists idx_peer_answers_qid        on public.peer_answers (question_id);
create index if not exists idx_student_notes_sid       on public.student_notes (student_id);
create index if not exists idx_lesson_materials_target on public.lesson_materials (target_grade, target_class);
create index if not exists idx_lesson_materials_homework on public.lesson_materials (is_homework) where is_homework = true;
create index if not exists idx_live_sessions_open      on public.live_sessions (status, target_grade, target_class);
create index if not exists idx_plans_teacher           on public.lesson_plans (teacher_id, sort_order, id);
create unique index if not exists uq_plans_teacher_title on public.lesson_plans (teacher_id, title);
create index if not exists idx_sess_teacher            on public.lesson_sessions (teacher_id, session_date desc);
create index if not exists idx_obs_student             on public.observations (student_id, school_year, semester);
create index if not exists idx_obs_teacher             on public.observations (given_by, observed_on desc);
create index if not exists idx_obs_live                on public.observations (student_id) where voided_at is null;
create index if not exists idx_rw_student              on public.stamp_rewards (student_id, issued_at desc);
create index if not exists idx_rw_open                 on public.stamp_rewards (status) where status = 'issued';


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 3 — 함수
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.get_my_grade_class()
returns table(grade integer, class_no integer)
language sql stable security definer set search_path to 'public' as $$
  select grade, class_no from profiles where id = auth.uid() limit 1;
$$;

create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from public.teachers t where t.auth_id = auth.uid());
$$;

create or replace function public.is_verified_teacher()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from teachers where auth_id = auth.uid());
$$;

create or replace function public.teacher_can_see(student uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (
    select 1 from teachers t
    where t.auth_id = auth.uid()
      and (t.grade is null or t.grade = (select p.grade from profiles p where p.id = student))
  );
$$;

create or replace function public.my_teacher_ids()
returns setof bigint language sql stable security definer set search_path to 'public' as $$
  select id from teachers where auth_id = auth.uid();
$$;

create or replace function public.mask_name(n text)
returns text language sql immutable as $$
  select case
           when n is null or btrim(n) = '' then null
           when char_length(btrim(n)) <= 1 then btrim(n)
           else left(btrim(n), 1) || repeat('○', char_length(btrim(n)) - 1)
         end;
$$;

create or replace function public.kst_today()
returns date language sql stable as $$
  select (now() at time zone 'Asia/Seoul')::date;
$$;

-- 가입하면 프로필을 자동으로 만든다 (auth.users 트리거에서 부른다)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if exists (select 1 from public.profiles where id = new.id) then return new; end if;
  begin
    insert into public.profiles (id, name, grade, class_no, number)
    values (new.id,
            new.raw_user_meta_data->>'name',
            nullif(new.raw_user_meta_data->>'grade','')::int,
            nullif(new.raw_user_meta_data->>'class','')::int,
            nullif(new.raw_user_meta_data->>'number','')::int);
  exception when others then
    raise log 'Profile insert skipped for %: %', new.id, sqlerrm;
  end;
  return new;
end $$;

create or replace function public.increment_my_login()
returns integer language sql security definer set search_path to 'public' as $$
  update profiles set login_count = coalesce(login_count,0) + 1, last_login = now()
   where id = auth.uid() returning login_count;
$$;

create or replace function public.increment_site_visits()
returns bigint language sql security definer set search_path to 'public' as $$
  update site_stats set count = count + 1 where key = 'visits' returning count;
$$;

create or replace function public.get_site_visits()
returns bigint language sql stable security definer set search_path to 'public' as $$
  select count from site_stats where key = 'visits';
$$;

-- 교사가 학생 비밀번호를 바꿔 준다
create or replace function public.teacher_reset_student_password(p_student_id uuid, p_new_password text)
returns void language plpgsql security definer set search_path to '' as $$
declare v_pw text; v_found boolean;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다' using errcode='28000'; end if;
  if not public.is_teacher() then
    raise exception '교사 계정만 사용할 수 있는 기능입니다' using errcode='42501'; end if;
  v_pw := btrim(coalesce(p_new_password,''));
  if length(v_pw) < 4 then
    raise exception '비밀번호는 4자 이상이어야 합니다' using errcode='22023'; end if;
  select exists (select 1 from public.profiles p where p.id = p_student_id) into v_found;
  if not v_found then raise exception '대상 학생을 찾을 수 없습니다' using errcode='P0002'; end if;
  select exists (select 1 from public.teachers t where t.auth_id = p_student_id) into v_found;
  if v_found then
    raise exception '교사 계정의 비밀번호는 이 기능으로 변경할 수 없습니다' using errcode='42501'; end if;
  update auth.users
     set encrypted_password = extensions.crypt(v_pw, extensions.gen_salt('bf')), updated_at = now()
   where id = p_student_id;
  if not found then raise exception '대상 학생을 찾을 수 없습니다' using errcode='P0002'; end if;
end $$;

-- 하루 제한
--   ⚠️ 컬럼이 하나 늘면 CREATE OR REPLACE 로는 못 바꾼다(반환 형태가 달라져서).
--      먼저 지운다. 지운 사이에 앱은 «제한 없음» 으로 통과시키므로 수업은 안 멈춘다.
drop function if exists public.my_daily_quota();
create or replace function public.my_daily_quota()
returns table(kst_day date, planted integer, planted_after integer, grown integer,
              seeds integer, new_per_day integer, seeds_per_day integer, per_unit integer)
language sql stable security definer set search_path to 'public' as $$
  select public.kst_today(),
         coalesce(d.planted,0), coalesce(d.planted_after,0),
         coalesce(d.grown,0),   coalesce(d.seeds,0),
         l.new_per_day, l.seeds_per_day, l.per_unit
    from public.app_limits l
    left join public.daily_counts d
      on d.user_id = auth.uid() and d.kst_day = public.kst_today()
   where l.id = 1;
$$;

-- 이 차시에 내가 이미 심은 새 질문 수 (꼬리질문·라이브는 안 센다)
create or replace function public.my_unit_count(p_unit text)
returns integer language sql stable security definer set search_path to 'public' as $$
  select coalesce(count(*), 0)::int
    from public.questions q
   where q.user_id = auth.uid() and q.unit = p_unit
     and q.parent_id is null and q.session_id is null;
$$;

-- ── 교사가 남발된 질문을 지운다 ──────────────────────────────────────────
create table if not exists public.deleted_questions (
  id          bigint generated always as identity primary key,
  question_id bigint, user_id uuid, text text, unit text,
  created_at  timestamptz,
  deleted_by  uuid default auth.uid(),
  deleted_at  timestamptz default now(),
  reason      text
);
alter table public.deleted_questions enable row level security;
drop policy if exists delq_teacher on public.deleted_questions;
create policy delq_teacher on public.deleted_questions
  for select to authenticated using (public.is_teacher());

create or replace function public.teacher_delete_question(p_id bigint, p_reclaim_seeds integer default 0)
returns table(owner uuid, seeds_after integer)
language plpgsql security definer set search_path to 'public' as $$
declare q record; v_seeds int;
begin
  if not public.is_teacher() then
    raise exception '교사 계정만 사용할 수 있습니다' using errcode = '42501'; end if;
  select id, user_id, text, unit, created_at into q from public.questions where id = p_id;
  if not found then raise exception '질문을 찾을 수 없습니다' using errcode = 'P0002'; end if;
  insert into public.deleted_questions(question_id, user_id, text, unit, created_at)
  values (q.id, q.user_id, q.text, q.unit, q.created_at);
  delete from public.questions where id = p_id;
  if coalesce(p_reclaim_seeds, 0) > 0 then
    update public.profiles set seeds = greatest(0, coalesce(seeds,0) - p_reclaim_seeds)
     where id = q.user_id returning seeds into v_seeds;
    update public.daily_counts set seeds = greatest(0, seeds - p_reclaim_seeds)
     where user_id = q.user_id and kst_day = public.kst_today();
  else
    select coalesce(seeds,0) into v_seeds from public.profiles where id = q.user_id;
  end if;
  return query select q.user_id, coalesce(v_seeds, 0);
end $$;

create or replace function public.teacher_adjust_seeds(p_student uuid, p_delta integer)
returns integer language plpgsql security definer set search_path to 'public' as $$
declare v int;
begin
  if not public.is_teacher() then
    raise exception '교사 계정만 사용할 수 있습니다' using errcode = '42501'; end if;
  if p_delta is null or p_delta = 0 then
    select coalesce(seeds,0) into v from public.profiles where id = p_student;
    return coalesce(v, 0); end if;
  update public.profiles set seeds = greatest(0, coalesce(seeds,0) + p_delta)
   where id = p_student returning seeds into v;
  if not found then raise exception '학생을 찾을 수 없습니다' using errcode = 'P0002'; end if;
  if p_delta < 0 then
    update public.daily_counts set seeds = greatest(0, seeds + p_delta)
     where user_id = p_student and kst_day = public.kst_today();
  end if;
  return coalesce(v, 0);
end $$;

create or replace function public.teacher_refund_slot(p_student uuid, p_n integer default 1)
returns integer language plpgsql security definer set search_path to 'public' as $$
declare v int;
begin
  if not public.is_teacher() then
    raise exception '교사 계정만 사용할 수 있습니다' using errcode = '42501'; end if;
  update public.daily_counts set planted = greatest(0, planted - coalesce(p_n,1))
   where user_id = p_student and kst_day = public.kst_today()
   returning planted into v;
  return coalesce(v, 0);
end $$;

create or replace function public.award_seeds(p_n integer)
returns table(granted integer, seeds_today integer, seeds_total integer, cap integer)
language plpgsql security definer set search_path to 'public' as $$
declare d date := public.kst_today(); uid uuid := auth.uid();
        c int; cur int; g int; total int;
begin
  if uid is null then raise exception '로그인이 필요합니다'; end if;
  select seeds_per_day into c from public.app_limits where id = 1;
  c := coalesce(c, 8);
  insert into public.daily_counts(user_id, kst_day) values (uid, d)
    on conflict (user_id, kst_day) do nothing;
  select seeds into cur from public.daily_counts
   where user_id = uid and kst_day = d for update;
  cur := coalesce(cur, 0);
  if p_n >= 0 then g := greatest(0, least(p_n, c - cur));
  else            g := greatest(p_n, -cur); end if;
  if g <> 0 then
    update public.daily_counts set seeds = seeds + g where user_id = uid and kst_day = d;
    update public.profiles set seeds = greatest(0, coalesce(seeds,0) + g)
     where id = uid returning seeds into total;
  end if;
  if total is null then select coalesce(seeds,0) into total from public.profiles where id = uid; end if;
  return query select g, cur + g, coalesce(total,0), c;
end $$;

create or replace function public.bump_daily_counts()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare is_new boolean; is_grow boolean; is_after boolean;
begin
  is_new   := (new.parent_id is null and new.session_id is null);
  is_grow  := (new.parent_id is not null);
  is_after := (is_new and coalesce(new.phase,'') = 'after');
  insert into public.daily_counts(user_id, kst_day, planted, planted_after, grown)
  values (new.user_id, public.kst_today(),
          case when is_new then 1 else 0 end,
          case when is_after then 1 else 0 end,
          case when is_grow then 1 else 0 end)
  on conflict (user_id, kst_day) do update set
    planted       = public.daily_counts.planted       + excluded.planted,
    planted_after = public.daily_counts.planted_after + excluded.planted_after,
    grown         = public.daily_counts.grown         + excluded.grown;
  return new;
end $$;

-- 명예의 전당
create or replace function public.get_school_ranking(kind text)
returns table(name text, grade text, class_no text, number text,
              score bigint, qtext text, is_anonymous boolean)
language plpgsql stable security definer set search_path to 'public' as $$
#variable_conflict use_column
begin
  if kind = 'good' then
    return query
      with scored as (
        select q.id qid, q.user_id uid, q.text body,
               coalesce(q.is_anonymous,false) anon, coalesce(q.starred,false) star,
               (coalesce(q.water_count,0) + case when coalesce(q.starred,false) then 5 else 0 end) sc,
               (q.created_at >= date_trunc('month', now())) this_month
          from questions q
         where coalesce(q.water_count,0) > 0 or coalesce(q.starred,false)
      ), picked as (
        select s.* from scored s
         where s.this_month or not exists (select 1 from scored s2 where s2.this_month)
      )
      select case when k.anon then null else public.mask_name(p.name)::text end,
             case when k.anon then null else p.grade::text end,
             case when k.anon then null else p.class_no::text end,
             null::text, k.sc::bigint,
             ((case when k.star then '⭐ ' else '' end) || left(coalesce(k.body,''),80))::text,
             k.anon
        from picked k left join profiles p on p.id = k.uid
       order by k.sc desc, k.qid desc limit 10;
  elsif kind = 'king' then
    return query
      select public.mask_name(p.name)::text, p.grade::text, p.class_no::text,
             null::text, count(q.id)::bigint, null::text, false
        from questions q join profiles p on p.id = q.user_id
       group by p.id, p.name, p.grade, p.class_no
       order by count(q.id) desc limit 10;
  elsif kind = 'helper' then
    return query
      select public.mask_name(p.name)::text, p.grade::text, p.class_no::text,
             null::text, count(a.id)::bigint, null::text, false
        from peer_answers a join profiles p on p.id = a.user_id
       group by p.id, p.name, p.grade, p.class_no
       order by count(a.id) desc limit 10;
  elsif kind = 'water' then
    return query
      select public.mask_name(p.name)::text, p.grade::text, p.class_no::text,
             null::text, coalesce(p.waters_given,0)::bigint, null::text, false
        from profiles p where coalesce(p.waters_given,0) > 0
       order by coalesce(p.waters_given,0) desc limit 10;
  end if;
end $$;

-- ── 칭찬 도장판 함수 ──────────────────────────────────────────────────────
create or replace function public.my_stamp_balance()
returns table(earned integer, spent integer, balance integer)
language sql stable security definer set search_path to 'public' as $$
  select
    coalesce((select count(*) from public.observations o
              where o.student_id = auth.uid() and o.status='approved' and o.voided_at is null),0)::int,
    coalesce((select sum(r.cost) from public.stamp_rewards r
              where r.student_id = auth.uid() and r.status in ('issued','done')),0)::int,
    (coalesce((select count(*) from public.observations o
               where o.student_id = auth.uid() and o.status='approved' and o.voided_at is null),0)
     - coalesce((select sum(r.cost) from public.stamp_rewards r
                 where r.student_id = auth.uid() and r.status in ('issued','done')),0))::int;
$$;

create or replace function public.redeem_reward(p_code text, p_name text, p_cost integer)
returns bigint language plpgsql security definer set search_path to 'public' as $$
declare v_bal int; v_id bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다' using errcode='28000'; end if;
  if p_cost is null or p_cost <= 0 then raise exception '잘못된 요청입니다' using errcode='22023'; end if;
  select balance into v_bal from public.my_stamp_balance();
  if v_bal < p_cost then
    raise exception '쓸 수 있는 도장이 부족해요 (남은 도장 %개)', v_bal using errcode='22023'; end if;
  insert into public.stamp_rewards(student_id, reward_code, reward_name, cost)
  values (auth.uid(), p_code, p_name, p_cost) returning id into v_id;
  return v_id;
end $$;

create or replace function public.class_base()
returns table(student_id uuid, name text, theme text, branch text, nickname text, stage integer)
language sql stable security definer set search_path to 'public' as $$
  with me as (select grade, class_no from public.profiles where id = auth.uid())
  select p.id, p.name::text, coalesce(sp.theme,'creature')::text,
         sp.branch::text, sp.nickname::text,
         (case when c.n>=20 then 6 when c.n>=15 then 5 when c.n>=10 then 4
               when c.n>=6 then 3 when c.n>=3 then 2 when c.n>=1 then 1 else 0 end)::int
    from public.profiles p
    join me on me.grade = p.grade and me.class_no = p.class_no
    left join public.stamp_profiles sp on sp.student_id = p.id
    left join lateral (select count(*) n from public.observations o
                        where o.student_id=p.id and o.status='approved' and o.voided_at is null) c on true
   order by p.number nulls last, p.name;
$$;

create or replace function public.class_total()
returns integer language sql stable security definer set search_path to 'public' as $$
  with me as (select grade, class_no from public.profiles where id = auth.uid())
  select coalesce(count(o.id),0)::int
    from public.profiles p
    join me on me.grade = p.grade and me.class_no = p.class_no
    left join public.observations o
      on o.student_id = p.id and o.status='approved' and o.voided_at is null;
$$;

create or replace function public.class_base_for(p_grade integer, p_class integer)
returns table(student_id uuid, name text, theme text, branch text, nickname text, stage integer)
language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public.is_teacher() then raise exception '교사 계정으로 로그인해야 볼 수 있습니다'; end if;
  return query
  select p.id, p.name::text, coalesce(sp.theme,'creature')::text,
         sp.branch::text, sp.nickname::text,
         (case when c.n>=20 then 6 when c.n>=15 then 5 when c.n>=10 then 4
               when c.n>=6 then 3 when c.n>=3 then 2 when c.n>=1 then 1 else 0 end)::int
    from public.profiles p
    left join public.stamp_profiles sp on sp.student_id = p.id
    left join lateral (select count(*) n from public.observations o
                        where o.student_id=p.id and o.status='approved' and o.voided_at is null) c on true
   where p.grade = p_grade and p.class_no = p_class
   order by p.number nulls last, p.name;
end $$;

create or replace function public.class_total_for(p_grade integer, p_class integer)
returns integer language plpgsql stable security definer set search_path to 'public' as $$
declare n int;
begin
  if not public.is_teacher() then raise exception '교사 계정으로 로그인해야 볼 수 있습니다'; end if;
  select coalesce(count(o.id),0)::int into n
    from public.profiles p
    left join public.observations o
      on o.student_id = p.id and o.status='approved' and o.voided_at is null
   where p.grade = p_grade and p.class_no = p_class;
  return n;
end $$;


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 4 — 트리거
-- ═══════════════════════════════════════════════════════════════════════════
drop trigger if exists questions_daily_count on public.questions;
create trigger questions_daily_count after insert on public.questions
  for each row execute function public.bump_daily_counts();

-- 가입 → 프로필 자동 생성 (이게 없으면 학생이 로그인해도 프로필이 없다)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 5 — RLS (여기가 이 앱의 안전장치입니다)
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.profiles         enable row level security;
alter table public.teachers         enable row level security;
alter table public.subjects         enable row level security;
alter table public.trees            enable row level security;
alter table public.questions        enable row level security;
alter table public.branches         enable row level security;
alter table public.peer_answers     enable row level security;
alter table public.tree_state       enable row level security;
alter table public.student_notes    enable row level security;
alter table public.lesson_materials enable row level security;
alter table public.live_sessions    enable row level security;
alter table public.app_limits       enable row level security;
alter table public.daily_counts     enable row level security;
alter table public.site_stats       enable row level security;
alter table public.lesson_plans     enable row level security;
alter table public.lesson_sessions  enable row level security;
alter table public.observations     enable row level security;
alter table public.stamp_profiles   enable row level security;
alter table public.stamp_rewards    enable row level security;

-- profiles
drop policy if exists profiles_self_all on public.profiles;
create policy profiles_self_all on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists profiles_classmates_read on public.profiles;
create policy profiles_classmates_read on public.profiles for select
  using ((grade, class_no) in (select grade, class_no from public.get_my_grade_class()));
drop policy if exists teacher_read_profiles on public.profiles;
create policy teacher_read_profiles on public.profiles for select to authenticated
  using (public.is_teacher());

-- teachers
drop policy if exists teachers_read_authenticated on public.teachers;
create policy teachers_read_authenticated on public.teachers for select to authenticated using (true);
drop policy if exists teachers_self_update on public.teachers;
create policy teachers_self_update on public.teachers for update
  using (auth.uid() = auth_id) with check (auth.uid() = auth_id);

-- subjects · trees
drop policy if exists subjects_self_write on public.subjects;
create policy subjects_self_write on public.subjects for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists subjects_public_read on public.subjects;
create policy subjects_public_read on public.subjects for select
  using (user_id is null or user_id = auth.uid());
drop policy if exists teacher_read_subjects on public.subjects;
create policy teacher_read_subjects on public.subjects for select to authenticated
  using (public.is_teacher());

drop policy if exists trees_self_all on public.trees;
create policy trees_self_all on public.trees for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists trees_classmates_read on public.trees;
create policy trees_classmates_read on public.trees for select using (exists (
  select 1 from public.profiles o where o.id = trees.user_id
    and (o.grade, o.class_no) in (select grade, class_no from public.get_my_grade_class())));
drop policy if exists teacher_read_trees on public.trees;
create policy teacher_read_trees on public.trees for select to authenticated
  using (public.is_teacher());

-- questions
drop policy if exists questions_self_all on public.questions;
create policy questions_self_all on public.questions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists questions_classmates_read on public.questions;
create policy questions_classmates_read on public.questions for select using (exists (
  select 1 from public.profiles o where o.id = questions.user_id
    and (o.grade, o.class_no) in (select grade, class_no from public.get_my_grade_class())));
drop policy if exists questions_classmates_water on public.questions;
create policy questions_classmates_water on public.questions for update using (exists (
  select 1 from public.profiles o where o.id = questions.user_id
    and (o.grade, o.class_no) in (select grade, class_no from public.get_my_grade_class())))
  with check (exists (
  select 1 from public.profiles o where o.id = questions.user_id
    and (o.grade, o.class_no) in (select grade, class_no from public.get_my_grade_class())));
drop policy if exists teacher_read_questions on public.questions;
create policy teacher_read_questions on public.questions for select to authenticated
  using (public.is_teacher());
drop policy if exists teacher_update_questions on public.questions;
create policy teacher_update_questions on public.questions for update to authenticated
  using (public.is_teacher()) with check (public.is_teacher());
drop policy if exists teacher_delete_questions on public.questions;
create policy teacher_delete_questions on public.questions for delete to authenticated
  using (public.is_teacher());

-- branches · peer_answers · tree_state
drop policy if exists branches_self_write on public.branches;
create policy branches_self_write on public.branches for all
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists branches_classmates_read on public.branches;
create policy branches_classmates_read on public.branches for select using (exists (
  select 1 from public.questions q join public.profiles o on o.id = q.user_id
   where q.id = branches.question_id
     and (o.grade, o.class_no) in (select grade, class_no from public.get_my_grade_class())));
drop policy if exists teacher_read_branches on public.branches;
create policy teacher_read_branches on public.branches for select to authenticated
  using (public.is_teacher());

drop policy if exists peer_answers_insert on public.peer_answers;
create policy peer_answers_insert on public.peer_answers for insert with check (auth.uid() = user_id);
drop policy if exists peer_answers_delete on public.peer_answers;
create policy peer_answers_delete on public.peer_answers for delete using (auth.uid() = user_id);
drop policy if exists peer_answers_read on public.peer_answers;
create policy peer_answers_read on public.peer_answers for select to authenticated using (
  user_id = auth.uid() or public.is_teacher() or exists (
    select 1 from public.questions q join public.profiles owner on owner.id = q.user_id
     where q.id = peer_answers.question_id
       and (owner.grade, owner.class_no) in (select grade, class_no from public.get_my_grade_class())));

drop policy if exists tree_state_self on public.tree_state;
create policy tree_state_self on public.tree_state for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- student_notes (교사 전용 — 학생은 자기 것도 못 본다)
drop policy if exists student_notes_read on public.student_notes;
create policy student_notes_read on public.student_notes for select to authenticated
  using (public.is_teacher());
drop policy if exists student_notes_insert on public.student_notes;
create policy student_notes_insert on public.student_notes for insert to authenticated
  with check (author_id in (select t.id from public.teachers t where t.auth_id = auth.uid()));
drop policy if exists student_notes_delete on public.student_notes;
create policy student_notes_delete on public.student_notes for delete to authenticated
  using (author_id in (select t.id from public.teachers t where t.auth_id = auth.uid()));

-- lesson_materials · live_sessions
drop policy if exists lesson_materials_read on public.lesson_materials;
create policy lesson_materials_read on public.lesson_materials for select to authenticated
  using (is_active = true or public.is_teacher());
drop policy if exists lesson_materials_insert on public.lesson_materials;
create policy lesson_materials_insert on public.lesson_materials for insert to authenticated
  with check (public.is_teacher());
drop policy if exists lesson_materials_update on public.lesson_materials;
create policy lesson_materials_update on public.lesson_materials for update to authenticated
  using (public.is_teacher()) with check (public.is_teacher());
drop policy if exists lesson_materials_delete on public.lesson_materials;
create policy lesson_materials_delete on public.lesson_materials for delete to authenticated
  using (public.is_teacher());

drop policy if exists live_read on public.live_sessions;
create policy live_read on public.live_sessions for select to authenticated using (true);
drop policy if exists live_teacher_insert on public.live_sessions;
create policy live_teacher_insert on public.live_sessions for insert
  with check (public.is_verified_teacher());
drop policy if exists live_teacher_update on public.live_sessions;
create policy live_teacher_update on public.live_sessions for update
  using (public.is_verified_teacher());
drop policy if exists live_teacher_delete on public.live_sessions;
create policy live_teacher_delete on public.live_sessions for delete
  using (public.is_verified_teacher());

-- 하루 제한 (쓰기 정책 없음 → 트리거·RPC 만 건드릴 수 있다)
drop policy if exists limits_read on public.app_limits;
create policy limits_read on public.app_limits for select to authenticated using (true);
drop policy if exists daily_self_read on public.daily_counts;
create policy daily_self_read on public.daily_counts for select to authenticated
  using (user_id = auth.uid());
drop policy if exists site_stats_read on public.site_stats;
create policy site_stats_read on public.site_stats for select using (true);

-- 칭찬 도장판
drop policy if exists plans_teacher_own on public.lesson_plans;
create policy plans_teacher_own on public.lesson_plans for all to authenticated
  using (public.is_teacher() and teacher_id = auth.uid())
  with check (public.is_teacher() and teacher_id = auth.uid());
drop policy if exists sess_teacher_own on public.lesson_sessions;
create policy sess_teacher_own on public.lesson_sessions for all to authenticated
  using (public.is_teacher() and teacher_id = auth.uid())
  with check (public.is_teacher() and teacher_id = auth.uid());
drop policy if exists obs_student_read on public.observations;
create policy obs_student_read on public.observations for select to authenticated
  using (student_id = auth.uid() and status = 'approved' and voided_at is null);
drop policy if exists obs_teacher_own on public.observations;
create policy obs_teacher_own on public.observations for all to authenticated
  using (public.is_teacher() and given_by = auth.uid())
  with check (public.is_teacher() and given_by = auth.uid());
drop policy if exists sp_student_own on public.stamp_profiles;
create policy sp_student_own on public.stamp_profiles for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
drop policy if exists sp_classmate_read on public.stamp_profiles;
create policy sp_classmate_read on public.stamp_profiles for select to authenticated using (exists (
  select 1 from public.profiles me, public.profiles other
   where me.id = auth.uid() and other.id = stamp_profiles.student_id
     and me.grade = other.grade and me.class_no = other.class_no));
drop policy if exists sp_teacher_read on public.stamp_profiles;
create policy sp_teacher_read on public.stamp_profiles for select to authenticated
  using (public.is_teacher());
drop policy if exists rw_student_read on public.stamp_rewards;
create policy rw_student_read on public.stamp_rewards for select to authenticated
  using (student_id = auth.uid());
drop policy if exists rw_teacher on public.stamp_rewards;
create policy rw_teacher on public.stamp_rewards for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 6 — 함수 실행 권한 (로그인 안 한 사람은 못 부르게)
-- ═══════════════════════════════════════════════════════════════════════════
do $$
declare f text;
begin
  foreach f in array array[
    'public.is_teacher()', 'public.is_verified_teacher()', 'public.get_my_grade_class()',
    'public.my_teacher_ids()', 'public.kst_today()', 'public.my_daily_quota()',
    'public.award_seeds(int)', 'public.increment_my_login()',
    'public.increment_site_visits()', 'public.get_site_visits()',
    'public.teacher_can_see(uuid)', 'public.get_school_ranking(text)',
    'public.teacher_reset_student_password(uuid,text)',
    'public.my_stamp_balance()', 'public.redeem_reward(text,text,int)',
    'public.class_base()', 'public.class_total()',
    'public.class_base_for(int,int)', 'public.class_total_for(int,int)',
    'public.my_unit_count(text)', 'public.teacher_delete_question(bigint,int)',
    'public.teacher_adjust_seeds(uuid,int)', 'public.teacher_refund_slot(uuid,int)'
  ] loop
    begin
      execute format('revoke all on function %s from public, anon', f);
      execute format('grant execute on function %s to authenticated', f);
    exception when others then null;
    end;
  end loop;
end $$;


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 7 — 처음 값 · 파일 보관함
-- ═══════════════════════════════════════════════════════════════════════════
insert into public.app_limits(id) values (1) on conflict (id) do nothing;
insert into public.site_stats(key, count) values ('visits', 0) on conflict (key) do nothing;

-- 학생 답변 첨부용 버킷 (비공개로 만든다 — 공개면 링크만 알면 누구나 본다)
insert into storage.buckets (id, name, public, file_size_limit)
values ('attachments', 'attachments', false, 5242880)
on conflict (id) do nothing;

drop policy if exists attachments_read on storage.objects;
create policy attachments_read on storage.objects for select to authenticated
  using (bucket_id = 'attachments');
drop policy if exists attachments_upload on storage.objects;
create policy attachments_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments');
drop policy if exists attachments_delete on storage.objects;
create policy attachments_delete on storage.objects for delete to authenticated
  using (bucket_id = 'attachments');

notify pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 8 — 질문나무 2026-09 기능 (다듬기·대표질문·해결 / 지금 차시 / 교사 라벨 /
--            친구 수정 잠그기 / 나무를 베어도 질문은 남기기)
-- ═══════════════════════════════════════════════════════════════════════════
-- ── 8-1. ✨ 질문 다듬기 · ⭐ 대표 질문 · 🔬 스스로 해결하기 ─────────────────
alter table public.questions add column if not exists refined_text text;
alter table public.questions add column if not exists refined_at   timestamptz;
alter table public.questions add column if not exists refine_check jsonb;

-- ── ② 차시별 대표 질문 (최대 2개) ──────────────────────────────────────────
alter table public.questions add column if not exists is_picked boolean not null default false;

-- ── ③ 해결 과정 전체 ───────────────────────────────────────────────────────
--    { how:[], change, guess, why, known,          ← 나 혼자 생각한 것
--      prompt, ai,                                  ← 만들어진 프롬프트 · AI 답
--      verdict, source, unclear,                    ← 따져본 것
--      answer, newq }                               ← 최종 답 · 새 질문
alter table public.questions add column if not exists solve jsonb;

-- ── ④ 찾아보기 ─────────────────────────────────────────────────────────────
create index if not exists questions_picked_idx
  on public.questions (user_id, unit) where is_picked;
create index if not exists questions_refined_idx
  on public.questions (user_id) where refined_text is not null;

-- ── ⑤ 한 차시에 대표 질문은 2개까지 ────────────────────────────────────────
--    앱에서도 막지만, 두 기기에서 동시에 누르면 앱만으로는 못 막습니다.
--    서버에서 한 번 더 셉니다.
create or replace function public.pick_guard()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare n int;
begin
  if new.is_picked and coalesce(new.unit,'') <> '' then
    select count(*) into n from public.questions
     where user_id = new.user_id and unit = new.unit and is_picked
       and id <> new.id;
    if n >= 2 then
      raise exception '한 차시에 대표 질문은 2개까지예요' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists pick_guard_trg on public.questions;
create trigger pick_guard_trg before insert or update of is_picked, unit
  on public.questions for each row execute function public.pick_guard();

-- ── ⑥ 교사용: 차시별 대표 질문 모아보기 ────────────────────────────────────
create or replace function public.picked_questions(p_unit text default null)
returns table(
  id bigint, grade int, class_no int, number int, name text,
  original text, refined text, checks int, solved boolean, unit text
) language sql stable security definer set search_path to 'public' as $$
  select q.id, p.grade, p.class_no, p.number, p.name,
         q.text, q.refined_text,
         (select count(*) from jsonb_each(coalesce(q.refine_check,'{}'::jsonb)) e
           where e.value::text = 'true')::int,
         (coalesce(q.solve->>'answer','') <> ''),
         q.unit
    from public.questions q
    join public.profiles p on p.id = q.user_id
   where q.is_picked
     and (p_unit is null or q.unit = p_unit)
     and public.is_teacher()
   order by p.grade, p.class_no, p.number;
$$;

grant execute on function public.picked_questions(text) to authenticated;

-- ── 8-2. 📑 지금 차시 (교사가 켜두면 그 시간 질문에 차시가 저절로 붙는다) ────
create table if not exists public.active_units (
  id            bigint generated always as identity primary key,
  teacher_id    bigint not null references public.teachers(id) on delete cascade,
  target_grade  int,
  target_class  int,
  unit          text not null,
  subject_id    text,
  subject_label text,
  set_at        timestamptz not null default now(),
  -- 끄는 걸 잊어도 다음 날 질문에 붙지 않게 스스로 만료된다.
  -- 수업 한 타임을 넉넉히 덮되 하루를 넘기지 않는 길이.
  expires_at    timestamptz not null default (now() + interval '3 hours')
);

-- 학생이 «내 반 것» 을 찾을 때 쓰는 길
create index if not exists idx_active_units_live
  on public.active_units(expires_at desc);

alter table public.active_units enable row level security;

-- ── 학생: 읽기만 ──────────────────────────────────────────────────────────
--   차시 이름은 어차피 칠판에 적히는 것이라 가릴 것이 없다.
--   쓰기는 막는다 — 학생이 남의 반 차시를 켜면 곤란하다.
drop policy if exists "au_read" on public.active_units;
create policy "au_read" on public.active_units
  for select to authenticated
  using (true);

-- ── 교사: 자기 것만 ───────────────────────────────────────────────────────
drop policy if exists "au_teacher_write" on public.active_units;
create policy "au_teacher_write" on public.active_units
  for all to authenticated
  using (exists (select 1 from public.teachers t
                  where t.id = active_units.teacher_id and t.auth_id = auth.uid()))
  with check (exists (select 1 from public.teachers t
                       where t.id = active_units.teacher_id and t.auth_id = auth.uid()));

-- ── 만료된 것 치우기 ──────────────────────────────────────────────────────
--   대시보드가 차시를 켤 때마다 부른다. 따로 cron 을 두지 않는다.
create or replace function public.sweep_active_units()
returns void
language sql security definer set search_path = public as $$
  delete from public.active_units where expires_at < now() - interval '1 day';
$$;
grant execute on function public.sweep_active_units() to authenticated;

-- ── 8-3. 🏷️ 교사 라벨 (학생은 못 보고 못 쓴다) ───────────────────────────────
alter table public.questions
  add column if not exists teacher_labels text[] not null default '{}';

-- 라벨로 거를 때 쓰는 길 (배열 겹침 && / 포함 @> 연산에 붙는다)
create index if not exists idx_questions_teacher_labels
  on public.questions using gin (teacher_labels);

comment on column public.questions.teacher_labels is
  '교사가 붙인 분류 이름표. 학생은 못 보고 못 쓴다. 예: 오개념, 실험가능, 후속탐구감';

-- ── 학생이 못 쓰게 막는다 ─────────────────────────────────────────────────
--   questions 의 학생 정책은 «내 질문이면 수정 가능» 이라, 그냥 두면 학생이
--   자기 질문에 라벨을 붙이거나 지울 수 있다. 라벨은 교사의 기록이라
--   학생 손이 닿으면 안 된다. 트리거로 막는다.
create or replace function public.guard_teacher_labels()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.teacher_labels is distinct from old.teacher_labels then
    if not exists (select 1 from public.teachers t where t.auth_id = auth.uid()) then
      -- 교사가 아니면 라벨 변경을 «조용히 무시» 한다.
      -- 예외를 던지면 학생 앱의 다른 저장(다듬기·해결)까지 같이 실패한다.
      new.teacher_labels := old.teacher_labels;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_teacher_labels on public.questions;
create trigger trg_guard_teacher_labels
  before update on public.questions
  for each row execute function public.guard_teacher_labels();

-- ── 8-4. 🔒 친구는 물주기·탐구투표만 (남의 질문 내용은 못 고친다) ─────────────
create or replace function public.guard_classmate_update()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  -- 남이 고쳐도 되는 칸은 이것뿐이다
  allowed text[] := array['water_count', 'watered_by', 'explore_votes', 'explore_voters'];
  merged  jsonb;
  k       text;
begin
  -- 주인은 그대로 통과
  if auth.uid() = old.user_id then
    return new;
  end if;
  -- 교사도 그대로 통과 (되묻기·도장·차시·라벨을 달아야 한다)
  if exists (select 1 from public.teachers t where t.auth_id = auth.uid()) then
    return new;
  end if;

  -- 여기부터는 «남». 예전 줄에서 시작해 허용된 칸만 새 값으로 덮는다.
  merged := to_jsonb(old);
  foreach k in array allowed loop
    merged := jsonb_set(merged, array[k], to_jsonb(new) -> k);
  end loop;
  new := jsonb_populate_record(old, merged);

  return new;
end;
$$;

drop trigger if exists trg_guard_classmate_update on public.questions;
create trigger trg_guard_classmate_update
  before update on public.questions
  for each row execute function public.guard_classmate_update();

-- ── 8-5. 🌳 나무를 베어도 질문은 남는다 (cascade → set null) ─────────────────
do $$
declare
  con text;
begin
  -- 제약 이름은 환경마다 다를 수 있어 찾아서 지운다
  select c.conname into con
    from pg_constraint c
    join pg_class t  on t.oid = c.conrelid
    join pg_class ft on ft.oid = c.confrelid
   where t.relname = 'questions'
     and ft.relname = 'trees'
     and c.contype = 'f'
   limit 1;

  if con is not null then
    execute format('alter table public.questions drop constraint %I', con);
  end if;

  alter table public.questions
    add constraint questions_tree_id_fkey
    foreign key (tree_id) references public.trees(id) on delete set null;
end $$;

-- 확인: 이제 어떤 규칙으로 걸려 있나 (a = no action, c = cascade, n = set null)


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 9 — 📋 진도 트래커 (반 × 차시 체크표, 교사 계정마다 자기 것만)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.progress_boards (
  id         text        not null,                       -- 진도표 고유 번호(앱이 만듦)
  owner      uuid        not null references auth.users(id) on delete cascade,
  name       text        not null default '진도표',
  sort       integer     not null default 0,             -- 탭 순서
  classes    jsonb       not null default '[]'::jsonb,   -- [{id,name}, ...]
  lessons    jsonb       not null default '[]'::jsonb,   -- [{id,name}, ...]
  done       jsonb       not null default '{}'::jsonb,   -- {"반id|차시id":"2026-08-18"}
  memo       jsonb       not null default '{}'::jsonb,   -- {"반id|차시id":"이 반은 실험 안내 못 함"}
  updated_at timestamptz not null default now(),
  primary key (owner, id)
);

create index if not exists progress_boards_owner_sort_idx
  on public.progress_boards (owner, sort);

-- ── 2. 잠금장치 켜기 (내 것만 보이게) ──────────────────────────────────────
alter table public.progress_boards enable row level security;

drop policy if exists "내 진도표 읽기"   on public.progress_boards;
drop policy if exists "내 진도표 만들기" on public.progress_boards;
drop policy if exists "내 진도표 고치기" on public.progress_boards;
drop policy if exists "내 진도표 지우기" on public.progress_boards;

create policy "내 진도표 읽기"
  on public.progress_boards for select
  using (auth.uid() = owner);

create policy "내 진도표 만들기"
  on public.progress_boards for insert
  with check (auth.uid() = owner);

create policy "내 진도표 고치기"
  on public.progress_boards for update
  using (auth.uid() = owner) with check (auth.uid() = owner);

create policy "내 진도표 지우기"
  on public.progress_boards for delete
  using (auth.uid() = owner);

-- ── 3. 고친 시각 자동 기록 ────────────────────────────────────────────────
create or replace function public.touch_progress_boards()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists progress_boards_touch on public.progress_boards;
create trigger progress_boards_touch
  before update on public.progress_boards
  for each row execute function public.touch_progress_boards();

-- ══════════════════════════════════════════════════════════════════════════
--  끝났습니다. 아래처럼 나오면 성공이에요:
--     Success. No rows returned
--
--  이제 https://scienceisjo.github.io/scienceclass/?t=1 에서
--  📊 진도 트래커 → ☁️ 로그인 을 누르면 어느 기기에서든 같은 표가 보입니다.
-- ══════════════════════════════════════════════════════════════════════════


-- ── 이미 표를 만들어 두었다면 (메모 기능 추가분) ──────────────────────────
--  위 create table 은 표가 있으면 아무 일도 하지 않으므로, 아래 한 줄을 따로 실행하세요.
--  이미 memo 칸이 있으면 그냥 넘어갑니다.
alter table public.progress_boards
  add column if not exists memo jsonb not null default '{}'::jsonb;


-- ═══════════════════════════════════════════════════════════════════════════
--  PART 10 — 🧑‍🏫 교사 등록 (Edge Function 대신 SQL 함수로)
--    · register_teacher : 초대코드가 맞으면 teachers 에 등록/갱신
--    · kit_get_setting / kit_set_setting : 등록된 교사가 초대코드 등을 읽고 바꾼다
-- ═══════════════════════════════════════════════════════════════════════════
drop policy if exists kit_settings_teacher_read on public.kit_settings;
create policy kit_settings_teacher_read on public.kit_settings
  for select to authenticated using (public.is_teacher());

create or replace function public.register_teacher(
  p_invite_code   text,
  p_name          text,
  p_subject_id    text,
  p_subject_label text default null,
  p_subject_icon  text default '📚',
  p_grade         int  default null
) returns public.teachers
language plpgsql security definer set search_path = public as $$
declare
  code text;
  t    public.teachers;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다' using errcode = 'P0001';
  end if;
  select value into code from public.kit_settings where key = 'teacher_invite_code';
  if coalesce(code, '') = '' then
    raise exception '초대코드가 아직 설정되지 않았어요 (설치 SQL 맨 위 PART 0)' using errcode = 'P0001';
  end if;
  if coalesce(p_invite_code, '') <> code then
    perform pg_sleep(0.7);   -- 무작위 대입을 느리게
    raise exception '초대코드가 올바르지 않습니다' using errcode = 'P0001';
  end if;
  if coalesce(p_name, '') = '' or coalesce(p_subject_id, '') = '' then
    raise exception '성함과 담당 과목을 입력하세요' using errcode = 'P0001';
  end if;

  insert into public.teachers (auth_id, name, subject_id, subject_label, subject_icon, grade)
  values (auth.uid(), left(p_name, 40), p_subject_id,
          coalesce(p_subject_label, p_subject_id), coalesce(p_subject_icon, '📚'), p_grade)
  on conflict (auth_id) do update
     set name = excluded.name, subject_id = excluded.subject_id,
         subject_label = excluded.subject_label, subject_icon = excluded.subject_icon,
         grade = excluded.grade
  returning * into t;
  return t;
end $$;

create or replace function public.kit_get_setting(p_key text)
returns text language sql stable security definer set search_path = public as $$
  select case when public.is_teacher() then (select value from public.kit_settings where key = p_key) end;
$$;

create or replace function public.kit_set_setting(p_key text, p_value text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then
    raise exception '등록된 교사만 바꿀 수 있어요' using errcode = 'P0001';
  end if;
  if p_key = 'teacher_invite_code' and length(coalesce(p_value,'')) < 4 then
    raise exception '초대코드는 4자 이상으로 해 주세요' using errcode = 'P0001';
  end if;
  insert into public.kit_settings (key, value) values (p_key, p_value)
  on conflict (key) do update set value = excluded.value, updated_at = now();
end $$;


-- 하루 질문 상한(app_limits)을 대시보드 ⚙️ 관리에서 읽고 바꾼다 (RLS 는 읽기만 열려 있으므로 함수로)
create or replace function public.kit_get_limits()
returns table(new_per_day int, seeds_per_day int, per_unit int)
language sql stable security definer set search_path = public as $$
  select l.new_per_day, l.seeds_per_day, l.per_unit
    from public.app_limits l where l.id = 1 and public.is_teacher();
$$;

create or replace function public.kit_set_limits(p_new_per_day int, p_seeds_per_day int, p_per_unit int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then
    raise exception '등록된 교사만 바꿀 수 있어요' using errcode = 'P0001';
  end if;
  if p_new_per_day < 1 or p_new_per_day > 100 or p_seeds_per_day < 0 or p_seeds_per_day > 100
     or p_per_unit < 1 or p_per_unit > 100 then
    raise exception '1~100 사이 숫자로 해 주세요' using errcode = 'P0001';
  end if;
  insert into public.app_limits (id, new_per_day, seeds_per_day, per_unit)
  values (1, p_new_per_day, p_seeds_per_day, p_per_unit)
  on conflict (id) do update
     set new_per_day = excluded.new_per_day, seeds_per_day = excluded.seeds_per_day, per_unit = excluded.per_unit;
end $$;

-- 함수 실행 권한: 로그인한 사람만 (PUBLIC 기본 부여를 반드시 거둔다)
revoke all on function public.kit_get_limits()                                  from public, anon;
revoke all on function public.kit_set_limits(int,int,int)                       from public, anon;
grant execute on function public.kit_get_limits()                                  to authenticated;
grant execute on function public.kit_set_limits(int,int,int)                       to authenticated;

-- 함수 실행 권한: 로그인한 사람만 (PUBLIC 기본 부여를 반드시 거둔다)
revoke all on function public.register_teacher(text,text,text,text,text,int) from public, anon;
revoke all on function public.kit_get_setting(text)                          from public, anon;
revoke all on function public.kit_set_setting(text,text)                     from public, anon;
grant execute on function public.register_teacher(text,text,text,text,text,int) to authenticated;
grant execute on function public.kit_get_setting(text)                          to authenticated;
grant execute on function public.kit_set_setting(text,text)                     to authenticated;

notify pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════════════
--  확인 — 전부 ✅ 여야 합니다 (하나라도 ❌면 그 줄의 이름으로 위에서 찾아보세요)
-- ═══════════════════════════════════════════════════════════════════════════
select
  case when (select count(*) from information_schema.tables
              where table_schema='public' and table_name in
              ('profiles','teachers','subjects','trees','questions','branches',
               'peer_answers','tree_state','student_notes','lesson_materials',
               'live_sessions','app_limits','daily_counts','site_stats',
               'deleted_questions','active_units')) = 16
       then '✅ 질문나무 표 16개' else '❌ 질문나무 표 부족' end                       as 질문나무,
  case when (select count(*) from information_schema.tables
              where table_schema='public' and table_name in
              ('observations','lesson_sessions','stamp_profiles','stamp_rewards','lesson_plans')) = 5
       then '✅ 도장판 표 5개' else '❌ 도장판 표 부족' end                            as 도장판,
  case when exists (select 1 from information_schema.tables
              where table_schema='public' and table_name='progress_boards')
       then '✅ 진도표' else '❌ 진도표 없음' end                                      as 진도트래커,
  case when (select count(*) from information_schema.columns
              where table_schema='public' and table_name='questions'
                and column_name in ('unit','teacher_nudge','self_check','finding',
                    'still_wondering','explore_votes','explore_voters','session_id',
                    'refined_text','is_picked','solve','teacher_labels')) = 12
       then '✅ questions 컬럼 완비' else '❌ questions 컬럼 누락' end                  as 컬럼,
  case when (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
              where n.nspname='public' and p.proname in
              ('is_teacher','get_my_grade_class','handle_new_user','award_seeds',
               'my_daily_quota','kst_today','teacher_can_see','mask_name',
               'register_teacher','kit_set_setting','kit_set_limits','my_stamp_balance','redeem_reward',
               'pick_guard','sweep_active_units','guard_teacher_labels','guard_classmate_update')) = 17
       then '✅ 핵심 함수 17개' else '❌ 함수 누락' end                                as 함수,
  case when exists (select 1 from pg_trigger where tgname='on_auth_user_created')
       then '✅ 가입 트리거' else '❌ 가입 트리거 없음(학생 프로필이 안 생깁니다)' end as 가입트리거,
  case when exists (select 1 from storage.buckets where id='attachments')
       then '✅ 파일 보관함' else '❌ 없음' end                                        as 보관함,
  case when coalesce((select value from public.kit_settings where key='teacher_invite_code'),'') <> ''
       then '✅ 초대코드: ' || (select value from public.kit_settings where key='teacher_invite_code')
       else '❌ 초대코드 비어 있음' end                                                as 교사초대코드,
  (select count(*) from pg_policies where schemaname='public')::text || '개'           as RLS정책수;
