import { db } from "../src/db";
import {
  products,
  prices,
  priceHistory,
  productOffers,
  type NewProduct,
  type NewPrice,
  type NewProductOffer,
} from "../src/db/schema";
import { sql } from "drizzle-orm";

const CATEGORIES = [
  "hard-drives",
  "ram",
  "power-supplies",
  "cpu",
  "gpu",
  "external-storage",
  "pc-cases",
  "cpu-coolers",
  "case-fans",
  "thermal-paste",
  "monitors",
  "keyboards",
  "mice",
  "mouse-pads",
  "headphones",
  "speakers",
  "microphones",
  "webcams",
  "routers",
  "nas",
  "usb-hubs",
  "docking-stations",
  "network-switches",
  "network-cards",
  "cables",
  "laptop-stands",
  "ups",
  "cable-management",
  "monitor-arms",
  "desk-accessories",
  "office-chairs",
  "standing-desks",
  "tablets",
  "smartwatches",
  "tablet-accessories",
  "phone-accessories",
  "game-controllers",
  "vr-headsets",
  "capture-cards",
];

async function seed() {
  console.log("🌱 Clearing existing data...");
  // Clear tables - simplistic approach
  await db.delete(productOffers);
  await db.delete(priceHistory);
  await db.delete(prices);
  await db.delete(products);

  console.log("🚀 Starting seed...");

  // --- SSDs ---
  await createProduct({
    asin: "B099RHVB42",
    title: "Samsung 990 PRO NVMe M.2 SSD 2TB",
    category: "hard-drives",
    description: "PCIe 4.0, up to 7,450 MB/s, for PS5 and PC",
    image: "https://m.media-amazon.com/images/I/81abc.jpg",
    brand: "Samsung",
    capacity: 2,
    capacityUnit: "TB",
    price: 169.9,
    offers: [
      { source: "amazon", merchant: "Amazon", price: 169.9, shipping: 0 },
      {
        source: "awin_mediamarkt",
        merchant: "MediaMarkt",
        price: 179.0,
        shipping: 4.99,
      },
      {
        source: "awin_cyberport",
        merchant: "Cyberport",
        price: 174.9,
        shipping: 5.99,
      },
    ],
  });

  await createProduct({
    asin: "B0B7CMZ3QH",
    title: "WD_BLACK SN850X NVMe SSD 4TB",
    category: "hard-drives",
    description: "Gaming Storage, PCIe Gen4, up to 7,300 MB/s",
    image: "https://m.media-amazon.com/images/I/71abc.jpg",
    brand: "Western Digital",
    capacity: 4,
    capacityUnit: "TB",
    price: 329.0,
    offers: [
      { source: "amazon", merchant: "Amazon", price: 329.0, shipping: 0 },
      { source: "awin_saturn", merchant: "Saturn", price: 339.0, shipping: 0 },
    ],
  });

  // --- GBP ---
  await createProduct({
    asin: "B0BUD9S3",
    title: "ASUS TUF Gaming GeForce RTX 4090 OC Edition 24GB",
    category: "gpu",
    description: "DLSS 3, PCIe 4.0, 24GB GDDR6X, HDMI 2.1a",
    image: "https://m.media-amazon.com/images/I/4090.jpg",
    brand: "ASUS",
    price: 1949.0,
    capacity: 24,
    capacityUnit: "GB",
    offers: [
      { source: "amazon", merchant: "Amazon", price: 1999.0, shipping: 0 },
      {
        source: "awin_notebooksbilliger",
        merchant: "NBB",
        price: 1949.0,
        shipping: 7.99,
      },
    ],
  });

  // --- CPU ---
  await createProduct({
    asin: "B0BCF54SR1",
    title: "AMD Ryzen 7 7800X3D Processor",
    category: "cpu",
    description: "8 Cores, 16 Threads, 5.0 GHz Max Boost, 104MB Cache",
    image: "https://m.media-amazon.com/images/I/7800x3d.jpg",
    brand: "AMD",
    price: 369.0,
    capacity: 8,
    capacityUnit: "core",
    offers: [
      { source: "amazon", merchant: "Amazon", price: 375.0, shipping: 0 },
      {
        source: "awin_mindfactory",
        merchant: "Mindfactory",
        price: 369.0,
        shipping: 8.99,
      },
    ],
  });

  // --- Monitors ---
  await createProduct({
    asin: "B0C65E5S",
    title: "LG OLED42C37LA 42 Inch 4K OLED evo TV",
    category: "monitors",
    description: "120Hz, HDMI 2.1, G-Sync, perfect for PC gaming",
    image: "https://m.media-amazon.com/images/I/lgc3.jpg",
    brand: "LG",
    price: 899.0,
    offers: [
      { source: "amazon", merchant: "Amazon", price: 929.0, shipping: 0 },
      { source: "awin_otto", merchant: "OTTO", price: 899.0, shipping: 29.9 },
    ],
  });

  // --- Keyboards ---
  await createProduct({
    asin: "B07W5JK6",
    title: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
    category: "keyboards",
    description: "QMK/VIA, Aluminium, Hot-swappable, RGB",
    image: "https://m.media-amazon.com/images/I/q1pro.jpg",
    brand: "Keychron",
    price: 199.0,
    offers: [
      { source: "amazon", merchant: "Amazon", price: 219.0, shipping: 0 },
      {
        source: "awin_alternate",
        merchant: "Alternate",
        price: 199.0,
        shipping: 5.99,
      },
    ],
  });

  // --- Mice ---
  await createProduct({
    asin: "B0B11L6",
    title: "Logitech MX Master 3S - Performance Wireless Mouse",
    category: "mice",
    description: "Ultra-fast scrolling, Ergo, 8K DPI, Quiet Clicks",
    image: "https://m.media-amazon.com/images/I/mxmaster.jpg",
    brand: "Logitech",
    price: 89.9,
    offers: [
      { source: "amazon", merchant: "Amazon", price: 89.9, shipping: 0 },
      {
        source: "awin_mediamarkt",
        merchant: "MediaMarkt",
        price: 99.0,
        shipping: 4.99,
      },
    ],
  });

  // --- Fill remaining categories with generic items ---
  for (const cat of CATEGORIES) {
    // Skip if we already added explicit items (simple check)
    if (
      ["hard-drives", "gpu", "cpu", "monitors", "keyboards", "mice"].includes(
        cat,
      )
    )
      continue;

    await createProduct({
      asin: `GENERIC-${cat}-1`,
      title: `Top Rated ${toTitleCase(cat).replace("-", " ")} Pro Model`,
      category: cat,
      description: `High performance ${cat.replace("-", " ")} with premium features. Best value 2025.`,
      brand: "GenericBrand",
      price: 99.99,
      offers: [
        { source: "amazon", merchant: "Amazon", price: 99.99, shipping: 0 },
        {
          source: "awin_generic",
          merchant: "Other Store",
          price: 109.99,
          shipping: 4.99,
        },
      ],
    });
  }

  console.log("✅ Seed complete!");
}

