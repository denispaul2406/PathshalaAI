import sscQuestions from "@/../data/ssc_cgl_question_bank.json";
import bankingQuestions from "@/../data/banking_exam_question_bank_full_5_sections.json";
import type { Question, Difficulty, ExamType, AdaptiveQuizConfig } from "@/types/question";

// Normalize difficulty levels
const normalizeDifficulty = (difficulty: string): Difficulty => {
  if (difficulty === "beginner" || difficulty === "easy") return "beginner";
  if (difficulty === "intermediate" || difficulty === "medium") return "intermediate";
  if (difficulty === "advanced" || difficulty === "hard") return "advanced";
  return "beginner";
};

// Shuffle array utility function
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Parse and flatten questions from JSON structure
function parseSSCQuestions(): Question[] {
  const questions: Question[] = [];
  const sscData = sscQuestions as any;

  if (sscData.SSC_CGL) {
    Object.keys(sscData.SSC_CGL).forEach((subject) => {
      const subjectData = sscData.SSC_CGL[subject];
      if (typeof subjectData === "object") {
        Object.keys(subjectData).forEach((topic) => {
          const topicQuestions = subjectData[topic];
          if (Array.isArray(topicQuestions)) {
            topicQuestions.forEach((q: any, index: number) => {
              // Skip sample/placeholder questions
              if (!q.question || q.question.toLowerCase().includes("sample question")) {
                return;
              }
              
              // Get the correct answer first
              const correctAnswer = (q.answer || "").trim();
              if (!correctAnswer || correctAnswer.toLowerCase() === "correct answer") {
                return; // Skip if no valid answer
              }
              
              // Filter out placeholder options like "Option A", "Option B", etc.
              // But keep the real answer even if it's listed in options
              let validOptions = (q.options || []).filter((opt: string) => {
                const optLower = opt.toLowerCase().trim();
                return !optLower.match(/^option\s*[a-z]$/i) && 
                       optLower !== "correct answer" &&
                       opt.trim().length > 0;
              });
              
              // Create a set of all valid options including the correct answer
              const allValidOptions = new Set<string>();
              
              // Add correct answer first
              if (correctAnswer) {
                allValidOptions.add(correctAnswer);
              }
              
              // Add all other valid options
              validOptions.forEach(opt => {
                if (opt.trim()) {
                  allValidOptions.add(opt.trim());
                }
              });
              
              const uniqueOptions = Array.from(allValidOptions);
              
              // Shuffle and ensure we have at least 4 options for MCQ
              const shuffled = shuffle(uniqueOptions);
              
              // If we have less than 4 unique options, add generic ones
              while (shuffled.length < 4) {
                shuffled.push(`Option ${shuffled.length + 1}`);
              }
              
              // Ensure correct answer is in final options (if it was removed by shuffle)
              if (!shuffled.includes(correctAnswer)) {
                shuffled[0] = correctAnswer;
              }
              
              questions.push({
                id: `ssc-${subject}-${topic}-${index}`,
                question: q.question.trim(),
                options: shuffled.slice(0, 4),
                answer: correctAnswer,
                explanation: (q.explanation || "").trim(),
                difficulty: normalizeDifficulty(q.difficulty || "beginner"),
                subject: subject.replace(/_/g, " "),
                topic: topic.replace(/_/g, " "),
                examType: "SSC_CGL",
                timeLimit: 60,
              });
            });
          }
        });
      }
    });
  }

  return questions;
}

