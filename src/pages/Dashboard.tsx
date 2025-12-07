import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header, BottomNav } from "@/components/Navigation";
import { TaskCard, DailyTask } from "@/components/TaskCard";
import { StatsCard } from "@/components/StatsCard";
import { ProgressRing } from "@/components/ProgressRing";
import { LearningPath } from "@/components/LearningPath";
import { AISarthi } from "@/components/AISarthi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Star, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getUserProgress, getUserQuizAttempts } from "@/services/firestore";
import { generateAdaptiveQuiz } from "@/services/questions";
import { getVideosByExamType } from "@/services/videos";
import { useTranslation } from "react-i18next";
import type { Question } from "@/types/question";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [userStats, setUserStats] = useState({
    streak: 0,
    xp: 0,
    accuracy: 0,
    rank: 0,
  });
  const [todayProgress, setTodayProgress] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const progress = await getUserProgress(user.uid);
      const attempts = await getUserQuizAttempts(user.uid, 7);

      // Calculate stats
      if (progress?.stats) {
        setUserStats({
          streak: progress.stats.streak || 0,
          xp: progress.stats.totalXP || 0,
          accuracy: progress.stats.accuracy || 0,
          rank: 0, // TODO: Calculate from leaderboard
        });
      }

      // Generate daily mix based on weak areas
      const examType = progress?.examType === "SSC" ? "SSC_CGL" : "Banking_Exam";
      const dailyMix = generateDailyMix(examType, progress?.weakAreas || []);

      // Calculate today's progress
      const todayAttempts = attempts.filter((a) => {
        const date = new Date(a.completedAt);
        const today = new Date();
        return date.toDateString() === today.toDateString();
      });
      const completedToday = todayAttempts.length;
      
      // Mark tasks as completed based on quiz attempts
      const today = new Date().toDateString();
      const updatedTasks = dailyMix.map((task, index) => {
        // Mark quizzes as completed if there's a quiz attempt today
        if (task.type === "quiz" && index < completedToday) {
          return { ...task, completed: true, progress: 100 };
        }
        // Mark videos as completed if viewed today (we can check this later)
        return task;
      });
      
      setTasks(updatedTasks);
      setTodayProgress(Math.round((completedToday / dailyMix.length) * 100));

      // Calculate weekly progress
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAttempts = attempts.filter(
        (a) => new Date(a.completedAt) >= weekAgo
      );
      setWeeklyProgress(Math.round((weekAttempts.length / 50) * 100));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyMix = (
    examType: "SSC_CGL" | "Banking_Exam",
    weakAreas: string[]
  ): DailyTask[] => {
    const mix: DailyTask[] = [];
    const examTypeLocal = examType === "SSC_CGL" ? "SSC" : "Banking";
    const videos = getVideosByExamType(examTypeLocal as "SSC" | "Banking");

    // Generate quiz questions for weak areas
    if (weakAreas.length > 0) {
      const quizQuestions = generateAdaptiveQuiz(examType, {
        beginner: 40,
        intermediate: 40,
        advanced: 20,
        totalQuestions: 10,
      });

      mix.push({
        id: "daily-quiz-1",
        type: "quiz",
        title: `${weakAreas[0]} Practice Quiz`,
        titleHi: `${weakAreas[0]} अभ्यास क्विज़`,
        duration: "10 min",
        difficulty: "medium",
        subject: weakAreas[0],
        completed: false,
        progress: 0,
      });
    } else {
      mix.push({
        id: "daily-quiz-1",
        type: "quiz",
        title: "Daily Practice Quiz",
        titleHi: "दैनिक अभ्यास क्विज़",
        duration: "10 min",
        difficulty: "medium",
        subject: "Mixed",
        completed: false,
        progress: 0,
      });
    }

    // Add video recommendations
    const recommendedVideos = weakAreas.length > 0
      ? videos.filter((v) =>
          weakAreas.some((area) =>
            v.topic.toLowerCase().includes(area.toLowerCase())
          )
        ).slice(0, 2)
      : videos.slice(0, 2);

    recommendedVideos.forEach((video, index) => {
      mix.push({
        id: `video-${video.id}`,
        type: "video",
        title: video.title,
        titleHi: video.titleHi,
        duration: `${Math.floor(video.duration / 60)} min`,
        difficulty: video.difficulty === "beginner" ? "easy" : video.difficulty === "intermediate" ? "medium" : "hard",
        subject: video.subject,
        completed: false,
        progress: 0,
      });
    });

    // Add revision task
    mix.push({
      id: "revision-1",
      type: "revision",
      title: "Review Previous Mistakes",
      titleHi: "पिछली गलतियों की समीक्षा करें",
      duration: "5 min",
      difficulty: "easy",
      subject: "Revision",
      completed: false,
    });

    // Ensure we have 5 tasks
    while (mix.length < 5) {
      mix.push({
        id: `quiz-${mix.length + 1}`,
        type: "quiz",
        title: "Additional Practice",
        titleHi: "अतिरिक्त अभ्यास",
        duration: "5 min",
        difficulty: "easy",
        subject: "Mixed",
        completed: false,
        progress: 0,
      });
    }

    return mix.slice(0, 5);
  };

  const handleStartTask = (id: string) => {
    const examType = localStorage.getItem("examType");
    if (id.includes("quiz")) {
      navigate(`/quiz?examType=${examType === "SSC" ? "SSC_CGL" : "Banking_Exam"}`);
    } else if (id.includes("video")) {
      navigate("/reels");
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

  const completedTasks = tasks.filter((t) => t.completed).length;
  const userName = user?.displayName || user?.email?.split("@")[0] || "Student";

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
      <Header />

      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
                  {t("dashboard.welcome")}, {userName}! 🙏
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                  {t("dashboard.dailyGoal")}: {tasks.length} tasks to complete
                </p>
              </div>
              <div className="flex-shrink-0">
                <ProgressRing progress={todayProgress} size={70} strokeWidth={8} />
              </div>
            </motion.div>

            {/* Stats */}
            <StatsCard
              streak={userStats.streak}
              xp={userStats.xp}
              accuracy={userStats.accuracy}
              rank={userStats.rank}
            />

            {/* Daily Mix */}
            <Card variant="default">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold flex-shrink-0" />
                    <span className="break-words">{t("dashboard.todayMix")}</span>
                  </CardTitle>
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {completedTasks}/{tasks.length} {t("dashboard.tasksCompleted")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onStart={handleStartTask}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks yet. Complete your diagnostic test first!
                  </div>
                )}
                <Button
                  variant="hero"
                  className="w-full mt-4"
                  onClick={() => {
                    const examType = localStorage.getItem("examType");
                    navigate(`/quiz?examType=${examType === "SSC" ? "SSC_CGL" : "Banking_Exam"}`);
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Daily Practice
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Goal */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  {t("dashboard.weeklyGoal")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ProgressRing
                    progress={weeklyProgress}
                    size={100}
                    strokeWidth={10}
                    label="Complete"
                    sublabel={`${Math.round(weeklyProgress * 0.5)}/50 tasks`}
                  />
                </div>
                {/* Weekly calendar will be calculated from actual attempts */}
              </CardContent>
            </Card>

            {/* Learning Path Preview */}
            <Card variant="default">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    <span className="break-words">{t("dashboard.yourPath")}</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/learn")} className="text-xs sm:text-sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
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

