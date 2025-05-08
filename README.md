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

# co-sport.com

## Gestion des Erreurs et Surveillance

### Points d'API de Santé

L'application dispose de plusieurs endpoints pour surveiller son état de santé :

- `/api/health` : Endpoint simple pour vérifier que l'application fonctionne
- `/api/health/status` : Endpoint détaillé qui vérifie tous les composants (base de données, performance, etc.)

### Système de Gestion des Erreurs

Nous avons implémenté un système complet de gestion des erreurs :

1. **Middleware** : Capture les erreurs au niveau du middleware (`withMiddlewareErrorHandler`)
2. **Routes API** : Capture les erreurs dans les routes API (`withErrorHandler`)
3. **Composants React** : Gestion des erreurs avec des composants dédiés
   - `error.tsx` : Pour les erreurs de page
   - `global-error.tsx` : Pour les erreurs globales de l'application

### Bonnes Pratiques

- Toujours utiliser les wrappers `withErrorHandler` pour les routes API
- Vérifier les erreurs de base de données et les traiter correctement
- Éviter d'exposer les détails des erreurs en production

## Exigences Techniques

### Version de Node.js

L'application nécessite Node.js version `^18.18.0 || ^19.8.0 || >= 20.0.0`.
Actuellement, elle fonctionne avec Node.js `v20.19.1`.

Pour installer la bonne version avec NVM :

```
nvm use 20
```
