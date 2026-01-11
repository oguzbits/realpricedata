import { importAllCategories } from "@/lib/keepa/sync-service";

async function main() {
  console.log("Starting import test...");

  if (!process.env.KEEPA_API_KEY) {
    console.error("KEEPA_API_KEY is missing!");
    process.exit(1);
  }

  // Force local DB logic if needed, but drizzle config handles it.
  // We will run this with TURSO_DATABASE_URL=""

  try {
    const result = await importAllCategories(1);
    console.log("Import result:", JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

main();
