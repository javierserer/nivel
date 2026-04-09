-- ============================================================
-- NIVEL — Initial schema
-- Tables first, then RLS policies (to avoid cross-references)
-- ============================================================

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  level int not null default 1,
  xp int not null default 0,
  streak int not null default 0,
  best_streak int not null default 0,
  onboarding_done boolean not null default false,
  notify_squad boolean not null default true,
  notify_reminders boolean not null default true,
  public_profile boolean not null default false,
  invitations_total int not null default 5,
  invitations_used int not null default 0,
  created_at timestamptz not null default now()
);

-- HABITS
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  difficulty text not null check (difficulty in ('easy', 'normal', 'hard', 'beast')),
  pts int not null,
  frequency text not null default 'Diario',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index habits_user_id_idx on public.habits (user_id);

-- HABIT_LOGS
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  log_date date not null default current_date,
  completed boolean not null default true,
  pts_earned int not null default 0,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);
create index habit_logs_user_date_idx on public.habit_logs (user_id, log_date);
create index habit_logs_habit_id_idx on public.habit_logs (habit_id);

-- SQUADS
create table public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles on delete cascade,
  invite_code text unique not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  weekly_challenge text,
  week_number int not null default extract(week from now())::int,
  created_at timestamptz not null default now()
);

-- SQUAD_MEMBERS
create table public.squad_members (
  squad_id uuid not null references public.squads on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);

-- INVITATIONS
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles on delete cascade,
  code text unique not null,
  used_by uuid references public.profiles on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index invitations_code_idx on public.invitations (code) where used_by is null;

-- DUELS
create table public.duels (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads on delete cascade,
  challenger_id uuid not null references public.profiles on delete cascade,
  challenged_id uuid not null references public.profiles on delete cascade,
  habit_name text not null,
  stake text,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'rejected')),
  progress jsonb not null default '{}',
  winner_id uuid references public.profiles,
  created_at timestamptz not null default now(),
  ends_at timestamptz
);

-- KUDOS
create table public.kudos (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles on delete cascade,
  to_user uuid not null references public.profiles on delete cascade,
  activity_id uuid,
  created_at timestamptz not null default now(),
  unique (from_user, activity_id)
);

-- ACTIVITY FEED
create table public.activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  squad_id uuid references public.squads on delete cascade,
  type text not null check (type in (
    'habit_completed', 'level_up', 'streak_milestone',
    'duel_created', 'duel_won', 'achievement_unlocked',
    'joined_squad'
  )),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index activity_squad_created_idx on public.activity (squad_id, created_at desc);
create index activity_user_created_idx on public.activity (user_id, created_at desc);

-- WAITLIST
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.invitations enable row level security;
alter table public.duels enable row level security;
alter table public.kudos enable row level security;
alter table public.activity enable row level security;
alter table public.waitlist enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_select_squad" on public.profiles
  for select using (
    id in (
      select sm2.user_id from public.squad_members sm1
      join public.squad_members sm2 on sm1.squad_id = sm2.squad_id
      where sm1.user_id = auth.uid()
    )
  );

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Habits
create policy "habits_all_own" on public.habits
  for all using (auth.uid() = user_id);

-- Habit logs
create policy "habit_logs_all_own" on public.habit_logs
  for all using (auth.uid() = user_id);

create policy "habit_logs_select_squad" on public.habit_logs
  for select using (
    user_id in (
      select sm2.user_id from public.squad_members sm1
      join public.squad_members sm2 on sm1.squad_id = sm2.squad_id
      where sm1.user_id = auth.uid()
    )
  );

-- Squads
create policy "squads_select_member" on public.squads
  for select using (
    id in (select squad_id from public.squad_members where user_id = auth.uid())
  );

create policy "squads_insert_auth" on public.squads
  for insert with check (auth.uid() = created_by);

create policy "squads_update_owner" on public.squads
  for update using (auth.uid() = created_by);

-- Squad members
create policy "squad_members_select" on public.squad_members
  for select using (
    squad_id in (select squad_id from public.squad_members where user_id = auth.uid())
  );

create policy "squad_members_insert" on public.squad_members
  for insert with check (auth.uid() = user_id);

create policy "squad_members_delete" on public.squad_members
  for delete using (auth.uid() = user_id);

-- Invitations
create policy "invitations_select_own" on public.invitations
  for select using (auth.uid() = owner_id);

create policy "invitations_select_available" on public.invitations
  for select using (used_by is null);

create policy "invitations_update_claim" on public.invitations
  for update using (used_by is null);

-- Duels
create policy "duels_select_squad" on public.duels
  for select using (
    squad_id in (select squad_id from public.squad_members where user_id = auth.uid())
  );

create policy "duels_insert" on public.duels
  for insert with check (auth.uid() = challenger_id);

