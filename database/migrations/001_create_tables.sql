-- Hewtûjmêr notes and reminders schema
-- Run this file manually in the target hewtujmer PostgreSQL database.
-- No calendar or cultural-event data is stored in PostgreSQL.

BEGIN;

CREATE TABLE IF NOT EXISTS notes (
    id UUID NOT NULL,
    owner_id UUID NOT NULL,
    text VARCHAR(2000) NOT NULL CHECK (length(btrim(text)) BETWEEN 1 AND 2000),
    reminder_date DATE,
    reminder_time TIME,
    remind_before_minutes INTEGER NOT NULL DEFAULT 0
        CHECK (remind_before_minutes BETWEEN 0 AND 10080),
    reminder_shown_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notes_pkey PRIMARY KEY (id),
    CONSTRAINT notes_id_owner_unique UNIQUE (id, owner_id),
    CONSTRAINT notes_reminder_time_requires_date CHECK (
        reminder_time IS NULL OR reminder_date IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_notes_owner_date
    ON notes (owner_id, reminder_date, reminder_time);

CREATE TABLE IF NOT EXISTS reminders (
    id UUID NOT NULL,
    owner_id UUID NOT NULL,
    title VARCHAR(180) NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 180),
    description VARCHAR(2000) NOT NULL DEFAULT '',
    reminder_date DATE NOT NULL,
    reminder_time TIME NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    remind_before_minutes INTEGER NOT NULL DEFAULT 0
        CHECK (remind_before_minutes BETWEEN 0 AND 10080),
    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_shown_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reminders_pkey PRIMARY KEY (id),
    CONSTRAINT reminders_id_owner_unique UNIQUE (id, owner_id)
);

CREATE INDEX IF NOT EXISTS idx_reminders_owner_date
    ON reminders (owner_id, reminder_date, reminder_time);

COMMIT;
