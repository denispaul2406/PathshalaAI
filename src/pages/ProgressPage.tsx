import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header, BottomNav } from "@/components/Navigation";
import { ProgressRing } from "@/components/ProgressRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  ChevronRight,
  Flame
} from "lucide-react";
import { AISarthi } from "@/components/AISarthi";
import { useAuth } from "@/hooks/useAuth";
import { getUserProgress, getUserQuizAttempts } from "@/services/firestore";
import { useTranslation } from "react-i18next";

export default function ProgressPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalXP: 0,
    streak: 0,
    accuracy: 0,
    rank: 0,
  });
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; tasks: number; completed: number }>>([]);
  const [subjectProgress, setSubjectProgress] = useState<Array<{ name: string; score: number; trend: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const progress = await getUserProgress(user.uid);
      const attempts = await getUserQuizAttempts(user.uid, 30);

      // Update stats
      if (progress?.stats) {
        setStats({
          totalXP: progress.stats.totalXP || 0,
          streak: progress.stats.streak || 0,
          accuracy: progress.stats.accuracy || 0,
          rank: 0,
        });
      }

      // Calculate weekly activity
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const weekData = weekDays.map((day, index) => {
        const date = new Date();
        const dayOfWeek = date.getDay();
        const diff = index - dayOfWeek;
        const targetDate = new Date(date);
        targetDate.setDate(date.getDate() + diff);
        
        const dayAttempts = attempts.filter((a) => {
          const attemptDate = new Date(a.completedAt);
          return attemptDate.toDateString() === targetDate.toDateString();
        });

        return {
          day,
          tasks: dayAttempts.length + 2, // Base tasks
          completed: dayAttempts.length,
        };
      });
      setWeeklyData(weekData);

      // Calculate subject-wise progress
      const subjectMap = new Map<string, { correct: number; total: number }>();
      attempts.forEach((attempt) => {
        const subject = attempt.subject || "Mixed";
        const correct = attempt.results.filter((r) => r.isCorrect).length;
        const total = attempt.results.length;
        
        const current = subjectMap.get(subject) || { correct: 0, total: 0 };
        subjectMap.set(subject, {
          correct: current.correct + correct,
          total: current.total + total,
        });
      });

      const subjectProgressData = Array.from(subjectMap.entries())
        .map(([name, data]) => ({
          name,
          score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
          trend: "+5%", // TODO: Calculate from previous period
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setSubjectProgress(subjectProgressData);

      // Calculate overall progress
      const totalQuestions = attempts.reduce((acc, a) => acc + a.results.length, 0);
      const correctQuestions = attempts.reduce(
        (acc, a) => acc + a.results.filter((r) => r.isCorrect).length,
        0
      );
      setOverallProgress(
        totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0
      );
    } catch (error) {
      console.error("Error loading progress:", error);
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

  const thisWeekAttempts = weeklyData.reduce((acc, day) => acc + day.completed, 0);

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
            {t("progress.title")} 📊
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("progress.overview")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("progress.xp"), value: stats.totalXP.toLocaleString(), icon: TrendingUp, color: "text-primary" },
                { label: t("progress.streak"), value: stats.streak.toString(), icon: Flame, color: "text-coral" },
                { label: t("progress.accuracy"), value: `${stats.accuracy}%`, icon: Target, color: "text-accent" },
                { label: t("progress.rank"), value: `#${stats.rank || "---"}`, icon: Award, color: "text-gold" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="elevated" className="p-4 text-center">
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Weekly Activity */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {t("progress.weekly")}
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-40">
                  {weeklyData.map((day, index) => {
                    const height = day.tasks > 0 ? (day.completed / day.tasks) * 100 : 0;
                    const isToday = index === new Date().getDay() - 1;
                    
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full h-28 bg-muted rounded-lg overflow-hidden">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className={`absolute bottom-0 w-full rounded-lg ${
                              isToday ? "bg-primary/30" : "bg-gradient-primary"
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          isToday ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {day.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-primary" />
                    <span className="text-muted-foreground">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Progress */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  Subject-wise Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectProgress.length > 0 ? (
                  subjectProgress.map((subject, index) => (
                    <motion.div
                      key={subject.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{subject.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-accent">{subject.trend}</span>
                          <span className="font-bold text-foreground">{subject.score}%</span>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.score}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                          className="h-full bg-gradient-primary rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No data yet. Start taking quizzes to see your progress!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overall Progress */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg">Overall Mastery</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ProgressRing
                  progress={overallProgress}
                  size={160}
                  strokeWidth={14}
                  label="Complete"
                />
                <p className="mt-4 text-center text-muted-foreground text-sm">
                  Keep practicing to improve your mastery!
                </p>
              </CardContent>
            </Card>

            {/* Study Time */}
            <Card variant="default" className="p-4">
              <h3 className="font-semibold text-foreground mb-3">{t("progress.weekly")}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks Done</span>
                  <span className="font-bold text-foreground">{thisWeekAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quizzes</span>
                  <span className="font-bold text-foreground">{thisWeekAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-bold text-foreground">{stats.accuracy}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
      <AISarthi />
    </div>
  );
}
