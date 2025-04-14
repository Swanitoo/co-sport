This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Optimisations Next.js 15 pour Co-Sport

Ce document résume les améliorations de performance mises en place pour optimiser le site Co-Sport avec Next.js 15.

## Optimisations principales

1. **Partial Prerendering (PPR)** :

   - Activation du drapeau `unstable_partialPrerendering` dans les pages statiques
   - Utilisation de `noStore()` pour les sections dynamiques
   - Meilleure séparation des composants statiques et dynamiques

2. **Optimisation des images** :

   - Création d'un composant `ImageClient` optimisé pour Next.js 15
   - Utilisation de `fetchPriority`, `contentVisibility` et `aspectRatio` pour améliorer le CLS
   - Chargement différé intelligent avec Intersection Observer

3. **Optimisation des Core Web Vitals** :

   - Améliorations pour INP (Interaction to Next Paint)
   - Mémoisation des composants avec `React.memo`
   - Préchargement des ressources critiques

4. **Réduction du JavaScript côté client** :

   - Limitation du nombre d'icônes parallaxes sur mobile
   - Optimisation des animations avec CSS plutôt que JavaScript
   - Utilisation de `requestIdleCallback` pour les tâches non critiques

5. **Optimisations de rendu** :
   - Ajout de clés aux composants dans Suspense
   - Séparation du contenu pour un streaming optimisé
   - Chargement optimisé des polices avec `next/font`

## Techniques avancées

1. **Optimisation de CSS** :

   - Utilisation de `contentVisibility` pour améliorer le rendu
   - Application de `contain` pour limiter le recalcul du layout

2. **Optimisation de la réactivité** :

   - Utilisation de `useCallback` pour les gestionnaires d'événements
   - Découpage des tâches coûteuses avec `startTransition`

3. **Optimisation du cache**:
   - Configuration optimale pour le Edge Runtime
   - Stratégies de revalidation adaptées à Next.js 15

## Résultats

Les optimisations ont permis d'améliorer significativement :

- Le score Lighthouse (Performance, Accessibilité, Meilleures pratiques, SEO)
- Les Core Web Vitals (LCP, INP, CLS)
- L'expérience utilisateur globale

Ces améliorations sont particulièrement importantes avec l'adoption d'INP comme nouvelle métrique Core Web Vital en remplacement de FID à partir de mars 2024.
