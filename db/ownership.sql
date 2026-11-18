ALTER TABLE events ADD COLUMN IF NOT EXISTS owner_id TEXT REFERENCES "user"(id);
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS owner_id TEXT REFERENCES "user"(id);

DO $$
DECLARE
  initial_owner TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM events WHERE owner_id IS NULL)
     OR EXISTS (SELECT 1 FROM notebooks WHERE owner_id IS NULL) THEN
    SELECT id INTO initial_owner FROM "user" WHERE username = 'binha';
    IF initial_owner IS NULL THEN
      RAISE EXCEPTION 'A conta binha deve existir antes de migrar os registros existentes';
    END IF;

    UPDATE events SET owner_id = initial_owner WHERE owner_id IS NULL;
    UPDATE notebooks SET owner_id = initial_owner WHERE owner_id IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS events_owner_date_time_idx ON events (owner_id, date, time);
CREATE INDEX IF NOT EXISTS notebooks_owner_updated_idx ON notebooks (owner_id, updated_at DESC);
