import sscQuestions from "@/../data/ssc_cgl_question_bank.json";
import bankingQuestions from "@/../data/banking_exam_question_bank_full_5_sections.json";
import type { Question, Difficulty, ExamType, AdaptiveQuizConfig } from "@/types/question";
import { hardcodedSSCQuestions, hardcodedBankingQuestions } from "./hardcodedQuestions";

// Log JSON imports for debugging
console.log("Question JSON files loaded:", {
  sscQuestions: sscQuestions ? "loaded" : "failed",
  bankingQuestions: bankingQuestions ? "loaded" : "failed",
  sscType: typeof sscQuestions,
  bankingType: typeof bankingQuestions,
});

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
  let sscData: any;
  
  try {
    sscData = sscQuestions as any;
    if (!sscData) {
      console.error("SSC questions data is null or undefined");
      return [];
    }
  } catch (error) {
    console.error("Error loading SSC questions:", error);
    return [];
  }

  let totalQuestions = 0;
  let skippedCount = 0;

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
  let bankingData: any;
  let totalQuestions = 0;
  let skippedCount = 0;
  
  try {
    bankingData = bankingQuestions as any;
    if (!bankingData) {
      console.error("Banking questions data is null or undefined");
      return [];
    }
  } catch (error) {
    console.error("Error loading Banking questions:", error);
    return [];
  }

  if (bankingData.Banking_Exam) {
    Object.keys(bankingData.Banking_Exam).forEach((subject) => {
      const subjectData = bankingData.Banking_Exam[subject];
      if (typeof subjectData === "object") {
        Object.keys(subjectData).forEach((topic) => {
          const topicQuestions = subjectData[topic];
          if (Array.isArray(topicQuestions)) {
            topicQuestions.forEach((q: any, index: number) => {
              totalQuestions++;
              // Skip sample/placeholder questions
              if (!q.question || q.question.toLowerCase().includes("sample question")) {
                skippedCount++;
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

  console.log(`Banking questions parsing: ${totalQuestions} total, ${questions.length} parsed, ${skippedCount} skipped (sample/placeholder)`);
  
  if (questions.length === 0 && totalQuestions > 0) {
    console.warn(`⚠️ All ${totalQuestions} banking questions are sample/placeholder questions and were filtered out. The banking JSON file needs real questions with actual question text and answers (not "Correct Answer").`);
  }
  
  return questions;
}

let cachedQuestions: Question[] | null = null;

export function getAllQuestions(examType?: ExamType): Question[] {
  try {
    if (!cachedQuestions) {
      const ssc = parseSSCQuestions();
      const banking = parseBankingQuestions();
      
      // Use hardcoded questions as fallback if JSON parsing returns no questions
      const sscFinal = ssc.length > 0 ? ssc : hardcodedSSCQuestions;
      const bankingFinal = banking.length > 0 ? banking : hardcodedBankingQuestions;
      
      cachedQuestions = [...sscFinal, ...bankingFinal];
      
      if (ssc.length === 0) {
        console.log(`Using ${hardcodedSSCQuestions.length} hardcoded SSC questions (JSON had 0 valid questions)`);
      }
      if (banking.length === 0) {
        console.log(`Using ${hardcodedBankingQuestions.length} hardcoded Banking questions (JSON had 0 valid questions)`);
      }
      
      console.log(`Loaded ${sscFinal.length} SSC questions and ${bankingFinal.length} Banking questions. Total: ${cachedQuestions.length}`);
    }

    if (examType) {
      const filtered = cachedQuestions.filter((q) => q.examType === examType);
      console.log(`Filtered ${filtered.length} questions for exam type: ${examType}`);
      return filtered;
    }

    return cachedQuestions;
  } catch (error) {
    console.error("Error loading questions:", error);
    // Return hardcoded questions as fallback on error
    if (examType === "SSC_CGL") {
      return hardcodedSSCQuestions;
    } else if (examType === "Banking_Exam") {
      return hardcodedBankingQuestions;
    }
    return [...hardcodedSSCQuestions, ...hardcodedBankingQuestions];
  }
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
  try {
    const allQuestions = questionPool || getAllQuestions(examType);
    
    if (allQuestions.length === 0) {
      console.warn(`No questions available for exam type: ${examType}`);
      return [];
    }
    
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

    const quiz = shuffle([...beginner, ...intermediate, ...advanced]).slice(
      0,
      config.totalQuestions
    );
    
    console.log(`Generated adaptive quiz: ${quiz.length} questions (${beginner.length} beginner, ${intermediate.length} intermediate, ${advanced.length} advanced)`);
    
    return quiz;
  } catch (error) {
    console.error("Error generating adaptive quiz:", error);
    return [];
  }
}

export function getRandomQuestions(
  examType: ExamType,
  count: number
): Question[] {
  const all = getAllQuestions(examType);
  return shuffle(all).slice(0, count);
}

