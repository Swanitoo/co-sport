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

    const filteredResults = results.filter((result: NominatimResult) => {
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
