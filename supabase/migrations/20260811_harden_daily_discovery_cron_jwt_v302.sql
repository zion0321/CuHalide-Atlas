-- CuHalide Atlas release 3.0.2 literature-monitor hardening.
-- Secret values are deliberately not version-controlled. The deployment environment must contain:
--   vault secret cuhalide_atlas_cron_anon_jwt  (platform JWT gate)
--   vault secret cuhalide_atlas_cron_token     (private second factor)

do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid
  from cron.job
  where jobname = 'cuhalide-atlas-daily-discovery'
  limit 1;

  if v_jobid is null then
    raise exception 'cuhalide-atlas-daily-discovery cron job not found';
  end if;

  perform cron.alter_job(
    v_jobid,
    schedule := '17 2 * * *',
    command := $cmd$
      select net.http_post(
        url := 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas',
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='cuhalide_atlas_cron_anon_jwt' limit 1),
          'apikey',(select decrypted_secret from vault.decrypted_secrets where name='cuhalide_atlas_cron_anon_jwt' limit 1),
          'x-cuhalide-cron-token',(select decrypted_secret from vault.decrypted_secrets where name='cuhalide_atlas_cron_token' limit 1)
        ),
        body := jsonb_build_object('action','sync','days',30,'source','scheduled-cron'),
        timeout_milliseconds := 120000
      );
    $cmd$,
    active := true
  );
end $$;
