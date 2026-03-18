-- RLS + Roles bootstrap for VoteChain
-- Apply with your migration runner (drizzle-kit migrate) or manually.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'votechain_anon') then
    create role votechain_anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'votechain_user') then
    create role votechain_user nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'votechain_service') then
    create role votechain_service nologin;
  end if;
end $$;

-- IMPORTANT:
-- Your DB login role (the one in DATABASE_URL) must be granted these roles
-- for `SET LOCAL ROLE votechain_*` to work:
--   grant votechain_anon to <db_login_role>;
--   grant votechain_user to <db_login_role>;
--   grant votechain_service to <db_login_role>;

-- Enable RLS (policies are defined in schema.ts; this ensures it's on even if applied manually)
alter table if exists topics enable row level security;
alter table if exists topic_comments enable row level security;
alter table if exists topic_allowlist enable row level security;
alter table if exists vote_events enable row level security;
alter table if exists vote_snapshots enable row level security;

-- Recommended: lock down default privileges (optional; uncomment if desired)
-- revoke all on all tables in schema public from public;
-- revoke all on all sequences in schema public from public;

