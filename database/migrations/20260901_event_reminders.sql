CREATE TABLE IF NOT EXISTS event_reminders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  registration_id VARCHAR(32) NOT NULL REFERENCES registrations(registration_id) ON DELETE CASCADE,
  day_number SMALLINT NOT NULL CHECK (day_number BETWEEN 1 AND 4),
  event_date DATE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SENT')),
  sent_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (registration_id, day_number)
);

CREATE INDEX IF NOT EXISTS event_reminders_due_idx
  ON event_reminders (scheduled_at, id)
  WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS event_reminders_registration_idx
  ON event_reminders (registration_id);
