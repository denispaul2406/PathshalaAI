import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { QuizResult } from "@/types/question";

export interface UserProgress {
  userId: string;
  examType: "SSC" | "Banking";
  examYear: string;
  dataSaver: boolean;
  diagnosticResults?: {
    score: number;
    level: "Warrior" | "Champion" | "Master";
    correctCount: number;
    totalQuestions: number;
    results: QuizResult[];
    completedAt: string;
  };
  stats?: {
    totalXP: number;
    streak: number;
    accuracy: number;
    totalQuizzes: number;
    totalQuestions: number;
    correctAnswers: number;
  };
  weakAreas?: string[];
  strongAreas?: string[];
  lastActive?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  examType: "SSC_CGL" | "Banking_Exam";
  subject?: string;
  topic?: string;
  questions: string[];
  results: QuizResult[];
  score: number;
  timeTaken: number;
  completedAt: string;
}

export interface FlashcardProgress {
  cardId: string;
  userId: string;
  easiness: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview?: string;
}

const userProgressCollection = "users";
const quizAttemptsCollection = "quizAttempts";
const flashcardProgressCollection = "flashcardProgress";

export async function saveUserProgress(progress: UserProgress): Promise<void> {
  await setDoc(doc(db, userProgressCollection, progress.userId), {
    ...progress,
    lastActive: new Date().toISOString(),
  }, { merge: true });
}

export async function getUserProgress(
  userId: string
): Promise<UserProgress | null> {
  const docRef = doc(db, userProgressCollection, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProgress;
  }
  return null;
}

export async function updateUserStats(
  userId: string,
  stats: Partial<UserProgress["stats"]>
): Promise<void> {
  const userRef = doc(db, userProgressCollection, userId);
  const currentData = await getUserProgress(userId);
  const currentStats = currentData?.stats || {
    totalXP: 0,
    streak: 0,
    accuracy: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    correctAnswers: 0,
  };

  // Increment values instead of replacing
  const updatedStats = {
    totalXP: (currentStats.totalXP || 0) + (stats.totalXP || 0),
    totalQuizzes: (currentStats.totalQuizzes || 0) + (stats.totalQuizzes || 0),
    totalQuestions: (currentStats.totalQuestions || 0) + (stats.totalQuestions || 0),
    correctAnswers: (currentStats.correctAnswers || 0) + (stats.correctAnswers || 0),
    // Recalculate accuracy
    accuracy: stats.accuracy !== undefined 
      ? stats.accuracy 
      : (currentStats.totalQuestions || 0) > 0
        ? Math.round(((currentStats.correctAnswers || 0) / (currentStats.totalQuestions || 1)) * 100)
        : 0,
    streak: stats.streak !== undefined ? stats.streak : (currentStats.streak || 0),
  };

  await updateDoc(userRef, {
    stats: updatedStats,
    lastActive: new Date().toISOString(),
  });
}

export async function saveQuizAttempt(attempt: QuizAttempt): Promise<void> {
  // Remove undefined fields before saving to Firestore
  const cleanAttempt: any = {
    id: attempt.id,
    userId: attempt.userId,
    examType: attempt.examType,
    questions: attempt.questions,
    results: attempt.results,
    score: attempt.score,
    timeTaken: attempt.timeTaken,
    completedAt: attempt.completedAt,
  };
  
  if (attempt.subject) cleanAttempt.subject = attempt.subject;
  if (attempt.topic) cleanAttempt.topic = attempt.topic;
  
  await setDoc(doc(db, quizAttemptsCollection, attempt.id), cleanAttempt);
}

export async function getUserQuizAttempts(
  userId: string,
  limitCount: number = 10
): Promise<QuizAttempt[]> {
  try {
    // Try with orderBy first
    const q = query(
      collection(db, quizAttemptsCollection),
      where("userId", "==", userId),
      orderBy("completedAt", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as QuizAttempt);
  } catch (error: any) {
    // If index is missing, fetch all and sort in memory
    if (error.code === "failed-precondition") {
      const q = query(
        collection(db, quizAttemptsCollection),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const attempts = querySnapshot.docs.map((doc) => doc.data() as QuizAttempt);
      // Sort by completedAt descending and limit
      return attempts
        .sort((a, b) => {
          const dateA = new Date(a.completedAt).getTime();
          const dateB = new Date(b.completedAt).getTime();
          return dateB - dateA;
        })
        .slice(0, limitCount);
    }
    throw error;
  }
}

export async function saveFlashcardProgress(
  progress: FlashcardProgress
): Promise<void> {
  await setDoc(
    doc(
      db,
      flashcardProgressCollection,
      `${progress.userId}_${progress.cardId}`
    ),
    progress,
    { merge: true }
  );
}

export async function getUserFlashcardProgress(
  userId: string
): Promise<FlashcardProgress[]> {
  const q = query(
    collection(db, flashcardProgressCollection),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as FlashcardProgress);
}

export async function updateWeakAreas(
  userId: string,
  weakAreas: string[]
): Promise<void> {
  const userRef = doc(db, userProgressCollection, userId);
  await updateDoc(userRef, {
    weakAreas,
    lastActive: new Date().toISOString(),
  });
}

export async function updateStrongAreas(
  userId: string,
  strongAreas: string[]
): Promise<void> {
  const userRef = doc(db, userProgressCollection, userId);
  await updateDoc(userRef, {
    strongAreas,
    lastActive: new Date().toISOString(),
  });
}

// Interview Progress
export interface InterviewAttempt {
  id: string;
  userId: string;
  examType: "SSC" | "Banking";
  mode: "quick" | "full";
  question: string;
  category: string;
  userResponse: string;
  analysis: {
    contentScore: number;
    deliveryScore: number;
    overallScore: number;
    strengths: string[];
    improvements: string[];
    feedback: string;
  };
  completedAt: string;
}

const interviewAttemptsCollection = "interviewAttempts";

export async function saveInterviewAttempt(
  attempt: InterviewAttempt
): Promise<void> {
  await setDoc(
    doc(db, interviewAttemptsCollection, attempt.id),
    {
      ...attempt,
      // Remove undefined fields
      completedAt: attempt.completedAt || new Date().toISOString(),
    }
  );
}

export async function getUserInterviewAttempts(
  userId: string,
  limitCount: number = 10
): Promise<InterviewAttempt[]> {
  try {
    const q = query(
      collection(db, interviewAttemptsCollection),
      where("userId", "==", userId),
      orderBy("completedAt", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as InterviewAttempt);
  } catch (error: any) {
    // If index is missing, fetch all and sort in memory
    if (error.code === "failed-precondition" || error.code === "unavailable") {
      console.warn("Firestore index missing for interviewAttempts. Fetching all and sorting in memory.");
      const q = query(collection(db, interviewAttemptsCollection), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const attempts = querySnapshot.docs.map((doc) => doc.data() as InterviewAttempt);
      return attempts
        .sort((a, b) => {
          const dateA = new Date(a.completedAt).getTime();
          const dateB = new Date(b.completedAt).getTime();
          return dateB - dateA;
        })
        .slice(0, limitCount);
    }
    throw error;
  }
}

export async function getUserInterviewStats(userId: string): Promise<{
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  categoriesPracticed: string[];
}> {
  const attempts = await getUserInterviewAttempts(userId, 100);
  
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      categoriesPracticed: [],
    };
  }
  
  const scores = attempts.map(a => a.analysis.overallScore);
  const categories = new Set(attempts.map(a => a.category));
  
  return {
    totalAttempts: attempts.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    bestScore: Math.max(...scores),
    categoriesPracticed: Array.from(categories),
  };
}

