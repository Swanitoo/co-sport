/** @type {import('next-intl').NextIntlConfig} */
module.exports = {
  // Définir les locales disponibles
  locales: ["fr", "en", "es"],
  defaultLocale: "fr",
  // Optionnel : routes qui ne doivent pas être traduites
  excludedRoutes: ["/api/*", "/debug-page", "/test"],
  // Fonction pour charger les messages de traduction
  localeDetection: true,
};
