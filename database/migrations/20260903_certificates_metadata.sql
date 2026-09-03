BEGIN;

ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS event_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS template_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS verification_code VARCHAR(64);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'certificates'::regclass
      AND conname = 'certificates_event_id_fkey'
  ) THEN
    ALTER TABLE certificates
      ADD CONSTRAINT certificates_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES events(event_id);
  END IF;
END
$$;

DO $$
DECLARE
  duplicate_report TEXT;
BEGIN
  SELECT string_agg(
    format('(verification_code=%L, count=%s)', verification_code, duplicate_count),
    '; '
    ORDER BY verification_code
  )
  INTO duplicate_report
  FROM (
    SELECT verification_code, COUNT(*) AS duplicate_count
    FROM certificates
    WHERE verification_code IS NOT NULL
    GROUP BY verification_code
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_report IS NOT NULL THEN
    RAISE EXCEPTION
      'Cannot add certificate verification-code uniqueness: duplicate non-NULL values exist: %',
      duplicate_report;
  END IF;
END
$$;

DO $$
DECLARE
  duplicate_report TEXT;
BEGIN
  SELECT string_agg(
    format('(registration_id=%s, event_id=%L, certificate_type=%L, count=%s)', registration_id, event_id, certificate_type, duplicate_count),
    '; '
    ORDER BY registration_id, event_id, certificate_type
  )
  INTO duplicate_report
  FROM (
    SELECT registration_id, event_id, certificate_type, COUNT(*) AS duplicate_count
    FROM certificates
    WHERE event_id IS NOT NULL
    GROUP BY registration_id, event_id, certificate_type
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_report IS NOT NULL THEN
    RAISE EXCEPTION
      'Cannot add certificate duplicate protection: duplicate non-NULL event keys exist: %',
      duplicate_report;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'certificates'::regclass
      AND conname = 'certificates_event_id_fkey'
  ) THEN
    RAISE EXCEPTION 'Expected certificates.event_id foreign key was not created.';
  END IF;
END
$$;

-- A NULL event_id is intentionally excluded so legacy certificates can retain
-- multiple NULL-event rows under PostgreSQL NULL semantics.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index indexrel
    WHERE indexrel.indrelid = 'certificates'::regclass
      AND indexrel.indisunique
      AND indexrel.indkey = ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'certificates'::regclass AND attname = 'registration_id')::int2,
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'certificates'::regclass AND attname = 'event_id')::int2,
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'certificates'::regclass AND attname = 'certificate_type')::int2
      ]::int2vector
      AND pg_get_expr(indexrel.indpred, indexrel.indrelid) = '(event_id IS NOT NULL)'
  ) THEN
    CREATE UNIQUE INDEX certificates_registration_event_type_uidx
      ON certificates (registration_id, event_id, certificate_type)
      WHERE event_id IS NOT NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index indexrel
    WHERE indexrel.indrelid = 'certificates'::regclass
      AND indexrel.indkey = ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'certificates'::regclass AND attname = 'event_id')::int2
      ]::int2vector
  ) THEN
    CREATE INDEX certificates_event_id_idx ON certificates (event_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_index indexrel
    WHERE indexrel.indrelid = 'certificates'::regclass
      AND indexrel.indkey = ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'certificates'::regclass AND attname = 'registration_id')::int2
      ]::int2vector
  ) THEN
    CREATE INDEX certificates_registration_id_idx ON certificates (registration_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index indexrel
    WHERE indexrel.indrelid = 'certificates'::regclass
      AND indexrel.indisunique
      AND indexrel.indkey = ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'certificates'::regclass AND attname = 'verification_code')::int2
      ]::int2vector
  ) THEN
    CREATE UNIQUE INDEX certificates_verification_code_uidx
      ON certificates (verification_code);
  END IF;
END
$$;

COMMIT;