create policy "duels_update_participant" on public.duels
  for update using (auth.uid() in (challenger_id, challenged_id));

-- Kudos
create policy "kudos_select" on public.kudos for select using (true);
create policy "kudos_insert" on public.kudos
  for insert with check (auth.uid() = from_user);

-- Activity
create policy "activity_select" on public.activity
  for select using (
    (squad_id is null and user_id = auth.uid())
    or squad_id in (select squad_id from public.squad_members where user_id = auth.uid())
  );

create policy "activity_insert" on public.activity
  for insert with check (auth.uid() = user_id);

-- Waitlist
create policy "waitlist_insert" on public.waitlist
  for insert with check (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- XP thresholds per level
create or replace function public.xp_for_level(lvl int)
returns int as $$
begin
  return floor(500 * power(1.15, lvl - 1))::int;
end;
$$ language plpgsql immutable;

-- Calculate streak
create or replace function public.calculate_streak(p_user_id uuid)
returns int as $$
declare
  streak_count int := 0;
  check_date date := current_date;
  has_log boolean;
begin
  loop
    select exists(
      select 1 from public.habit_logs
      where user_id = p_user_id and log_date = check_date and completed = true
    ) into has_log;

    if not has_log then
      if check_date = current_date then
        check_date := check_date - 1;
        continue;
      end if;
      exit;
    end if;

    streak_count := streak_count + 1;
    check_date := check_date - 1;
  end loop;

  return streak_count;
end;
$$ language plpgsql security definer;

-- Update XP on habit completion
create or replace function public.update_user_xp()
returns trigger as $$
declare
  current_profile record;
  new_xp int;
  new_level int;
  xp_needed int;
  streak_mult numeric;
  user_streak int;
  user_squad_id uuid;
begin
  if new.completed = false then return new; end if;

  select * into current_profile from public.profiles where id = new.user_id;
  user_streak := public.calculate_streak(new.user_id);

  if user_streak >= 30 then streak_mult := 2.0;
  elsif user_streak >= 7 then streak_mult := 1.5;
  else streak_mult := 1.0;
  end if;

  new.pts_earned := floor(new.pts_earned * streak_mult)::int;
  new_xp := current_profile.xp + new.pts_earned;
  new_level := current_profile.level;

  loop
    xp_needed := public.xp_for_level(new_level);
    exit when new_xp < xp_needed;
    new_xp := new_xp - xp_needed;
    new_level := new_level + 1;
  end loop;

  update public.profiles set
    xp = new_xp,
    level = new_level,
    streak = user_streak,
    best_streak = greatest(best_streak, user_streak)
  where id = new.user_id;

  select squad_id into user_squad_id
    from public.squad_members where user_id = new.user_id limit 1;

  insert into public.activity (user_id, squad_id, type, payload)
  values (
    new.user_id, user_squad_id, 'habit_completed',
    jsonb_build_object(
      'habit_name', (select name from public.habits where id = new.habit_id),
      'pts', new.pts_earned
    )
  );

  if new_level > current_profile.level then
    insert into public.activity (user_id, squad_id, type, payload)
    values (new.user_id, user_squad_id, 'level_up',
      jsonb_build_object('new_level', new_level));
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_habit_log_insert
  before insert on public.habit_logs
  for each row execute function public.update_user_xp();

-- Generate invitation codes when onboarding completes
create or replace function public.generate_invitations()
returns trigger as $$
declare
  i int;
  code text;
  prefix text;
begin
  prefix := upper(left(coalesce(new.username, new.id::text), 3));
  for i in 1..5 loop
    code := prefix || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    insert into public.invitations (owner_id, code)
    values (new.id, code)
    on conflict do nothing;
  end loop;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_onboarding_done
  after update of onboarding_done on public.profiles
  for each row
  when (new.onboarding_done = true and old.onboarding_done = false)
  execute function public.generate_invitations();

-- Weekly points helper
create or replace function public.weekly_points(p_user_id uuid, p_weeks_ago int default 0)
returns int as $$
declare
  week_start date;
  week_end date;
begin
  week_start := date_trunc('week', current_date - (p_weeks_ago * 7 * interval '1 day'))::date;
  week_end := week_start + 6;
  return coalesce(
    (select sum(pts_earned) from public.habit_logs
     where user_id = p_user_id and log_date between week_start and week_end and completed = true),
    0
  );
end;
$$ language plpgsql security definer;

-- ============================================================
-- STORAGE
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "avatars_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_select" on storage.objects
  for select using (bucket_id = 'avatars');

-- ============================================================
-- REALTIME
-- ============================================================

alter publication supabase_realtime add table public.activity;
alter publication supabase_realtime add table public.kudos;
alter publication supabase_realtime add table public.habit_logs;
