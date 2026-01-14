import { createClient } from "@libsql/client";

async function check() {
  const client = createClient({
    url: "libsql://cleverprices-oguzbits.aws-eu-west-1.turso.io",
    authToken:
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgwODE4MzcsImlkIjoiZmNkNWE5MDMtODA5ZS00NTQzLThkNzUtMmM1MTAxOGRjM2U5IiwicmlkIjoiZTNkNGMyNWItOWNiNi00NzAyLWI2NjAtNmZhZTJmZTViZTBiIn0.TmkUhRzyULLPOf2AxtFOffA9TwwX4vuWj6VvL5-8KVwg4C2xb5WHZuAwtLWCeFjwA8JMpTVNmIqfDEKnroSgAw",
  });

  const query = `
    SELECT p.category, count(*) as count 
    FROM products p 
    JOIN prices pr ON p.id = pr.product_id 
    WHERE pr.country = 'de' AND (pr.amazon_price > 0 OR pr.new_price > 0)
    GROUP BY p.category
  `;

  const res = await client.execute(query);
  console.table(res.rows);
}

check().catch(console.error);
