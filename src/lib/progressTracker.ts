/**
 * Utility functions for tracking user progress and achievements
 */

// Types for user progress
export interface UserProgress {
  level: number;
  experience: number;
  nextLevelExperience: number;
  achievements: Achievement[];
  stats: UserStats;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlockedAt?: Date;
  progress?: number; // 0-100
  maxProgress?: number;
}

export interface UserStats {
  testsCompleted: number;
  moodEntriesLogged: number;
  insightsGenerated: number;
  daysActive: number;
  traitsImproved: number;
  journalEntriesCreated: number;
}

export type AchievementCategory = 
  | 'tests' 
  | 'mood' 
  | 'insights' 
  | 'engagement' 
  | 'growth' 
  | 'social';

// Experience points for different actions
export const experiencePoints = {
  completeTest: 100,
  logMood: 10,
  generateInsights: 25,
  dailyLogin: 5,
  shareResults: 15,
  completeProfile: 20,
  readArticle: 5,
  weeklyStreak: 50,
  monthlyStreak: 200,
};

// Level thresholds (experience needed for each level)
export const levelThresholds = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  450,    // Level 4
  700,    // Level 5
  1000,   // Level 6
  1350,   // Level 7
  1750,   // Level 8
  2200,   // Level 9
  2700,   // Level 10
  3300,   // Level 11
  4000,   // Level 12
  4800,   // Level 13
  5700,   // Level 14
  6700,   // Level 15
  7800,   // Level 16
  9000,   // Level 17
  10300,  // Level 18
  11700,  // Level 19
  13200,  // Level 20
];

// Level titles
export const levelTitles = [
  'Novice Explorer',
  'Curious Mind',
  'Self-Observer',
  'Insight Seeker',
  'Pattern Recognizer',
  'Emotional Navigator',
  'Trait Analyst',
  'Personality Enthusiast',
  'Self-Awareness Adept',
  'Mindfulness Practitioner',
  'Emotional Intelligence Apprentice',
  'Growth Mindset Adopter',
  'Personality Voyager',
  'Trait Master',
  'Wisdom Seeker',
  'Emotional Sage',
  'Personality Virtuoso',
  'Self-Mastery Guide',
  'Enlightened Explorer',
  'Aura Luminary',
];

// Available achievements
export const availableAchievements: Achievement[] = [
  // Tests category
  {
    id: 'first-test',
    title: 'First Steps',
    description: 'Complete your first personality test',
    icon: 'clipboard-check',
    category: 'tests',
  },
  {
    id: 'test-explorer',
    title: 'Test Explorer',
    description: 'Complete 5 personality tests',
    icon: 'clipboard-list',
    category: 'tests',
    maxProgress: 5,
  },
  {
    id: 'test-master',
    title: 'Test Master',
    description: 'Complete 10 personality tests',
    icon: 'academic-cap',
    category: 'tests',
    maxProgress: 10,
  },
  
  // Mood category
  {
    id: 'mood-tracker',
    title: 'Mood Tracker',
    description: 'Log your mood for the first time',
    icon: 'emoji-happy',
    category: 'mood',
  },
  {
    id: 'mood-streak',
    title: 'Mood Streak',
    description: 'Log your mood for 7 consecutive days',
    icon: 'fire',
    category: 'mood',
    maxProgress: 7,
  },
  {
    id: 'mood-master',
    title: 'Mood Master',
    description: 'Log 30 mood entries',
    icon: 'chart-bar',
    category: 'mood',
    maxProgress: 30,
  },
  
  // Insights category
  {
    id: 'first-insight',
    title: 'First Insight',
    description: 'Generate insights from your test results',
    icon: 'light-bulb',
    category: 'insights',
  },
  {
    id: 'insight-collector',
    title: 'Insight Collector',
    description: 'Generate insights 5 times',
    icon: 'collection',
    category: 'insights',
    maxProgress: 5,
  },
  
  // Engagement category
  {
    id: 'profile-complete',
    title: 'Identity Established',
    description: 'Complete your user profile',
    icon: 'user-circle',
    category: 'engagement',
  },
  {
    id: 'daily-login',
    title: 'Daily Explorer',
    description: 'Log in for 5 consecutive days',
    icon: 'calendar',
    category: 'engagement',
    maxProgress: 5,
  },
  {
    id: 'weekly-login',
    title: 'Weekly Devotee',
    description: 'Log in for 4 consecutive weeks',
    icon: 'clock',
    category: 'engagement',
    maxProgress: 4,
  },
  
  // Growth category
  {
    id: 'trait-improvement',
    title: 'Personal Growth',
    description: 'Show improvement in at least one personality trait',
    icon: 'trending-up',
    category: 'growth',
  },
  {
    id: 'balanced-personality',
    title: 'Balanced Personality',
    description: 'Achieve a balanced score across all personality traits',
    icon: 'scale',
    category: 'growth',
  },
  
  // Social category
  {
    id: 'first-share',
    title: 'Social Butterfly',
    description: 'Share your test results for the first time',
    icon: 'share',
    category: 'social',
  },
  {
    id: 'popular-results',
    title: 'Personality Influencer',
    description: 'Have your shared results viewed 10 times',
    icon: 'users',
    category: 'social',
    maxProgress: 10,
  },
];

// Calculate user level based on experience
export function calculateLevel(experience: number): number {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (experience >= levelThresholds[i]) {
      return i + 1;
    }
  }
  return 1; // Default to level 1
}

// Calculate experience needed for next level
export function calculateNextLevelExperience(level: number): number {
  if (level >= levelThresholds.length) {
    // If at max level, return a large number
    return 999999;
  }
  return levelThresholds[level];
}

// Calculate progress percentage to next level
export function calculateLevelProgress(experience: number, level: number): number {
  const currentLevelThreshold = levelThresholds[level - 1];
  const nextLevelThreshold = levelThresholds[level];
  
  if (nextLevelThreshold === undefined) {
    return 100; // Max level reached
  }
  
  const requiredExperience = nextLevelThreshold - currentLevelThreshold;
  const currentExperience = experience - currentLevelThreshold;
  
  return Math.min(100, Math.floor((currentExperience / requiredExperience) * 100));
}

// Get level title
export function getLevelTitle(level: number): string {
  if (level < 1) {
    return levelTitles[0];
  }
  if (level > levelTitles.length) {
    return levelTitles[levelTitles.length - 1];
  }
  return levelTitles[level - 1];
}

// Check if user has unlocked an achievement
export function hasUnlockedAchievement(achievements: Achievement[], achievementId: string): boolean {
  return achievements.some(a => a.id === achievementId && a.unlockedAt !== undefined);
}

// Get achievement progress
export function getAchievementProgress(achievements: Achievement[], achievementId: string): number {
  const achievement = achievements.find(a => a.id === achievementId);
  return achievement?.progress || 0;
}

// Initialize empty user progress
export function initializeUserProgress(): UserProgress {
  return {
    level: 1,
    experience: 0,
    nextLevelExperience: levelThresholds[0],
    achievements: [],
    stats: {
      testsCompleted: 0,
      moodEntriesLogged: 0,
      insightsGenerated: 0,
      daysActive: 0,
      traitsImproved: 0,
      journalEntriesCreated: 0,
    },
  };
}
