import { beforeAll, afterAll, beforeEach } from "vitest";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const PSQL = "/opt/homebrew/opt/postgresql@16/bin/psql";

beforeAll(async () => {
  console.log("Setting up test database schema...");
  await execAsync(`${PSQL} -d dmart_test -f scripts/setup-test-db.sql`);
});

beforeEach(async () => {
  console.log("Truncating tables and reseeding...");
  await execAsync(
    `${PSQL} -d dmart_test -c "TRUNCATE artworks, tags, artwork_tag_join, users, session CASCADE"`,
  );
  await execAsync(`${PSQL} -d dmart_test -f scripts/seed-test-data.sql`);
});

afterAll(async () => {
  console.log("Test suite complete");
});
