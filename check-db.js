import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "backend/database/quran_roots_dual_v2.sqlite");

const client = createClient({
  url: `file:${dbPath}`,
});

async function checkTables() {
  try {
    console.log(`Checking database at: ${dbPath}`);
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("📂 Tables found in database:");
    console.table(result.rows);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

checkTables();