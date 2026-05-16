# YazkUp

YazkUp is a beta language learning platform built with Next.js App Router.
The live course teaches Russian through short lessons, XP, worlds, boss
challenges, mistake review, daily streaks, and English/Arabic explanations.

## Local Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Build for production:

```bash
npm run build
```

## Environment

Local development and production both require a `.env` or `.env.local` file with
the configured Clerk, database, and deployment values. Do not commit `.env`,
`.env.local`, or any file containing secret values.

## Main Routes

- `/` - homepage
- `/courses` - course catalog
- `/dashboard` - learner hub and progress
- `/worlds` - world and stage map
- `/lesson` and `/lesson/[lessonId]` - lesson sessions
- `/challenge` - boss challenge
- `/practice` - mistake review
- `/feedback` - beta feedback form
- `/profile` - learner profile
- `/settings` - language and theme preferences
- `/admin/feedback` - protected feedback management
- `/login` and `/signup` - Clerk authentication
