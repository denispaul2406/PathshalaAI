import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header, BottomNav } from "@/components/Navigation";
import { LearningPath } from "@/components/LearningPath";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Clock, Award } from "lucide-react";
import { AISarthi } from "@/components/AISarthi";
import { useAuth } from "@/hooks/useAuth";
import { getUserProgress, getUserQuizAttempts } from "@/services/firestore";
import { getAllQuestions } from "@/services/questions";
import { getVideosByExamType } from "@/services/videos";
import { useTranslation } from "react-i18next";

export default function LearnPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    progress: number;
    chapters: number;
    completed: number;
  }>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    title: string;
    type: string;
    duration: string;
    subject: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLearnData();
    }
  }, [user]);

  const loadLearnData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const progress = await getUserProgress(user.uid);
      const attempts = await getUserQuizAttempts(user.uid, 5);
      const examType = progress?.examType === "SSC" ? "SSC_CGL" : "Banking_Exam";
      const allQuestions = getAllQuestions(examType);
      const videos = getVideosByExamType(progress?.examType || "SSC");

      // Calculate subject progress
      const subjectMap = new Map<string, { total: number; completed: number }>();
      
      allQuestions.forEach((q) => {
        if (q.subject) {
          const current = subjectMap.get(q.subject) || { total: 0, completed: 0 };
          subjectMap.set(q.subject, { ...current, total: current.total + 1 });
        }
      });

      attempts.forEach((attempt) => {
        const correct = attempt.results.filter((r) => r.isCorrect).length;
        attempt.results.forEach((result) => {
          if (result.topic) {
            const subject = allQuestions.find((q) => q.topic === result.topic)?.subject;
            if (subject) {
              const current = subjectMap.get(subject) || { total: 0, completed: 0 };
              subjectMap.set(subject, {
                ...current,
                completed: current.completed + (result.isCorrect ? 1 : 0),
              });
            }
          }
        });
      });

      const subjectIcons: Record<string, string> = {
        "Quantitative Aptitude": "📐",
        "General Intelligence and Reasoning": "🧩",
        "English Language": "📚",
        "General Awareness": "📜",
        "Reasoning Ability": "🧩",
        "General/Economic/Banking Awareness": "💼",
      };

      const subjectsData = Array.from(subjectMap.entries())
        .map(([name, data]) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name,
          icon: subjectIcons[name] || "📖",
          progress: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
          chapters: Math.ceil(data.total / 10),
          completed: Math.ceil(data.completed / 10),
        }))
        .sort((a, b) => b.progress - a.progress);

      setSubjects(subjectsData);

      // Recent activity from quiz attempts
      const activity = attempts.slice(0, 3).map((attempt, index) => ({
        id: attempt.id,
        title: attempt.topic || `Quiz ${index + 1}`,
        type: "quiz",
        duration: `${Math.floor(attempt.timeTaken / 60)} min`,
        subject: attempt.subject || "Mixed",
      }));

      // Add video activity if available
      if (videos.length > 0 && activity.length < 3) {
        activity.push({
          id: `video-${videos[0].id}`,
          title: videos[0].title,
          type: "video",
          duration: `${Math.floor(videos[0].duration / 60)} min`,
          subject: videos[0].subject,
        });
      }

      setRecentActivity(activity);
    } catch (error) {
      console.error("Error loading learn data:", error);
    } finally {
      setLoading(false);
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

  const examType = localStorage.getItem("examType");
  const continueVideo = getVideosByExamType((examType as "SSC" | "Banking") || "SSC")[0];

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
            {t("dashboard.welcome")} 📖
          </h1>
          <p className="text-muted-foreground mt-1">
            Follow your personalized learning path
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning */}
            {continueVideo && (
              <Card variant="elevated" className="overflow-hidden">
                <div className="bg-gradient-primary p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary-foreground/80 text-sm">Continue where you left</p>
                      <h2 className="text-xl font-bold text-primary-foreground mt-1">
                        {continueVideo.title}
                      </h2>
                      <p className="text-primary-foreground/70 text-sm mt-1">
                        {continueVideo.subject} • {Math.floor(continueVideo.duration / 60)} min
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full"
                      onClick={() => navigate("/reels")}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Subjects Grid */}
            <div>
              <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Subjects
              </h2>
              {subjects.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        variant="task"
                        className="p-4 text-center h-full cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => {
                          const examType = localStorage.getItem("examType");
                          navigate(`/quiz?examType=${examType === "SSC" ? "SSC_CGL" : "Banking_Exam"}&subject=${encodeURIComponent(subject.name)}`);
                        }}
                      >
                        <span className="text-3xl">{subject.icon}</span>
                        <h3 className="font-semibold text-foreground mt-2">{subject.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {subject.completed}/{subject.chapters} topics
                        </p>
                        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary transition-all"
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {subject.progress}% complete
                        </span>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card variant="default" className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Complete quizzes to see your subject progress
                  </p>
                </Card>
              )}
            </div>

            {/* Recent Activity */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => {
                        if (lesson.type === "quiz") {
                          const examType = localStorage.getItem("examType");
                          navigate(`/quiz?examType=${examType === "SSC" ? "SSC_CGL" : "Banking_Exam"}`);
                        } else {
                          navigate("/reels");
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            lesson.type === "video"
                              ? "bg-saffron-light text-primary"
                              : lesson.type === "reading"
                              ? "bg-indigo-light text-secondary"
                              : "bg-emerald-light text-accent"
                          }`}
                        >
                          {lesson.type === "video" && <Play className="w-5 h-5" />}
                          {lesson.type === "reading" && <BookOpen className="w-5 h-5" />}
                          {lesson.type === "quiz" && <Award className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{lesson.title}</h4>
                          <p className="text-xs text-muted-foreground">{lesson.subject}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent activity. Start learning!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Learning Path */}
          <div>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg">Your Learning Path</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <LearningPath />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
      <AISarthi />
    </div>
  );
}
