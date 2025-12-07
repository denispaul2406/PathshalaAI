/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on SuperMemo 2 algorithm
 */

export interface Flashcard {
  id: string;
  question: string;
  questionHi?: string;
  answer: string;
  answerHi?: string;
  subject: string;
  topic?: string;
}

export interface FlashcardProgress {
  cardId: string;
  easiness: number;
  interval: number; // days
  repetitions: number;
  nextReview: Date;
  lastReview?: Date;
}

const DEFAULT_EASINESS = 2.5;
const MIN_EASINESS = 1.3;

/**
 * Update flashcard progress based on user response
 * @param progress Current progress
 * @param quality Quality of response (0-5): 0=wrong, 1=hard, 2=medium, 3=good, 4=easy, 5=perfect
 * @returns Updated progress
 */
export function updateFlashcardProgress(
  progress: FlashcardProgress | null,
  quality: number
): FlashcardProgress {
  const easiness = progress
    ? Math.max(
        MIN_EASINESS,
        progress.easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      )
    : DEFAULT_EASINESS;

  let interval: number;
  let repetitions: number;

  if (quality < 3) {
    // Incorrect answer - reset
    interval = 1;
    repetitions = 0;
  } else {
    if (progress) {
      repetitions = progress.repetitions + 1;
      
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(progress.interval * easiness);
      }
    } else {
      repetitions = 1;
      interval = 1;
    }
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    cardId: progress?.cardId || "",
    easiness,
    interval,
    repetitions,
    nextReview,
    lastReview: new Date(),
  };
}

/**
 * Get flashcards due for review
 */
export function getDueFlashcards(
  allProgress: FlashcardProgress[]
): FlashcardProgress[] {
  const now = new Date();
  return allProgress.filter((progress) => {
    const nextReviewDate = new Date(progress.nextReview);
    return nextReviewDate <= now;
  });
}

/**
 * Calculate mastery percentage
 */
export function calculateMastery(progress: FlashcardProgress): number {
  // Mastery based on easiness and repetitions
  const easinessScore = ((progress.easiness - MIN_EASINESS) / (DEFAULT_EASINESS - MIN_EASINESS)) * 50;
  const repetitionScore = Math.min(progress.repetitions * 10, 50);
  return Math.min(Math.round(easinessScore + repetitionScore), 100);
}

