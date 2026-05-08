# Database Schema

This project is still using `localStorage` for live progress. The Prisma schema is a database-ready model for the next backend phase and should not be migrated or pushed until a safe PostgreSQL `DATABASE_URL` is configured.

## Setup

- Target database: PostgreSQL.
- Prisma schema: `prisma/schema.prisma`.
- Prisma config: `prisma.config.ts`, including the `DATABASE_URL` lookup required by Prisma 7.
- If `DATABASE_URL` is absent, the config uses a deliberately unusable local fallback so schema-only CLI commands can load without connecting to a real database.
- Do not run `prisma migrate`, `prisma db push`, or production data commands unless the target database is intentional.
- Once dependencies are installed, use `npx prisma generate` to generate the TypeScript client.

## Models

- `User`: account-level identity. It owns profile, progress, challenge attempts, and achievements.
- `UserProfile`: learner-facing stats and preferences such as display name, XP, streaks, hearts, locale settings, and user settings JSON.
- `World`: a course world such as World 1. It groups stages, lessons, and challenges.
- `Stage`: a section inside a world. It can represent normal lesson groups or a boss stage.
- `Lesson`: a teachable unit inside a stage. It stores vocabulary as JSON and owns ordered exercises.
- `Exercise`: a question or interaction inside a lesson. `content` stores prompt-specific JSON, and `answerKey` stores grading data.
- `Challenge`: daily, boss, or review challenge content. Challenge questions and settings live in JSON so the existing challenge shapes can be moved over gradually.
- `UserLessonProgress`: per-user lesson state, including status, XP earned, best score, attempts, timestamps, and resume state JSON.
- `UserStageProgress`: per-user stage state for unlocks and completion.
- `UserChallengeAttempt`: one challenge run by one user, including status, score, hearts left, answer JSON, and timing.
- `Achievement`: reusable achievement definition with optional criteria JSON.
- `UserAchievement`: per-user achievement state and unlock progress.

## Status Fields

- `ContentStatus`: publication lifecycle for worlds, stages, lessons, exercises, challenges, and achievements.
- `ProgressStatus`: learner unlock and completion state for lessons and stages.
- `ChallengeAttemptStatus`: result state for a challenge attempt.
- `AchievementStatus`: learner-facing achievement state.

## JSON Fields

JSON fields are intentionally used where the current app already has flexible TypeScript objects:

- `Lesson.vocabulary`
- `Exercise.content`
- `Exercise.answerKey`
- `Challenge.content`
- `UserProfile.settings`
- `UserLessonProgress.state`
- `UserStageProgress.state`
- `UserChallengeAttempt.answers`
- `Achievement.criteria`
- `Achievement.metadata`
- `UserAchievement.progress`

This keeps the first database version compatible with the current learning-data shapes while leaving room to normalize later if analytics or authoring workflows require it.