function parseBankingQuestions(): Question[] {
  const questions: Question[] = [];
  const bankingData = bankingQuestions as any;

  if (bankingData.Banking_Exam) {
    Object.keys(bankingData.Banking_Exam).forEach((subject) => {
      const subjectData = bankingData.Banking_Exam[subject];
      if (typeof subjectData === "object") {
        Object.keys(subjectData).forEach((topic) => {
          const topicQuestions = subjectData[topic];
          if (Array.isArray(topicQuestions)) {
            topicQuestions.forEach((q: any, index: number) => {
              // Skip sample/placeholder questions
              if (!q.question || q.question.toLowerCase().includes("sample question")) {
                return;
              }
              
              // Get the correct answer first
              let correctAnswer = (q.answer || "").trim();
              if (correctAnswer.toLowerCase() === "correct answer") {
                // Try to find the correct answer in options
                const realAnswers = (q.options || []).filter((opt: string) => {
                  const optLower = opt.toLowerCase().trim();
                  return !optLower.match(/^option\s*[a-z]$/i) && 
                         optLower !== "correct answer" &&
                         opt.trim().length > 0;
                });
                correctAnswer = realAnswers[0] || "";
              }
              
              if (!correctAnswer) {
                return; // Skip if no valid answer
              }
              
              // Filter out placeholder options like "Option A", "Option B", etc.
              // But keep the real answer even if it's listed in options
              let validOptions = (q.options || []).filter((opt: string) => {
                const optLower = opt.toLowerCase().trim();
                return !optLower.match(/^option\s*[a-z]$/i) && 
                       optLower !== "correct answer" &&
                       opt.trim().length > 0;
              });
              
              // Create a set of all valid options including the correct answer
              const allValidOptions = new Set<string>();
              
              // Add correct answer first
              if (correctAnswer) {
                allValidOptions.add(correctAnswer);
              }
              
              // Add all other valid options
              validOptions.forEach(opt => {
                if (opt.trim()) {
                  allValidOptions.add(opt.trim());
                }
              });
              
              const uniqueOptions = Array.from(allValidOptions);
              
              // Shuffle and ensure we have at least 4 options for MCQ
              const shuffled = shuffle(uniqueOptions);
              
              // If we have less than 4 unique options, add generic ones
              while (shuffled.length < 4) {
                shuffled.push(`Option ${shuffled.length + 1}`);
              }
              
              // Ensure correct answer is in final options (if it was removed by shuffle)
              if (!shuffled.includes(correctAnswer)) {
                shuffled[0] = correctAnswer;
              }
              
              questions.push({
                id: `banking-${subject}-${topic}-${index}`,
                question: q.question.trim(),
                options: shuffled.slice(0, 4),
                answer: correctAnswer,
                explanation: (q.explanation || "").trim(),
                difficulty: normalizeDifficulty(q.difficulty || "beginner"),
                subject: subject.replace(/_/g, " "),
                topic: topic.replace(/_/g, " "),
                examType: "Banking_Exam",
                timeLimit: 60,
              });
            });
          }
        });
      }
    });
  }

  return questions;
}

let cachedQuestions: Question[] | null = null;

export function getAllQuestions(examType?: ExamType): Question[] {
  if (!cachedQuestions) {
    const ssc = parseSSCQuestions();
    const banking = parseBankingQuestions();
    cachedQuestions = [...ssc, ...banking];
  }

  if (examType) {
    return cachedQuestions.filter((q) => q.examType === examType);
  }

  return cachedQuestions;
}

export function getQuestionsBySubject(
  examType: ExamType,
  subject: string
): Question[] {
  return getAllQuestions(examType).filter(
    (q) => q.subject?.toLowerCase() === subject.toLowerCase()
  );
}

export function getQuestionsByTopic(
  examType: ExamType,
  topic: string
): Question[] {
  return getAllQuestions(examType).filter(
    (q) => q.topic?.toLowerCase().includes(topic.toLowerCase())
  );
}

export function generateAdaptiveQuiz(
  examType: ExamType,
  config: AdaptiveQuizConfig = {
    beginner: 40,
    intermediate: 40,
    advanced: 20,
    totalQuestions: 10,
  },
  questionPool?: Question[]
): Question[] {
  const allQuestions = questionPool || getAllQuestions(examType);
  const beginnerCount = Math.round(
    (config.totalQuestions * config.beginner) / 100
  );
  const intermediateCount = Math.round(
    (config.totalQuestions * config.intermediate) / 100
  );
  const advancedCount =
    config.totalQuestions - beginnerCount - intermediateCount;

  const beginner = shuffle(
    allQuestions.filter((q) => q.difficulty === "beginner")
  ).slice(0, beginnerCount);
  const intermediate = shuffle(
    allQuestions.filter((q) => q.difficulty === "intermediate")
  ).slice(0, intermediateCount);
  const advanced = shuffle(
    allQuestions.filter((q) => q.difficulty === "advanced")
  ).slice(0, advancedCount);

  return shuffle([...beginner, ...intermediate, ...advanced]).slice(
    0,
    config.totalQuestions
  );
}

export function getRandomQuestions(
  examType: ExamType,
  count: number
): Question[] {
  const all = getAllQuestions(examType);
  return shuffle(all).slice(0, count);
}

