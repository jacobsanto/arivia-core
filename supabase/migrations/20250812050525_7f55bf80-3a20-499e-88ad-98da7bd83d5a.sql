-- Ensure pgcrypto for UUIDs
create extension if not exists pgcrypto with schema public;

-- Create audit_logs table for app observability (sanitized)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid,
  level text not null check (level in ('info','warn','error')),
  source text,
  event text,
  message text,
  path text,
  component text,
  fingerprint text,
  context jsonb not null default '{}'::jsonb
);

comment on table public.audit_logs is 'Application audit and error logs (sanitized).';

-- Enable Row Level Security
alter table public.audit_logs enable row level security;

-- Allow inserts from authenticated users (no reads by default)
drop policy if exists "Authenticated users can insert logs" on public.audit_logs;
create policy "Authenticated users can insert logs"
  on public.audit_logs
  for insert
  to authenticated
  with check (
    auth.uid() is not null
    and (user_id is null or user_id = auth.uid())
  );

-- Indexes for common queries
create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);
create index if not exists idx_audit_logs_user_id on public.audit_logs (user_id);
create index if not exists idx_audit_logs_level on public.audit_logs (level);
