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
  MonitorCheck,
  MonitorSpeaker,
  Mouse,
  Network,
  Package,
  Phone,
  Printer,
  Router,
  Server,
  Search,
  Smartphone,
  Speaker,
  Tablet,
  Thermometer,
  Tv,
  Usb,
  Video,
  Watch,
  Zap,
  Home,
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
  | "pc-komponenten"
  | "computer"
  | "elektroartikel"
  | "electronics"
  | "hard-drives"
  | "ram"
  | "power-supplies"
  | "cpu"
  | "gpu"
  | "storage"
  | "ssds"
  | "external-storage"
  | "motherboards"
  | "pc-cases"
  | "cpu-coolers"
  | "case-fans"
  | "thermal-paste"
  | "monitors"
  | "keyboards"
  | "mice"
  | "mouse-pads"
  | "headphones"
  | "speakers"
  | "microphones"
  | "webcams"
  | "routers"
  | "nas"
  | "usb-hubs"
  | "docking-stations"
  | "network-switches"
  | "network-cards"
  | "cables"
  | "laptop-stands"
  | "ups"
  | "cable-management"
  | "monitor-arms"
  | "desk-accessories"
  | "gaming-chairs"
  | "office-chairs"
  | "standing-desks"
  | "tablets"
  | "smartwatches"
  | "tablet-accessories"
  | "phone-accessories"
  | "game-controllers"
  | "vr-headsets"
  | "capture-cards"
  | "smartphones"
  | "tvs"
  | "notebooks"
  | "consoles"
  | "soundbars"
  | "drones"
  | "cameras"
  | "smartwatch-accessories"
  | "haushaltselektronik"
  | "telekommunikation"
  | "hifi-audio"
  | "tv-sat"
  | "fotografie"
  | "drucker-scanner"
  | "staubsauger"
  | "gaming-elektrospielzeug"
  | "espressomaschinen"
  | "kühlschränke"
  | "elektrische-zahnbürsten"
  | "waschmaschinen"
  | "multifunktionsdrucker"
  | "geschirrspüler"
  | "systemkameras"
  | "druckerpatronen"
  | "backöfen"
  | "kochfelder"
  | "radios"
  | "wäschetrockner"
  | "küchenmaschinen"
  | "bartschneider-haarschneider"
  | "receiver"
  | "mikrowellen"
  | "dunstabzugshauben"
  | "gefrierschränke"
  | "herde"
  | "kompaktkameras"
  | "medien";

export interface FilterGroup {
  label: string;
  field: string;
  type: "checkbox" | "range";
  options?: string[]; // Hardcoded options if needed
}

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
  isFeatured?: boolean; // Show in popular categories on homepage
  popularFilters?: { label: string; params?: string; href?: string }[];
  imageUrl?: string;
  aliases?: string[]; // SEO and URL aliases
  /** Tailwind filter groups for this category */
  filterGroups?: FilterGroup[];
}

export interface CategoryHierarchy {
  parent: Category;
  children: Category[];
}

