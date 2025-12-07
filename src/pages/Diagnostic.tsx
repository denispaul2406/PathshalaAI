import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { generateAdaptiveQuiz } from "@/services/questions";
import type { Question, QuizResult } from "@/types/question";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, Trophy, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/hooks/useAuth";

export default function Diagnostic() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [userLevel, setUserLevel] = useState<"Warrior" | "Champion" | "Master">("Warrior");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const examType = localStorage.getItem("examType") === "SSC" ? "SSC_CGL" : "Banking_Exam";
        console.log("Loading diagnostic quiz for exam type:", examType);
        
        // Import questions service to ensure it's loaded
        const quiz = generateAdaptiveQuiz(examType, {
          beginner: 40,
          intermediate: 40,
          advanced: 20,
          totalQuestions: 10,
        });
        
        console.log("Generated quiz with", quiz.length, "questions");
        
        if (quiz.length === 0) {
          console.error("No valid questions found. Please check question data.");
          // Navigate to dashboard if no questions available
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          setQuestions(quiz);
        }
      } catch (error) {
        console.error("Error loading diagnostic quiz:", error);
        // Navigate to dashboard on error
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    };
    
    loadQuiz();
  }, [navigate]);

  useEffect(() => {
    if (currentIndex < questions.length && !isCompleted) {
      setTimeLeft(60);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNext();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentIndex, questions.length, isCompleted]);

  const handleNext = () => {
    if (selectedAnswer) {
      const newAnswers = { ...answers, [currentIndex]: selectedAnswer };
      setAnswers(newAnswers);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(newAnswers[currentIndex + 1] || "");
      } else {
        handleSubmit(newAnswers);
      }
    }
  };

  const handleSubmit = async (finalAnswers: Record<number, string>) => {
    const quizResults: QuizResult[] = questions.map((q, index) => {
      const userAnswer = finalAnswers[index] || "";
      const isCorrect = userAnswer === q.answer;
      return {
        questionId: q.id || `q${index}`,
        userAnswer,
        correctAnswer: q.answer,
        isCorrect,
        timeTaken: 60 - timeLeft,
        topic: q.topic,
      };
    });

    setResults(quizResults);

    const correctCount = quizResults.filter((r) => r.isCorrect).length;
    const score = (correctCount / questions.length) * 100;

    // Determine user level
    let level: "Warrior" | "Champion" | "Master" = "Warrior";
    if (score >= 80) {
      level = "Master";
    } else if (score >= 60) {
      level = "Champion";
    }

    setUserLevel(level);
    setIsCompleted(true);

    // Save to Firestore
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          diagnosticResults: {
            score,
            level,
            correctCount,
            totalQuestions: questions.length,
            results: quizResults,
            completedAt: new Date().toISOString(),
          },
          examType: localStorage.getItem("examType"),
          examYear: localStorage.getItem("examYear"),
          dataSaver: localStorage.getItem("dataSaver") === "true",
        }, { merge: true });
      } catch (error) {
        console.error("Error saving diagnostic results:", error);
      }
    }
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card variant="elevated" className="p-8 text-center max-w-md">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Loading Questions...</h2>
          <p className="text-muted-foreground mb-4">
            Preparing your diagnostic test. This should only take a moment.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mt-4"
          >
            Skip for Now
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (isCompleted) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = (correctCount / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card variant="elevated" className="p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t("onboarding.diagnostic.results")}
              </h1>
              <p className="text-muted-foreground">
                {t("onboarding.diagnostic.level")}
              </p>
            </div>

            <div className="space-y-6">
              <Card variant="gradient" className="p-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-3">
                    {score.toFixed(0)}%
                  </div>
                  <div className="text-foreground text-lg font-medium">
                    {correctCount} / {questions.length} {t("quiz.correct")}
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <p className="text-muted-foreground">
                  {userLevel === "Master"
                    ? "Excellent! You're ready for advanced challenges."
                    : userLevel === "Champion"
                    ? "Great start! Let's build on your strengths."
                    : "Keep going! We'll help you improve step by step."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card variant="default" className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">
                    {score.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </Card>
                <Card variant="default" className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-gold" />
                  <div className="text-2xl font-bold text-foreground break-words min-h-[2.5rem] flex items-center justify-center px-1">
                    {userLevel}
                  </div>
                  <div className="text-xs text-muted-foreground">Level</div>
                </Card>
                <Card variant="default" className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round((results.reduce((acc, r) => acc + r.timeTaken, 0) / results.length))}s
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Time</div>
                </Card>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleContinue}
              >
                {t("common.continue")} to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="max-w-3xl mx-auto pt-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-foreground">
              {t("onboarding.diagnostic.title")}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {timeLeft}s
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-muted-foreground mt-2">
            {t("onboarding.diagnostic.question")} {currentIndex + 1} {t("onboarding.diagnostic.of")} {questions.length}
          </div>
        </div>

        <Card variant="elevated" className="p-6">
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-2">
              {currentQuestion.topic} • {currentQuestion.difficulty}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {currentQuestion.question}
            </h2>
          </div>

          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index}>
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-border cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary">
                      <div className="w-3 h-3 rounded-full bg-primary-foreground opacity-0 peer-data-[state=checked]:opacity-100" />
                    </div>
                    <span className="flex-1">{option}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  setSelectedAnswer(answers[currentIndex - 1] || "");
                }
              }}
              disabled={currentIndex === 0}
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!selectedAnswer}
            >
              {currentIndex === questions.length - 1
                ? t("onboarding.diagnostic.submit")
                : t("common.next")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

