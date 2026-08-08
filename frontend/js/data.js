const imageUrl = (prompt, imageSize = "landscape_4_3") => {
  const encoded = encodeURIComponent(prompt);
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encoded}&image_size=${imageSize}`;
};

export const CATEGORIES = [
  "All",
  "Akara Specials",
  "Breakfast Combos",
  "Sides",
  "Drinks",
  "Family Packs",
];

export const MENU_ITEMS = [
  {
    id: "akara-pap-combo",
    name: "Akara & Pap Combo",
    description: "Hot crispy akara with silky pap, milk, and a hint of nutmeg.",
    category: "Breakfast Combos",
    price: 3200,
    bestseller: true,
    image: imageUrl(
      "Premium food photography, Nigerian akara fritters served with creamy pap in a ceramic bowl, modern minimalist styling, teal accents, natural morning light, ultra realistic, shallow depth of field"
    ),
  },
  {
    id: "akara-burger",
    name: "Akara Burger",
    description: "Akara patty, spicy suya mayo, crisp slaw, soft brioche bun.",
    category: "Akara Specials",
    price: 4500,
    bestseller: true,
    image: imageUrl(
      "Premium food photography, Nigerian akara burger on a dark slate plate, glossy brioche bun, crisp slaw, teal napkin, editorial lighting, ultra realistic, shallow depth of field"
    ),
  },
  {
    id: "akara-wrap",
    name: "Akara Wrap",
    description: "Warm tortilla wrap with akara, greens, tomatoes, and ata rodo aioli.",
    category: "Akara Specials",
    price: 3900,
    bestseller: true,
    image: imageUrl(
      "Premium food photography, Nigerian akara wrap sliced open, vibrant filling, minimalist plating, natural light, teal color accents, ultra realistic, 50mm lens"
    ),
  },
  {
    id: "moi-moi",
    name: "Moi Moi",
    description: "Steamed bean pudding with fish, egg, and peppers—soft and rich.",
    category: "Sides",
    price: 2200,
    bestseller: true,
    image: imageUrl(
      "Premium food photography, Nigerian moi moi wrapped presentation opened on plate, steam rising, elegant styling, dark charcoal background, ultra realistic"
    ),
  },
  {
    id: "yam-akara",
    name: "Yam & Akara",
    description: "Boiled yam slices with akara and pepper sauce—comforting and filling.",
    category: "Breakfast Combos",
    price: 3800,
    bestseller: true,
    image: imageUrl(
      "Premium food photography, Nigerian boiled yam and akara with red pepper sauce in small bowl, minimalist plate, natural light, ultra realistic"
    ),
  },
  {
    id: "family-breakfast-pack",
    name: "Family Breakfast Pack",
    description: "Akara, pap, moi moi, and drinks—perfect for sharing (serves 4).",
    category: "Family Packs",
    price: 12500,
    bestseller: true,
    image: imageUrl(
      "Premium food photography, Nigerian family breakfast spread with akara, pap, moi moi and drinks on modern table, airy composition, teal accents, ultra realistic"
    ),
  },
  {
    id: "akara-12pcs",
    name: "Akara (12 Pieces)",
    description: "Golden, fluffy inside, crisp outside. Made fresh to order.",
    category: "Akara Specials",
    price: 3000,
    image: imageUrl(
      "Premium food photography, Nigerian akara fritters stacked in a bowl, warm tones, minimalist background, ultra realistic, shallow depth of field"
    ),
  },
  {
    id: "akara-24pcs",
    name: "Akara (24 Pieces)",
    description: "More akara, more joy—ideal for small gatherings.",
    category: "Akara Specials",
    price: 5500,
    image: imageUrl(
      "Premium food photography, platter of Nigerian akara fritters with dipping sauce, elegant minimal style, ultra realistic"
    ),
  },
  {
    id: "pap-only",
    name: "Pap (Ogi) Bowl",
    description: "Silky smooth pap with milk and optional sugar.",
    category: "Breakfast Combos",
    price: 1500,
    image: imageUrl(
      "Premium food photography, Nigerian pap ogi in ceramic bowl, minimalist table setting, natural light, ultra realistic"
    ),
  },
  {
    id: "akara-pepper-sauce",
    name: "Ata Dindin Pepper Sauce",
    description: "Smoky pepper sauce for dipping—bold, spicy, addictive.",
    category: "Sides",
    price: 1200,
    image: imageUrl(
      "Premium food photography, Nigerian ata dindin pepper sauce in small bowl, glossy texture, dark background, ultra realistic"
    ),
  },
  {
    id: "plantain-bites",
    name: "Fried Plantain Bites",
    description: "Sweet ripe plantain, lightly caramelized, perfectly golden.",
    category: "Sides",
    price: 1800,
    image: imageUrl(
      "Premium food photography, Nigerian fried plantain dodo bites on plate, modern minimal, teal accent, ultra realistic"
    ),
  },
  {
    id: "zobo-chilled",
    name: "Chilled Zobo",
    description: "Hibiscus drink with pineapple and ginger—refreshing and bright.",
    category: "Drinks",
    price: 1400,
    image: imageUrl(
      "Premium food photography, chilled Nigerian zobo drink in glass with ice, condensation, minimalist styling, ultra realistic"
    ),
  },
  {
    id: "chapman",
    name: "Chapman (Classic)",
    description: "Bitter lemon + grenadine + cucumber + citrus—party in a cup.",
    category: "Drinks",
    price: 2000,
    image: imageUrl(
      "Premium food photography, Nigerian chapman drink in tall glass, cucumber slices, citrus, glossy look, ultra realistic"
    ),
  },
  {
    id: "water",
    name: "Bottled Water",
    description: "Cold and crisp.",
    category: "Drinks",
    price: 600,
    image: imageUrl(
      "Premium product photography, bottled water on clean background, minimalist, ultra realistic"
    ),
  },
  {
    id: "akara-mix-pack",
    name: "Akara Mix Pack",
    description: "Assorted akara with sauces—great for events (serves 6).",
    category: "Family Packs",
    price: 17500,
    image: imageUrl(
      "Premium food photography, Nigerian assorted akara platter with three dipping sauces, modern table, teal accents, ultra realistic"
    ),
  },
  {
    id: "weekend-brunch-pack",
    name: "Weekend Brunch Pack",
    description: "Akara, pap, plantain bites, moi moi, and chapman (serves 4).",
    category: "Family Packs",
    price: 15800,
    image: imageUrl(
      "Premium food photography, Nigerian brunch spread on table, airy composition, premium editorial styling, ultra realistic"
    ),
  },
  {
    id: "moinmoin-2",
    name: "Moi Moi (2 Wraps)",
    description: "Double wrap of rich moi moi with peppers and fish.",
    category: "Sides",
    price: 4000,
    image: imageUrl(
      "Premium food photography, Nigerian moi moi wraps on a plate, elegant styling, ultra realistic"
    ),
  },
  {
    id: "spicy-akara",
    name: "Spicy Akara (12 Pieces)",
    description: "Extra ata rodo and onions for a punchier akara.",
    category: "Akara Specials",
    price: 3400,
    image: imageUrl(
      "Premium food photography, spicy Nigerian akara fritters with red pepper garnish, dark plate, ultra realistic"
    ),
  },
  {
    id: "breakfast-duo",
    name: "Breakfast Duo",
    description: "Akara (6) + pap bowl—simple, classic, satisfying.",
    category: "Breakfast Combos",
    price: 2500,
    image: imageUrl(
      "Premium food photography, Nigerian breakfast duo of akara and pap, minimal composition, morning light, ultra realistic"
    ),
  },
];

export const TESTIMONIALS = [
  {
    name: "Amaka",
    area: "Ikeja",
    rating: 5,
    quote:
      "The akara arrived hot and crispy. Packaging was premium and delivery was fast.",
  },
  {
    name: "Tunde",
    area: "Lekki",
    rating: 5,
    quote:
      "Akara Burger is elite. You can tell the ingredients are fresh—worth every naira.",
  },
  {
    name: "Zainab",
    area: "Surulere",
    rating: 4,
    quote:
      "Loved the pap texture and the spice level. Smooth ordering experience on mobile.",
  },
  {
    name: "Chinedu",
    area: "Yaba",
    rating: 5,
    quote:
      "Family pack saved our morning. Everything tasted like home, just more polished.",
  },
  {
    name: "Kemi",
    area: "Gbagada",
    rating: 5,
    quote:
      "Secure payment and quick checkout. This is the standard I want for food ordering.",
  },
  {
    name: "Seyi",
    area: "Victoria Island",
    rating: 4,
    quote:
      "Clean website, great photos, and the food delivered exactly as promised.",
  },
];

export const FAQS = [
  {
    q: "How fast is delivery?",
    a: "Most orders arrive within 45–90 minutes depending on distance, traffic, and order volume.",
  },
  {
    q: "Do you accept cash on delivery?",
    a: "For a smooth experience, we prioritize secure online payment. Cash on delivery will be introduced only where available.",
  },
  {
    q: "Is the akara made fresh?",
    a: "Yes. Akara is prepared fresh to order using authentic recipes and quality ingredients.",
  },
  {
    q: "Can I change my order after payment?",
    a: "If your order hasn’t started processing, contact support immediately and we’ll do our best to help.",
  },
];

export const OPEN_POSITIONS = [
  {
    id: "dispatch-rider",
    title: "Dispatch Rider (Contract)",
    location: "Lagos",
    type: "On-site",
  },
  {
    id: "kitchen-assistant",
    title: "Kitchen Assistant",
    location: "Lagos",
    type: "On-site",
  },
  {
    id: "customer-support",
    title: "Customer Support Associate",
    location: "Lagos",
    type: "Hybrid",
  },
];

export const BRAND = {
  name: "Nana's Akara",
  phone: "+2348066721971",
  email: "support@nanasakara.ng",
  addressLine: "Online-only kitchen, Port Harcourt, Rivers State",
  whatsappMessage: "Hi Nana's Akara — I need help with my order.",
};

