-- Schema da agendinha (idempotente). Aplicar com a conexão direta (DATABASE_URL_UNPOOLED):
--   npm run db:migrate

CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  time        TIME,
  type        TEXT NOT NULL CHECK (type IN ('exam', 'project', 'studio', 'critique', 'lecture', 'other')),
  notified    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_date_time_idx ON events (date, time);
