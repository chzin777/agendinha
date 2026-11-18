import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED/DATABASE_URL não definida");
  process.exit(1);
}

const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
const pool = new Pool({ connectionString: url });

try {
  await pool.query(schema);
  console.log("Schema aplicado com sucesso.");
} finally {
  await pool.end();
}
