-- ===========================================================
-- General Education Renaissance — Supabase schema
-- Run this whole file in Supabase: SQL Editor > New Query > Run
-- ===========================================================

-- ---------- Literature review ----------
create table if not exists literature_resources (
  id uuid primary key default gen_random_uuid(),
  title text,
  authors text,
  isbn text,
  link text,
  note text,
  submitted_by text default 'Anonymous',
  created_at timestamptz not null default now()
);

alter table literature_resources enable row level security;

create policy "Public can read literature" on literature_resources
  for select using (true);

create policy "Public can add literature" on literature_resources
  for insert with check (true);

-- ---------- Discussion posts (six "Thoughts on..." channels) ----------
create table if not exists discussion_posts (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in (
    'critical-thinking',
    'adaptability-flexibility',
    'collaboration-teamwork',
    'verbal-communication',
    'curiosity',
    'leadership-professionalism'
  )),
  author_name text default 'Anonymous',
  message text,
  link_url text,
  file_url text,
  file_name text,
  file_size bigint,
  created_at timestamptz not null default now()
);

alter table discussion_posts enable row level security;

create policy "Public can read discussion posts" on discussion_posts
  for select using (true);

create policy "Public can add discussion posts" on discussion_posts
  for insert with check (true);

create index if not exists idx_discussion_channel on discussion_posts (channel, created_at desc);

-- ---------- Visual identity contest submissions ----------
create table if not exists contest_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  artist_name text default 'Anonymous',
  artist_email text,
  description text,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table contest_submissions enable row level security;

create policy "Public can read contest submissions" on contest_submissions
  for select using (true);

create policy "Public can add contest submissions" on contest_submissions
  for insert with check (true);

-- ===========================================================
-- STORAGE BUCKETS
-- The SQL above only creates tables. You still need to create
-- two storage buckets in the dashboard (Storage > New bucket):
--   1. discussion-uploads  (Public bucket: ON)
--   2. contest-uploads     (Public bucket: ON)
-- Then run the policies below so anonymous visitors can upload
-- and everyone can view files. See SETUP-INSTRUCTIONS.md for
-- the click-by-click version, including setting the 5MB file
-- size limit on each bucket.
-- ===========================================================

create policy "Public can read discussion uploads"
  on storage.objects for select
  using (bucket_id = 'discussion-uploads');

create policy "Public can upload discussion files"
  on storage.objects for insert
  with check (bucket_id = 'discussion-uploads');

create policy "Public can read contest uploads"
  on storage.objects for select
  using (bucket_id = 'contest-uploads');

create policy "Public can upload contest files"
  on storage.objects for insert
  with check (bucket_id = 'contest-uploads');
