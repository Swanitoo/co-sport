import { env } from "@/env";
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

// Sports and outdoor activities keywords
const sportKeywords = [
  // Cities & Urban Areas
  "ville",
  "city",
  "ciudad",
  "stadt",
  "città",
  "cidade",
  "village",
  "pueblo",
  "dorf",
  "aldea",
  "vila",
  "town",
  "borough",
  "district",

  // Administrative Divisions
  "arrondissement",
  "quartier",
  "ward",
  "sector",
  "sector",
  "sektor",
  "district",
  "distrito",
  "bezirk",
  "distretto",
  "bairro",
  "region",
  "région",
  "región",
  "regione",
  "região",
  "prefecture",
  "préfecture",
  "prefectura",
  "commune",
  "comuna",
  "gemeinde",
  "comune",
  "municipality",
  "municipalité",
  "municipio",
  "municipalidade",

  // Geographic Areas
  "zone",
  "área",
  "zone",
  "zona",
  "bereich",
  "territory",
  "territoire",
  "territorio",
  "territorium",
  "department",
  "département",
  "departamento",
  "dipartimento",
  "state",
  "état",
  "estado",
  "stato",
  "staat",
  "province",
  "provincia",
  "provinz",
  "província",
  "county",
  "comté",
  "condado",
  "landkreis",
  "contea",

  // Neighborhoods
  "neighborhood",
  "quartier",
  "barrio",
  "viertel",
  "hood",
  "block",
  "îlot",
  "manzana",
  "quadra",
  "suburb",
  "banlieue",
  "suburbio",
  "vorort",
  "subúrbio",
  "community",
  "communauté",
  "comunidad",
  "gemeinschaft",

  // Infrastructure
  "downtown",
  "centre-ville",
  "centro",
  "innenstadt",
  "uptown",
  "urban area",
  "zone urbaine",
  "área urbana",
  "metropolitan",
  "métropolitain",
  "metropolitano",
  "central",
  "centrum",
  "centro",
  "zentrum",

  // Sports facilities
  "gym",
  "fitness",
  "arena",
  "piscine",
  "swimming",
  "gymnase",
  "dojo",
  "complexe sportif",
  "centre sportif",
  "stade",
  "terrain",
  "skatepark",
  "salle de sport",
  "salle de fitness",
  "salle de musculation",
  "piscine municipale",
  "centre aquatique",
  "tennis",
  "basket",
  "aire de jeux",
  "sport",
  "sportif",

  // Mountains and hiking
  "montagne",
  "mont",
  "aiguille",
  "roche",
  "rocher",
  "volcan",
  "montaña",
  "volcán",
  "monte",
  "berg",
  "nevado",
  "cerro",
  "cordillera",
  "sierra",
  "cumbre",
  "pico",
  "vulcão",
  "peak",
  "summit",
  "sommet",

  // Outdoor activities
  "hiking",
  "randonnée",
  "trail",
  "sentier",
  "trek",
  "trekking",
  "alpinisme",
  "mountaineering",
  "climbing",
  "escalade",
  "via ferrata",
  "canyon",
  "gorge",
  "cascade",
  "waterfall",
  "glacier",
  "outdoor",
  "plein air",
  "adventure",
  "aventure",
  "hike",
  "backpacking",

  // Nature
  "nature",
  "natural park",
  "parc naturel",
  "national park",
  "parc national",
];

const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[-\s]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query) {
    return new Response("Query parameter is required", { status: 400 });
  }

  try {
    const response = await client.textSearch({
      params: {
        query: `${query}`,
        key: env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 3000,
    });

    const results = response.data.results
      .filter((result) => {
        const normalizedName = normalizeText(result.name || "");
        const normalizedAddress = normalizeText(result.formatted_address || "");
        const types = result.types || [];

        const isRelevantType = types.some((type) =>
          [
            "natural_feature",
            "point_of_interest",
            "tourist_attraction",
            "gym",
            "stadium",
            "sports_complex",
            "park",
          ].includes(type)
        );

        const matchesKeywords = sportKeywords.some(
          (keyword) =>
            normalizedName.includes(normalizeText(keyword)) ||
            normalizedAddress.includes(normalizeText(keyword))
        );

        return isRelevantType || matchesKeywords;
      })
      .slice(0, 5);

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Places API error:", error);
    return new Response("Error fetching results", { status: 500 });
  }
}
