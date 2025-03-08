export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BE", name: "België/Belgique", flag: "🇧🇪" },
  { code: "CH", name: "Schweiz/Suisse", flag: "🇨🇭" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CG", name: "Congo", flag: "🇨🇬" },
  { code: "DE", name: "Deutschland", flag: "🇩🇪" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "LU", name: "Lëtzebuerg", flag: "🇱🇺" },
  { code: "MC", name: "Monaco", flag: "🇲🇨" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "NL", name: "Nederland", flag: "🇳🇱" },
  { code: "AT", name: "Österreich", flag: "🇦🇹" },
  { code: "DK", name: "Danmark", flag: "🇩🇰" },
  { code: "FI", name: "Suomi", flag: "🇫🇮" },
  { code: "GR", name: "Ελλάδα", flag: "🇬🇷" },
  { code: "IE", name: "Ireland/Éire", flag: "🇮🇪" },
  { code: "NO", name: "Norge", flag: "🇳🇴" },
  { code: "SE", name: "Sverige", flag: "🇸🇪" },
  { code: "PL", name: "Polska", flag: "🇵🇱" },
  { code: "CZ", name: "Česká republika", flag: "🇨🇿" },
  { code: "HR", name: "Hrvatska", flag: "🇭🇷" },
  { code: "HU", name: "Magyarország", flag: "🇭🇺" },
  { code: "RO", name: "România", flag: "🇷🇴" },
  { code: "SK", name: "Slovensko", flag: "🇸🇰" },
  { code: "SI", name: "Slovenija", flag: "🇸🇮" },
  { code: "BG", name: "България", flag: "🇧🇬" },
  { code: "EE", name: "Eesti", flag: "🇪🇪" },
  { code: "LV", name: "Latvija", flag: "🇱🇻" },
  { code: "LT", name: "Lietuva", flag: "🇱🇹" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "CY", name: "Κύπρος/Kıbrıs", flag: "🇨🇾" },
  { code: "JP", name: "日本", flag: "🇯🇵" },
  { code: "CN", name: "中国", flag: "🇨🇳" },
  { code: "KR", name: "대한민국", flag: "🇰🇷" },
  { code: "IN", name: "भारत", flag: "🇮🇳" },
  { code: "RU", name: "Россия", flag: "🇷🇺" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "EG", name: "مصر", flag: "🇪🇬" },
  { code: "MA", name: "المغرب", flag: "🇲🇦" },
  { code: "TN", name: "تونس", flag: "🇹🇳" },
  { code: "DZ", name: "الجزائر", flag: "🇩🇿" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "SA", name: "السعودية", flag: "🇸🇦" },
  { code: "AE", name: "الإمارات", flag: "🇦🇪" },
  { code: "IL", name: "ישראל", flag: "🇮🇱" },
  { code: "TR", name: "Türkiye", flag: "🇹🇷" },
  { code: "TH", name: "ประเทศไทย", flag: "🇹🇭" },
  { code: "VN", name: "Việt Nam", flag: "🇻🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "UA", name: "Україна", flag: "🇺🇦" },
  { code: "BY", name: "Беларусь", flag: "🇧🇾" },
  { code: "MD", name: "Moldova", flag: "🇲🇩" },
  { code: "IS", name: "Ísland", flag: "🇮🇸" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
].sort((a, b) => a.name.localeCompare(b.name));

export const getCountryFlag = (code: string): string => {
  return COUNTRIES.find((country) => country.code === code)?.flag || "🏳️";
};

export const getCountryName = (code: string): string => {
  return COUNTRIES.find((country) => country.code === code)?.name || code;
};
