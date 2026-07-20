-- Create projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);

-- Create entries table
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  timestamp timestamptz default now(),
  raw_text text not null,
  ai_summary jsonb,
  activity text,
  project_id uuid references projects(id) on delete set null,
  tags text[],
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table entries enable row level security;
alter table projects enable row level security;

-- Policies for entries
create policy "Users manage their own entries"
  on entries for all using (auth.uid() = user_id);

-- Policies for projects
create policy "Users manage their own projects"
  on projects for all using (auth.uid() = user_id);

-- Full-text search setup (Phase 3 optimization, configured early)
alter table entries add column search_vector tsvector
  generated always as (to_tsvector('english', raw_text)) stored;

create index entries_search_idx on entries using gin(search_vector);