// Internal base categories object to derive slugs from
const CATEGORY_MAP: Record<CategorySlug, Omit<Category, "slug">> = {
  // Parent Category
  haushaltselektronik: {
    name: "Haushaltselektronik",
    description: "Kühlschränke, Waschmaschinen und Küchengeräte",
    icon: Home,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Elektro-Großgeräte", href: "/elektro-großgeräte" },
      { label: "Haushaltsgeräte", href: "/haushaltsgeräte" },
      { label: "Küchengeräte", href: "/küchengeräte" },
      { label: "Kaffeezubereitung", href: "/kaffeezubereitung" },
      { label: "Pflege- & Wellnessgeräte", href: "/pflege-wellness" },
    ],
  },

  computer: {
    name: "Computer",
    description: "Notebooks, Monitore, Tablets und Zubehör",
    icon: Laptop,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "PC-Komponenten", href: "/pc-komponenten" },
      { label: "Notebooks", href: "/notebooks" },
      { label: "Tablets", href: "/tablets" },
      { label: "Eingabegeräte", href: "/eingabegeräte" },
      { label: "Grafikkarten", href: "/gpu" },
    ],
    metaTitle: `Computer & Zubehör Preisvergleich | ${BRAND_DOMAIN}`,
    metaDescription:
      "Vergleichen Sie Preise für Laptops, Monitore und Computer-Zubehör.",
  },

  telekommunikation: {
    name: "Telekommunikation",
    description: "Smartphones, Smartwatches und Zubehör",
    icon: Phone,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Handys & Smartphones", href: "/smartphones" },
      { label: "Smartwatches", href: "/smartwatches" },
      { label: "Handy-Zubehör", href: "/phone-accessories" },
      { label: "Telefone", href: "/telefone" },
      { label: "Smartwatch-Zubehör", href: "/smartwatch-accessories" },
    ],
  },

  "hifi-audio": {
    name: "HiFi & Audio",
    description: "Kopfhörer, Lautsprecher und Soundbars",
    icon: Speaker,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "HiFi-Komponenten", href: "/hifi-komponenten" },
      { label: "Kopfhörer", href: "/headphones" },
      { label: "Studio- & Event-Technik", href: "/studio-technik" },
      { label: "Musikinstrumente", href: "/musikinstrumente" },
      { label: "Radios", href: "/radios" },
    ],
  },

  "tv-sat": {
    name: "TV & Sat",
    description: "Fernseher, Heimkino und Zubehör",
    icon: Tv,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Fernseher", href: "/tvs" },
      { label: "Heimkino", href: "/heimkino" },
      { label: "Netzwerkplayer", href: "/netzwerkplayer" },
      { label: "TV-Zubehör", href: "/tv-zubehör" },
      { label: "Blu-ray-Player", href: "/blu-ray-player" },
    ],
  },

  fotografie: {
    name: "Fotografie",
    description: "Kameras, Objektive und Zubehör",
    icon: Camera,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Kamera-Zubehör", href: "/kamera-zubehör" },
      { label: "Digitalkameras", href: "/cameras" },
      { label: "Systemkameras", href: "/systemkameras" },
      { label: "Objektive", href: "/objektive" },
      { label: "Action-Cams", href: "/action-cams" },
    ],
  },

  "drucker-scanner": {
    name: "Drucker & Scanner",
    description: "Multifunktionsdrucker, Tinte und Toner",
    icon: Printer,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Druckerzubehör", href: "/druckerzubehör" },
      { label: "Multifunktionsdrucker", href: "/multifunktionsdrucker" },
      { label: "3D-Drucker", href: "/3d-drucker" },
      { label: "Laserdrucker", href: "/laserdrucker" },
      { label: "Scanner", href: "/scanner" },
    ],
  },

  "gaming-elektrospielzeug": {
    name: "Gaming & Elektrospielzeug",
    description: "Konsolen, Drohnen und E-Spielzeuge",
    icon: Gamepad2,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Spielekonsolen", href: "/consoles" },
      { label: "Drohnen", href: "/drones" },
      { label: "Drohnenzubehör", href: "/drones-accessories" },
      { label: "Elektronische Spielzeuge", href: "/gaming-toys" },
      { label: "Kinderkameras", href: "/kids-cameras" },
    ],
  },

  elektroartikel: {
    name: "Elektroartikel",
    description: "Smartphones, TVs, Kopfhörer und Wearables",
    icon: Smartphone,
    categoryType: "standard",
    metaTitle: `Elektroartikel & Multimedia Preisvergleich | ${BRAND_DOMAIN}`,
    metaDescription:
      "Top-Angebote für Smartphones, Fernseher und Unterhaltungselektronik.",
  },

  electronics: {
    name: "Elektronik",
    description: "Hardware, Computer & Multimedia",
    icon: HardDrive,
    hidden: true,
    categoryType: "standard",
  },

  tvs: {
    name: "Fernseher",
    description: "OLED, QLED und Smart TVs",
    icon: Tv,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "55 Zoll", params: "size=55" },
      { label: "65 Zoll", params: "size=65" },
      { label: "OLED", params: "panel=oled" },
      { label: "Samsung", params: "brand=Samsung" },
      { label: "LG", params: "brand=LG" },
    ],
  },

  staubsauger: {
    name: "Staubsauger",
    description: "Akku-Staubsauger und Saugroboter",
    icon: Fan,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Dyson", params: "brand=Dyson" },
      { label: "Saugroboter", params: "type=robot" },
      { label: "Akku-Staubsauger", params: "type=cordless" },
      { label: "Miele", params: "brand=Miele" },
    ],
  },

  headphones: {
    name: "Kopfhörer",
    description: "In-Ear, Over-Ear und Bluetooth Kopfhörer",
    icon: Headphones,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Apple", params: "brand=Apple" },
      { label: "Bluetooth", params: "type=bluetooth" },
      { label: "Noise-Cancelling", params: "features=anc" },
      { label: "In-Ear", params: "type=in-ear" },
    ],
  },

  notebooks: {
    name: "Notebooks",
    description: "Laptops, MacBooks und Convertibles",
    icon: Laptop,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Apple MacBook", params: "brand=Apple" },
      { label: "Gaming Laptops", params: "type=gaming" },
      { label: "16 GB RAM", params: "ram=16" },
      { label: "Intel Core Ultra", params: "cpu=intel-ultra" },
    ],
  },

  tablets: {
    name: "Tablets",
    description: "iPads und Android Tablets",
    icon: Tablet,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Apple iPad", params: "brand=Apple" },
      { label: "Samsung Galaxy Tab", params: "brand=Samsung" },
      { label: "Android-Tablet", params: "os=android" },
      { label: "5G-Tablet", params: "connectivity=5g" },
    ],
  },

  espressomaschinen: {
    name: "Espressomaschinen",
    description: "Kaffeevollautomaten und Siebträgermaschinen",
    icon: Zap,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Kaffeevollautomat", params: "type=fully-automatic" },
      { label: "Siebträgermaschine", params: "type=portafilter" },
      { label: "De'Longhi", params: "brand=delonghi" },
      { label: "Siemens EQ.6", params: "model=eq6" },
    ],
  },

  monitors: {
    name: "Monitore",
    description: "Gaming und Office Monitore",
    icon: Monitor,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "27 Zoll", params: "size=27" },
      { label: "144 Hz", params: "refresh=144" },
      { label: "4K Monitor", params: "resolution=4k" },
      { label: "Gaming Monitor", params: "type=gaming" },
    ],
  },

  speakers: {
    name: "Lautsprecher",
    description: "Bluetooth, Regal und Standlautsprecher",
    icon: Speaker,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "JBL", params: "brand=jbl" },
      { label: "Sonos", params: "brand=sonos" },
      { label: "Bluetooth Lautsprecher", params: "type=bluetooth" },
      { label: "Subwoofer", params: "type=subwoofer" },
    ],
  },

  kühlschränke: {
    name: "Kühlschränke",
    description: "Kühl-Gefrierkombinationen und Side-by-Side",
    icon: Thermometer,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Bosch", params: "brand=bosch" },
      { label: "Liebherr", params: "brand=liebherr" },
      { label: "Einbaukühlschrank", params: "type=built-in" },
      { label: "Side-by-Side", params: "type=side-by-side" },
    ],
  },

  "elektrische-zahnbürsten": {
    name: "Elektrische Zahnbürsten",
    description: "Schall- und oszillierende Zahnbürsten",
    icon: Zap,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Oral-B iO", params: "model=io" },
      { label: "Philips Sonicare", params: "model=sonicare" },
      { label: "Schallzahnbürste", params: "type=sonic" },
    ],
  },

  waschmaschinen: {
    name: "Waschmaschinen",
    description: "Frontlader und Toplader",
    icon: Zap,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Miele", params: "brand=miele" },
      { label: "Bosch", params: "brand=bosch" },
      { label: "9 kg", params: "capacity=9" },
      { label: "Frontlader", params: "type=front-loader" },
    ],
  },

  multifunktionsdrucker: {
    name: "Multifunktionsdrucker",
    description: "Drucken, Scannen und Kopieren",
    icon: Printer,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Canon", params: "brand=Canon" },
      { label: "HP", params: "brand=HP" },
      { label: "EcoTank", params: "series=ecotank" },
    ],
  },

  geschirrspüler: {
    name: "Geschirrspüler",
    description: "Einbau- und Standgeschirrspüler",
    icon: HardDrive,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Bosch", params: "brand=Bosch" },
      { label: "Miele", params: "brand=Miele" },
      { label: "Vollintegriert", params: "type=integrated" },
    ],
  },

  routers: {
    name: "Router",
    description: "WLAN & Internet Router",
    icon: Router,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "AVM Fritz!Box", params: "brand=AVM" },
      { label: "WiFi 6", params: "standard=wifi-6" },
      { label: "TP-Link", params: "brand=TP-Link" },
    ],
  },

  systemkameras: {
    name: "Systemkameras",
    description: "Spiegellose Profikameras",
    icon: Camera,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Sony Alpha", params: "series=alpha" },
      { label: "Canon EOS R", params: "series=eos-r" },
      { label: "Fuji X", params: "series=x" },
    ],
  },

  druckerpatronen: {
    name: "Druckerpatronen",
    description: "Tinten und Toner für alle Drucker",
    icon: Printer,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "HP", params: "brand=HP" },
      { label: "Canon", params: "brand=Canon" },
      { label: "Epson", params: "brand=Epson" },
    ],
  },

  backöfen: {
    name: "Backöfen",
    description: "Einbaubacköfen und Sets",
    icon: Zap,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Bosch", params: "brand=Bosch" },
      { label: "Siemens", params: "brand=Siemens" },
      { label: "Pyrolyse", params: "features=pyrolysis" },
    ],
  },

  kochfelder: {
    name: "Kochfelder",
    description: "Induktion, Ceran und Gas",
    icon: Zap,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Induktion", params: "type=induction" },
      { label: "Kochfeldabzug", params: "features=extractor" },
      { label: "80 cm breit", params: "width=80" },
    ],
  },

  soundbars: {
    name: "Soundbars",
    description: "Heimkino-Soundsysteme",
    icon: Speaker,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Sonos", params: "brand=Sonos" },
      { label: "Samsung", params: "brand=Samsung" },
      { label: "Dolby Atmos", params: "features=atmos" },
    ],
  },

  radios: {
    name: "Radios",
    description: "DAB+, Internet- und Kurbelradios",
    icon: Mic,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "DAB+", params: "type=dab-plus" },
      { label: "Internetradio", params: "type=internet" },
      { label: "TechniSat", params: "brand=TechniSat" },
    ],
  },

  wäschetrockner: {
    name: "Wäschetrockner",
    description: "Wärmepumpen- und Kondenstrockner",
    icon: Fan,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Wärmepumpentrockner", params: "type=heat-pump" },
      { label: "Miele", params: "brand=Miele" },
      { label: "AEG", params: "brand=AEG" },
    ],
  },

  küchenmaschinen: {
    name: "Küchenmaschinen",
    description: "Knet- und Multifunktionsmaschinen",
    icon: Zap,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "KitchenAid", params: "brand=KitchenAid" },
      { label: "Bosch MUM", params: "series=mum" },
      { label: "Thermomix", params: "brand=Vorwerk" },
    ],
  },

  "bartschneider-haarschneider": {
    name: "Bartschneider & Haarschneider",
    description: "Haarpflege für Männer",
    icon: Zap,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Philips OneBlade", params: "model=oneblade" },
      { label: "Braun", params: "brand=Braun" },
      { label: "Haarschneider", params: "type=hair" },
    ],
  },

  receiver: {
    name: "Receiver",
    description: "AV-Receiver und Verstärker",
    icon: Speaker,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "AV-Receiver", params: "type=av" },
      { label: "Denon", params: "brand=Denon" },
      { label: "Yamaha", params: "brand=Yamaha" },
    ],
  },

  mikrowellen: {
    name: "Mikrowellen",
    description: "Stand- und Einbaumikrowellen",
    icon: Zap,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Einbau-Mikrowelle", params: "type=built-in" },
      { label: "Samsung", params: "brand=Samsung" },
    ],
  },

  dunstabzugshauben: {
    name: "Dunstabzugshauben",
    description: "Wand-, Insel- und Unterbauhauben",
    icon: Fan,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Kopffreihaube", params: "type=angled" },
      { label: "60 cm breit", params: "width=60" },
    ],
  },

  "hard-drives": {
    name: "Festplatten",
    description: "HDD Speicherlösungen",
    icon: HardDrive,
    parent: "elektroartikel",
    categoryType: "analytical",
    unitType: "TB",
    unitLabel: "pro TB",
    popularFilters: [
      { label: "4 TB", params: "capacity=4" },
      { label: "NAS-Festplatte", params: "type=nas" },
    ],
  },

  gefrierschränke: {
    name: "Gefrierschränke",
    description: "Gefrierschränke und Truhen",
    icon: Thermometer,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Liebherr", params: "brand=Liebherr" },
      { label: "NoFrost", params: "features=nofrost" },
    ],
  },

  herde: {
    name: "Herde",
    description: "Stand- und Einbauherde",
    icon: Zap,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Induktionsherd", params: "type=induction" },
      { label: "Herd-Set", params: "type=set" },
    ],
  },

  drones: {
    name: "Drohnen",
    description: "Kameradrohnen und Quadcopters",
    icon: Camera,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "DJI Mini", params: "series=mini" },
      { label: "4K Kamera", params: "resolution=4k" },
    ],
  },

  nas: {
    name: "NAS-Server",
    description: "Netzwerkspeicher für zuhause",
    icon: Server,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Synology", params: "brand=Synology" },
      { label: "4-Bay NAS", params: "bays=4" },
    ],
  },

  kompaktkameras: {
    name: "Kompaktkameras",
    description: "Handliche Digitalkameras",
    icon: Camera,
    parent: "elektroartikel",
    categoryType: "standard",
    popularFilters: [
      { label: "Vlog-Kamera", params: "use=vlog" },
      { label: "Sony RX100", params: "series=rx100" },
    ],
  },

  medien: {
    name: "Medien",
    description: "Musik, Filme und Games",
    icon: Search,
    parent: "elektroartikel",
    categoryType: "standard",
  },

  // --- PC-KOMPONENTEN (Hardware focus) ---
  "pc-komponenten": {
    name: "PC-Komponenten",
    description: "Hardware für Ihren PC",
    icon: Cpu,
    parent: "computer",
    categoryType: "standard",
    imageUrl: "/images/category/festplatten-&-ssds.jpg",
    popularFilters: [
      { label: "Grafikkarten", href: "/gpu" },
      { label: "Laufwerke", href: "/storage" },
      { label: "RAM", href: "/ram" },
      { label: "CPU", href: "/cpu" },
      { label: "PC-Gehäuse", href: "/pc-cases" },
    ],
  },
  gpu: {
    name: "Grafikkarten",
    description: "NVIDIA, AMD & Intel GPUs vergleichen",
    icon: Video,
    parent: "pc-komponenten",
    categoryType: "analytical",
    unitType: "GB",
    unitLabel: "pro GB VRAM",
    popularFilters: [
      { label: "RTX 4070", params: "model=RTX+4070" },
      { label: "RTX 4080", params: "model=RTX+4080" },
      { label: "RX 7800 XT", params: "model=RX+7800+XT" },
    ],
  },
  motherboards: {
    name: "Mainboards",
    description: "Motherboards für Intel & AMD",
    icon: Server,
    parent: "pc-komponenten",
    categoryType: "standard",
    popularFilters: [
      { label: "AM5 Mainboards", params: "socket=AM5" },
      { label: "LGA 1700", params: "socket=LGA1700" },
      { label: "B650 Chipsatz", params: "chipset=B650" },
    ],
  },
  ram: {
    name: "Arbeitsspeicher",
    description: "DDR4 & DDR5 RAM Module",
    icon: MemoryStick,
    parent: "pc-komponenten",
    categoryType: "analytical",
    unitType: "GB",
    unitLabel: "pro GB",
    popularFilters: [
      { label: "DDR5 RAM", params: "type=DDR5" },
      { label: "32GB Kits", params: "capacity=32" },
      { label: "6000 MHz", params: "speed=6000" },
    ],
  },
  "pc-cases": {
    name: "PC-Gehäuse",
    description: "Computergehäuse für Ihren Build",
    icon: Server,
    parent: "pc-komponenten",
    categoryType: "standard",
    popularFilters: [
      { label: "Midi-Tower", params: "type=midi-tower" },
      { label: "Big-Tower", params: "type=big-tower" },
      { label: "Mini-ITX Gehäuse", params: "type=mini-itx" },
    ],
  },
  "power-supplies": {
    name: "Netzteile",
    description: "Effiziente Stromversorgung",
    icon: Zap,
    parent: "pc-komponenten",
    categoryType: "analytical",
    unitType: "W",
    unitLabel: "pro Watt",
    popularFilters: [
      { label: "80 PLUS Gold", params: "efficiency=gold" },
      { label: "750 Watt", params: "wattage=750" },
      { label: "Vollmodular", params: "modularity=full" },
    ],
  },
  "cpu-coolers": {
    name: "CPU-Kühler",
    description: "Luft- & Wasserkühlung",
    icon: Fan,
    parent: "pc-komponenten",
    categoryType: "standard",
    popularFilters: [
      { label: "Luftkühler", params: "type=air" },
      { label: "Wasserkühlung (AiO)", params: "type=aio" },
    ],
  },
  "case-fans": {
    name: "Gehäuselüfter",
    description: "Kühlung für Ihren PC",
    icon: Fan,
    parent: "pc-komponenten",
    categoryType: "standard",
    popularFilters: [
      { label: "120mm Lüfter", params: "size=120" },
      { label: "140mm Lüfter", params: "size=140" },
      { label: "RGB Lüfter", params: "features=rgb" },
    ],
  },
  storage: {
    name: "Laufwerke",
    description: "Interne & externe Speicherlösungen",
    icon: HardDrive,
    parent: "pc-komponenten",
    categoryType: "standard",
    popularFilters: [
      { label: "SSDs", href: "/ssds" },
      { label: "Festplatten (HDD)", params: "type=hdd" },
      { label: "Externe Festplatten", href: "/external-storage" },
    ],
  },
  ssds: {
    name: "SSDs",
    description: "Schnelle Solid State Drives",
    icon: HardDrive,
    parent: "storage",
    categoryType: "analytical",
    unitType: "TB",
    unitLabel: "pro TB",
    popularFilters: [
      { label: "M.2 SSDs (NVMe)", params: "interface=m2-nvme" },
      { label: "SATA SSDs", params: "interface=sata" },
      { label: "PS5 SSDs", params: "compatible=ps5" },
    ],
  },

  "thermal-paste": {
    name: "Wärmeleitpaste",
    description: "Thermische Verbindung",
    icon: Thermometer,
    parent: "pc-komponenten",
    categoryType: "standard",
    popularFilters: [
      { label: "Arctic MX-4", params: "brand=Arctic" },
      { label: "Thermal Grizzly", params: "brand=Thermal+Grizzly" },
    ],
  },
  "smartwatch-accessories": {
    name: "Smartwatch-Zubehör",
    description: "Bänder & Ladestationen",
    icon: Watch,
    parent: "telekommunikation",
    categoryType: "standard",
  },

  smartphones: {
    name: "Smartphones",
    description: "Handys & Smartphones",
    icon: Smartphone,
    parent: "telekommunikation",
    categoryType: "standard",
    popularFilters: [
      { label: "iPhone", params: "brand=Apple" },
      { label: "Samsung Galaxy", params: "brand=Samsung" },
    ],
  },

  smartwatches: {
    name: "Smartwatches",
    description: "Wearables & Watches",
    icon: Watch,
    parent: "telekommunikation",
    categoryType: "standard",
  },

  consoles: {
    name: "Spielekonsolen",
    description: "PS5, Xbox, Switch",
    icon: Gamepad2,
    parent: "elektroartikel",
    categoryType: "standard",
  },

  cameras: {
    name: "Digitalkameras",
    description: "Kameras & Optik",
    icon: Camera,
    parent: "fotografie",
    categoryType: "standard",
  },

  keyboards: {
    name: "Tastaturen",
    description: "Keyboards & Eingabegeräte",
    icon: Keyboard,
    parent: "computer",
    categoryType: "standard",
  },

  mice: {
    name: "Mäuse",
    description: "Präzisionsmäuse",
    icon: Mouse,
    parent: "computer",
    categoryType: "standard",
  },

  "mouse-pads": {
    name: "Mauspads",
    description: "Unterlagen",
    icon: Mouse,
    parent: "computer",
    categoryType: "standard",
  },

  "external-storage": {
    name: "Externe Speicher",
    description: "Portable HDDs & SSDs",
    icon: HardDrive,
    parent: "storage",
    categoryType: "analytical",
    unitType: "TB",
    unitLabel: "pro TB",
  },

  "usb-hubs": {
    name: "USB-Hubs",
    description: "Port-Erweiterungen",
    icon: Usb,
    parent: "computer",
    categoryType: "standard",
  },

  "docking-stations": {
    name: "Docking-Stationen",
    description: "Laptop-Docks",
    icon: Usb,
    parent: "computer",
    categoryType: "standard",
  },

  "network-switches": {
    name: "Netzwerk-Switches",
    description: "Ethernet-Verteiler",
    icon: Network,
    parent: "computer",
    categoryType: "standard",
  },

  "network-cards": {
    name: "Netzwerkkarten",
    description: "WLAN-Karten",
    icon: Network,
    parent: "computer",
    categoryType: "standard",
  },

  cables: {
    name: "Kabel & Adapter",
    description: "Verbindungen",
    icon: Cable,
    parent: "computer",
    categoryType: "standard",
  },

  "laptop-stands": {
    name: "Laptop-Ständer",
    description: "Halterungen",
    icon: Laptop,
    parent: "computer",
    categoryType: "standard",
  },

  ups: {
    name: "USV",
    description: "Notstrom",
    icon: Battery,
    parent: "computer",
    categoryType: "standard",
  },

  "cable-management": {
    name: "Kabelmanagement",
    description: "Ordnung",
    icon: Cable,
    parent: "computer",
    categoryType: "standard",
  },

  "monitor-arms": {
    name: "Monitorhalterungen",
    description: "Arme & Halter",
    icon: MonitorCheck,
    parent: "computer",
    categoryType: "standard",
  },

  "desk-accessories": {
    name: "Schreibtisch-Zubehör",
    description: "Ordnung am Tisch",
    icon: Package,
    parent: "computer",
    categoryType: "standard",
  },

  "office-chairs": {
    name: "Bürostühle",
    description: "Ergonomie",
    icon: Armchair,
    parent: "computer",
    categoryType: "standard",
  },

  "standing-desks": {
    name: "Stehschreibtische",
    description: "Höhenverstellbar",
    icon: Monitor,
    parent: "computer",
    categoryType: "standard",
  },

  "tablet-accessories": {
    name: "Tablet-Zubehör",
    description: "Hüllen & Stifte",
    icon: Tablet,
    parent: "computer",
    categoryType: "standard",
  },

  "phone-accessories": {
    name: "Handy-Zubehör",
    description: "Schutz & Power",
    icon: Smartphone,
    parent: "telekommunikation",
    categoryType: "standard",
  },

  "game-controllers": {
    name: "Game-Controller",
    description: "Gamepads",
    icon: Gamepad2,
    parent: "elektroartikel",
    categoryType: "standard",
  },

  "vr-headsets": {
    name: "VR-Brillen",
    description: "Virtual Reality",
    icon: Glasses,
    parent: "elektroartikel",
    categoryType: "standard",
  },

  microphones: {
    name: "Mikrofone",
    description: "Audio-Aufnahme",
    icon: Mic,
    parent: "hifi-audio",
    categoryType: "standard",
  },

  "gaming-chairs": {
    name: "Gaming-Stühle",
    description: "Zocker-Sessel",
    icon: Armchair,
    parent: "elektroartikel",
    categoryType: "standard",
  },

  webcams: {
    name: "Webcams",
    description: "Videokonferenz",
    icon: Camera,
    parent: "computer",
    categoryType: "standard",
  },

  "capture-cards": {
    name: "Capture-Karten",
    description: "Streaming-Hardware",
    icon: Video,
    parent: "computer",
    categoryType: "standard",
  },

  cpu: {
    name: "Prozessoren",
    description: "CPUs von Intel & AMD",
    icon: Cpu,
    parent: "pc-komponenten",
    categoryType: "analytical",
    unitType: "core",
    unitLabel: "pro Kern",
    popularFilters: [
      { label: "Sockel AM5", params: "socket=AM5" },
      { label: "Sockel 1700", params: "socket=LGA1700" },
    ],
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
  let current: Category | undefined = allCategories[categorySlug];

  while (current) {
    breadcrumbs.unshift(current);
    if (current.parent) {
      current = allCategories[current.parent];
    } else {
      current = undefined;
    }
  }

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
 * Get all categories
 */
export function getAllCategories(): Category[] {
  return Object.values(allCategories);
}

/**
 * Get all standard categories (regular price comparison)
 */
export function getStandardCategories(): Category[] {
  return Object.values(allCategories).filter(
    (cat) => cat.categoryType === "standard" && !cat.hidden,
  );
}
