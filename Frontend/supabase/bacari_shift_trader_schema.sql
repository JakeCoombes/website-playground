create table if not exists public.bacari_shift_trader_names (
  id uuid primary key default gen_random_uuid(),
  shift_date date not null,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists bacari_shift_trader_names_shift_date_created_at_idx
  on public.bacari_shift_trader_names (shift_date, created_at);

alter table public.bacari_shift_trader_names enable row level security;

drop policy if exists "Anyone can view Bacari shift trader names"
  on public.bacari_shift_trader_names;

create policy "Anyone can view Bacari shift trader names"
  on public.bacari_shift_trader_names
  for select
  using (true);

drop policy if exists "Anyone can add Bacari shift trader names"
  on public.bacari_shift_trader_names;

create policy "Anyone can add Bacari shift trader names"
  on public.bacari_shift_trader_names
  for insert
  with check (name <> '');

create or replace function public.cleanup_old_bacari_shift_trader_names(
  today_date date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.bacari_shift_trader_names
  where shift_date < today_date;
end;
$$;

grant execute on function public.cleanup_old_bacari_shift_trader_names(date)
  to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bacari_shift_trader_names'
  ) then
    alter publication supabase_realtime add table public.bacari_shift_trader_names;
  end if;
end;
$$;
