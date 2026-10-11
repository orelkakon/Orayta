-- Drop the two obsolete tables from the removed manual minyan-reporting feature.
--
-- Scope: ONLY public."MinyanReport" and public."SynagogueContact". Nothing else.
--
-- Pre-checks done read-only against production on 2026-10-11:
--   * row counts: MinyanReport = 0, SynagogueContact = 0
--   * no foreign keys to/from either table, no dependent views/rules, no triggers
--   * no references in code, prisma/schema.prisma or the generated client
--   * objects dropped with them: their own 4 indexes
--       MinyanReport_pkey, MinyanReport_placeId_idx,
--       MinyanReport_placeId_service_dayType_time_kind_reporter_key,
--       SynagogueContact_pkey
--
-- ORDER OF OPERATIONS: deploy the code that removes /api/minyan/reports and
-- /api/minyan/contacts FIRST. Until then the old production build can still
-- insert rows — in which case this script aborts instead of dropping data.
--
-- Safety: runs in one transaction; takes ACCESS EXCLUSIVE locks so no row can
-- be written between the emptiness check and the drop; aborts (and changes
-- nothing) if either table has rows; RESTRICT refuses to drop if any other
-- object depends on a table; idempotent (missing tables are skipped).
--
-- Run (after review, after deploy):
--   npx prisma db execute --file prisma/manual-migrations/2026-10-11_drop_obsolete_minyan_tables.sql --schema prisma/schema.prisma
-- Do NOT use `prisma db push` for this.

BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
DECLARE
  t text;
  n bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY['MinyanReport', 'SynagogueContact'] LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      RAISE NOTICE 'table % does not exist — skipping', t;
      CONTINUE;
    END IF;
    EXECUTE format('LOCK TABLE public.%I IN ACCESS EXCLUSIVE MODE', t);
    EXECUTE format('SELECT count(*) FROM public.%I', t) INTO n;
    IF n <> 0 THEN
      RAISE EXCEPTION 'aborting: table % has % row(s) — nothing was dropped', t, n;
    END IF;
  END LOOP;

  FOREACH t IN ARRAY ARRAY['MinyanReport', 'SynagogueContact'] LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      EXECUTE format('DROP TABLE public.%I RESTRICT', t);
      RAISE NOTICE 'dropped table %', t;
    END IF;
  END LOOP;
END $$;

COMMIT;
