import { genAI } from "@/config/gemini";

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  sampleAnswer?: string;
  tips?: string[];
}

export interface InterviewAnalysis {
  contentScore: number; // 0-100
  deliveryScore: number; // 0-100
  overallScore: number; // 0-100
  strengths: string[];
  improvements: string[];
  feedback: string;
}

export type InterviewMode = "quick" | "full";
export type ExamType = "SSC" | "Banking";

// Job roles for different exam types
const SSC_ROLES = [
  "Auditor",
  "Tax Assistant",
  "Accountant",
  "Statistical Investigator",
  "Inspector",
  "Assistant Section Officer",
];

const BANKING_ROLES = [
  "Probationary Officer (PO)",
  "Clerk",
  "Specialist Officer",
  "Assistant Manager",
  "Relationship Manager",
];

export async function generateInterviewQuestion(
  examType: ExamType,
  category?: string,
  difficulty?: "easy" | "medium" | "hard"
): Promise<InterviewQuestion> {
  const roles = examType === "SSC" ? SSC_ROLES : BANKING_ROLES;
  const randomRole = roles[Math.floor(Math.random() * roles.length)];
  const selectedDifficulty = difficulty || (["easy", "medium", "hard"] as const)[Math.floor(Math.random() * 3)];

  const categories = examType === "SSC" 
    ? ["General Knowledge", "Current Affairs", "Why This Job", "Strengths & Weaknesses", "Problem Solving", "Communication Skills"]
    : ["Banking Awareness", "Current Affairs", "Why Banking", "Customer Service", "Problem Solving", "Teamwork"];

  const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)];

  const prompt = `Generate a single realistic interview question for a ${examType} exam candidate applying for the role of ${randomRole}.

Category: ${selectedCategory}
Difficulty: ${selectedDifficulty}

The question should:
- Be relevant to Indian government job interviews for ${examType} exams
- Be appropriate for Tier 2/3 city candidates
- Test practical knowledge and communication skills
- Be answerable in 1-2 minutes

Return ONLY a JSON object with this exact structure:
{
  "question": "the interview question",
  "category": "${selectedCategory}",
  "difficulty": "${selectedDifficulty}",
  "sampleAnswer": "a good sample answer (2-3 sentences) that Tier 2/3 candidates can understand and learn from",
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question: parsed.question,
        category: parsed.category || selectedCategory,
        difficulty: parsed.difficulty || selectedDifficulty,
        sampleAnswer: parsed.sampleAnswer,
        tips: parsed.tips || [],
      };
    }
    
    // Fallback
    return {
      id: `interview-${Date.now()}`,
      question: `Tell us about yourself and why you want to work in ${randomRole} role?`,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      sampleAnswer: `I am a dedicated and hardworking individual with a strong interest in serving the public through government service. I want to work in the ${randomRole} role because it offers stability, growth opportunities, and the chance to contribute meaningfully to the organization.`,
      tips: [
        "Be concise and to the point",
        "Highlight relevant qualifications",
        "Show enthusiasm for the role",
      ],
    };
  } catch (error) {
    console.error("Error generating interview question:", error);
    throw new Error("Failed to generate interview question");
  }
}

export async function analyzeInterviewResponse(
  question: string,
  userResponse: string,
  examType: ExamType,
  language: string = "en"
): Promise<InterviewAnalysis> {
  const languageMap: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
    bn: "Bengali",
    kn: "Kannada",
  };
  
  const languageName = languageMap[language] || "English";

  const prompt = `You are an experienced interview panel member evaluating a candidate's response for ${examType} exam interview.

Question asked: "${question}"
Candidate's response: "${userResponse}"
Language: ${languageName}

Provide a comprehensive analysis in JSON format with this exact structure:
{
  "contentScore": <number 0-100, based on relevance, completeness, accuracy>,
  "deliveryScore": <number 0-100, based on clarity, confidence, fluency>,
  "overallScore": <number 0-100, average of content and delivery>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement area 1", "improvement area 2"],
  "feedback": "2-3 sentence constructive feedback in ${languageName}"
}

Be encouraging but honest. Focus on actionable feedback for Tier 2/3 city candidates.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        contentScore: Math.max(0, Math.min(100, parsed.contentScore || 70)),
        deliveryScore: Math.max(0, Math.min(100, parsed.deliveryScore || 70)),
        overallScore: Math.max(0, Math.min(100, parsed.overallScore || 70)),
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        feedback: parsed.feedback || "Good attempt! Keep practicing to improve.",
      };
    }
    
    // Fallback analysis
    const wordCount = userResponse.split(/\s+/).length;
    const hasKeywords = (question + userResponse).toLowerCase().includes("government") || 
                       (question + userResponse).toLowerCase().includes("service") ||
                       (question + userResponse).toLowerCase().includes("work");
    
    const contentScore = hasKeywords ? 75 : 60;
    const deliveryScore = wordCount > 20 ? 70 : 60;
    
    return {
      contentScore,
      deliveryScore,
      overallScore: Math.round((contentScore + deliveryScore) / 2),
      strengths: wordCount > 20 ? ["Good length", "Clear communication"] : ["Attempted the question"],
      improvements: ["Add more specific examples", "Connect answer to job requirements"],
      feedback: "Your answer shows understanding. Try to include specific examples and relate them to the role you're applying for.",
    };
  } catch (error) {
    console.error("Error analyzing interview response:", error);
    throw new Error("Failed to analyze interview response");
  }
}

export function getJobRolesForExam(examType: ExamType): string[] {
  return examType === "SSC" ? SSC_ROLES : BANKING_ROLES;
}

export function getInterviewCategories(examType: ExamType): string[] {
  return examType === "SSC"
    ? ["General Knowledge", "Current Affairs", "Why This Job", "Strengths & Weaknesses", "Problem Solving", "Communication Skills"]
    : ["Banking Awareness", "Current Affairs", "Why Banking", "Customer Service", "Problem Solving", "Teamwork"];
}

