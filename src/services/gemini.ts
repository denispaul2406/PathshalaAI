import { genAI } from "@/config/gemini";

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeminiContext {
  language?: string;
  examType?: string;
  weakAreas?: string[];
  strongAreas?: string[];
  userProgress?: {
    weakAreas: string[];
    strongAreas: string[];
    currentTopic?: string;
  };
  conversationHistory?: ChatMessage[];
}

export async function chatWithGemini(
  message: string,
  context?: GeminiContext
): Promise<string> {
  try {
    // Default to English if no language specified
    const language = context?.language || "en";
    
    // Map language codes to full names for better AI understanding
    const languageMap: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      ta: "Tamil",
      bn: "Bengali",
      kn: "Kannada",
    };
    
    const languageName = languageMap[language] || "English";
    const examType = context?.examType || "SSC CGL";

    let systemPrompt = `You are AI Sarthi, a helpful and friendly study assistant for Indian government exam preparation (SSC CGL, Banking exams).

IMPORTANT INSTRUCTIONS:
1. **Language**: Respond in ${languageName}. Default to English if user hasn't specified a language preference.
2. **Format**: Always format your responses using Markdown (.md format). Use:
   - **Bold** for emphasis and headings
   - *Italic* for subtle emphasis
   - ### Headings for sections
   - - Bullet points for lists
   - 1. Numbered lists for steps
   - \`code\` for technical terms
   - > Blockquotes for important notes
3. **Style**: Be conversational, encouraging, and supportive. Use the Socratic method - give hints rather than direct answers to help students learn.
4. **Context-Aware**: Use the user's progress information to personalize responses.`;

    let userContext = "";
    
    // Get weak/strong areas from either userProgress object or direct properties
    const weakAreas = context?.userProgress?.weakAreas || context?.weakAreas || [];
    const strongAreas = context?.userProgress?.strongAreas || context?.strongAreas || [];
    const currentTopic = context?.userProgress?.currentTopic;

    if (weakAreas.length || strongAreas.length || currentTopic) {
      const weakStr = weakAreas.length 
        ? `- Weak Areas: ${weakAreas.join(", ")}\n`
        : "";
      const strongStr = strongAreas.length
        ? `- Strong Areas: ${strongAreas.join(", ")}\n`
        : "";
      const topicStr = currentTopic
        ? `- Current Topic: ${currentTopic}\n`
        : "";
      
      userContext = `\nUser Progress Context:\n${weakStr}${strongStr}${topicStr}`;
    }

    if (context?.examType) {
      userContext += `\n- Exam Type: ${examType}`;
    }

    const conversationHistory = context?.conversationHistory?.map(msg => 
      `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
    ).join("\n") || "";

    const fullPrompt = `${systemPrompt}${userContext}

${conversationHistory ? `Previous Conversation:\n${conversationHistory}\n\n` : ""}User: ${message}

Assistant (respond in ${languageName}, use Markdown formatting):`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to get AI response. Please try again.");
  }
}

export async function generateStudyPlan(
  weakAreas: string[],
  examType: "SSC" | "Banking",
  examDate?: string
): Promise<string> {
  const prompt = `
Create a personalized study plan for ${examType} exam preparation.

Weak Areas: ${weakAreas.join(", ")}
${examDate ? `Exam Date: ${examDate}` : ""}

Provide a daily study schedule with:
1. Topics to focus on
2. Time allocation
3. Practice recommendations
4. Revision schedule

Format it in a clear, actionable way in Hindi/English mix.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate study plan.");
  }
}

export async function analyzeErrorPattern(
  errors: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
  }>
): Promise<{
  category: "Concept Gap" | "Silly Mistake" | "Time Panic";
  explanation: string;
  recommendation: string;
}> {
  const errorSummary = errors
    .map(
      (e, i) =>
        `Error ${i + 1}:\nTopic: ${e.topic}\nQuestion: ${e.question}\nYour Answer: ${e.userAnswer}\nCorrect: ${e.correctAnswer}`
    )
    .join("\n\n");

  const prompt = `
Analyze these quiz errors and categorize each as:
1. "Concept Gap" - Fundamental misunderstanding
2. "Silly Mistake" - Calculation/reading error
3. "Time Panic" - Rushed due to time pressure

${errorSummary}

For each error, provide:
- Category
- Brief explanation
- Actionable recommendation

Respond in JSON format.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      category: "Concept Gap" as const,
      explanation: text,
      recommendation: "Review the fundamentals of this topic",
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      category: "Concept Gap" as const,
      explanation: "Error analysis failed",
      recommendation: "Review the topic thoroughly",
    };
  }
}

export async function fixFluency(text: string): Promise<string> {
  const prompt = `Fix the grammar and fluency of this text while keeping the meaning intact. Return only the corrected text, no explanations:\n\n${text}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    return text; // Return original if correction fails
  }
}

