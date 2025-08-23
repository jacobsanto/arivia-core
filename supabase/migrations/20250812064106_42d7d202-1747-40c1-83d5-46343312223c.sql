-- Create system_settings table for single-tenant persisted settings
create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Policies: Only administrators and superadmins can read/write
create policy if not exists "Admins can read system settings"
  on public.system_settings
  for select
  using (
    has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)
  );

create policy if not exists "Admins can insert system settings"
  on public.system_settings
  for insert
  with check (
    has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)
  );

create policy if not exists "Admins can update system settings"
  on public.system_settings
  for update
  using (
    has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)
  );

create policy if not exists "Admins can delete system settings"
  on public.system_settings
  for delete
  using (
    has_role(auth.uid(), 'administrator'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)
  );

-- Trigger to keep updated_at fresh
create trigger if not exists update_system_settings_updated_at
before update on public.system_settings
for each row
execute function public.update_updated_at_column();