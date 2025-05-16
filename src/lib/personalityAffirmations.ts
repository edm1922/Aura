/**
 * Utility functions for generating personality-based affirmations and tips
 */

// Types for personality traits
interface PersonalityTraits {
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;
}

// Affirmations for each personality trait
const traitAffirmations = {
  // Openness affirmations
  openness: {
    high: [
      "My curiosity opens doors to new possibilities.",
      "I embrace change as an opportunity for growth.",
      "My creative perspective brings unique value to the world.",
      "I find beauty and meaning in art, ideas, and experiences.",
      "My open mind allows me to see solutions others might miss.",
      "I value learning and continuous exploration.",
      "My imagination is a powerful tool for innovation.",
      "I appreciate the diversity of perspectives around me.",
      "I am comfortable challenging conventional thinking.",
      "My openness to new experiences enriches my life."
    ],
    moderate: [
      "I balance tradition with openness to new ideas.",
      "I appreciate both practical solutions and creative approaches.",
      "I can adapt to change while valuing stability.",
      "I find value in both familiar routines and new experiences.",
      "I respect different perspectives while staying true to my values.",
      "I am thoughtful about which new ideas to explore.",
      "I blend creativity with practicality in solving problems.",
      "I appreciate both the concrete and the abstract.",
      "I can be both conventional and innovative when needed.",
      "I value both tradition and progress."
    ],
    low: [
      "My practical approach helps me accomplish concrete goals.",
      "I value reliability and consistency in my life and work.",
      "My focus on the practical keeps me grounded.",
      "I excel at maintaining valuable traditions and practices.",
      "My preference for the familiar helps me work efficiently.",
      "I trust in proven methods and approaches.",
      "My practical nature helps me focus on what works.",
      "I value clarity and straightforwardness.",
      "My consistent approach builds trust with others.",
      "I find comfort and strength in established routines."
    ]
  },

  // Conscientiousness affirmations
  conscientiousness: {
    high: [
      "My attention to detail ensures quality in everything I do.",
      "My organizational skills help me achieve my goals efficiently.",
      "I follow through on my commitments reliably.",
      "My disciplined approach leads to consistent progress.",
      "I plan effectively to make the most of my time and energy.",
      "My persistence helps me overcome obstacles.",
      "I take pride in doing thorough, careful work.",
      "My self-discipline is a powerful tool for achievement.",
      "I create order and structure that benefits myself and others.",
      "My responsible nature earns the trust of those around me."
    ],
    moderate: [
      "I balance structure with flexibility in my approach.",
      "I can be organized when it matters most.",
      "I know when to be methodical and when to be spontaneous.",
      "I value both planning and adaptability.",
      "I can focus on details while keeping the big picture in mind.",
      "I balance work and leisure effectively.",
      "I set reasonable goals and work steadily toward them.",
      "I appreciate both order and creative freedom.",
      "I fulfill my responsibilities while remaining adaptable.",
      "I know when precision matters and when good enough is sufficient."
    ],
    low: [
      "My spontaneous nature helps me seize unexpected opportunities.",
      "I adapt easily to changing circumstances.",
      "My flexible approach allows for creativity and innovation.",
      "I embrace the journey rather than fixating on the destination.",
      "I find joy in the present moment rather than always planning ahead.",
      "My relaxed attitude helps others feel comfortable.",
      "I see multiple ways to approach tasks and challenges.",
      "I value freedom and exploration in my work and life.",
      "My adaptable nature helps me navigate uncertainty.",
      "I find unique solutions by thinking outside conventional structures."
    ]
  },

  // Extraversion affirmations
  extraversion: {
    high: [
      "My enthusiasm energizes both myself and others.",
      "I build connections easily and create community.",
      "My expressive nature helps me communicate effectively.",
      "I thrive in collaborative environments.",
      "My social energy helps bring people together.",
      "I'm comfortable taking initiative in groups.",
      "My outgoing nature opens doors to new opportunities.",
      "I express my thoughts and feelings with confidence.",
      "My positive energy is contagious and uplifting.",
      "I find strength and joy in my connections with others."
    ],
    moderate: [
      "I balance social time and solitude effectively.",
      "I can be outgoing when needed and reflective when appropriate.",
      "I enjoy both group activities and independent pursuits.",
      "I communicate well in both social and one-on-one settings.",
      "I value deep connections and broader social networks.",
      "I can lead when necessary and follow when appropriate.",
      "I draw energy from both social interaction and quiet reflection.",
      "I adapt my social energy to the situation at hand.",
      "I appreciate both lively gatherings and meaningful conversations.",
      "I balance speaking and listening in my interactions."
    ],
    low: [
      "My thoughtful nature allows for deep reflection and insight.",
      "I listen carefully before speaking.",
      "My rich inner world fuels my creativity and understanding.",
      "I form deep, meaningful connections with others.",
      "My independent nature allows me to focus and concentrate.",
      "I conserve my energy by being selective about social activities.",
      "My calm presence provides balance in hectic situations.",
      "I observe and understand dynamics that others might miss.",
      "I think carefully before acting or deciding.",
      "My self-sufficiency is a source of strength."
    ]
  },

  // Agreeableness affirmations
  agreeableness: {
    high: [
      "My compassion creates a positive environment for others.",
      "I build trust through kindness and understanding.",
      "My cooperative nature helps create effective teams.",
      "I see the best in others and help them see it too.",
      "My empathy allows me to understand different perspectives.",
      "I create harmony in my relationships and environments.",
      "My kindness makes a positive difference in others' lives.",
      "I find common ground even in disagreement.",
      "My supportive nature helps others grow and succeed.",
      "I value connection and mutual understanding."
    ],
    moderate: [
      "I balance kindness with healthy boundaries.",
      "I can be cooperative while standing up for my needs.",
      "I show compassion while maintaining objectivity.",
      "I value both harmony and honest expression.",
      "I can be diplomatic yet straightforward when needed.",
      "I consider others' feelings while honoring my own.",
      "I know when to compromise and when to hold firm.",
      "I balance trust with appropriate caution.",
      "I can be both supportive and challenging when needed.",
      "I value both cooperation and healthy assertiveness."
    ],
    low: [
      "My straightforward approach brings clarity to situations.",
      "I stand firm in my convictions and boundaries.",
      "My objective perspective helps me make fair decisions.",
      "I speak truth even when it's difficult.",
      "My skepticism protects me and others from poor decisions.",
      "I value honesty over artificial harmony.",
      "My independent thinking leads to innovative solutions.",
      "I advocate effectively for myself and my ideas.",
      "My critical thinking helps identify problems and solutions.",
      "I make decisions based on principles rather than popularity."
    ]
  },

  // Neuroticism (emotional stability) affirmations
  neuroticism: {
    high: [
      "My sensitivity helps me understand subtle emotional dynamics.",
      "I am aware of potential challenges and prepare for them.",
      "My emotional depth gives me empathy for others' struggles.",
      "I can identify and express my feelings with awareness.",
      "My caution helps me avoid unnecessary risks.",
      "I notice details and nuances that others might miss.",
      "My emotional range gives me access to deep creativity.",
      "I take time to process my feelings fully.",
      "My self-awareness helps me grow and develop.",
      "I honor my emotions while not being defined by them."
    ],
    moderate: [
      "I experience emotions fully while maintaining perspective.",
      "I balance awareness of risks with optimism about possibilities.",
      "I acknowledge challenges while focusing on solutions.",
      "I feel deeply while maintaining emotional balance.",
      "I respond to situations with appropriate emotional intensity.",
      "I recover my equilibrium after emotional experiences.",
      "I balance caution with confidence in my decisions.",
      "I acknowledge my concerns while not being overwhelmed by them.",
      "I experience a full range of emotions in a balanced way.",
      "I am both emotionally aware and emotionally resilient."
    ],
    low: [
      "My emotional stability helps me stay calm under pressure.",
      "I maintain perspective even in challenging situations.",
      "My resilience helps me bounce back from setbacks.",
      "I approach problems with a steady, balanced mindset.",
      "My calm nature helps others feel secure.",
      "I face challenges with confidence and composure.",
      "My optimism helps me see opportunities in difficulties.",
      "I maintain my equilibrium in stressful circumstances.",
      "My steady presence is a source of strength for myself and others.",
      "I approach life's ups and downs with equanimity."
    ]
  }
};

