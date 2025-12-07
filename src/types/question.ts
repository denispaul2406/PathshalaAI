export type Difficulty = "beginner" | "intermediate" | "advanced" | "easy" | "medium" | "hard";

export type ExamType = "SSC_CGL" | "Banking_Exam";

export interface Question {
  id?: string;
  question: string;
  questionHi?: string;
  options: string[];
  answer: string;
  explanation?: string;
  explanationHi?: string;
  difficulty: Difficulty;
  subject?: string;
  topic?: string;
  examType: ExamType;
  timeLimit?: number; // in seconds
}

export interface QuestionSet {
  examType: ExamType;
  subject: string;
  topic: string;
  questions: Question[];
}

export interface QuizResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // in seconds
  topic?: string;
}

export interface AdaptiveQuizConfig {
  beginner: number; // percentage
  intermediate: number;
  advanced: number;
  totalQuestions: number;
}

