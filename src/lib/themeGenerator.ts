/**
 * Utility functions for generating personalized theme colors based on personality traits
 */

// Types for personality traits
interface PersonalityTraits {
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;
}

// Theme interface
export interface Theme {
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  badge: {
    background: string;
    border: string;
    shadow: string;
  };
}

// Base themes for each trait (when that trait is dominant)
const traitBaseThemes: Record<string, Theme> = {
  openness: {
    name: 'Creative Explorer',
    description: 'A vibrant, imaginative theme reflecting your openness to new experiences and ideas.',
    primary: '#8B5CF6', // Purple
    secondary: '#C4B5FD', // Light purple
    accent: '#F59E0B', // Amber
    background: '#F5F3FF', // Very light purple
    text: '#4B5563', // Gray 600
    badge: {
      background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
      border: '#C4B5FD',
      shadow: 'rgba(139, 92, 246, 0.3)',
    },
  },
  conscientiousness: {
    name: 'Structured Achiever',
    description: 'A clean, organized theme reflecting your disciplined and goal-oriented nature.',
    primary: '#10B981', // Emerald
    secondary: '#A7F3D0', // Light emerald
    accent: '#3B82F6', // Blue
    background: '#ECFDF5', // Very light emerald
    text: '#1F2937', // Gray 800
    badge: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      border: '#A7F3D0',
      shadow: 'rgba(16, 185, 129, 0.3)',
    },
  },
  extraversion: {
    name: 'Social Energizer',
    description: 'A bright, engaging theme reflecting your outgoing and enthusiastic personality.',
    primary: '#3B82F6', // Blue
    secondary: '#BFDBFE', // Light blue
    accent: '#F97316', // Orange
    background: '#EFF6FF', // Very light blue
    text: '#374151', // Gray 700
    badge: {
      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      border: '#BFDBFE',
      shadow: 'rgba(59, 130, 246, 0.3)',
    },
  },
  agreeableness: {
    name: 'Harmonious Mediator',
    description: 'A warm, inviting theme reflecting your compassionate and cooperative nature.',
    primary: '#F59E0B', // Amber
    secondary: '#FDE68A', // Light amber
    accent: '#EC4899', // Pink
    background: '#FFFBEB', // Very light amber
    text: '#4B5563', // Gray 600
    badge: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      border: '#FDE68A',
      shadow: 'rgba(245, 158, 11, 0.3)',
    },
  },
  neuroticism: {
    name: 'Deep Feeler',
    description: 'A rich, nuanced theme reflecting your emotional depth and sensitivity.',
    primary: '#EC4899', // Pink
    secondary: '#FBCFE8', // Light pink
    accent: '#8B5CF6', // Purple
    background: '#FCE7F3', // Very light pink
    text: '#4B5563', // Gray 600
    badge: {
      background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      border: '#FBCFE8',
      shadow: 'rgba(236, 72, 153, 0.3)',
    },
  },
};

// Balanced theme for when no trait is particularly dominant
const balancedTheme: Theme = {
  name: 'Balanced Harmony',
  description: 'A balanced, harmonious theme reflecting your well-rounded personality.',
  primary: '#6D28D9', // Violet
  secondary: '#DDD6FE', // Light violet
  accent: '#0EA5E9', // Sky
  background: '#F5F5F5', // Very light gray
  text: '#374151', // Gray 700
  badge: {
    background: 'linear-gradient(135deg, #6D28D9 0%, #4F46E5 50%, #0EA5E9 100%)',
    border: '#DDD6FE',
    shadow: 'rgba(109, 40, 217, 0.3)',
  },
};

// Get dominant trait from personality profile
export function getDominantTrait(traits: PersonalityTraits): string | null {
  if (!traits || Object.keys(traits).length === 0) {
    return null;
  }
  
  const entries = Object.entries(traits);
  if (entries.length === 0) return null;
  
  // Sort traits by score (highest first)
  const sortedTraits = entries.sort((a, b) => b[1] - a[1]);
  
  // Check if the highest trait is significantly higher than the second (by at least 0.5)
  if (sortedTraits.length > 1 && sortedTraits[0][1] - sortedTraits[1][1] >= 0.5) {
    return sortedTraits[0][0];
  }
  
  // If no clear dominant trait, return null
  return null;
}

// Get secondary trait (second highest)
export function getSecondaryTrait(traits: PersonalityTraits): string | null {
  if (!traits || Object.keys(traits).length < 2) {
    return null;
  }
  
  const entries = Object.entries(traits);
  if (entries.length < 2) return null;
  
  // Sort traits by score (highest first)
  const sortedTraits = entries.sort((a, b) => b[1] - a[1]);
  
  // Return the name of the second highest trait
  return sortedTraits[1][0];
}

// Blend two colors
function blendColors(color1: string, color2: string, ratio: number = 0.5): string {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  
  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };
  
  // Blend the colors
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const blended = rgb1.map((channel, i) => {
    return channel * (1 - ratio) + rgb2[i] * ratio;
  });
  
  return rgbToHex(blended[0], blended[1], blended[2]);
}

// Generate a theme based on personality traits
export function generateTheme(traits: PersonalityTraits): Theme {
  if (!traits || Object.keys(traits).length === 0) {
    return balancedTheme;
  }
  
  const dominantTrait = getDominantTrait(traits);
  
  // If there's a clear dominant trait, use its base theme
  if (dominantTrait && traits[dominantTrait] >= 3.5) {
    return traitBaseThemes[dominantTrait];
  }
  
  // If no clear dominant trait, blend the top two traits
  const sortedTraits = Object.entries(traits).sort((a, b) => b[1] - a[1]);
  
  if (sortedTraits.length >= 2) {
    const trait1 = sortedTraits[0][0];
    const trait2 = sortedTraits[1][0];
    const score1 = sortedTraits[0][1];
    const score2 = sortedTraits[1][1];
    
    // Calculate blend ratio based on relative scores
    const totalScore = score1 + score2;
    const ratio = score2 / totalScore;
    
    const theme1 = traitBaseThemes[trait1];
    const theme2 = traitBaseThemes[trait2];
    
    // Create a blended theme
    return {
      name: `${theme1.name.split(' ')[0]} ${theme2.name.split(' ')[1]}`,
      description: `A personalized theme blending elements of your ${trait1} and ${trait2} traits.`,
      primary: blendColors(theme1.primary, theme2.primary, ratio),
      secondary: blendColors(theme1.secondary, theme2.secondary, ratio),
      accent: blendColors(theme1.accent, theme2.accent, ratio),
      background: blendColors(theme1.background, theme2.background, ratio),
      text: theme1.text, // Keep text color consistent
      badge: {
        background: `linear-gradient(135deg, ${theme1.primary} 0%, ${theme2.primary} 100%)`,
        border: blendColors(theme1.badge.border, theme2.badge.border, ratio),
        shadow: `rgba(${parseInt(theme1.primary.slice(1, 3), 16)}, ${parseInt(theme1.primary.slice(3, 5), 16)}, ${parseInt(theme1.primary.slice(5, 7), 16)}, 0.3)`,
      },
    };
  }
  
  // Fallback to balanced theme
  return balancedTheme;
}
