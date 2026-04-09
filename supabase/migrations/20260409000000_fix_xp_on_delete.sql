-- Subtract XP when a habit_log is deleted (user unchecks a habit)
create or replace function public.revert_user_xp()
returns trigger as $$
declare
  current_profile record;
  new_xp int;
  new_level int;
  xp_needed int;
  total_xp int;
begin
  if old.completed = false or old.pts_earned = 0 then return old; end if;

  select * into current_profile from public.profiles where id = old.user_id;

  -- Convert current level+xp back to absolute XP, then subtract
  total_xp := current_profile.xp;
  for i in 1..(current_profile.level - 1) loop
    total_xp := total_xp + public.xp_for_level(i);
  end loop;

  total_xp := greatest(0, total_xp - old.pts_earned);

  -- Recalculate level from absolute XP
  new_level := 1;
  loop
    xp_needed := public.xp_for_level(new_level);
    exit when total_xp < xp_needed;
    total_xp := total_xp - xp_needed;
    new_level := new_level + 1;
  end loop;
  new_xp := total_xp;

  update public.profiles set
    xp = new_xp,
    level = new_level
  where id = old.user_id;

  -- Remove the activity entry for this habit completion
  delete from public.activity
  where user_id = old.user_id
    and type = 'habit_completed'
    and created_at >= old.created_at - interval '5 seconds'
    and created_at <= old.created_at + interval '5 seconds'
    and payload->>'habit_name' = (select name from public.habits where id = old.habit_id);

  return old;
end;
$$ language plpgsql security definer;

create trigger on_habit_log_delete
  before delete on public.habit_logs
  for each row execute function public.revert_user_xp();
