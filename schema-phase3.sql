-- Create summaries table
create table summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  content jsonb not null,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- Create plans table
create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  content jsonb not null,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- Enable Row Level Security (RLS)
alter table summaries enable row level security;
alter table plans enable row level security;

-- RLS policies
create policy "Users manage their own summaries"
  on summaries for all using (auth.uid() = user_id);

create policy "Users manage their own plans"
  on plans for all using (auth.uid() = user_id);
