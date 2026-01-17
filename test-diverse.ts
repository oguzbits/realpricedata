import { getDiverseMostPopular } from "./src/lib/product-registry";

async function test() {
  console.log("Testing getDiverseMostPopular...");
  try {
    const products = await getDiverseMostPopular(2, "de");
    console.log(`Found ${products.length} products.`);

    // Group by category to check diversity
    const categories = new Set(products.map((p) => p.category));
    console.log(`Unique categories in result: ${categories.size}`);

    products.slice(0, 5).forEach((p) => {
      console.log(
        `- [${p.category}] ${p.title.substring(0, 40)}... (Rank: ${p.salesRank})`,
      );
    });
  } catch (e) {
    console.error("Test failed:", e);
  }
}

test();
