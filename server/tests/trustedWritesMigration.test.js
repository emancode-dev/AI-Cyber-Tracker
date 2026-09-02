import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(here, "../../supabase/migrations/202609010009_trust_evidence_lifecycle.sql");
const sql = fs.readFileSync(migrationPath, "utf8");

test("hardening migration revokes authenticated mutation of scanner-owned records", () => {
  for (const table of ["scans", "findings", "ai_reports", "score_history"]) {
    assert.match(sql, new RegExp(`revoke insert, update, delete on public\\.${table} from authenticated`, "i"));
  }
  assert.match(sql, /grant select, insert, update, delete on public\.scans[\s\S]*to service_role/i);
});

test("durable lifecycle history stores minimal finding metadata rather than raw evidence", () => {
  const tableBlock = sql.match(/create table if not exists public\.finding_history \([\s\S]*?\n\);/i)?.[0] || "";
  assert.match(tableBlock, /finding_code text not null/i);
  assert.match(tableBlock, /lifecycle_state text not null/i);
  assert.doesNotMatch(tableBlock, /raw_header|raw_cookie|response_body|authorization/i);
});
