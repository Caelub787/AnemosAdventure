-- Local development seed data.
-- Runs automatically after `supabase db reset`. Safe to extend, never runs in production.

insert into content_items (id, type, title, body, status, created_by)
select
  '00000000-0000-0000-0000-000000000001',
  'announcement',
  'Welcome to ArcanaVTT',
  '{"text": "This is a seeded announcement for local development."}'::jsonb,
  'published',
  id
from auth.users
limit 1
on conflict (id) do nothing;
