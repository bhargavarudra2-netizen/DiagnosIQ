-- Create guardian_access table
create table guardian_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  guardian_email text not null,
  created_at timestamptz default now(),
  unique (owner_id, guardian_email)
);

-- Enable Row Level Security (RLS)
alter table guardian_access enable row level security;

-- RLS policies
create policy "Users manage their own grants"
  on guardian_access for all using (auth.uid() = owner_id);
