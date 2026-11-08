/* Lis Studio data. Everything on the Studio page is rendered from these arrays. */

const WARDROBES = [
  { id: "paris", label: "Paris" },
  { id: "europe", label: "Europe" },
  { id: "america", label: "America" },
  { id: "kazakh", label: "Qazaqstan" }
];

const PIECES = [
  {
    id: "p01", name: "Beaded drop-waist dress", wardrobe: "paris", decade: 1920, era: "1920s", price: 240,
    image: "img/paris-1920s.svg", alt: "Illustration of a 1920s Paris look: green beaded drop-waist dress, cloche hat and long pearls",
    tags: "dress beads fringe flapper jazz green",
    story: "In the 1920s hemlines rose towards the knee and the waist slid down to the hip. The straight, loose shape let women dance the Charleston all night, and glass beading caught the light of the new electric dance halls. Ours is hand-beaded on silk georgette."
  },
  {
    id: "p02", name: "Long pearl rope", wardrobe: "paris", decade: 1920, era: "1920s", price: 60,
    image: "img/paris-1920s.svg", alt: "Illustration of a 1920s Paris look with a long rope of pearls over a green dress",
    tags: "pearls necklace jewellery accessory",
    story: "Coco Chanel made costume jewellery respectable: real and faux pearls worn together, long enough to knot or swing. A rope that falls past the waist follows the long, straight line of the flapper dress."
  },
  {
    id: "p03", name: "Cream bar jacket", wardrobe: "paris", decade: 1950, era: "1950s", price: 310,
    image: "img/paris-1950s.svg", alt: "Illustration of a 1950s Paris look: cream bar jacket, full black pleated skirt and red pillbox hat",
    tags: "jacket new look dior cream tailoring",
    story: "In February 1947 Christian Dior showed his first collection, and the press called it the \"New Look\". After years of wartime rationing, the Bar jacket brought back the nipped waist and padded hip. We cut ours in wool-silk with a hidden inner corset."
  },
  {
    id: "p04", name: "Colour-block mini dress", wardrobe: "europe", decade: 1960, era: "1960s", price: 180,
    image: "img/europe-1960s.svg", alt: "Illustration of a 1960s European look: colour-block mini dress with orange dots and white boots",
    tags: "dress mini mod quant london colour",
    story: "Mary Quant's boutique on the King's Road made the miniskirt the uniform of Swinging London. Hemlines climbed, shapes became simple A-lines and colour came in flat, bold blocks. Ours is double-knit jersey that keeps its shape."
  },
  {
    id: "p05", name: "White go-go boots", wardrobe: "europe", decade: 1960, era: "1960s", price: 140,
    image: "img/europe-1960s.svg", alt: "Illustration of a 1960s European look finished with white mid-calf go-go boots",
    tags: "boots shoes white courreges space age",
    story: "André Courrèges showed flat white boots with his space-age collection in 1964, and they spread from the Paris runway to every dance floor in Europe. A low heel meant you could actually move in them."
  },
  {
    id: "p06", name: "High-waist flared trousers", wardrobe: "europe", decade: 1970, era: "1970s", price: 160,
    image: "img/europe-1970s.svg", alt: "Illustration of a 1970s European look: wide-brim hat, bell-sleeve blouse and rust flared trousers",
    tags: "trousers flares rust seventies boho",
    story: "By the seventies, trousers were everyday wear for women across Europe. Waists rose to the navel and legs flared wide over platform shoes, a shape that came from festival fields and folk revival. Ours are rust corduroy."
  },
  {
    id: "p07", name: "Padded power blazer", wardrobe: "america", decade: 1980, era: "1980s", price: 260,
    image: "img/america-1980s.svg", alt: "Illustration of a 1980s American look: hot pink blazer with big shoulders, black pencil skirt and briefcase",
    tags: "blazer jacket pink shoulders office power",
    story: "As more women moved into management in the 1980s, the blazer became armour: wide padded shoulders, a sharp lapel and a colour no one could miss. \"Dressing for success\" was a whole movement. Ours has removable shoulder pads."
  },
  {
    id: "p08", name: "Gold chain belt", wardrobe: "america", decade: 1980, era: "1980s", price: 70,
    image: "img/america-1980s.svg", alt: "Illustration of a 1980s American look with a gold belt cinching a pink blazer",
    tags: "belt gold chain accessory",
    story: "Eighties excess was worn at the waist. A gold chain belt cinched an oversized blazer back into shape and added shine from day to night. Ours is brass with a hook clasp, adjustable by four links."
  },
  {
    id: "p09", name: "Plaid flannel shirt", wardrobe: "america", decade: 1990, era: "1990s", price: 85,
    image: "img/america-1990s.svg", alt: "Illustration of a 1990s American look: plaid flannel shirt, baggy jeans, beanie and combat boots",
    tags: "shirt flannel plaid grunge seattle",
    story: "Grunge started in Seattle's music scene, where cheap flannel shirts were simply warm. In 1992 Marc Jacobs put grunge on the runway for Perry Ellis, and the thrift-store look went high fashion. Ours is brushed cotton, cut oversized."
  },
  {
    id: "p10", name: "Velvet kamzol", wardrobe: "kazakh", decade: 1900, era: "Heritage", price: 290,
    image: "img/kazakh-traditional.svg", alt: "Illustration of a traditional Kazakh look: tall white saukele headdress, turquoise dress and wine velvet vest",
    tags: "kamzol vest velvet wine embroidery toi bride",
    story: "The kamzol is a fitted vest worn over a long dress. Velvet in wine or deep blue, edged in gold thread, it was part of a bride's outfit at the toi, worn with the tall saukele headdress. Ours carries the koshkar-muiz ram's-horn ornament on the hem."
  },
  {
    id: "p11", name: "Gold ornament belt", wardrobe: "kazakh", decade: 1900, era: "Heritage", price: 120,
    image: "img/kazakh-traditional.svg", alt: "Illustration of a traditional Kazakh look with a gold ornament belt at the waist",
    tags: "belt gold ornament silver jewellery",
    story: "Metal belts with stamped and engraved plaques were family treasures in Kazakh households, often passed from mother to daughter. Each plaque repeats a plant or horn motif. Ours is gilded brass on a leather base."
  },
  {
    id: "p12", name: "Chapan-style long coat", wardrobe: "kazakh", decade: 2020, era: "Today", price: 340,
    image: "img/kazakh-modern.svg", alt: "Illustration of a modern Kazakh look: navy chapan-style coat with sky-blue ornament over cream trousers",
    tags: "coat chapan navy modern outerwear",
    story: "The chapan is a long robe that Kazakh families give to honoured guests. Today's Almaty designers cut it as a city overcoat: lighter wool, a clean collar and the ornament moved to the cuffs. Ours is navy wool with sky-blue embroidery."
  }
];

