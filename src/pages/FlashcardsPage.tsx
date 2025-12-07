import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header, BottomNav } from "@/components/Navigation";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Layers, Flame, Clock } from "lucide-react";
import { AISarthi } from "@/components/AISarthi";
import { useAuth } from "@/hooks/useAuth";
import { getUserProgress, getUserFlashcardProgress, saveFlashcardProgress } from "@/services/firestore";
import { getAllQuestions } from "@/services/questions";
import { getDueFlashcards, calculateMastery, type FlashcardProgress as SRProgress } from "@/services/spacedRepetition";
import { useTranslation } from "react-i18next";

interface Deck {
  id: string;
  name: string;
  cards: number;
  due: number;
  mastery: number;
}

export default function FlashcardsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState({
    totalCards: 0,
    dueToday: 0,
    retention: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFlashcardData();
    }
  }, [user]);

  const loadFlashcardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const progress = await getUserProgress(user.uid);
      const examType = progress?.examType === "SSC" ? "SSC_CGL" : "Banking_Exam";
      const allQuestions = getAllQuestions(examType);

      // Get all flashcard progress
      const allProgress = await getUserFlashcardProgress(user.uid);
      const dueCards = getDueFlashcards(allProgress);

      // Create decks by topic
      const topicMap = new Map<string, string[]>();
      allQuestions.forEach((q) => {
        if (q.topic) {
          const current = topicMap.get(q.topic) || [];
          topicMap.set(q.topic, [...current, q.id || ""]);
        }
      });

      const decksData: Deck[] = Array.from(topicMap.entries()).map(([topic, cardIds]) => {
        const topicProgress = allProgress.filter((p) =>
          cardIds.some((id) => p.cardId.includes(id))
        );
        const dueCount = getDueFlashcards(topicProgress).length;
        const mastery = topicProgress.length > 0
          ? Math.round(
              topicProgress.reduce((acc, p) => acc + calculateMastery(p), 0) /
                topicProgress.length
            )
          : 0;

        return {
          id: topic.toLowerCase().replace(/\s+/g, "-"),
          name: topic,
          cards: cardIds.length,
          due: dueCount,
          mastery,
        };
      });

      setDecks(decksData);

      // Calculate stats
      const totalCards = allQuestions.length;
      const totalProgress = allProgress.length;
      const mastered = allProgress.filter((p) => calculateMastery(p) >= 70).length;
      const retentionRate = totalProgress > 0 && mastered > 0 
        ? Math.round((mastered / totalProgress) * 100) 
        : 0;
      
      setStats({
        totalCards: totalCards || 0,
        dueToday: dueCards.length || 0,
        retention: retentionRate,
      });
    } catch (error) {
      console.error("Error loading flashcard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeckClick = (deckName: string) => {
    setSelectedDeck(deckName);
    localStorage.setItem("selectedDeckTopic", deckName);
    // Trigger refresh of FlashcardDeck
    window.dispatchEvent(new Event("deckSelected"));
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

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
      <Header />

      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("flashcards.title")} 🧠
          </h1>
          <p className="text-muted-foreground mt-1">
            Remember every concept with spaced repetition
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Deck */}
          <Card variant="elevated" className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                {selectedDeck ? `Review: ${selectedDeck}` : t("flashcards.review")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FlashcardDeck />
            </CardContent>
          </Card>

          {/* Deck List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-secondary" />
                Your Decks
              </h2>
              {selectedDeck && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDeck(null);
                    localStorage.removeItem("selectedDeckTopic");
                    window.dispatchEvent(new Event("deckSelected"));
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </div>

            {decks.length > 0 ? (
              <>
                <div className="space-y-3">
                  {decks.map((deck, index) => (
                    <motion.div
                      key={deck.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        variant="task" 
                        className={`p-4 cursor-pointer hover:shadow-lg transition-all ${
                          selectedDeck === deck.name ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleDeckClick(deck.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{deck.name}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {deck.cards} cards
                              </span>
                              <span className="flex items-center gap-1 text-primary">
                                <Clock className="w-3 h-3" />
                                {deck.due} {t("flashcards.due")}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground">
                              {deck.mastery}%
                            </div>
                            <div className="text-xs text-muted-foreground">{t("flashcards.mastered")}</div>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary transition-all"
                            style={{ width: `${deck.mastery}%` }}
                          />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <Card variant="default" className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {stats.totalCards}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Cards</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                        {stats.dueToday}
                        <Flame className="w-4 h-4 text-coral" />
                      </div>
                      <div className="text-xs text-muted-foreground">{t("flashcards.due")}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">{stats.retention}%</div>
                      <div className="text-xs text-muted-foreground">Retention</div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card variant="default" className="p-8 text-center">
                <p className="text-muted-foreground">
                  Start reviewing flashcards to see your decks
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
      <AISarthi />
    </div>
  );
}
