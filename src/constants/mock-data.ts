export interface Showroom {
  id: string;
  name: string;
  slug: string;
  address: string;
  mapsUrl: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  heroImage: string;
  description: string;
  brands: string[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  productCount: number;
}

export interface ProductMock {
  id: string;
  articleNumber: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  showroom: string;
  mrp: number;
  discount: number;
  finalPrice: number;
  image: string;
  coverImage?: string;
  images?: { filename: string; url: string; color?: string }[];
  imageCount?: number;
  hotSelling: boolean;
  hotSellingBadge?: "TRENDING" | "BEST_SELLER" | "SELLING_FAST";
  newArrival: boolean;
  available: boolean;
}

export const MOCK_SHOWROOMS: Showroom[] = [
  {
    id: "showroom-1",
    name: "Footcare Kick Sports",
    slug: "kick-sports",
    address: "9A Royal plaza, Near Honest Hotel, College Road, Bhuj, Gujarat 370001",
    mapsUrl: "https://maps.google.com/?q=Footcare+Kick+Sports+College+Road+Bhuj",
    phone: "+91 98794 59303",
    email: "footcarebhuj@gmail.com",
    openingTime: "09:30 AM",
    closingTime: "09:00 PM",
    heroImage: "linear-gradient(to right bottom, #0f172a, #1e293b)",
    description: "Our athletic-focused showroom carrying the latest activewear and premium running ranges from Nike and Skechers.",
    brands: ["Nike", "Skechers"],
  },
  {
    id: "showroom-2",
    name: "Foot Care Store",
    slug: "foot-care-store",
    address: "Opp. Mandvi Octroi, College Bhuj, Gujarat 370001, India",
    mapsUrl: "https://maps.google.com/?q=Foot+Care+Store+Station+Road+Bhuj",
    phone: "+91 98794 59303",
    email: "footcarebhuj@gmail.com",
    openingTime: "10:00 AM",
    closingTime: "09:30 PM",
    heroImage: "linear-gradient(to right bottom, #1e1b4b, #312e81)",
    description: "Our flagship retail store featuring comfort, casual, and lifestyle footwear collections including Puma and Jockey comfort wear.",
    brands: ["Puma", "Jockey"],
  },
  {
    id: "showroom-3",
    name: "Foot Care Mall",
    slug: "foot-care-mall",
    address: "Near Jay nagar Bus stop, Patel Tower 3, Near K.D Hero, Bhuj, Gujarat 370001",
    mapsUrl: "https://maps.google.com/?q=Royal+Arcade+Air+Force+Road+Bhuj",
    phone: "+91 98794 59303",
    email: "footcarebhuj@gmail.com",
    openingTime: "10:00 AM",
    closingTime: "10:00 PM",
    heroImage: "linear-gradient(to right bottom, #1c1917, #44403c)",
    description: "An upscale shopping experience displaying premium apparel, accessories, and formal shoes for the whole family.",
    brands: ["Asics", "Joybean"],
  },
];

export const MOCK_BRANDS: Brand[] = [
  {
    id: "brand-1",
    name: "Nike",
    slug: "nike",
    logo: "NIKE",
    banner: "linear-gradient(135deg, #f53f3f 0%, #ff8c00 100%)",
    description: "The global leader in athletic footwear, apparel, and equipment, bringing innovation and inspiration to every athlete.",
    productCount: 148,
  },
  {
    id: "brand-2",
    name: "Skechers",
    slug: "skechers",
    logo: "SKECHERS",
    banner: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    description: "Known globally for comfort, style, and innovative walking and casual footwear ranges.",
    productCount: 95,
  },
  {
    id: "brand-3",
    name: "Puma",
    slug: "puma",
    logo: "PUMA",
    banner: "linear-gradient(135deg, #000000 0%, #434343 100%)",
    description: "Forever Faster brand offering sleek street style, running wear, and lifestyle apparel.",
    productCount: 112,
  },
  {
    id: "brand-4",
    name: "Jockey",
    slug: "jockey",
    logo: "JOCKEY",
    banner: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    description: "Premium innerwear, activewear, and leisurewear engineered for comfort and daily performance.",
    productCount: 64,
  },
  {
    id: "brand-5",
    name: "Asics",
    slug: "asics",
    logo: "ASICS",
    banner: "linear-gradient(135deg, #0052ff 0%, #00d2ff 100%)",
    description: "Sound Mind, Sound Body. High performance running and technical sports footwear.",
    productCount: 88,
  },
  {
    id: "brand-6",
    name: "Joybean",
    slug: "joybean",
    logo: "JOYBEAN",
    banner: "linear-gradient(135deg, #f75c03 0%, #d90429 100%)",
    description: "Vibrant, trendy lifestyle fashion and kids' footwear crafted for active play and all-day wear.",
    productCount: 42,
  },
];

export const MOCK_PRODUCTS: ProductMock[] = [
  {
    id: "prod-1",
    articleNumber: "NK-PEG-40",
    name: "Air Zoom Pegasus 40",
    slug: "air-zoom-pegasus-40",
    brand: "Nike",
    category: "Running Shoes",
    showroom: "Footcare Kick Sports",
    mrp: 11499,
    discount: 10,
    finalPrice: 10349,
    image: "/mock-pegasus.jpg",
    hotSelling: true,
    hotSellingBadge: "BEST_SELLER",
    newArrival: false,
    available: true,
  },
  {
    id: "prod-2",
    articleNumber: "SK-GO-WALK",
    name: "Go Walk Arch Fit",
    slug: "go-walk-arch-fit",
    brand: "Skechers",
    category: "Casual Shoes",
    showroom: "Foot Care Store",
    mrp: 6999,
    discount: 15,
    finalPrice: 5949,
    image: "/mock-skechers.jpg",
    hotSelling: false,
    newArrival: true,
    available: true,
  },
  {
    id: "prod-3",
    articleNumber: "PM-NITRO-2",
    name: "Deviate Nitro 2",
    slug: "deviate-nitro-2",
    brand: "Puma",
    category: "Sports Shoes",
    showroom: "Footcare Kick Sports",
    mrp: 15999,
    discount: 20,
    finalPrice: 12799,
    image: "/mock-puma.jpg",
    hotSelling: true,
    hotSellingBadge: "TRENDING",
    newArrival: true,
    available: true,
  },
  {
    id: "prod-4",
    articleNumber: "JK-TRACK-09",
    name: "Athletic Comfort Track Pants",
    slug: "athletic-comfort-track-pants",
    brand: "Jockey",
    category: "Apparel",
    showroom: "Foot Care Store",
    mrp: 2499,
    discount: 0,
    finalPrice: 2499,
    image: "/mock-jockey.jpg",
    hotSelling: false,
    newArrival: false,
    available: true,
  },
  {
    id: "prod-5",
    articleNumber: "AS-KAYANO-30",
    name: "GEL-Kayano 30",
    slug: "gel-kayano-30",
    brand: "Asics",
    category: "Running Shoes",
    showroom: "Foot Care Mall",
    mrp: 17999,
    discount: 5,
    finalPrice: 17099,
    image: "/mock-asics.jpg",
    hotSelling: true,
    hotSellingBadge: "SELLING_FAST",
    newArrival: true,
    available: true,
  },
];
