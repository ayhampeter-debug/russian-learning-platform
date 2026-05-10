export type SavedProgress = {
  completedLessonIds: string[];
  completedChallengeIds: string[];
  totalXp: number;
  hearts: number;
  currentStreak: number;
};

export type ProgressApiResponse = {
  signedIn: boolean;
  source: "database" | "local";
  progress: SavedProgress | null;
};
