import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Lock, PlayCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getUserProgress, getUserQuizAttempts } from "@/services/firestore";
import { getAllQuestions } from "@/services/questions";

interface PathNode {
  id: string;
  title: string;
  titleHindi?: string;
  type: "concept" | "practice" | "test";
  status: "completed" | "current" | "locked";
  masteryScore?: number;
}

export function LearningPath() {
  const { user } = useAuth();
  const [pathNodes, setPathNodes] = useState<PathNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLearningPath();
    }
  }, [user]);

  const loadLearningPath = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const progress = await getUserProgress(user.uid);
      const attempts = await getUserQuizAttempts(user.uid, 10);
      const examType = progress?.examType === "SSC" ? "SSC_CGL" : "Banking_Exam";
      const allQuestions = getAllQuestions(examType);

      // Get topics from questions
      const topicMap = new Map<string, number>();
      allQuestions.forEach((q) => {
        if (q.topic) {
          const current = topicMap.get(q.topic) || 0;
          topicMap.set(q.topic, current + 1);
        }
      });

      // Calculate mastery from attempts
      const topicMastery = new Map<string, { correct: number; total: number }>();
      attempts.forEach((attempt) => {
        attempt.results.forEach((result) => {
          if (result.topic) {
            const current = topicMastery.get(result.topic) || { correct: 0, total: 0 };
            topicMastery.set(result.topic, {
              correct: current.correct + (result.isCorrect ? 1 : 0),
              total: current.total + 1,
            });
          }
        });
      });

      // Build learning path from topics
      const topics = Array.from(topicMap.keys()).slice(0, 6);
      const nodes: PathNode[] = [];
      
      topics.forEach((topic, index) => {
        const mastery = topicMastery.get(topic);
        const masteryScore = mastery && mastery.total > 0
          ? Math.round((mastery.correct / mastery.total) * 100)
          : undefined;

        let status: "completed" | "current" | "locked" = "locked";
        if (masteryScore && masteryScore >= 70) {
          status = "completed";
        } else if (index === 0 || (index > 0 && nodes[index - 1]?.status === "completed")) {
          status = "current";
        }

        nodes.push({
          id: `topic-${index}`,
          title: topic,
          type: index % 2 === 0 ? "concept" : "practice",
          status,
          masteryScore,
        });
      });

      // If no topics yet, show placeholder
      if (nodes.length === 0) {
        nodes.push({
          id: "start",
          title: "Complete Diagnostic Test",
          titleHindi: "डायग्नोस्टिक टेस्ट पूरा करें",
          type: "test",
          status: "current",
        });
      }

      setPathNodes(nodes);
    } catch (error) {
      console.error("Error loading learning path:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-4 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (pathNodes.length === 0) {
    return (
      <div className="w-full py-4 text-center text-muted-foreground">
        Complete your diagnostic test to see your learning path
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-primary to-muted rounded-full" />

        {/* Nodes */}
        <div className="space-y-4">
          {pathNodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-center gap-4 ${
                node.status === "locked" ? "opacity-50" : ""
              }`}
            >
              {/* Node indicator */}
              <div
                className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  node.status === "completed"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : node.status === "current"
                    ? "bg-primary text-primary-foreground shadow-lg animate-pulse-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {node.status === "completed" ? (
                  <Check className="w-6 h-6" />
                ) : node.status === "current" ? (
                  <PlayCircle className="w-6 h-6" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                
                {/* Mastery badge */}
                {node.masteryScore && (
                  <span className="absolute -top-1 -right-1 bg-gold text-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {node.masteryScore}%
                  </span>
                )}
              </div>

              {/* Content */}
              <div
                className={`flex-1 p-4 rounded-xl transition-all ${
                  node.status === "current"
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card border border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      node.type === "concept"
                        ? "bg-saffron-light text-primary"
                        : node.type === "practice"
                        ? "bg-indigo-light text-secondary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                  </span>
                  {node.status === "current" && (
                    <span className="text-xs font-medium text-primary">Continue →</span>
                  )}
                </div>
                <h4 className="font-semibold mt-1 text-foreground">{node.title}</h4>
                {node.titleHindi && (
                  <p className="text-sm text-muted-foreground">{node.titleHindi}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
