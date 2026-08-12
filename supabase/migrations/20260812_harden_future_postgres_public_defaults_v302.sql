-- Future-object least privilege for release 3.0.2 maintenance.
-- Atlas database objects are owned/created by postgres. New tables, sequences
-- and helper functions in public no longer inherit anon/authenticated access;
-- any future public database surface must therefore be granted explicitly.

begin;

alter default privileges for role postgres in schema public revoke all privileges on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all privileges on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated;

alter default privileges for role postgres in schema public grant all privileges on tables to service_role;
alter default privileges for role postgres in schema public grant usage, select, update on sequences to service_role;
alter default privileges for role postgres in schema public grant execute on functions to service_role;

commit;
