export interface ClothingItem {
  id: string;
  name: string;
  category: "tops" | "bottoms" | "shoes" | "accessories" | "outerwear";
  color: string;
  colorHex: string;
  brand: string;
  image: string;
  season: string[];
  tags: string[];
  wearCount: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: string[];
  occasion: string;
  createdAt: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

export const wardrobeItems: ClothingItem[] = [
  {
    id: "1",
    name: "Cashmere Sweater",
    category: "tops",
    color: "Cream",
    colorHex: "#F5F5DC",
    brand: "Loro Piana",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop",
    season: ["fall", "winter"],
    tags: ["casual", "luxury"],
    wearCount: 12,
  },
  {
    id: "2",
    name: "Silk Blouse",
    category: "tops",
    color: "Ivory",
    colorHex: "#FFFFF0",
    brand: "Equipment",
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=500&fit=crop",
    season: ["spring", "summer"],
    tags: ["elegant", "work"],
    wearCount: 8,
  },
  {
    id: "3",
    name: "Linen Shirt",
    category: "tops",
    color: "White",
    colorHex: "#FFFFFF",
    brand: "Brunello Cucinelli",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
    season: ["spring", "summer"],
    tags: ["casual", "vacation"],
    wearCount: 15,
  },
  {
    id: "4",
    name: "Merino Turtleneck",
    category: "tops",
    color: "Black",
    colorHex: "#1a1a1a",
    brand: "The Row",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
    season: ["fall", "winter"],
    tags: ["minimal", "classic"],
    wearCount: 20,
  },
  {
    id: "5",
    name: "Wool Trousers",
    category: "bottoms",
    color: "Charcoal",
    colorHex: "#36454F",
    brand: "Zegna",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop",
    season: ["fall", "winter", "spring"],
    tags: ["work", "formal"],
    wearCount: 18,
  },
  {
    id: "6",
    name: "High-Waist Jeans",
    category: "bottoms",
    color: "Indigo",
    colorHex: "#3F5D9D",
    brand: "AGOLDE",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop",
    season: ["all"],
    tags: ["casual", "everyday"],
    wearCount: 25,
  },
  {
    id: "7",
    name: "Pleated Skirt",
    category: "bottoms",
    color: "Camel",
    colorHex: "#C19A6B",
    brand: "Max Mara",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj50?w=400&h=500&fit=crop",
    season: ["fall", "spring"],
    tags: ["elegant", "work"],
    wearCount: 6,
  },
  {
    id: "8",
    name: "Leather Loafers",
    category: "shoes",
    color: "Burgundy",
    colorHex: "#800020",
    brand: "Tod's",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop",
    season: ["all"],
    tags: ["classic", "work"],
    wearCount: 30,
  },
  {
    id: "9",
    name: "Suede Ankle Boots",
    category: "shoes",
    color: "Taupe",
    colorHex: "#483C32",
    brand: "Gianvito Rossi",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop",
    season: ["fall", "winter"],
    tags: ["elegant", "versatile"],
    wearCount: 14,
  },
  {
    id: "10",
    name: "White Sneakers",
    category: "shoes",
    color: "White",
    colorHex: "#FFFFFF",
    brand: "Common Projects",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    season: ["all"],
    tags: ["casual", "everyday"],
    wearCount: 45,
  },
  {
    id: "11",
    name: "Silk Scarf",
    category: "accessories",
    color: "Multi",
    colorHex: "#E8D5B7",
    brand: "Hermès",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
    season: ["all"],
    tags: ["luxury", "accent"],
    wearCount: 8,
  },
  {
    id: "12",
    name: "Leather Belt",
    category: "accessories",
    color: "Brown",
    colorHex: "#8B4513",
    brand: "Bottega Veneta",
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=400&fit=crop",
    season: ["all"],
    tags: ["classic", "everyday"],
    wearCount: 35,
  },
  {
    id: "13",
    name: "Cashmere Coat",
    category: "outerwear",
    color: "Camel",
    colorHex: "#C19A6B",
    brand: "Max Mara",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop",
    season: ["fall", "winter"],
    tags: ["luxury", "classic"],
    wearCount: 22,
  },
  {
    id: "14",
    name: "Leather Jacket",
    category: "outerwear",
    color: "Black",
    colorHex: "#1a1a1a",
    brand: "Acne Studios",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
    season: ["fall", "spring"],
    tags: ["edgy", "versatile"],
    wearCount: 28,
  },
  {
    id: "15",
    name: "Gold Necklace",
    category: "accessories",
    color: "Gold",
    colorHex: "#FFD700",
    brand: "Mejuri",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    season: ["all"],
    tags: ["elegant", "everyday"],
    wearCount: 40,
  },
];

export const outfits: Outfit[] = [
  {
    id: "o1",
    name: "Monday Meeting",
    items: ["4", "5", "8"],
    occasion: "Work",
    createdAt: "2024-01-15",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop",
  },
  {
    id: "o2",
    name: "Weekend Brunch",
    items: ["3", "6", "10"],
    occasion: "Casual",
    createdAt: "2024-01-14",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
  },
  {
    id: "o3",
    name: "Date Night",
    items: ["2", "7", "9", "15"],
    occasion: "Evening",
    createdAt: "2024-01-12",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
  },
  {
    id: "o4",
    name: "Cozy Sunday",
    items: ["1", "6", "10"],
    occasion: "Casual",
    createdAt: "2024-01-10",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop",
  },
];

export const storeProducts: Product[] = [
  {
    id: "p1",
    name: "Oversized Wool Blazer",
    brand: "The Frankie Shop",
    price: 495,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop",
    category: "Outerwear",
    description: "A beautifully tailored oversized blazer in premium Italian wool. Features padded shoulders and a relaxed fit that drapes elegantly.",
  },
  {
    id: "p2",
    name: "Ribbed Knit Dress",
    brand: "Totême",
    price: 390,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
    category: "Dresses",
    description: "Minimalist ribbed knit midi dress with a figure-hugging silhouette. Perfect for layering or wearing alone.",
  },
  {
    id: "p3",
    name: "Leather Crossbody Bag",
    brand: "Mansur Gavriel",
    price: 595,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
    category: "Accessories",
    description: "Handcrafted leather crossbody bag with gold-tone hardware. Features an adjustable strap and interior pocket.",
  },
  {
    id: "p4",
    name: "Cashmere Cardigan",
    brand: "Nili Lotan",
    price: 750,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
    category: "Knitwear",
    description: "Luxuriously soft cashmere cardigan with mother-of-pearl buttons. A timeless wardrobe essential.",
  },
  {
    id: "p5",
    name: "Wide-Leg Trousers",
    brand: "Vince",
    price: 295,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
    category: "Bottoms",
    description: "Flowing wide-leg trousers in a silk-blend fabric. High-waisted with a flattering drape.",
  },
  {
    id: "p6",
    name: "Suede Mules",
    brand: "By Far",
    price: 420,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop",
    category: "Shoes",
    description: "Elegant suede mules with a sculptural heel. Italian craftsmanship meets modern design.",
  },
  {
    id: "p7",
    name: "Linen Midi Skirt",
    brand: "Reformation",
    price: 178,
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj50?w=400&h=500&fit=crop",
    category: "Bottoms",
    description: "Sustainable linen midi skirt with a flattering A-line silhouette. Perfect for warm weather.",
  },
  {
    id: "p8",
    name: "Statement Earrings",
    brand: "Jennifer Fisher",
    price: 350,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
    category: "Jewelry",
    description: "Bold gold-plated hoop earrings that add instant sophistication to any outfit.",
  },
];

export const userProfile = {
  name: "Alexandra Chen",
  email: "alex.chen@example.com",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  memberSince: "2023",
  totalItems: 48,
  totalOutfits: 24,
  favoriteColors: ["Black", "Cream", "Camel"],
  styleProfile: "Minimalist Luxe",
};
