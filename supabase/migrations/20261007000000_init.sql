-- ELIE // MASS PROTOCOL — initial schema.
-- Every row belongs to auth.uid(). RLS is on for every table; the app only ever uses the anon key + user session.

create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  name text not null,
  age int not null,
  height_cm double precision not null,
  start_weight double precision not null,
  goal_weight double precision not null,
  start_date date not null,
  sessions_per_week text not null default 'auto' check (sessions_per_week in ('auto', '4', '5')),
  padel_days int[] not null default '{0,1,2}',
  activity double precision not null,
  surplus int not null,
  kcal_adjust int not null default 0,
  protein_per_kg double precision not null,
  nutrition_mode text not null default 'auto' check (nutrition_mode in ('auto', 'manual')),
  manual jsonb not null,
  water_l double precision not null,
  creatine boolean not null default true,
  prefs jsonb not null default '{}',
  lang text not null default 'fr' check (lang in ('fr', 'en')),
  updated_at timestamptz not null default now()
);

-- One row per calendar day: meals {slot: {eaten, swap}}, habits {}, checkin {energy, note}, note, extras [].
create table public.day_logs (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  meals jsonb,
  habits jsonb,
  checkin jsonb,
  note text,
  extras jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table public.body_weights (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  kg double precision not null check (kg > 30 and kg < 250),
  primary key (user_id, date)
);

create table public.workout_sessions (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  date date not null,
  tpl_id text not null,
  name text not null,
  started_at timestamptz,
  ended_at timestamptz,
  sets int not null default 0,
  volume int not null default 0,
  prs int not null default 0,
  pr_list jsonb not null default '[]',
  primary key (user_id, id)
);
create index workout_sessions_date on public.workout_sessions (user_id, date);

create table public.exercise_sets (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  session_id text not null,
  ex_order int not null,
  ex_id text not null,
  ex_name text not null,
  set_order int not null,
  weight double precision not null,
  reps int not null,
  primary key (user_id, session_id, ex_order, set_order),
  foreign key (user_id, session_id) references public.workout_sessions (user_id, id) on delete cascade
);
create index exercise_sets_ex on public.exercise_sets (user_id, ex_id);

-- The workout in progress, persisted so it survives closing the app.
create table public.workout_drafts (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.activities (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  date date not null,
  type text not null check (type in ('padel', 'run', 'crossfit', 'other')),
  duration int not null check (duration > 0),
  intensity text not null check (intensity in ('low', 'medium', 'high')),
  primary key (user_id, id)
);

create table public.body_measurements (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  date date not null,
  chest double precision,
  waist double precision,
  arms double precision,
  thighs double precision,
  shoulders double precision,
  primary key (user_id, id)
);

create table public.progress_photos (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  date date not null,
  pose text not null check (pose in ('front', 'side', 'back')),
  path text not null,
  primary key (user_id, id)
);

create table public.weekly_checkins (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  week_start date not null,
  answers jsonb not null,
  stats jsonb not null,
  suggestion text not null,
  suggestion_code text,
  applied boolean not null default false,
  submitted_at timestamptz,
  primary key (user_id, week_start)
);

create table public.achievements_unlocked (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  ach_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, ach_id)
);

-- RLS: owner = auth.uid() on every table.
do $$
declare t text;
begin
  foreach t in array array['profiles', 'day_logs', 'body_weights', 'workout_sessions', 'exercise_sets', 'workout_drafts',
    'activities', 'body_measurements', 'progress_photos', 'weekly_checkins', 'achievements_unlocked']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "owner" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- Progress photos: private bucket, files under <user_id>/<photo_id>.jpg.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-photos', 'progress-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy "progress photos owner read" on storage.objects for select to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "progress photos owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "progress photos owner update" on storage.objects for update to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "progress photos owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