const DESIGNERS = [
  { id: "d1", name: "Amélie Rousseau", wardrobe: "paris", speciality: "Beadwork and bias cuts", era: "1920s to 1930s", fee: 180, leadDays: 21 },
  { id: "d2", name: "Lucien Marchand", wardrobe: "paris", speciality: "Corseted couture tailoring", era: "1940s to 1950s", fee: 220, leadDays: 28 },
  { id: "d3", name: "Freya Lindqvist", wardrobe: "europe", speciality: "Mod colour-block geometry", era: "1960s", fee: 150, leadDays: 18 },
  { id: "d4", name: "Marco Bellini", wardrobe: "europe", speciality: "Flares, suede and folk prints", era: "1970s", fee: 140, leadDays: 18 },
  { id: "d5", name: "Jordan Hayes", wardrobe: "america", speciality: "Power shoulders and sharp lapels", era: "1980s", fee: 160, leadDays: 21 },
  { id: "d6", name: "Riley Brooks", wardrobe: "america", speciality: "Deconstructed layers and denim", era: "1990s", fee: 120, leadDays: 14 },
  { id: "d7", name: "Aruzhan Seitkali", wardrobe: "kazakh", speciality: "Gold-thread embroidery, saukele", era: "Heritage", fee: 240, leadDays: 35 },
  { id: "d8", name: "Dias Nurlanov", wardrobe: "kazakh", speciality: "Modern chapan and city coats", era: "Today", fee: 200, leadDays: 25 }
];

const GARMENTS = [
  { id: "dress", label: "Dress", base: 220 },
  { id: "jacket", label: "Jacket or blazer", base: 260 },
  { id: "coat", label: "Long coat", base: 300 },
  { id: "trousers", label: "Trousers", base: 140 },
  { id: "skirt", label: "Skirt", base: 150 },
  { id: "headpiece", label: "Headpiece or hat", base: 180 },
  { id: "look", label: "Full look (3 pieces)", base: 520 }
];
