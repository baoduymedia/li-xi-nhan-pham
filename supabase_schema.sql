-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Rooms Table
create table rooms (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  host_id uuid, -- Optional if we have auth
  settings jsonb not null default '{}'::jsonb,
  status text not null default 'active', -- 'active', 'closed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Players Table
create table players (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references rooms(id) on delete cascade not null,
  name text not null,
  avatar_url text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, name) -- Prevent duplicate names in same room
);

-- Results Table (Lì Xì History)
create table results (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references rooms(id) on delete cascade not null,
  player_id uuid references players(id) on delete cascade not null,
  amount bigint not null, -- Stored in VND
  wish text,
  is_trap boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Realtime Subscriptions
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table results;

-- RLS Policies (Simplified for demo)
alter table rooms enable row level security;
alter table players enable row level security;
alter table results enable row level security;

-- Allow anyone to read/write for now (in production, lock this down)
create policy "Public Access Rooms" on rooms for all using (true) with check (true);
create policy "Public Access Players" on players for all using (true) with check (true);
create policy "Public Access Results" on results for all using (true) with check (true);
