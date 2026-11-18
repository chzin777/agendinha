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

-- Cadernos (bloco de notas)
CREATE TABLE IF NOT EXISTS notebooks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT NOT NULL DEFAULT 'primary',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notebook_pages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notebook_pages_notebook_idx ON notebook_pages (notebook_id, position);
