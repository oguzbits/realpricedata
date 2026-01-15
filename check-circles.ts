import { allCategories } from "./src/lib/categories";

for (const slug in allCategories) {
  const path = [slug];
  let current = allCategories[slug as any].parent;
  while (current) {
    if (path.includes(current)) {
      console.error("Circular reference detected:", path.join(" -> "), "->", current);
      process.exit(1);
    }
    path.push(current);
    current = allCategories[current as any]?.parent;
  }
}
console.log("No circular references found.");