function toTitleCase(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function createProduct(data: {
  asin: string;
  title: string;
  category: string;
  description: string;
  brand: string;
  price: number;
  offers: {
    source: string;
    merchant: string;
    price: number;
    shipping: number;
  }[];
  image?: string;
  capacity?: number;
  capacityUnit?: string;
}) {
  const [product] = await db
    .insert(products)
    .values({
      asin: data.asin,
      slug: data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      title: data.title,
      category: data.category,
      description: data.description,
      brand: data.brand,
      imageUrl: data.image, // Corrected property name
      capacity: data.capacity,
      capacityUnit: data.capacityUnit,
      normalizedCapacity: data.capacity,
      currency: "EUR",
      availability: "in_stock",
      lastUpdated: new Date(),
    } as NewProduct)
    .returning();

  // Insert Price
  await db.insert(prices).values({
    productId: product.id,
    country: "de",
    amazonPrice: data.price,
    currency: "EUR",
    source: "seed",
    lastUpdated: new Date(),
  } as NewPrice);

  // Insert Offers
  for (const offer of data.offers) {
    await db.insert(productOffers).values({
      productId: product.id,
      source: offer.source,
      merchantName: offer.merchant,
      price: offer.price,
      shippingCost: offer.shipping,
      totalPrice: offer.price + offer.shipping,
      currency: "EUR",
      affiliateUrl: "https://example.com",
      availability: "in_stock",
      deliveryTime: "2-3 Days",
      lastUpdated: new Date(),
    } as NewProductOffer);
  }

  // Generate Price History (Past 90 days)
  const history = [];
  let currentPrice = data.price * 1.1; // Started 10% higher
  const now = new Date();

  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random fluctuation
    if (Math.random() > 0.8) currentPrice += (Math.random() - 0.5) * 5;

    // Ensure price doesn't go below minimum
    if (currentPrice < data.price * 0.5) currentPrice = data.price * 0.5;

    history.push({
      productId: product.id,
      country: "de",
      price: parseFloat(currentPrice.toFixed(2)),
      currency: "EUR",
      priceType: "best",
      recordedAt: date,
    });
  }

  await db.insert(priceHistory).values(history);
  console.log(`Added: ${data.title}`);
}

seed().catch(console.error);
