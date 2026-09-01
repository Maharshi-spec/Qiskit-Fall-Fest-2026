CREATE SEQUENCE IF NOT EXISTS registrations_id_seq;

CREATE TABLE IF NOT EXISTS registrations (
  id BIGINT PRIMARY KEY DEFAULT nextval('registrations_id_seq'),
  registration_id VARCHAR(32) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  mobile_number VARCHAR(32) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'PROFESSIONAL', 'OTHER')),
  institute_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  knows_python BOOLEAN NOT NULL DEFAULT FALSE,
  aicte_quantum_course BOOLEAN NOT NULL DEFAULT FALSE,
  knows_quantum_basics BOOLEAN NOT NULL DEFAULT FALSE,
  used_qiskit_before BOOLEAN NOT NULL DEFAULT FALSE,
  id_card_url TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);