// Get trait level category (high, moderate, low)
function getTraitLevel(score: number): 'high' | 'moderate' | 'low' {
  if (score >= 4) return 'high';
  if (score <= 2) return 'low';
  return 'moderate';
}

// Get random affirmation from an array
function getRandomAffirmation(affirmations: string[]): string {
  const randomIndex = Math.floor(Math.random() * affirmations.length);
  return affirmations[randomIndex];
}

// Generate an affirmation based on a specific trait
export function generateTraitAffirmation(trait: string, score: number): string {
  const traitName = trait.toLowerCase();

  // Use type assertion to check if the trait exists in our affirmations
  if (!Object.prototype.hasOwnProperty.call(traitAffirmations, traitName)) {
    return "I embrace my unique personality and strengths.";
  }

  // Use type assertion to safely access the trait
  const traitAffirmation = traitAffirmations[traitName as keyof typeof traitAffirmations];
  const level = getTraitLevel(score);
  return getRandomAffirmation(traitAffirmation[level]);
}

// Generate a daily affirmation based on personality traits
export function generateDailyAffirmation(traits: PersonalityTraits): string {
  if (!traits || Object.keys(traits).length === 0) {
    return "I embrace my unique qualities and continue to grow each day.";
  }

  // Get a random trait to focus on for today's affirmation
  const traitEntries = Object.entries(traits);
  const randomIndex = Math.floor(Math.random() * traitEntries.length);
  const [trait, score] = traitEntries[randomIndex];

  return generateTraitAffirmation(trait, score);
}

// Generate a set of affirmations for all traits
export function generateAllTraitAffirmations(traits: PersonalityTraits): Record<string, string> {
  const affirmations: Record<string, string> = {};

  if (!traits || Object.keys(traits).length === 0) {
    return affirmations;
  }

  Object.entries(traits).forEach(([trait, score]) => {
    affirmations[trait] = generateTraitAffirmation(trait, score);
  });

  return affirmations;
}
