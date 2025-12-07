import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateAdaptiveQuiz, getQuestionsBySubject, getQuestionsByTopic } from "@/services/questions";
import type { Question, QuizResult } from "@/types/question";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { saveQuizAttempt, updateUserStats, updateWeakAreas, getUserProgress } from "@/services/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Header, BottomNav } from "@/components/Navigation";
import { AISarthi } from "@/components/AISarthi";
import { toast } from "sonner";

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const examType = searchParams.get("examType") as "SSC_CGL" | "Banking_Exam" | null;
  const topic = searchParams.get("topic") || undefined;
  const subject = searchParams.get("subject") || undefined;

  useEffect(() => {
    if (examType) {
      try {
        setLoading(true);
        setError(null);
        
        let quiz: Question[];
        if (subject) {
          // Filter by subject
          const subjectQuestions = getQuestionsBySubject(examType, decodeURIComponent(subject));
          console.log(`Loaded ${subjectQuestions.length} questions for subject: ${subject}`);
          quiz = generateAdaptiveQuiz(examType, {
            beginner: 40,
            intermediate: 40,
            advanced: 20,
            totalQuestions: 10,
          }, subjectQuestions);
        } else if (topic) {
          // Filter by topic
          const topicQuestions = getQuestionsByTopic(examType, decodeURIComponent(topic));
          console.log(`Loaded ${topicQuestions.length} questions for topic: ${topic}`);
          quiz = generateAdaptiveQuiz(examType, {
            beginner: 40,
            intermediate: 40,
            advanced: 20,
            totalQuestions: 10,
          }, topicQuestions);
        } else {
          quiz = generateAdaptiveQuiz(examType, {
            beginner: 40,
            intermediate: 40,
            advanced: 20,
            totalQuestions: 10,
          });
        }
        
        console.log(`Generated quiz with ${quiz.length} questions`);
        
        if (quiz.length === 0) {
          setError("No questions found. Please try again or contact support.");
          toast.error("No questions available for this topic/subject.");
        } else {
          setQuestions(quiz);
        }
      } catch (err) {
        console.error("Error loading questions:", err);
        setError("Failed to load questions. Please refresh the page or try again later.");
        toast.error("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      navigate("/dashboard");
    }
  }, [examType, subject, topic, navigate]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const currentQuestion = questions[currentIndex];
      setTimeLeft(currentQuestion.timeLimit || 60);
      setSelectedAnswer(answers[currentIndex] || "");
    }
  }, [currentIndex, questions, answers]);

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      handleNext();
    }
  }, [timeLeft, isCompleted]);

  const handleNext = () => {
    if (selectedAnswer) {
      setAnswers({ ...answers, [currentIndex]: selectedAnswer });
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1] || "");
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const finalAnswers = { ...answers, [currentIndex]: selectedAnswer };
    const quizResults: QuizResult[] = questions.map((q, index) => {
      const userAnswer = finalAnswers[index] || "";
      return {
        questionId: q.id || "",
        userAnswer,
        correctAnswer: q.answer,
        isCorrect: userAnswer === q.answer,
        timeTaken: (q.timeLimit || 60) - timeLeft,
        topic: q.topic,
        subject: q.subject,
      };
    });

    setResults(quizResults);
    setIsCompleted(true);

    const correctCount = quizResults.filter((r) => r.isCorrect).length;
    const score = (correctCount / questions.length) * 100;
    const totalTime = Date.now() - startTime;

    // Save to Firestore
    if (user && examType) {
      try {
        const attemptId = `${user.uid}_${Date.now()}`;
        await saveQuizAttempt({
          id: attemptId,
          userId: user.uid,
          examType,
          topic: topic || questions[0]?.topic || undefined,
          subject: subject || questions[0]?.subject || undefined,
          questions: questions.map((q) => q.id || ""),
          results: quizResults,
          score,
          timeTaken: Math.round(totalTime / 1000),
          completedAt: new Date().toISOString(),
        });

        // Update user stats (increment values)
        const currentProgress = await getUserProgress(user.uid);
        const currentStats = currentProgress?.stats || {
          totalQuizzes: 0,
          totalQuestions: 0,
          correctAnswers: 0,
        };
        
        const newTotalQuestions = (currentStats.totalQuestions || 0) + questions.length;
        const newCorrectAnswers = (currentStats.correctAnswers || 0) + correctCount;
        const newAccuracy = Math.round((newCorrectAnswers / newTotalQuestions) * 100);
        
        await updateUserStats(user.uid, {
          totalQuizzes: 1,
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          accuracy: newAccuracy,
        });

        // Update weak areas
        const wrongTopics = quizResults
          .filter((r) => !r.isCorrect && r.topic)
          .map((r) => r.topic!)
          .filter((t, i, arr) => arr.indexOf(t) === i);

        if (wrongTopics.length > 0) {
          await updateWeakAreas(user.uid, wrongTopics);
        }

        toast.success(t("quiz.result") + `: ${score.toFixed(0)}%`);
      } catch (error) {
        console.error("Error saving quiz results:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center pb-20 md:pb-0">
        <Header />
        <main className="container py-6 flex-1 flex items-center justify-center">
          <Card variant="elevated" className="max-w-md w-full p-6 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-xl font-bold text-foreground mb-2">Error Loading Questions</h1>
            <p className="text-muted-foreground mb-6">
              {error || "No questions available. Please try again later."}
            </p>
            <div className="space-y-2">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (isCompleted) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = (correctCount / questions.length) * 100;
    const level = score >= 80 ? "Master" : score >= 60 ? "Champion" : "Warrior";

    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col pb-20 md:pb-0">
        <Header />
        <main className="container py-4 md:py-6 flex-1 flex items-center justify-center overflow-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full mx-auto"
          >
            <Card variant="elevated" className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {t("quiz.results")}
              </h1>
              <p className="text-muted-foreground mb-4 md:mb-6">{t("quiz.yourLevel")}</p>

              <div className="bg-muted rounded-2xl p-6 md:p-8 mb-4 md:mb-6">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                  {score.toFixed(0)}%
                </div>
                <div className="text-base md:text-lg text-foreground">
                  {correctCount} / {questions.length} {t("quiz.correct")}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-6">
                <Card variant="default" className="p-2 sm:p-3 md:p-4 text-center">
                  <div className="text-base sm:text-xl md:text-2xl font-bold text-primary break-words">{score.toFixed(0)}%</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground break-words">{t("quiz.score")}</div>
                </Card>
                <Card variant="default" className="p-2 sm:p-3 md:p-4 text-center">
                  <div className="text-base sm:text-xl md:text-2xl font-bold text-gold break-words min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center px-1">
                    {level}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground break-words">{t("quiz.level")}</div>
                </Card>
                <Card variant="default" className="p-2 sm:p-3 md:p-4 text-center">
                  <div className="text-base sm:text-xl md:text-2xl font-bold text-accent break-words">
                    {Math.round((Date.now() - startTime) / 1000)}s
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground break-words">{t("quiz.avgTime")}</div>
                </Card>
              </div>

              <div className="mb-4 md:mb-6">
                <p className="text-sm md:text-base text-muted-foreground">
                  {score >= 80
                    ? t("quiz.masterMessage")
                    : score >= 60
                    ? t("quiz.championMessage")
                    : t("quiz.warriorMessage")}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  {t("quiz.continueToDashboard")}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setCurrentIndex(0);
                    setAnswers({});
                    setResults([]);
                    setIsCompleted(false);
                    setSelectedAnswer("");
                  }}
                >
                  {t("quiz.retake")}
                </Button>
              </div>
            </Card>
          </motion.div>
        </main>
        <BottomNav />
        <AISarthi />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
      <Header />
      <main className="container py-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {t("quiz.question")} {currentIndex + 1} / {questions.length}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {timeLeft}s
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card variant="elevated" className="p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="mb-3 sm:mb-4">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary break-words inline-block">
                {currentQuestion.subject}
              </span>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-4 sm:mb-6 break-words">
              {currentQuestion.question}
            </h2>

            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              className="space-y-2 sm:space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                  <RadioGroupItem value={option} id={`option-${index}`} className="mt-1 flex-shrink-0" />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 p-2 sm:p-3 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors text-sm sm:text-base break-words"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="default"
              className="flex-1 sm:flex-none"
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  setSelectedAnswer(answers[currentIndex - 1] || "");
                }
              }}
              disabled={currentIndex === 0}
            >
              {t("quiz.previous")}
            </Button>
            <Button variant="hero" size="default" className="flex-1 sm:flex-none" onClick={handleNext}>
              {currentIndex === questions.length - 1
                ? t("quiz.submit")
                : t("quiz.next")}
            </Button>
          </div>
        </div>
      </main>
      <BottomNav />
      <AISarthi />
    </div>
  );
}
