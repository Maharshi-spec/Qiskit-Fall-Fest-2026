BEGIN;

CREATE SEQUENCE IF NOT EXISTS certificates_certificate_number_seq
    AS BIGINT
    START WITH 1
    INCREMENT BY 1
    OWNED BY NONE;

DO $$
DECLARE
  invalid_certificate_numbers TEXT;
BEGIN
  SELECT string_agg(quote_literal(certificate_number), ', ' ORDER BY certificate_number)
  INTO invalid_certificate_numbers
  FROM certificates
  WHERE certificate_number IS NOT NULL
    AND certificate_number !~ '^QFF26-C-[0-9]+$';

  IF invalid_certificate_numbers IS NOT NULL THEN
    RAISE EXCEPTION
      'Cannot initialize certificate number sequence: invalid certificate_number value(s): %',
      invalid_certificate_numbers;
  END IF;
END
$$;

DO $$
DECLARE
  max_certificate_number BIGINT;
BEGIN
  SELECT MAX(
    CAST(regexp_replace(certificate_number, '^QFF26-C-', '') AS BIGINT)
  )
  INTO max_certificate_number
  FROM certificates
  WHERE certificate_number IS NOT NULL;

  IF max_certificate_number IS NULL THEN
    -- is_called = false makes the first nextval() return 1.
    PERFORM setval(
      'certificates_certificate_number_seq'::regclass,
      1,
      false
    );
  ELSE
    -- is_called = true makes the next nextval() return max + 1.
    PERFORM setval(
      'certificates_certificate_number_seq'::regclass,
      max_certificate_number,
      true
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('certificates_certificate_number_seq') IS NULL THEN
    RAISE EXCEPTION 'Certificate number sequence was not created.';
  END IF;
END
$$;

COMMIT;
