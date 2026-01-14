import { createClient } from "@libsql/client";

async function check() {
  const client = createClient({
    url: "libsql://cleverprices-oguzbits.aws-eu-west-1.turso.io",
    authToken:
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgwODE4MzcsImlkIjoiZmNkNWE5MDMtODA5ZS00NTQzLThkNzUtMmM1MTAxOGRjM2U5IiwicmlkIjoiZTNkNGMyNWItOWNiNi00NzAyLWI2NjAtNmZhZTJmZTViZTBiIn0.TmkUhRzyULLPOf2AxtFOffA9TwwX4vuWj6VvL5-8KVwg4C2xb5WHZuAwtLWCeFjwA8JMpTVNmIqfDEKnroSgAw",
  });

  const p = await client.execute(
    "SELECT count(*) as productCount FROM products",
  );
  const pr = await client.execute(
    "SELECT count(*) as priceCount FROM prices WHERE country='de'",
  );

  const cats = await client.execute(
    "SELECT category, count(*) as count FROM products GROUP BY category",
  );

  console.log("Total counts:");
  console.log({
    productCount: p.rows[0].productCount,
    priceCount: pr.rows[0].priceCount,
  });

  console.log("\nCounts per category (products):");
  console.table(cats.rows);
}

check().catch(console.error);
