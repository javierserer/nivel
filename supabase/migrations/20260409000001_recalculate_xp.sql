-- Recalculate XP for all users based on actual habit_logs
-- This fixes phantom XP from logs created during the RLS recursion bug
do $$
declare
  p record;
  total_xp int;
  new_level int;
  xp_needed int;
begin
  for p in select id from public.profiles loop
    select coalesce(sum(pts_earned), 0) into total_xp
    from public.habit_logs
    where user_id = p.id and completed = true;

    new_level := 1;
    loop
      xp_needed := public.xp_for_level(new_level);
      exit when total_xp < xp_needed;
      total_xp := total_xp - xp_needed;
      new_level := new_level + 1;
    end loop;

    update public.profiles set xp = total_xp, level = new_level where id = p.id;
  end loop;
end;
$$;
