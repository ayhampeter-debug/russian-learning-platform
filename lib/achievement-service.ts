import "server-only";

import { getPrismaClient } from "@/lib/prisma";

export type ProfileAchievementRow = {
  slug: string;
  title: string;
  description: string;
  status: "LOCKED" | "IN_PROGRESS" | "UNLOCKED";
  unlockedAt: string | null;
};

export async function getUserAchievementRows(userId: string | null) {
  if (!userId) {
    return [];
  }

  try {
    const rows = await getPrismaClient().userAchievement.findMany({
      where: { userId },
      include: {
        achievement: {
          select: {
            slug: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: [{ unlockedAt: "desc" }, { createdAt: "desc" }],
    });

    return rows.map((row) => ({
      slug: row.achievement.slug,
      title: row.achievement.title,
      description: row.achievement.description,
      status: row.status,
      unlockedAt: row.unlockedAt?.toISOString() ?? null,
    }));
  } catch {
    console.warn("Achievement load skipped: using inferred achievement fallback.");
    return [];
  }
}
