import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getAllQuestions } from "@/services/questions";
import { getUserProgress, getUserFlashcardProgress, saveFlashcardProgress } from "@/services/firestore";
import { getDueFlashcards, updateFlashcardProgress, calculateMastery, type FlashcardProgress as SRProgress } from "@/services/spacedRepetition";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

interface Flashcard {
  id: string;
  question: string;
  questionHi?: string;
  answer: string;
  answerHi?: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
}

export function FlashcardDeck() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFlashcards();
    }
    
    // Listen for deck selection
    const handleDeckSelect = () => {
      loadFlashcards();
    };
    window.addEventListener("deckSelected", handleDeckSelect);
    
    return () => {
      window.removeEventListener("deckSelected", handleDeckSelect);
    };
  }, [user]);

  const loadFlashcards = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const progress = await getUserProgress(user.uid);
      const examType = progress?.examType === "SSC" ? "SSC_CGL" : "Banking_Exam";
      let allQuestions = getAllQuestions(examType);
      
      // Filter by selected deck topic if available
      const selectedTopic = localStorage.getItem("selectedDeckTopic");
      if (selectedTopic) {
        allQuestions = allQuestions.filter((q) => 
          q.topic?.toLowerCase().includes(selectedTopic.toLowerCase())
        );
        localStorage.removeItem("selectedDeckTopic");
      }

      // Convert questions to flashcards (due cards first)
      const allProgress = await getUserFlashcardProgress(user.uid);
      const dueCards = getDueFlashcards(allProgress);

      // Get flashcards from due cards, then add new ones
      const flashcardMap = new Map<string, Flashcard>();
      const dueCardIds = new Set(dueCards.map((p) => p.cardId));

      // Add due cards first
      dueCards.forEach((progress) => {
        const question = allQuestions.find((q) => progress.cardId.includes(q.id || ""));
        if (question) {
          flashcardMap.set(question.id || "", {
            id: question.id || "",
            question: question.question,
            answer: question.answer,
            subject: question.subject || "Mixed",
            difficulty: question.difficulty === "beginner" ? "easy" : question.difficulty === "intermediate" ? "medium" : "hard",
          });
        }
      });

      // Add new cards (up to 10 total)
      allQuestions.slice(0, 10).forEach((q) => {
        if (!flashcardMap.has(q.id || "") && flashcardMap.size < 10) {
          flashcardMap.set(q.id || "", {
            id: q.id || "",
            question: q.question,
            answer: q.answer,
            subject: q.subject || "Mixed",
            difficulty: q.difficulty === "beginner" ? "easy" : q.difficulty === "intermediate" ? "medium" : "hard",
          });
        }
      });

      setCards(Array.from(flashcardMap.values()));
    } catch (error) {
      console.error("Error loading flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentIndex];

  const handleNext = async () => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // All cards reviewed, reload
      await loadFlashcards();
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleKnow = async () => {
    if (user && currentCard) {
      // Quality 4 = Easy, 5 = Perfect
      const quality = 4;
      const allProgress = await getUserFlashcardProgress(user.uid);
      const existing = allProgress.find((p) => p.cardId.includes(currentCard.id));
      const updated = updateFlashcardProgress(existing || null, quality);
      updated.cardId = `${user.uid}_${currentCard.id}`;
      
      await saveFlashcardProgress({
        ...updated,
        userId: user.uid,
      });
    }
    await handleNext();
  };

  const handleDontKnow = async () => {
    if (user && currentCard) {
      // Quality 0 = Wrong
      const quality = 0;
      const allProgress = await getUserFlashcardProgress(user.uid);
      const existing = allProgress.find((p) => p.cardId.includes(currentCard.id));
      const updated = updateFlashcardProgress(existing || null, quality);
      updated.cardId = `${user.uid}_${currentCard.id}`;
      
      await saveFlashcardProgress({
        ...updated,
        userId: user.uid,
      });
    }
    await handleNext();
  };

  const difficultyColors = {
    easy: "bg-accent/20 text-accent",
    medium: "bg-gold/20 text-foreground",
    hard: "bg-coral/20 text-coral",
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!currentCard || cards.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-8">
        <p className="text-muted-foreground">No flashcards available. Complete quizzes to generate flashcards!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <div className="flex-1 mx-4 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="relative min-h-[320px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentCard.id + currentIndex}
            initial={{ 
              opacity: 0, 
              x: direction * 100,
              scale: 0.9
            }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              x: -direction * 100,
              scale: 0.9
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <div
              className={`w-full h-full rounded-2xl shadow-lg p-6 flex flex-col cursor-pointer transition-all ${
                isFlipped
                  ? "bg-gradient-primary text-white"
                  : "bg-card border-2 border-border"
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Subject badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  isFlipped 
                    ? "bg-white/20 text-white" 
                    : difficultyColors[currentCard.difficulty]
                }`}>
                  {currentCard.subject}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(!isFlipped);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    isFlipped 
                      ? "hover:bg-white/20 text-white" 
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-4">
                {isFlipped ? (
                  <>
                    <p className="text-2xl md:text-3xl font-bold text-white mb-3 break-words leading-relaxed">
                      {currentCard.answer}
                    </p>
                    {currentCard.answerHi && (
                      <p className="text-sm mt-2 text-white/90">{currentCard.answerHi}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xl md:text-2xl font-semibold text-foreground break-words leading-relaxed">
                      {currentCard.question}
                    </p>
                    {currentCard.questionHi && (
                      <p className="text-sm mt-2 text-muted-foreground">{currentCard.questionHi}</p>
                    )}
                  </>
                )}
              </div>

              {/* Hint */}
              <p className={`text-xs text-center mt-4 ${
                isFlipped 
                  ? "text-white/80" 
                  : "text-muted-foreground"
              }`}>
                {t("flashcards.flip")}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDontKnow}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            {t("flashcards.dontKnow")}
          </Button>
          <Button variant="success" onClick={handleKnow}>
            <Check className="w-4 h-4 mr-2" />
            {t("flashcards.know")}
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
