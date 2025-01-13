import { geocode } from "nominatim-browser";

interface NominatimAddress {
  leisure?: string;
  amenity?: string;
  building?: string;
  [key: string]: string | undefined;
}

interface NominatimResult {
  place_id: number;
  type: string;
  display_name: string;
  lat: string;
  lon: string;
  address: NominatimAddress;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[-\s]/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  if (!query) {
    return new Response("Query parameter required", { status: 400 });
  }

  try {
    const results = await geocode({
      q: query,
      countrycodes: ["fr"],
      addressdetails: true,
      limit: 20,
    });

    const sportKeywords = [
      // Indoor sports facilities
      "sport",
      "gym",
      "fitness",
      "arena",
      "piscine",
      "swimming",

      "Smart Fit",
      "basic-fit",
      "fitness park",
      "neoness",
      "keepcool",
      "l'orange bleue",
      "orange bleue",
      "magic form",
      "on air",
      "on air fitness",
      "Sportlife Fitness Club",

      // Établissements municipaux
      "gymnase",
      "complexe sportif",
      "centre sportif",
      "palais des sports",
      "salle omnisports",
      "salle polyvalente",
      "cosec",
      "dojo",

      // Types de salles spécifiques
      "salle de sport",
      "salle de fitness",
      "salle de musculation",
      "salle d'escalade",
      "climbing spot",
      "block out",
      "arkose",
      "salle de combat",
      "ring",
      "dojo",

      // Installations spécifiques
      "piscine municipale",
      "centre aquatique",
      "stade municipal",
      "court de tennis",
      "terrain de foot",
      "city stade",

      // Marques connues
      "urban soccer",
      "soccer park",
      "five",
      "futsal",
      "soccer five",
      "climb up",
      "blockout",
      "vertical art",

      // Outdoor sports facilities
      "stade",
      "terrain",
      "court",
      "field",
      "parc",
      "park",

      // Urban sports
      "skate",
      "skateboard",
      "skatepark",
      "roller",
      "bmx",
      "ramp",
      "bowl",
      "street",
      "urban",

      // Ball sports
      "tennis",
      "football",
      "basketball",

      // Mountain/Nature activities
      "sommet",
      "peak",
      "randonnée",
      "hiking",
      "escalade",
      "climbing",
      "montagne",
      "mountain",
      "mont",

      // Water activities
      "lac",
      "lake",
      "plage",
      "beach",

      // Generic
      "leisure",
    ];

    const excludedKeywords = [
      // Lieux religieux
      "mosque",
      "mosquée",
      "church",
      "église",
      "chapel",
      "chapelle",
      "temple",
      "synagogue",

      // Arabic terms
      "مسجد",
      "جامع",
      "مصلى",
      "كنيسة",
      "معبد",
      "مقبرة",
      "مدرسة",
      "مدينة",
      "حرم",

      // Transliterated Arabic
      "masjid",
      "jami",
      "musalla",
      "kanisa",
      "maqbara",
      "madrasa",
      "madina",
      "haram",

      // Countries/Regions to exclude
      "arabia",
      "arabie",
      "saudi",
      "saoud",
      "emirates",
      "émirats",
      "العربية",
      "السعودية",
      "الإمارات",

      // Religious terms
      "islamic",
      "islamique",
      "إسلامي",
      "muslim",
      "musulman",
      "مسلم",
      "minaret",
      "منارة",
      "mihrab",
      "محراب",
      "qibla",
      "قبلة",

      // Places
      "medina",
      "médina",
      "مدينة",
      "souk",
      "سوق",
      "cemetery",
      "cimetière",
      "مقبرة",
      "memorial",
      "mémorial",

      // Additional terms
      "holy",
      "saint",
      "sacré",
      "مقدس",
      "sanctuaire",
      "shrine",
      "ضريح",
    ];

    const isLatinOnly = (text: string) => {
      return /^[a-zA-Z0-9\s.,'\-()]+$/.test(text);
    };

    const filteredResults = results.filter((result: NominatimResult) => {
      if (
        result.display_name.length > 50 ||
        !isLatinOnly(result.display_name)
      ) {
        return false;
      }

      const normalizedTags = normalizeText(result.type || "");
      const normalizedName = normalizeText(result.display_name);
      const address = result.address || {};

      // Normalize address fields
      const normalizedLeisure = normalizeText(address.leisure || "");
      const normalizedAmenity = normalizeText(address.amenity || "");
      const normalizedSport = normalizeText(address.sport || "");
      const normalizedNatural = normalizeText(address.natural || "");

      return sportKeywords.some((keyword) => {
        const normalizedKeyword = normalizeText(keyword);
        return (
          normalizedTags.includes(normalizedKeyword) ||
          normalizedName.includes(normalizedKeyword) ||
          normalizedLeisure.includes(normalizedKeyword) ||
          normalizedAmenity.includes(normalizedKeyword) ||
          normalizedSport.includes(normalizedKeyword) ||
          normalizedNatural.includes(normalizedKeyword)
        );
      });
    });

    return new Response(
      JSON.stringify(filteredResults.length ? filteredResults : results),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Nominatim error:", error);
    return new Response(JSON.stringify({ error: "Error fetching venues" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
