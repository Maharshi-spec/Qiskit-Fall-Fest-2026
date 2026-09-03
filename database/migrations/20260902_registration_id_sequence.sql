CREATE SEQUENCE IF NOT EXISTS registrations_registration_id_seq
    AS BIGINT
    INCREMENT BY 1
    START WITH 1
    OWNED BY NONE;

SELECT setval(
    'registrations_registration_id_seq',
    COALESCE(max_registration_number, 1),
    max_registration_number IS NOT NULL
)
FROM (
    SELECT MAX(
        CAST(
            regexp_replace(
                registration_id,
                '^QFF26-R-',
                '',
                'g'
            ) AS BIGINT
        )
    ) AS max_registration_number
    FROM registrations
    WHERE registration_id ~ '^QFF26-R-[0-9]+$'
) AS registration_numbers;
