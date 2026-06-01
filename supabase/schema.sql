-- Inside App - Supabase Schema

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  text text not null,
  order_index integer default 0
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  nickname text not null,
  created_at timestamptz default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade not null,
  value boolean not null,
  unique(user_id, question_id)
);

-- Enable Row Level Security
alter table rooms enable row level security;
alter table questions enable row level security;
alter table users enable row level security;
alter table answers enable row level security;

-- Public access policies (no auth for MVP)
create policy "Public rooms" on rooms for all using (true) with check (true);
create policy "Public questions" on questions for all using (true) with check (true);
create policy "Public users" on users for all using (true) with check (true);
create policy "Public answers" on answers for all using (true) with check (true);

-- Enable realtime for presence
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table answers;
