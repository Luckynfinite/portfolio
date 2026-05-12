create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  site_key text not null unique default 'main',
  full_name text not null default '',
  headline text not null default '',
  hero_badge text not null default '',
  location text not null default '',
  email text not null default '',
  phone text not null default '',
  github_url text not null default '',
  linkedin_url text not null default '',
  availability text not null default '',
  short_bio text not null default '',
  bio_markdown text not null default '',
  avatar_url text not null default '',
  resume_url text not null default '',
  resume_file_name text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  site_key text not null unique default 'main',
  site_name text not null default 'Portfolio',
  site_tagline text not null default '',
  hero_eyebrow text not null default '',
  hero_intro text not null default '',
  contact_title text not null default 'Parlons de votre projet',
  contact_message text not null default '',
  contact_email_subject text not null default 'Prise de contact portfolio',
  footer_note text not null default '',
  primary_cta_label text not null default 'Voir les projets',
  primary_cta_url text not null default '#projects',
  secondary_cta_label text not null default 'Me contacter',
  secondary_cta_url text not null default '#contact',
  theme_accent text not null default '#2563eb',
  seo_title text not null default 'Portfolio professionnel',
  seo_description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'main',
  name text not null,
  category text not null default '',
  level integer not null default 75 check (level between 0 and 100),
  icon text not null default 'sparkles',
  color text not null default '#2563eb',
  description text not null default '',
  tags text[] not null default '{}'::text[],
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'main',
  title text not null,
  summary text not null default '',
  description text not null default '',
  technologies text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  image_url text not null default '',
  github_url text not null default '',
  demo_url text not null default '',
  category text not null default '',
  status text not null default 'En cours',
  project_date date,
  featured boolean not null default false,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'main',
  role_title text not null,
  company text not null default '',
  location text not null default '',
  start_date date,
  end_date date,
  is_current boolean not null default false,
  summary text not null default '',
  description text not null default '',
  technologies text[] not null default '{}'::text[],
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'main',
  name text not null,
  issuer text not null default '',
  issue_date date,
  expiry_date date,
  credential_id text not null default '',
  credential_url text not null default '',
  status text not null default 'Active',
  description text not null default '',
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'main',
  title text not null,
  summary text not null default '',
  description text not null default '',
  icon text not null default 'briefcase-business',
  color text not null default '#2563eb',
  tags text[] not null default '{}'::text[],
  featured boolean not null default false,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'main',
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  company text not null default '',
  status text not null default 'new' check (status in ('new', 'reading', 'answered', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

grant usage on schema public to anon, authenticated;

grant select on public.profile to anon, authenticated;
grant select on public.settings to anon, authenticated;
grant select on public.skills to anon, authenticated;
grant select on public.projects to anon, authenticated;
grant select on public.experiences to anon, authenticated;
grant select on public.certifications to anon, authenticated;
grant select on public.services to anon, authenticated;

grant select on public.admin_roles to authenticated;

grant insert, update, delete on public.profile to authenticated;
grant insert, update, delete on public.settings to authenticated;
grant insert, update, delete on public.skills to authenticated;
grant insert, update, delete on public.projects to authenticated;
grant insert, update, delete on public.experiences to authenticated;
grant insert, update, delete on public.certifications to authenticated;
grant insert, update, delete on public.services to authenticated;
grant insert, update, delete on public.admin_roles to authenticated;

grant insert on public.messages to anon, authenticated;
grant select, update, delete on public.messages to authenticated;

create index if not exists idx_skills_site_order on public.skills (site_key, sort_order, created_at);
create index if not exists idx_projects_site_order on public.projects (site_key, sort_order, project_date desc, created_at desc);
create index if not exists idx_experiences_site_order on public.experiences (site_key, sort_order, start_date desc, created_at desc);
create index if not exists idx_certifications_site_order on public.certifications (site_key, sort_order, issue_date desc, created_at desc);
create index if not exists idx_services_site_order on public.services (site_key, sort_order, created_at);
create index if not exists idx_messages_site_status on public.messages (site_key, status, created_at desc);

drop trigger if exists trg_profile_updated_at on public.profile;
create trigger trg_profile_updated_at before update on public.profile for each row execute function public.touch_updated_at();

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at before update on public.settings for each row execute function public.touch_updated_at();

drop trigger if exists trg_skills_updated_at on public.skills;
create trigger trg_skills_updated_at before update on public.skills for each row execute function public.touch_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at before update on public.projects for each row execute function public.touch_updated_at();

drop trigger if exists trg_experiences_updated_at on public.experiences;
create trigger trg_experiences_updated_at before update on public.experiences for each row execute function public.touch_updated_at();

drop trigger if exists trg_certifications_updated_at on public.certifications;
create trigger trg_certifications_updated_at before update on public.certifications for each row execute function public.touch_updated_at();

drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at before update on public.services for each row execute function public.touch_updated_at();

drop trigger if exists trg_messages_updated_at on public.messages;
create trigger trg_messages_updated_at before update on public.messages for each row execute function public.touch_updated_at();

alter table public.admin_roles enable row level security;
alter table public.profile enable row level security;
alter table public.settings enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.experiences enable row level security;
alter table public.certifications enable row level security;
alter table public.services enable row level security;
alter table public.messages enable row level security;

drop policy if exists "admin_roles_select_self" on public.admin_roles;
create policy "admin_roles_select_self"
on public.admin_roles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin_roles_admin_all" on public.admin_roles;
create policy "admin_roles_admin_all"
on public.admin_roles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "profile_public_read" on public.profile;
create policy "profile_public_read"
on public.profile
for select
to anon, authenticated
using (true);

drop policy if exists "profile_admin_all" on public.profile;
create policy "profile_admin_all"
on public.profile
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read"
on public.settings
for select
to anon, authenticated
using (true);

drop policy if exists "settings_admin_all" on public.settings;
create policy "settings_admin_all"
on public.settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read"
on public.skills
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "skills_admin_all" on public.skills;
create policy "skills_admin_all"
on public.skills
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
on public.projects
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "projects_admin_all" on public.projects;
create policy "projects_admin_all"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "experiences_public_read" on public.experiences;
create policy "experiences_public_read"
on public.experiences
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "experiences_admin_all" on public.experiences;
create policy "experiences_admin_all"
on public.experiences
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "certifications_public_read" on public.certifications;
create policy "certifications_public_read"
on public.certifications
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "certifications_admin_all" on public.certifications;
create policy "certifications_admin_all"
on public.certifications
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "services_public_read" on public.services;
create policy "services_public_read"
on public.services
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "services_admin_all" on public.services;
create policy "services_admin_all"
on public.services
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "messages_public_insert" on public.messages;
create policy "messages_public_insert"
on public.messages
for insert
to anon, authenticated
with check (coalesce(company, '') = '');

drop policy if exists "messages_admin_read" on public.messages;
create policy "messages_admin_read"
on public.messages
for select
to authenticated
using (public.is_admin());

drop policy if exists "messages_admin_update" on public.messages;
create policy "messages_admin_update"
on public.messages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "messages_admin_delete" on public.messages;
create policy "messages_admin_delete"
on public.messages
for delete
to authenticated
using (public.is_admin());

insert into public.profile (site_key)
values ('main')
on conflict (site_key) do nothing;

insert into public.settings (site_key)
values ('main')
on conflict (site_key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio-assets', 'portfolio-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('portfolio-documents', 'portfolio-documents', true, 10485760, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "public_read_portfolio_storage" on storage.objects;
create policy "public_read_portfolio_storage"
on storage.objects
for select
to public
using (bucket_id in ('portfolio-assets', 'portfolio-documents'));

drop policy if exists "admin_insert_portfolio_storage" on storage.objects;
create policy "admin_insert_portfolio_storage"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('portfolio-assets', 'portfolio-documents')
  and public.is_admin()
);

drop policy if exists "admin_update_portfolio_storage" on storage.objects;
create policy "admin_update_portfolio_storage"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('portfolio-assets', 'portfolio-documents')
  and public.is_admin()
)
with check (
  bucket_id in ('portfolio-assets', 'portfolio-documents')
  and public.is_admin()
);

drop policy if exists "admin_delete_portfolio_storage" on storage.objects;
create policy "admin_delete_portfolio_storage"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('portfolio-assets', 'portfolio-documents')
  and public.is_admin()
);

do $$
declare
  legacy_content jsonb;
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'portfolio_sites'
  ) then
    select content
    into legacy_content
    from public.portfolio_sites
    where site_key = 'main'
    order by updated_at desc nulls last
    limit 1;

    if legacy_content is not null then
      update public.profile
      set
        full_name = coalesce(nullif(legacy_content -> 'profile' ->> 'name', ''), full_name),
        headline = coalesce(nullif(legacy_content -> 'profile' ->> 'role', ''), headline),
        hero_badge = coalesce(nullif(legacy_content -> 'profile' ->> 'badge', ''), hero_badge),
        location = coalesce(nullif(legacy_content -> 'profile' ->> 'location', ''), location),
        email = coalesce(nullif(legacy_content -> 'profile' ->> 'email', ''), email),
        phone = coalesce(nullif(legacy_content -> 'profile' ->> 'phone', ''), phone),
        github_url = coalesce(nullif(legacy_content -> 'profile' ->> 'github', ''), github_url),
        linkedin_url = coalesce(nullif(legacy_content -> 'profile' ->> 'linkedin', ''), linkedin_url),
        availability = coalesce(nullif(legacy_content -> 'profile' ->> 'availabilityStatus', ''), availability),
        short_bio = coalesce(nullif(legacy_content -> 'profile' ->> 'intro', ''), short_bio),
        bio_markdown = coalesce(nullif(legacy_content -> 'profile' ->> 'narrative', ''), bio_markdown),
        avatar_url = coalesce(nullif(legacy_content -> 'profile' ->> 'avatarUrl', ''), avatar_url),
        resume_url = coalesce(nullif(legacy_content -> 'resume' ->> 'href', ''), resume_url),
        resume_file_name = coalesce(nullif(legacy_content -> 'resume' ->> 'fileName', ''), resume_file_name)
      where site_key = 'main';

      update public.settings
      set
        site_name = coalesce(nullif(legacy_content -> 'profile' ->> 'shortName', ''), nullif(legacy_content -> 'profile' ->> 'name', ''), site_name),
        site_tagline = coalesce(nullif(legacy_content -> 'profile' ->> 'role', ''), site_tagline),
        hero_eyebrow = coalesce(nullif(legacy_content -> 'profile' ->> 'badge', ''), hero_eyebrow),
        hero_intro = coalesce(nullif(legacy_content -> 'profile' ->> 'intro', ''), hero_intro),
        contact_title = coalesce(nullif(legacy_content -> 'contact' ->> 'title', ''), contact_title),
        contact_message = coalesce(nullif(legacy_content -> 'contact' ->> 'message', ''), contact_message),
        contact_email_subject = coalesce(nullif(legacy_content -> 'contact' ->> 'emailSubject', ''), contact_email_subject)
      where site_key = 'main';

      if not exists (select 1 from public.skills where site_key = 'main') then
        insert into public.skills (site_key, name, category, level, icon, color, description, tags, is_visible, sort_order)
        select
          'main',
          coalesce(nullif(item ->> 'domain', ''), nullif(item ->> 'name', ''), 'Competence'),
          coalesce(nullif(item ->> 'signal', ''), nullif(item ->> 'category', ''), 'General'),
          case
            when coalesce(item ->> 'level', '') ~ '^\d+$' then greatest(0, least(100, (item ->> 'level')::integer))
            else 75
          end,
          coalesce(nullif(item ->> 'icon', ''), 'sparkles'),
          coalesce(nullif(item ->> 'color', ''), '#2563eb'),
          coalesce(nullif(item ->> 'focus', ''), nullif(item ->> 'description', ''), ''),
          coalesce(
            (
              select array_agg(value)
              from jsonb_array_elements_text(coalesce(item -> 'items', item -> 'tags', '[]'::jsonb)) as tags(value)
            ),
            '{}'::text[]
          ),
          true,
          ordinality::integer - 1
        from jsonb_array_elements(coalesce(legacy_content -> 'skills', '[]'::jsonb)) with ordinality as skills(item, ordinality);
      end if;

      if not exists (select 1 from public.projects where site_key = 'main') then
        insert into public.projects (
          site_key,
          title,
          summary,
          description,
          technologies,
          tags,
          image_url,
          github_url,
          demo_url,
          category,
          status,
          featured,
          is_visible,
          sort_order
        )
        select
          'main',
          coalesce(nullif(item ->> 'title', ''), 'Projet'),
          coalesce(nullif(item ->> 'summary', ''), nullif(item ->> 'subtitle', ''), ''),
          coalesce(nullif(item ->> 'impact', ''), nullif(item ->> 'summary', ''), ''),
          coalesce(
            (
              select array_agg(value)
              from jsonb_array_elements_text(coalesce(item -> 'technologies', '[]'::jsonb)) as technologies(value)
            ),
            '{}'::text[]
          ),
          coalesce(
            (
              select array_agg(value)
              from jsonb_array_elements_text(coalesce(item -> 'highlights', item -> 'tags', '[]'::jsonb)) as tags(value)
            ),
            '{}'::text[]
          ),
          coalesce(nullif(item ->> 'imageUrl', ''), nullif(item ->> 'image_url', ''), ''),
          coalesce(nullif(item -> 'links' ->> 'github', ''), nullif(item ->> 'github_url', ''), ''),
          coalesce(nullif(item -> 'links' ->> 'demo', ''), nullif(item ->> 'demo_url', ''), ''),
          coalesce(nullif(item ->> 'category', ''), ''),
          coalesce(nullif(item ->> 'status', ''), 'En cours'),
          coalesce((item ->> 'featured')::boolean, false),
          true,
          ordinality::integer - 1
        from jsonb_array_elements(coalesce(legacy_content -> 'projects', '[]'::jsonb)) with ordinality as projects(item, ordinality);
      end if;

      if not exists (select 1 from public.experiences where site_key = 'main') then
        insert into public.experiences (
          site_key,
          role_title,
          company,
          location,
          summary,
          description,
          technologies,
          is_visible,
          sort_order
        )
        select
          'main',
          coalesce(nullif(item ->> 'title', ''), 'Experience'),
          coalesce(nullif(item ->> 'organisation', ''), nullif(item ->> 'company', ''), ''),
          coalesce(nullif(item ->> 'location', ''), ''),
          coalesce(nullif(item ->> 'description', ''), ''),
          coalesce(nullif(item ->> 'description', ''), ''),
          coalesce(
            (
              select array_agg(value)
              from jsonb_array_elements_text(coalesce(item -> 'chips', item -> 'technologies', '[]'::jsonb)) as technologies(value)
            ),
            '{}'::text[]
          ),
          true,
          ordinality::integer - 1
        from jsonb_array_elements(coalesce(legacy_content -> 'journey', '[]'::jsonb)) with ordinality as journey(item, ordinality);
      end if;

      if not exists (select 1 from public.certifications where site_key = 'main') then
        insert into public.certifications (
          site_key,
          name,
          issuer,
          issue_date,
          status,
          description,
          is_visible,
          sort_order
        )
        select
          'main',
          coalesce(nullif(item ->> 'title', ''), 'Certification'),
          coalesce(nullif(item ->> 'issuer', ''), ''),
          case
            when coalesce(item ->> 'year', '') ~ '^\d{4}$' then make_date((item ->> 'year')::integer, 1, 1)
            else null
          end,
          'Active',
          coalesce(nullif(item ->> 'code', ''), nullif(item ->> 'description', ''), ''),
          true,
          ordinality::integer - 1
        from jsonb_array_elements(coalesce(legacy_content -> 'certifications', '[]'::jsonb)) with ordinality as certifications(item, ordinality);
      end if;
    end if;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'contact_messages'
  ) and not exists (select 1 from public.messages where site_key = 'main') then
    insert into public.messages (site_key, name, email, subject, message, company, status, metadata, created_at, updated_at)
    select
      coalesce(site_key, 'main'),
      name,
      email,
      subject,
      message,
      company,
      case
        when status in ('new', 'reading', 'answered', 'archived') then status
        else 'new'
      end,
      coalesce(metadata, '{}'::jsonb),
      created_at,
      created_at
    from public.contact_messages;
  end if;
end;
$$;
