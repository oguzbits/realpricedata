import {
  Armchair,
  Battery,
  Cable,
  Camera,
  Cpu,
  Fan,
  Gamepad2,
  Glasses,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  MemoryStick,
  Mic,
  Monitor,
  MonitorSpeaker,
  Mouse,
  Network,
  Package,
  Router,
  Server,
  Smartphone,
  Speaker,
  Tablet,
  Thermometer,
  Usb,
  Video,
  Watch,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { BRAND_DOMAIN } from "./site-config";

export type UnitType = "TB" | "GB" | "W" | "core";

/**
 * Category type determines the comparison mode:
 * - "analytical": Price-per-unit calculation (e.g., $/TB, $/GB, $/W)
 * - "standard": Regular price comparison without unit metrics
 */
export type CategoryType = "analytical" | "standard";

export type CategorySlug =
  | "electronics"
  // Analytical categories (price-per-unit)
  | "hard-drives"
  | "ram"
  | "power-supplies"
  | "cpu"
  | "gpu"
  | "external-storage"
  // PC Components
  | "pc-cases"
  | "cpu-coolers"
  | "case-fans"
  | "thermal-paste"
  // Peripherals
  | "monitors"
  | "keyboards"
  | "mice"
  | "mouse-pads"
  | "headphones"
  | "speakers"
  | "microphones"
  | "webcams"
  // Networking
  | "routers"
  | "nas"
  | "usb-hubs"
  | "docking-stations"
  | "network-switches"
  | "network-cards"
  // Accessories
  | "cables"
  | "laptop-stands"
  | "ups"
  | "cable-management"
  | "monitor-arms"
  | "desk-accessories"
  // Furniture
  | "gaming-chairs"
  | "office-chairs"
  | "standing-desks"
  // Mobile & Wearables
  | "tablets"
  | "smartwatches"
  | "tablet-accessories"
  | "phone-accessories"
  // Gaming
  | "game-controllers"
  | "vr-headsets"
  | "capture-cards";

export interface Category {
  name: string;
  slug: CategorySlug;
  description: string;
  icon: LucideIcon;
  parent?: CategorySlug; // Parent category slug
  metaTitle?: string;
  metaDescription?: string;
  /** Category comparison type */
  categoryType: CategoryType;
  /** Unit for price-per-unit calculation (only for analytical categories) */
  unitType?: UnitType;
  /** Display label for unit (e.g., "per TB", "per GB") */
  unitLabel?: string;
  hidden?: boolean;
  popularFilters?: { label: string; params: string }[];
  aliases?: string[]; // SEO and URL aliases
}

export interface CategoryHierarchy {
  parent: Category;
  children: Category[];
}

// Internal base categories object to derive slugs from
const CATEGORY_MAP: Record<CategorySlug, Omit<Category, "slug">> = {
  // Parent Category
  electronics: {
    name: "Electronics",
    description: "Digital storage solutions - compare price per terabyte",
    icon: HardDrive,
    categoryType: "standard", // Parent categories are standard
    metaTitle: `Hard Drive Storage - Best Price Per TB | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare hard drive and SSD prices by cost per terabyte. Find the best deals on storage from top brands like Samsung, WD, Seagate, and Crucial.",
  },

  // Electronics Children (ONLY monetized categories)
  "hard-drives": {
    name: "Hard Drives & SSDs",
    description: "HDD and SSD storage solutions - compare price per TB",
    icon: HardDrive,
    parent: "electronics",
    categoryType: "analytical",
    unitType: "TB",
    unitLabel: "per TB",
    metaTitle: `Hard Drives & SSDs - Compare Price Per TB | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best hard drive and SSD deals by comparing price per terabyte. Compare internal and external storage from top brands.",
    popularFilters: [
      { label: "SSDs", params: "technology=SSD" },
      { label: "HDDs", params: "technology=HDD" },
      { label: "NVMe SSDs", params: "formFactor=M.2+NVMe" },
    ],
    aliases: ["disks", "storage", "hdd", "ssd"],
  },

  ram: {
    name: "RAM & Memory",
    description: "DDR4 and DDR5 RAM modules - compare price per GB",
    icon: MemoryStick,
    parent: "electronics",
    categoryType: "analytical",
    unitType: "GB",
    unitLabel: "per GB",
    metaTitle: `RAM & Memory - Compare Price Per GB | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best RAM and memory deals by comparing price per gigabyte. Compare DDR4 and DDR5 modules from top brands like Crucial, Lexar, and Patriot.",
    popularFilters: [
      { label: "DDR4 RAM", params: "technology=DDR4" },
      { label: "DDR5 RAM", params: "technology=DDR5" },
      { label: "Laptop RAM", params: "formFactor=SO-DIMM" },
    ],
    aliases: ["memory"],
  },

  "power-supplies": {
    name: "Power Supplies",
    description: "ATX and SFX power supplies - compare price per Watt",
    icon: Zap,
    parent: "electronics",
    categoryType: "analytical",
    unitType: "W",
    unitLabel: "per Watt",
    metaTitle: `Power Supplies - Compare Price Per Watt | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best power supply deals by comparing price per watt. Compare 80+ Bronze, Gold, and Platinum PSUs from top brands.",
    popularFilters: [
      { label: "80+ Gold PSUs", params: "technology=80%2B+Gold" },
    ],
    aliases: ["psu"],
  },

  cpu: {
    name: "CPUs",
    description: "Compare processors by core count and performance",
    icon: HardDrive,
    parent: "electronics",
    categoryType: "analytical",
    unitType: "core",
    unitLabel: "per core",
    hidden: false, // Unhide when ready to launch
    metaTitle: `Processors (CPUs) - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best prices on Intel and AMD processors. Compare core counts, clock speeds, and benchmarks.",
    popularFilters: [
      { label: "Intel Core i7", params: "brand=Intel&series=Core+i7" },
      { label: "AMD Ryzen 7", params: "brand=AMD&series=Ryzen+7" },
    ],
    aliases: ["processors", "chips"],
  },

  gpu: {
    name: "Graphics Cards",
    description: "Compare GPUs by VRAM and performance",
    icon: HardDrive,
    parent: "electronics",
    categoryType: "analytical",
    unitType: "GB",
    unitLabel: "per GB VRAM",
    hidden: false, // Unhide when ready to launch
    metaTitle: `Graphics Cards (GPUs) - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best graphics card deals. Compare NVIDIA GeForce and AMD Radeon GPUs by price and performance.",
    popularFilters: [
      { label: "NVIDIA RTX 4070", params: "brand=NVIDIA&model=RTX+4070" },
      { label: "12GB+ VRAM", params: "min_memory=12" },
    ],
    aliases: ["video-cards", "vga"],
  },

  // ======================
  // Standard Categories (no price-per-unit)
  // ======================

  monitors: {
    name: "Monitors",
    description: "Compare monitors by size, resolution, and refresh rate",
    icon: Monitor,
    parent: "electronics",
    categoryType: "standard",
    hidden: false, // Unhide when ready to launch
    metaTitle: `Computer Monitors - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best monitor deals. Compare 4K, ultrawide, and gaming monitors from top brands like LG, Samsung, Dell, and ASUS.",
    popularFilters: [
      { label: "4K Monitors", params: "resolution=4K" },
      { label: "Gaming 144Hz+", params: "refresh_rate=144" },
      { label: "Ultrawide", params: "aspect_ratio=21:9" },
    ],
    aliases: ["displays", "screens"],
  },

  keyboards: {
    name: "Keyboards",
    description: "Mechanical and membrane keyboards for gaming and work",
    icon: Keyboard,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Keyboards - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best keyboard deals. Compare mechanical, membrane, and wireless keyboards from Logitech, Razer, Corsair, and more.",
    popularFilters: [
      { label: "Mechanical", params: "type=mechanical" },
      { label: "Wireless", params: "connectivity=wireless" },
      { label: "RGB", params: "features=rgb" },
    ],
    aliases: ["tastaturen"],
  },

  mice: {
    name: "Mice",
    description: "Gaming and productivity mice for precision and comfort",
    icon: Mouse,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Computer Mice - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best mouse deals. Compare gaming mice, ergonomic mice, and wireless mice from Logitech, Razer, and SteelSeries.",
    popularFilters: [
      { label: "Gaming Mice", params: "type=gaming" },
      { label: "Wireless", params: "connectivity=wireless" },
      { label: "Ergonomic", params: "type=ergonomic" },
    ],
    aliases: ["mäuse", "maus"],
  },

  headphones: {
    name: "Headphones",
    description: "Over-ear, in-ear, and gaming headsets",
    icon: Headphones,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Headphones & Headsets - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best headphone deals. Compare over-ear, in-ear, and gaming headsets from Sony, Bose, Sennheiser, and more.",
    popularFilters: [
      { label: "Over-Ear", params: "type=over-ear" },
      { label: "Wireless", params: "connectivity=wireless" },
      { label: "Gaming Headsets", params: "type=gaming" },
      { label: "Noise Cancelling", params: "features=anc" },
    ],
    aliases: ["kopfhörer", "headsets"],
  },

  webcams: {
    name: "Webcams",
    description: "HD and 4K webcams for streaming and video calls",
    icon: Camera,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Webcams - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Find the best webcam deals. Compare HD and 4K webcams for streaming, video conferencing, and content creation.",
    popularFilters: [
      { label: "4K Webcams", params: "resolution=4K" },
      { label: "1080p", params: "resolution=1080p" },
      { label: "Streaming", params: "type=streaming" },
    ],
    aliases: ["kameras", "webkameras"],
  },

  // ======================
  // Additional Standard Categories
  // ======================

  "external-storage": {
    name: "External Storage",
    description: "External hard drives and portable SSDs",
    icon: HardDrive,
    parent: "electronics",
    categoryType: "analytical",
    unitType: "TB",
    unitLabel: "per TB",
    hidden: false,
    metaTitle: `External Storage - Compare Prices per TB | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare external hard drives and portable SSDs by price per TB. Find the best deals on WD, Seagate, Samsung, and SanDisk.",
    popularFilters: [
      { label: "Portable SSD", params: "type=ssd" },
      { label: "USB-C", params: "interface=usb-c" },
    ],
    aliases: ["externe-festplatten", "portable-ssd"],
  },

  routers: {
    name: "Routers",
    description: "WiFi routers and mesh systems",
    icon: Router,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `WiFi Routers - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare WiFi 6 and WiFi 7 routers from ASUS, TP-Link, Netgear, and more. Find the best deals on mesh systems.",
    popularFilters: [
      { label: "WiFi 6", params: "wifi=6" },
      { label: "WiFi 7", params: "wifi=7" },
      { label: "Mesh Systems", params: "type=mesh" },
    ],
    aliases: ["wlan-router", "mesh"],
  },

  nas: {
    name: "NAS Systems",
    description: "Network attached storage for home and office",
    icon: Server,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `NAS Systems - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare NAS devices from Synology, QNAP, and more. Find the best deals for home servers and media storage.",
    popularFilters: [
      { label: "2-Bay", params: "bays=2" },
      { label: "4-Bay", params: "bays=4" },
      { label: "Synology", params: "brand=Synology" },
    ],
    aliases: ["netzwerkspeicher", "home-server"],
  },

  "usb-hubs": {
    name: "USB Hubs",
    description: "USB hubs and port expanders",
    icon: Usb,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `USB Hubs - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare USB-C and USB-A hubs. Find the best deals on powered hubs and docking solutions.",
    popularFilters: [
      { label: "USB-C", params: "type=usb-c" },
      { label: "Powered", params: "powered=true" },
    ],
    aliases: ["usb-verteiler"],
  },

  speakers: {
    name: "Speakers",
    description: "Computer speakers and audio systems",
    icon: Speaker,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Computer Speakers - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare PC speakers, soundbars, and 2.1 systems. Find deals from Logitech, Creative, and more.",
    popularFilters: [
      { label: "2.1 Systems", params: "type=2.1" },
      { label: "Bluetooth", params: "connectivity=bluetooth" },
    ],
    aliases: ["lautsprecher", "pc-lautsprecher"],
  },

  microphones: {
    name: "Microphones",
    description: "USB and XLR microphones for streaming and podcasting",
    icon: Mic,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Microphones - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare USB and XLR microphones for streaming, gaming, and podcasting. Find deals on Blue, Rode, and Shure.",
    popularFilters: [
      { label: "USB Mics", params: "type=usb" },
      { label: "XLR", params: "type=xlr" },
      { label: "Condenser", params: "type=condenser" },
    ],
    aliases: ["mikrofone", "streaming-mikrofon"],
  },

  "gaming-chairs": {
    name: "Gaming Chairs",
    description: "Ergonomic gaming and office chairs",
    icon: Armchair,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Gaming Chairs - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare gaming chairs from Secretlab, Noblechairs, and more. Find ergonomic chairs for long gaming sessions.",
    popularFilters: [
      { label: "Secretlab", params: "brand=Secretlab" },
      { label: "Ergonomic", params: "features=ergonomic" },
    ],
    aliases: ["gaming-stühle", "bürostühle"],
  },

  tablets: {
    name: "Tablets",
    description: "iPads, Android tablets, and drawing tablets",
    icon: Tablet,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Tablets - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare tablets from Apple, Samsung, and Lenovo. Find deals on iPads, Android tablets, and drawing tablets.",
    popularFilters: [
      { label: "iPad", params: "brand=Apple" },
      { label: "Samsung Galaxy Tab", params: "brand=Samsung" },
      { label: "Drawing Tablets", params: "type=drawing" },
    ],
    aliases: ["tablet-pc"],
  },

  smartwatches: {
    name: "Smartwatches",
    description: "Smartwatches and fitness trackers",
    icon: Watch,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Smartwatches - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare smartwatches from Apple, Samsung, Garmin, and Fitbit. Find deals on fitness trackers and smart bands.",
    popularFilters: [
      { label: "Apple Watch", params: "brand=Apple" },
      { label: "Garmin", params: "brand=Garmin" },
      { label: "Fitness Trackers", params: "type=fitness" },
    ],
    aliases: ["fitness-tracker", "smart-uhren"],
  },

  cables: {
    name: "Cables & Adapters",
    description: "USB, HDMI, DisplayPort cables and adapters",
    icon: Cable,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Cables & Adapters - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare USB-C, HDMI, and DisplayPort cables. Find deals on adapters and cable accessories.",
    popularFilters: [
      { label: "USB-C", params: "type=usb-c" },
      { label: "HDMI 2.1", params: "type=hdmi-2.1" },
      { label: "DisplayPort", params: "type=displayport" },
    ],
    aliases: ["kabel", "adapter"],
  },

  "laptop-stands": {
    name: "Laptop Stands",
    description: "Laptop stands, risers, and cooling pads",
    icon: Laptop,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Laptop Stands - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare laptop stands, risers, and cooling pads for ergonomic setups.",
    popularFilters: [
      { label: "Adjustable", params: "type=adjustable" },
      { label: "With Cooling", params: "features=cooling" },
    ],
    aliases: ["laptop-ständer", "notebook-halter"],
  },

  "mouse-pads": {
    name: "Mouse Pads",
    description: "Gaming and desk mouse pads",
    icon: Mouse,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Mouse Pads - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare gaming mouse pads and desk mats. Find deals on extended pads and RGB mouse mats.",
    popularFilters: [
      { label: "Extended/XXL", params: "size=xxl" },
      { label: "RGB", params: "features=rgb" },
    ],
    aliases: ["mauspads", "schreibtischunterlagen"],
  },

  "docking-stations": {
    name: "Docking Stations",
    description: "USB-C and Thunderbolt docking stations",
    icon: Usb,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Docking Stations - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare USB-C and Thunderbolt docking stations. Find deals on laptop docks with multiple ports.",
    popularFilters: [
      { label: "Thunderbolt 4", params: "type=thunderbolt-4" },
      { label: "USB-C", params: "type=usb-c" },
    ],
    aliases: ["dock", "laptop-dock"],
  },

  ups: {
    name: "UPS / Battery Backup",
    description: "Uninterruptible power supplies for PCs and NAS",
    icon: Battery,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `UPS Battery Backup - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare UPS systems from APC, CyberPower, and Eaton. Protect your PC and NAS from power outages.",
    popularFilters: [
      { label: "600VA+", params: "capacity=600" },
      { label: "1000VA+", params: "capacity=1000" },
    ],
    aliases: ["usv", "notstrom"],
  },

  "pc-cases": {
    name: "PC Cases",
    description: "Computer cases for gaming and workstation builds",
    icon: Server,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `PC Cases - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare PC cases from Fractal Design, NZXT, Corsair, and more. Find deals on ATX, mATX, and ITX cases.",
    popularFilters: [
      { label: "ATX", params: "form-factor=atx" },
      { label: "mATX", params: "form-factor=matx" },
      { label: "ITX", params: "form-factor=itx" },
    ],
    aliases: ["gehäuse", "pc-gehäuse"],
  },

  // ======================
  // NEW: 15 Additional Categories
  // ======================

  "cpu-coolers": {
    name: "CPU Coolers",
    description: "Air and liquid CPU coolers for optimal temperatures",
    icon: Fan,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `CPU Coolers - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare air and AIO liquid CPU coolers. Find deals on Noctua, be quiet!, Corsair, and more.",
    popularFilters: [
      { label: "Air Coolers", params: "type=air" },
      { label: "AIO Liquid", params: "type=aio" },
    ],
    aliases: ["kühler", "cpu-kühler"],
  },

  "case-fans": {
    name: "Case Fans",
    description: "PC case fans and fan controllers",
    icon: Fan,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Case Fans - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare PC case fans from Noctua, Arctic, Corsair, and more. Find RGB and high-airflow options.",
    popularFilters: [
      { label: "120mm", params: "size=120" },
      { label: "140mm", params: "size=140" },
      { label: "RGB", params: "features=rgb" },
    ],
    aliases: ["lüfter", "gehäuselüfter"],
  },

  "thermal-paste": {
    name: "Thermal Paste",
    description: "Thermal compounds and pads for CPU and GPU",
    icon: Thermometer,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Thermal Paste - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare thermal paste from Noctua, Thermal Grizzly, and Arctic. Find the best thermal compounds.",
    popularFilters: [
      { label: "High Performance", params: "type=premium" },
      { label: "Thermal Pads", params: "type=pad" },
    ],
    aliases: ["wärmeleitpaste"],
  },

  "network-switches": {
    name: "Network Switches",
    description: "Ethernet switches for home and office networks",
    icon: Network,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Network Switches - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare network switches from TP-Link, Netgear, and Ubiquiti. Managed and unmanaged options.",
    popularFilters: [
      { label: "8 Port", params: "ports=8" },
      { label: "PoE", params: "features=poe" },
      { label: "Managed", params: "type=managed" },
    ],
    aliases: ["netzwerk-switch"],
  },

  "network-cards": {
    name: "Network Cards",
    description: "PCIe WiFi and Ethernet adapters",
    icon: Network,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Network Cards - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare WiFi and Ethernet adapters. PCIe and USB network cards for desktop and laptop.",
    popularFilters: [
      { label: "WiFi 6", params: "wifi=6" },
      { label: "2.5GbE", params: "speed=2.5gbe" },
    ],
    aliases: ["netzwerkkarten", "wlan-karten"],
  },

  "cable-management": {
    name: "Cable Management",
    description: "Cable ties, sleeves, and organization solutions",
    icon: Cable,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Cable Management - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare cable management solutions. Cable ties, sleeves, trays, and under-desk organizers.",
    popularFilters: [
      { label: "Cable Sleeves", params: "type=sleeve" },
      { label: "Cable Ties", params: "type=ties" },
    ],
    aliases: ["kabelmanagement"],
  },

  "monitor-arms": {
    name: "Monitor Arms",
    description: "Monitor mounts and desk arms",
    icon: Monitor,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Monitor Arms - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare monitor arms and mounts from Ergotron, AmazonBasics, and more. Single and dual options.",
    popularFilters: [
      { label: "Single Monitor", params: "type=single" },
      { label: "Dual Monitor", params: "type=dual" },
    ],
    aliases: ["monitorhalterung", "monitor-arm"],
  },

  "desk-accessories": {
    name: "Desk Accessories",
    description: "Desk organizers, lamps, and accessories",
    icon: Package,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Desk Accessories - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare desk accessories. Desk lamps, organizers, and workspace essentials.",
    popularFilters: [
      { label: "Desk Lamps", params: "type=lamp" },
      { label: "Organizers", params: "type=organizer" },
    ],
    aliases: ["schreibtisch-zubehör"],
  },

  "office-chairs": {
    name: "Office Chairs",
    description: "Ergonomic office chairs for productivity",
    icon: Armchair,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Office Chairs - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare ergonomic office chairs from Herman Miller, Steelcase, and affordable alternatives.",
    popularFilters: [
      { label: "Ergonomic", params: "features=ergonomic" },
      { label: "Mesh Back", params: "type=mesh" },
    ],
    aliases: ["bürostühle"],
  },

  "standing-desks": {
    name: "Standing Desks",
    description: "Height-adjustable and standing desks",
    icon: Monitor,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Standing Desks - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare standing desks and sit-stand desks. Electric and manual height-adjustable options.",
    popularFilters: [
      { label: "Electric", params: "type=electric" },
      { label: "Manual", params: "type=manual" },
    ],
    aliases: ["stehschreibtisch", "höhenverstellbar"],
  },

  "tablet-accessories": {
    name: "Tablet Accessories",
    description: "Cases, stands, and accessories for tablets",
    icon: Tablet,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Tablet Accessories - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare tablet cases, stands, and styluses. iPad and Android tablet accessories.",
    popularFilters: [
      { label: "iPad Cases", params: "type=ipad-case" },
      { label: "Styluses", params: "type=stylus" },
    ],
    aliases: ["tablet-zubehör"],
  },

  "phone-accessories": {
    name: "Phone Accessories",
    description: "Phone cases, chargers, and accessories",
    icon: Smartphone,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Phone Accessories - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare phone cases, wireless chargers, and phone accessories for iPhone and Android.",
    popularFilters: [
      { label: "Wireless Chargers", params: "type=wireless-charger" },
      { label: "Phone Cases", params: "type=case" },
    ],
    aliases: ["handy-zubehör"],
  },

  "game-controllers": {
    name: "Game Controllers",
    description: "Gamepads, controllers, and joysticks",
    icon: Gamepad2,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Game Controllers - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare game controllers and gamepads from Xbox, PlayStation, and third-party brands.",
    popularFilters: [
      { label: "Xbox Controllers", params: "brand=Xbox" },
      { label: "PlayStation", params: "brand=PlayStation" },
    ],
    aliases: ["controller", "gamepad"],
  },

  "vr-headsets": {
    name: "VR Headsets",
    description: "Virtual reality headsets and accessories",
    icon: Glasses,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `VR Headsets - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare VR headsets from Meta Quest, HTC Vive, and Valve Index. Standalone and PC VR options.",
    popularFilters: [
      { label: "Standalone", params: "type=standalone" },
      { label: "PC VR", params: "type=pcvr" },
    ],
    aliases: ["vr-brille", "virtual-reality"],
  },

  "capture-cards": {
    name: "Capture Cards",
    description: "Video capture cards for streaming and recording",
    icon: Video,
    parent: "electronics",
    categoryType: "standard",
    hidden: false,
    metaTitle: `Capture Cards - Compare Prices | ${BRAND_DOMAIN}`,
    metaDescription:
      "Compare capture cards from Elgato, AVerMedia, and more. USB and PCIe options for streaming.",
    popularFilters: [
      { label: "USB", params: "type=usb" },
      { label: "PCIe", params: "type=pcie" },
      { label: "4K", params: "resolution=4k" },
    ],
    aliases: ["capture-karte", "game-capture"],
  },
};

// All categories in a flat structure with slug added
export const allCategories: Record<CategorySlug, Category> = Object.entries(
  CATEGORY_MAP,
).reduce(
  (acc, [slug, data]) => {
    acc[slug as CategorySlug] = {
      ...(data as Omit<Category, "slug">),
      slug: slug as CategorySlug,
    } as Category;
    return acc;
  },
  {} as Record<CategorySlug, Category>,
);

// Get category hierarchy (parent with children)
export function getCategoryHierarchy(): CategoryHierarchy[] {
  const hierarchies: CategoryHierarchy[] = [];
  const parents = Object.values(allCategories).filter(
    (cat) => !cat.parent && !cat.hidden,
  );

  parents.forEach((parent) => {
    const children = Object.values(allCategories).filter(
      (cat) => cat.parent === parent.slug && !cat.hidden,
    );
    hierarchies.push({
      parent: stripCategoryIcon(parent) as Category,
      children: children.map(stripCategoryIcon) as Category[],
    });
  });

  return hierarchies;
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return allCategories[slug as CategorySlug];
}

// Get parent category for a given category
export function getParentCategory(
  categorySlug: CategorySlug,
): Category | undefined {
  const category = allCategories[categorySlug];
  if (!category?.parent) return undefined;
  return allCategories[category.parent];
}

// Get children of a parent category
export function getChildCategories(parentSlug: CategorySlug): Category[] {
  return Object.values(allCategories).filter(
    (cat) => cat.parent === parentSlug && !cat.hidden,
  );
}

// Get breadcrumb trail for a category
export function getBreadcrumbs(categorySlug: CategorySlug): Category[] {
  const breadcrumbs: Category[] = [];
  const category = allCategories[categorySlug];

  if (!category) return breadcrumbs;

  if (category.parent) {
    const parent = allCategories[category.parent];
    if (parent) breadcrumbs.push(parent);
  }

  breadcrumbs.push(category);
  return breadcrumbs;
}

// Get full URL path for a category
export function getCategoryPath(categorySlug: CategorySlug): string {
  const category = allCategories[categorySlug];
  if (!category) return "/";

  return `/${category.slug}`;
}

// Return a copy of the category without the icon function (for serialization)
export function stripCategoryIcon(category: Category): Omit<Category, "icon"> {
  const { icon, ...rest } = category;
  return JSON.parse(JSON.stringify(rest));
}

/**
 * Check if a category is analytical (price-per-unit)
 */
export function isAnalyticalCategory(category: Category): boolean {
  return category.categoryType === "analytical";
}

/**
 * Get all analytical categories (price-per-unit categories)
 */
export function getAnalyticalCategories(): Category[] {
  return Object.values(allCategories).filter(
    (cat) => cat.categoryType === "analytical" && !cat.hidden,
  );
}

/**
 * Get all standard categories (regular price comparison)
 */
export function getStandardCategories(): Category[] {
  return Object.values(allCategories).filter(
    (cat) => cat.categoryType === "standard" && !cat.hidden,
  );
}
