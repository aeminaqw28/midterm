/* The eight Lis looks. Shared by the lookbook timeline, the look game,
   the style quiz and the account page (saved looks). */

const LOOKS = [
  {
    id: "flapper", name: "The Jazz-Age Flapper", wardrobe: "paris", decade: 1920, era: "1920s",
    image: "img/paris-1920s.svg", alt: "Illustration of a 1920s Paris look: green beaded drop-waist dress, cloche hat and long pearls",
    silhouette: "Straight, low waist", signature: "Cloche hat",
    pieces: ["Beaded drop-waist dress", "Cloche hat", "Long pearl rope", "T-strap shoes"],
    keyMoment: "1926: Vogue calls Chanel's simple black dress the \"Ford\" of fashion, a uniform for every woman.",
    history: "After the First World War, young Parisian women cut their hair into short bobs, raised their hemlines and let the waist fall to the hip. Designers such as Coco Chanel and Jean Patou made loose, sporty clothes that let women move, drive and dance. Heavy bead embroidery made dresses swing during the Charleston, and the cloche hat, pulled low over the eyes, only worked with short hair.",
    tip: "Swap the cloche for a beret and keep one long string of pearls over a simple slip dress.",
    occasions: ["party"], boldness: 4
  },
  {
    id: "newlook", name: "The New Look", wardrobe: "paris", decade: 1950, era: "1950s",
    image: "img/paris-1950s.svg", alt: "Illustration of a 1950s Paris look: cream bar jacket, full black pleated skirt and red pillbox hat",
    silhouette: "Hourglass, full skirt", signature: "Bar jacket",
    pieces: ["Cream bar jacket", "Full pleated skirt", "Pillbox hat", "White gloves"],
    keyMoment: "1947: Harper's Bazaar editor Carmel Snow calls Christian Dior's first collection a \"New Look\".",
    history: "After years of wartime fabric rationing, Christian Dior's 1947 debut used metres of cloth in a single skirt. The Bar jacket had a padded hip and a tiny waist, and the skirt swung below the calf. Some people protested the waste, but the hourglass shape ruled the 1950s, from Paris couture to the department-store copies sold around the world.",
    tip: "Wear one nipped jacket with straight trousers. The waist does the work.",
    occasions: ["everyday", "work", "party"], boldness: 2
  },
  {
    id: "mod", name: "The Mod Mini", wardrobe: "europe", decade: 1960, era: "1960s",
    image: "img/europe-1960s.svg", alt: "Illustration of a 1960s European look: colour-block mini dress with orange dots and white boots",
    silhouette: "A-line, above the knee", signature: "Go-go boots",
    pieces: ["Colour-block mini dress", "White go-go boots", "Geometric bob", "Round gold earrings"],
    keyMoment: "1966: Mary Quant, whose London boutique Bazaar helped launch the miniskirt, is made an OBE.",
    history: "In the 1960s, fashion started on the street instead of the salon. Mary Quant's shop on the King's Road sold short, simple dresses to young Londoners, and Paris answered with André Courrèges' space-age white boots. Geometric haircuts, bold op-art prints and flat colour blocks made the decade look like the future.",
    tip: "Pair a colour-block mini with flat boots and keep the rest plain.",
    occasions: ["party", "everyday"], boldness: 5
  },
  {
    id: "flare", name: "The Open-Road Flare", wardrobe: "europe", decade: 1970, era: "1970s",
    image: "img/europe-1970s.svg", alt: "Illustration of a 1970s European look: wide-brim hat, bell-sleeve blouse and rust flared trousers",
    silhouette: "Fitted top, wide leg", signature: "Flared trousers",
    pieces: ["High-waist flared trousers", "Bell-sleeve blouse", "Suede waistcoat", "Wide-brim hat"],
    keyMoment: "1970s: trousers become everyday wear for women at work and at school across Europe.",
    history: "The seventies took the hippie and folk revival of the late sixties into ordinary wardrobes. Waists rose, trouser legs flared over platform shoes, and earthy colours like rust, mustard and brown filled the shops. Suede, fringe and peasant blouses came from travel, festivals and a new interest in craft and the countryside.",
    tip: "High-waist flares with a plain tucked tee. One seventies piece is enough.",
    occasions: ["travel", "everyday"], boldness: 3
  },
  {
    id: "power", name: "The Power Blazer", wardrobe: "america", decade: 1980, era: "1980s",
    image: "img/america-1980s.svg", alt: "Illustration of a 1980s American look: hot pink blazer with big shoulders, black pencil skirt and briefcase",
    silhouette: "Inverted triangle", signature: "Shoulder pads",
    pieces: ["Padded pink blazer", "Black pencil skirt", "Gold belt", "Leather briefcase"],
    keyMoment: "1977: John T. Molloy's dress-for-success advice for working women becomes a bestseller, setting up the power suit.",
    history: "As more American women moved into offices and management in the 1980s, the suit became a statement. Shoulder pads widened the frame, skirts narrowed into pencils, and colour got louder. Television dramas made the look famous, and gold jewellery, big hair and a briefcase finished the uniform of ambition.",
    tip: "Wear a sharp blazer over relaxed jeans. The shoulders carry the eighties on their own.",
    occasions: ["work"], boldness: 5
  },
  {
    id: "grunge", name: "The Grunge Layer", wardrobe: "america", decade: 1990, era: "1990s",
    image: "img/america-1990s.svg", alt: "Illustration of a 1990s American look: plaid flannel shirt, baggy jeans, beanie and combat boots",
    silhouette: "Loose, layered", signature: "Flannel shirt",
    pieces: ["Plaid flannel shirt", "Baggy light jeans", "Beanie", "Combat boots"],
    keyMoment: "1992: Marc Jacobs sends grunge down the runway for Perry Ellis and is fired for it.",
    history: "Grunge grew out of the Seattle music scene, where flannel shirts and thrift-store jeans were simply cheap and warm. When the bands went global, the look followed. The fashion industry first resisted, then copied it, and the nineties settled into a relaxed, layered style that still shapes casual clothes today.",
    tip: "Tie a flannel round the waist over clean straight jeans.",
    occasions: ["everyday", "travel"], boldness: 2
  },
  {
    id: "toi", name: "The Toi Bride", wardrobe: "kazakh", decade: 1900, era: "Heritage",
    image: "img/kazakh-traditional.svg", alt: "Illustration of a traditional Kazakh look: tall white saukele headdress, turquoise dress and wine velvet vest",
    silhouette: "Long, layered", signature: "Saukele",
    pieces: ["Saukele headdress", "Velvet kamzol", "Long turquoise dress", "Gold ornament belt"],
    keyMoment: "Tradition: a fine saukele was said to be worth a whole herd of horses.",
    history: "The saukele is a tall, cone-shaped bridal headdress, covered in silver plaques, coral, pearls and gold thread, often topped with owl feathers for protection. Families prepared it long before the wedding. The bride wore it with a long dress and a fitted velvet kamzol at the toi, the wedding feast, and the ornaments spoke of her family and her region.",
    tip: "Wear one ornamented velvet vest over a simple long dress.",
    occasions: ["toi", "party"], boldness: 4
  },
  {
    id: "modernist", name: "The Steppe Modernist", wardrobe: "kazakh", decade: 2020, era: "Today",
    image: "img/kazakh-modern.svg", alt: "Illustration of a modern Kazakh look: navy chapan-style coat with sky-blue ornament over cream trousers",
    silhouette: "Long, straight, wide", signature: "Ornamented coat",
    pieces: ["Chapan-style long coat", "Ornamented cuffs and hem", "Gold sash", "Wide cream trousers"],
    keyMoment: "Today: the chapan is still given to honoured guests, and Almaty designers cut it as a city coat.",
    history: "The chapan is a long robe that Kazakh families give as a mark of respect. Contemporary designers in Almaty and Astana keep its long, straight line but use lighter wool, cleaner collars and move the koshkar-muiz ram's-horn ornament to cuffs and hems. Heritage becomes a detail you can wear to the office.",
    tip: "One ornamented coat over neutrals. Let the pattern lead.",
    occasions: ["work", "toi", "travel"], boldness: 2
  }
];

const WARDROBE_LABELS = { paris: "Paris", europe: "Europe", america: "America", kazakh: "Qazaqstan" };

function findLook(id) {
  return LOOKS.find((look) => look.id === id);
}
