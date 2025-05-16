/**
 * Utility functions for generating personalized greetings based on personality traits and time of day
 */

// Types for personality traits
interface PersonalityTraits {
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;
}

// Get time-based greeting (Good morning, afternoon, evening)
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

// Get day of week greeting variation
export function getDayBasedGreeting(): string {
  const day = new Date().getDay();

  switch (day) {
    case 0: // Sunday
      return 'Happy Sunday';
    case 1: // Monday
      return 'Welcome to a new week';
    case 5: // Friday
      return 'Happy Friday';
    case 6: // Saturday
      return 'Happy weekend';
    default:
      return '';
  }
}

// Get dominant trait from personality profile
export function getDominantTrait(traits: PersonalityTraits): string | null {
  if (!traits || Object.keys(traits).length === 0) {
    return null;
  }

  const entries = Object.entries(traits);
  if (entries.length === 0) return null;

  // Sort traits by score (highest first)
  const sortedTraits = entries.sort((a, b) => b[1] - a[1]);

  // Return the name of the highest trait
  return sortedTraits[0][0];
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

// Generate trait-specific greeting addition
export function getTraitBasedGreeting(trait: string, score: number): string[] {
  // Only add trait-specific greeting for strong traits (score >= 4)
  if (score < 4) return [];

  switch (trait) {
    case 'openness':
      return [
        'Ready to explore something new today?',
        'What will you discover today?',
        'Your creative energy is flowing today.',
        'The world is full of possibilities for you today.',
      ];
    case 'conscientiousness':
      return [
        'Your organized approach will serve you well today.',
        'Ready to accomplish your goals today?',
        'Your dedication is your superpower.',
        'Another day to make progress on what matters.',
      ];
    case 'extraversion':
      return [
        'Your energy is contagious today!',
        'Ready to connect with others today?',
        'Your social battery seems fully charged!',
        'Your vibrant presence brightens the day.',
      ];
    case 'agreeableness':
      return [
        'Your kindness makes a difference.',
        'Your compassionate nature is a gift to others.',
        'Your harmonious approach creates positive connections.',
        'Your supportive nature is valued by those around you.',
      ];
    case 'neuroticism':
      // For high neuroticism, offer supportive/calming messages
      return [
        'Remember to take moments of calm today.',
        'Your sensitivity helps you understand others deeply.',
        'Take things one step at a time today.',
        'Remember to breathe and center yourself today.',
      ];
    default:
      return [];
  }
}

// Get random greeting from an array of options
function getRandomGreeting(greetings: string[]): string {
  if (!greetings.length) return '';
  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
}

// Generate personalized greeting based on traits and time
export function generatePersonalizedGreeting(
  name: string,
  traits?: PersonalityTraits
): string {
  // Start with time-based greeting
  let greeting = getTimeBasedGreeting();

  // Add name
  greeting += `, ${name}`;

  // If we have traits data, personalize further
  if (traits && Object.keys(traits).length > 0) {
    const dominantTrait = getDominantTrait(traits);

    if (dominantTrait && traits[dominantTrait as keyof PersonalityTraits] !== undefined &&
        traits[dominantTrait as keyof PersonalityTraits]! >= 4) {
      // Add trait-specific greeting for strong dominant traits
      const traitScore = traits[dominantTrait as keyof PersonalityTraits]!;
      const traitGreetings = getTraitBasedGreeting(dominantTrait, traitScore);
      if (traitGreetings.length > 0) {
        greeting += `. ${getRandomGreeting(traitGreetings)}`;
      }
    } else {
      // Add day-based greeting if no strong dominant trait
      const dayGreeting = getDayBasedGreeting();
      if (dayGreeting) {
        greeting += `! ${dayGreeting}`;
      } else {
        greeting += '!';
      }
    }
  } else {
    // No traits data, use day-based greeting
    const dayGreeting = getDayBasedGreeting();
    if (dayGreeting) {
      greeting += `! ${dayGreeting}`;
    } else {
      greeting += '!';
    }
  }

  return greeting;
}

// Generate mood-based greeting suggestion
export function generateMoodBasedSuggestion(
  traits?: PersonalityTraits
): string {
  if (!traits) return '';

  const dominantTrait = getDominantTrait(traits);
  const secondaryTrait = getSecondaryTrait(traits);

  if (!dominantTrait) return '';

  // Suggestions based on dominant trait
  const suggestions = {
    openness: [
      'Try something creative today to energize your mind.',
      'Explore a new idea or concept that interests you.',
      'Consider taking a different route today to spark your curiosity.',
      'A good day to appreciate art or beauty around you.',
    ],
    conscientiousness: [
      'Setting clear priorities will help you feel accomplished today.',
      'Taking a few minutes to organize your space might boost your focus.',
      'Checking off even small tasks can bring satisfaction today.',
      'Remember to balance productivity with moments of rest.',
    ],
    extraversion: [
      'Connecting with others could energize you today.',
      'A brief social interaction might brighten your day.',
      'Sharing your thoughts with someone could bring clarity.',
      'Your enthusiasm can inspire others today.',
    ],
    agreeableness: [
      'A small act of kindness might lift your spirits today.',
      'Taking time to listen to someone could be rewarding.',
      'Your empathy is valuable - remember to extend it to yourself too.',
      'Finding common ground in disagreements can bring peace today.',
    ],
    neuroticism: [
      'Taking a few deep breaths can help center you today.',
      'A moment of mindfulness might ease any tension you feel.',
      'Remember that your feelings are valid but temporary.',
      'A short walk might help clear your mind if things feel overwhelming.',
    ],
  };

  // Get random suggestion based on dominant trait
  return getRandomGreeting(suggestions[dominantTrait as keyof typeof suggestions]);
}
