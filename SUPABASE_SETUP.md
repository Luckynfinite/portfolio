# Supabase Setup

## 1. Create the project

1. Create a Supabase project.
2. In `Authentication > Users`, create the admin account that will log into the dashboard.
3. In `SQL Editor`, run [`supabase/schema.sql`](./supabase/schema.sql).

## 2. Grant the admin role

After the admin user exists, run this query once and replace the email:

```sql
insert into public.admin_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'admin@example.com'
on conflict (user_id) do update set role = excluded.role;
```

Without this row, the account can authenticate but will still be blocked from `/admin`.

## 3. Configure local environment

1. Copy `.env.example` to `.env`.
2. Fill these variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_SUPABASE_SITE_KEY=main
VITE_SUPABASE_ASSETS_BUCKET=portfolio-assets
VITE_SUPABASE_DOCUMENTS_BUCKET=portfolio-documents
```

3. Restart the dev server after changing env vars.

## 4. What this schema provides

- Dedicated tables for `profile`, `settings`, `projects`, `skills`, `experiences`, `certifications`, `services`, and `messages`
- `admin_roles` table plus role-aware RLS
- Public read access only for content meant to be visible
- Admin-only CRUD for dashboard resources
- Public insert only for contact messages
- Supabase Storage buckets for images and PDF files
- A best-effort migration block from the previous JSON-based `portfolio_sites` setup

## 5. Authentication flow now expected

- `/admin` checks the Supabase session immediately
- unauthenticated users are redirected to `/admin/login`
- authenticated users without the `admin` role are blocked
- admin forms are rendered only after auth + role validation

## 6. Vercel deployment

1. Push the project to a Git provider.
2. Import the project into Vercel.
3. Choose the `Vite` framework preset.
4. Add the same environment variables from `.env`.
5. Deploy.

## 7. Recommended Supabase settings

- `Authentication > URL Configuration`
  - Set the site URL to your production domain.
  - Add preview domains if you use Vercel preview deployments.
- `Storage`
  - Keep `portfolio-assets` and `portfolio-documents` public only if direct public file access is desired.
- `Database`
  - Keep the SQL schema as the source of truth for future environments.
