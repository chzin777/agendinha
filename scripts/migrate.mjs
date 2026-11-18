import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED/DATABASE_URL não definida");
  process.exit(1);
}

const schemas = ["../db/schema.sql", "../db/auth-schema.sql", "../db/ownership.sql"].map((file) =>
  readFileSync(new URL(file, import.meta.url), "utf8"),
);
const pool = new Pool({ connectionString: url });
const enforceOwnership = process.argv.includes("--enforce-ownership");

try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (enforceOwnership) {
      await client.query('LOCK TABLE events, notebooks IN ACCESS EXCLUSIVE MODE');
    }
    for (const schema of schemas) {
      await client.query(schema);
    }
    if (enforceOwnership) {
      await client.query("ALTER TABLE events ALTER COLUMN owner_id SET NOT NULL");
      await client.query("ALTER TABLE notebooks ALTER COLUMN owner_id SET NOT NULL");
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  console.log("Schema aplicado com sucesso.");
} finally {
  await pool.end();
}
