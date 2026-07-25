-- ArcanaVTT initial schema
-- Additive/non-destructive by convention: prefer new migrations over editing this file.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function role_rank(p_role text)
returns int
language sql
immutable
as $$
  select case p_role
    when 'owner' then 6
    when 'administrator' then 5
    when 'game_master' then 4
    when 'editor' then 3
    when 'player' then 2
    when 'viewer' then 1
    else 0
  end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth.users row)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Adventurer',
  avatar_url text,
  privacy_settings jsonb not null default '{}'::jsonb,
  notification_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Projects & membership
-- ---------------------------------------------------------------------------

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  owner_id uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'administrator', 'game_master', 'editor', 'player', 'viewer')),
  status text not null default 'active' check (status in ('invited', 'active', 'removed')),
  invited_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index project_members_user_id_idx on project_members (user_id);

create or replace function has_project_role(p_project_id uuid, p_min_role text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = auth.uid()
      and pm.status = 'active'
      and role_rank(pm.role) >= role_rank(p_min_role)
  );
$$;

create table invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  email text not null,
  role text not null check (role in ('administrator', 'game_master', 'editor', 'player', 'viewer')),
  token uuid not null default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid not null references profiles (id),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  unique (project_id, email, status)
);

create index invitations_token_idx on invitations (token);

create or replace function accept_invitation(p_token uuid)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_invitation invitations%rowtype;
  v_user_email text;
begin
  select email into v_user_email from auth.users where id = auth.uid();

  select * into v_invitation
    from invitations
    where token = p_token
      and status = 'pending'
      and expires_at > now()
    for update;

  if not found then
    raise exception 'invitation not found or expired';
  end if;

  if lower(v_invitation.email) <> lower(v_user_email) then
    raise exception 'invitation email does not match the signed-in account';
  end if;

  insert into project_members (project_id, user_id, role, status, invited_by)
    values (v_invitation.project_id, auth.uid(), v_invitation.role, 'active', v_invitation.invited_by)
    on conflict (project_id, user_id) do update set status = 'active', role = excluded.role;

  update invitations set status = 'accepted' where id = v_invitation.id;

  return v_invitation.project_id;
end;
$$;

-- returns a minimal preview for an invitation link without exposing the invitations table via RLS
create or replace function get_invitation_preview(p_token uuid)
returns table (project_name text, role text, email text, status text)
language sql
security definer set search_path = public
stable
as $$
  select p.name, i.role, i.email, i.status
  from invitations i
  join projects p on p.id = i.project_id
  where i.token = p_token;
$$;

-- ---------------------------------------------------------------------------
-- Shared identity registry for cross-linkable project content
-- ---------------------------------------------------------------------------

create table project_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  node_type text not null check (node_type in ('world_entry', 'map', 'campaign')),
  search_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index project_nodes_project_id_idx on project_nodes (project_id);
create index project_nodes_search_idx on project_nodes using gin (to_tsvector('english', search_text));

create trigger project_nodes_set_updated_at
  before update on project_nodes
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- World Builder
-- ---------------------------------------------------------------------------

create table world_builder_entries (
  id uuid primary key references project_nodes (id) on delete cascade,
  project_id uuid not null references projects (id) on delete cascade,
  title text not null,
  slug text not null,
  content_text text not null default '',
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, slug)
);

create trigger world_builder_entries_set_updated_at
  before update on world_builder_entries
  for each row execute function set_updated_at();

create table entry_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  source_entry_id uuid not null references project_nodes (id) on delete cascade,
  target_node_id uuid references project_nodes (id) on delete set null,
  link_text text not null,
  created_at timestamptz not null default now()
);

create index entry_links_source_idx on entry_links (source_entry_id);
create index entry_links_target_idx on entry_links (target_node_id);

create or replace function sync_world_entry_search_text()
returns trigger
language plpgsql
as $$
begin
  update project_nodes
    set search_text = new.title || ' ' || new.content_text
    where id = new.id;
  return new;
end;
$$;

create trigger world_builder_entries_sync_search
  after insert or update on world_builder_entries
  for each row execute function sync_world_entry_search_text();

create or replace function create_world_entry(p_project_id uuid, p_title text, p_slug text)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_id uuid;
begin
  if not has_project_role(p_project_id, 'editor') then
    raise exception 'insufficient permissions';
  end if;

  insert into project_nodes (project_id, node_type) values (p_project_id, 'world_entry') returning id into v_id;
  insert into world_builder_entries (id, project_id, title, slug, created_by)
    values (v_id, p_project_id, p_title, p_slug, auth.uid());

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Map Maker
-- ---------------------------------------------------------------------------

