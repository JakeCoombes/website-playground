create table if not exists public.pet_boarding_bookings (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  owner_email text not null,
  owner_phone text not null,
  pet_name text not null,
  pet_type text not null,
  pet_breed text,
  pet_age text,
  pet_weight text,
  pet_temperament text,
  extra_pets jsonb not null default '[]'::jsonb,
  services text[] not null default '{}',
  start_date date not null,
  end_date date not null,
  vaccination_file_name text,
  care_notes text,
  emergency_name text,
  emergency_phone text,
  subtotal numeric(10, 2) not null default 0,
  deposit_amount numeric(10, 2) not null default 0,
  payment_method text not null,
  status text not null default 'Pending Deposit',
  requested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pet_boarding_bookings_status_check check (
    status in (
      'Pending Deposit',
      'Deposit Received',
      'Confirmed',
      'Completed',
      'Cancelled'
    )
  ),
  constraint pet_boarding_bookings_payment_method_check check (
    payment_method in ('Zelle', 'Venmo', 'Cash App', 'Apple Pay', 'Other')
  )
);

alter table public.pet_boarding_bookings enable row level security;

create policy "Admins can manage pet boarding bookings"
  on public.pet_boarding_bookings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
