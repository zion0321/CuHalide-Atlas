-- Keep CuXplore query snapshots fresh after corpus/processing updates.
-- The refresh function remains callable manually; this cron is a bounded maintenance backstop.

do $$
declare
  existing_job record;
begin
  for existing_job in
    select jobid
    from cron.job
    where jobname = 'cuxplore-query-snapshot-refresh'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;
end
$$;

select cron.schedule(
  'cuxplore-query-snapshot-refresh',
  '37 * * * *',
  $cron$
    select atlas_internal.cuxplore_refresh_query_snapshots_v1();
  $cron$
);
