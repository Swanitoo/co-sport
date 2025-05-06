import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
      },
    ],
  },
  // Configuration des en-têtes de sécurité HTTP
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stricte-Transport-Security
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // X-Frame-Options pour prévenir le clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // X-Content-Type-Options pour empêcher le MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer-Policy pour contrôler les informations transmises lors de la navigation
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions-Policy pour contrôler les fonctionnalités et API du navigateur
          {
            key: "Permissions-Policy",
            value:
              "camera=(), geolocation=(self), microphone=(), payment=(), usb=(), interest-cohort=()",
          },
          // Content-Security-Policy pour prévenir les attaques XSS
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://maps.googleapis.com https://pagead2.googlesyndication.com https://www.google-analytics.com https://connect.facebook.net https://www.google.com https://www.gstatic.com; connect-src 'self' https://www.google-analytics.com https://maps.googleapis.com https://api.strava.com; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://www.google.com https://www.youtube.com; object-src 'none'; base-uri 'none';",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