create table maps (
  id uuid primary key references project_nodes (id) on delete cascade,
  project_id uuid not null references projects (id) on delete cascade,
  name text not null,
  width int not null default 4000,
  height int not null default 4000,
  background_url text,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger maps_set_updated_at
  before update on maps
  for each row execute function set_updated_at();

create table map_objects (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references maps (id) on delete cascade,
  object_type text not null check (object_type in ('marker', 'label')),
  x numeric not null,
  y numeric not null,
  layer_id text not null default 'default',
  data jsonb not null default '{}'::jsonb,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index map_objects_map_id_idx on map_objects (map_id);

create trigger map_objects_set_updated_at
  before update on map_objects
  for each row execute function set_updated_at();

create or replace function sync_map_search_text()
returns trigger
language plpgsql
as $$
begin
  update project_nodes set search_text = new.name where id = new.id;
  return new;
end;
$$;

create trigger maps_sync_search
  after insert or update on maps
  for each row execute function sync_map_search_text();

create or replace function create_map(p_project_id uuid, p_name text)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_id uuid;
begin
  if not has_project_role(p_project_id, 'editor') then
    raise exception 'insufficient permissions';
  end if;

  insert into project_nodes (project_id, node_type) values (p_project_id, 'map') returning id into v_id;
  insert into maps (id, project_id, name, created_by) values (v_id, p_project_id, p_name, auth.uid());

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------

create table campaigns (
  id uuid primary key references project_nodes (id) on delete cascade,
  project_id uuid not null references projects (id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger campaigns_set_updated_at
  before update on campaigns
  for each row execute function set_updated_at();

create table campaign_members (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role text not null check (role in ('game_master', 'player')),
  joined_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);

create or replace function sync_campaign_search_text()
returns trigger
language plpgsql
as $$
begin
  update project_nodes set search_text = new.name || ' ' || coalesce(new.description, '') where id = new.id;
  return new;
end;
$$;

create trigger campaigns_sync_search
  after insert or update on campaigns
  for each row execute function sync_campaign_search_text();

create or replace function create_campaign(p_project_id uuid, p_name text, p_description text)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_id uuid;
begin
  if not has_project_role(p_project_id, 'game_master') then
    raise exception 'insufficient permissions';
  end if;

  insert into project_nodes (project_id, node_type) values (p_project_id, 'campaign') returning id into v_id;
  insert into campaigns (id, project_id, name, description, created_by)
    values (v_id, p_project_id, p_name, p_description, auth.uid());
  insert into campaign_members (campaign_id, user_id, role) values (v_id, auth.uid(), 'game_master');

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Realtime CRDT document persistence (Hocuspocus)
-- ---------------------------------------------------------------------------

create table yjs_documents (
  doc_name text primary key,
  doc_type text not null,
  project_id uuid not null references projects (id) on delete cascade,
  state bytea not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin-managed platform content (proves code vs. content update split)
-- ---------------------------------------------------------------------------

create table admin_users (
  user_id uuid primary key references profiles (id) on delete cascade,
  granted_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

create table content_items (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'announcement',
  title text not null,
  body jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  version int not null default 1,
  published_at timestamptz,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger content_items_set_updated_at
  before update on content_items
  for each row execute function set_updated_at();

create table content_item_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references content_items (id) on delete cascade,
  version int not null,
  title text not null,
  body jsonb not null,
  edited_by uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create or replace function snapshot_content_item_version()
returns trigger
language plpgsql
as $$
begin
  insert into content_item_versions (content_item_id, version, title, body, edited_by)
    values (old.id, old.version, old.title, old.body, auth.uid());
  new.version = old.version + 1;
  return new;
end;
$$;

create trigger content_items_snapshot_before_update
  before update on content_items
  for each row
  when (old.title is distinct from new.title or old.body is distinct from new.body)
  execute function snapshot_content_item_version();

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table invitations enable row level security;
alter table project_nodes enable row level security;
alter table world_builder_entries enable row level security;
alter table entry_links enable row level security;
alter table maps enable row level security;
alter table map_objects enable row level security;
alter table campaigns enable row level security;
alter table campaign_members enable row level security;
alter table yjs_documents enable row level security;
alter table admin_users enable row level security;
alter table content_items enable row level security;
alter table content_item_versions enable row level security;
alter table notifications enable row level security;

-- profiles: readable by any authenticated user (needed for member lists), writable only by owner
create policy "profiles readable by authenticated" on profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles writable by owner" on profiles
  for update using (auth.uid() = id);

-- projects: visible/editable to members with sufficient role
create policy "projects readable by members" on projects
  for select using (has_project_role(id, 'viewer'));
create policy "projects insertable by authenticated" on projects
  for insert with check (auth.uid() = owner_id);
create policy "projects updatable by administrator+" on projects
  for update using (has_project_role(id, 'administrator'));

-- project_members: members can see the roster; only administrator+ can manage it
create policy "project_members readable by members" on project_members
  for select using (has_project_role(project_id, 'viewer'));
create policy "project_members manageable by administrator+" on project_members
  for insert with check (has_project_role(project_id, 'administrator'));
create policy "project_members updatable by administrator+" on project_members
  for update using (has_project_role(project_id, 'administrator'));
create policy "project_members deletable by administrator+" on project_members
  for delete using (has_project_role(project_id, 'administrator'));

-- invitations: administrator+ manage; invited user can also see invitations sent to their own email
-- (e.g. for a "pending invitations" list on the dashboard, before they've accepted and become a member)
create policy "invitations readable by administrator+" on invitations
  for select using (has_project_role(project_id, 'administrator'));
create policy "invitations readable by invited email" on invitations
  for select using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy "invitations insertable by administrator+" on invitations
  for insert with check (has_project_role(project_id, 'administrator'));
create policy "invitations updatable by administrator+" on invitations
  for update using (has_project_role(project_id, 'administrator'));

-- project_nodes / typed content: readable by viewer+, writable by editor+ (except campaigns need game_master+)
create policy "project_nodes readable by members" on project_nodes
  for select using (has_project_role(project_id, 'viewer'));

create policy "world_entries readable by members" on world_builder_entries
  for select using (has_project_role(project_id, 'viewer'));
create policy "world_entries writable by editor+" on world_builder_entries
  for update using (has_project_role(project_id, 'editor'));
create policy "world_entries deletable by editor+" on world_builder_entries
  for delete using (has_project_role(project_id, 'editor'));

create policy "entry_links readable by members" on entry_links
  for select using (has_project_role(project_id, 'viewer'));
create policy "entry_links writable by editor+" on entry_links
  for insert with check (has_project_role(project_id, 'editor'));
create policy "entry_links deletable by editor+" on entry_links
  for delete using (has_project_role(project_id, 'editor'));

create policy "maps readable by members" on maps
  for select using (has_project_role(project_id, 'viewer'));
create policy "maps writable by editor+" on maps
  for update using (has_project_role(project_id, 'editor'));
create policy "maps deletable by editor+" on maps
  for delete using (has_project_role(project_id, 'editor'));

create policy "map_objects readable by members" on map_objects
  for select using (has_project_role((select project_id from maps where maps.id = map_objects.map_id), 'viewer'));
create policy "map_objects writable by editor+" on map_objects
  for all using (has_project_role((select project_id from maps where maps.id = map_objects.map_id), 'editor'));

create policy "campaigns readable by members" on campaigns
  for select using (has_project_role(project_id, 'viewer'));
create policy "campaigns writable by game_master+" on campaigns
  for update using (has_project_role(project_id, 'game_master'));
create policy "campaigns deletable by administrator+" on campaigns
  for delete using (has_project_role(project_id, 'administrator'));

create policy "campaign_members readable by project members" on campaign_members
  for select using (has_project_role((select project_id from campaigns where campaigns.id = campaign_members.campaign_id), 'viewer'));
create policy "campaign_members manageable by game_master+" on campaign_members
  for all using (has_project_role((select project_id from campaigns where campaigns.id = campaign_members.campaign_id), 'game_master'));

-- yjs_documents: no direct client access; only the realtime-sync server (service role) touches this table
create policy "yjs_documents no client access" on yjs_documents
  for all using (false);

-- admin_users: only readable/manageable by existing admins (service role seeds the first admin)
create policy "admin_users readable by admins" on admin_users
  for select using (is_admin());

-- content_items: public reads only see published; admins see/manage everything
create policy "content_items published readable by anyone" on content_items
  for select using (status = 'published' or is_admin());
create policy "content_items manageable by admins" on content_items
  for insert with check (is_admin());
create policy "content_items updatable by admins" on content_items
  for update using (is_admin());
create policy "content_items deletable by admins" on content_items
  for delete using (is_admin());

create policy "content_item_versions readable by admins" on content_item_versions
  for select using (is_admin());

-- notifications: strictly per-user
create policy "notifications readable by owner" on notifications
  for select using (auth.uid() = user_id);
create policy "notifications updatable by owner" on notifications
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Realtime: opt in the tables clients subscribe to via Postgres Changes.
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table content_items;
alter publication supabase_realtime add table notifications;
