import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react";

interface StatsCardProps {
  streak: number;
  xp: number;
  accuracy: number;
  rank: number;
}

export function StatsCard({ streak, xp, accuracy, rank }: StatsCardProps) {
  const stats = [
    {
      icon: Flame,
      value: streak,
      label: "Day Streak",
      suffix: "🔥",
      color: "text-coral",
      bgColor: "bg-coral/10",
    },
    {
      icon: Trophy,
      value: xp,
      label: "Total XP",
      suffix: "",
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      icon: Target,
      value: accuracy,
      label: "Accuracy",
      suffix: "%",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: TrendingUp,
      value: rank,
      label: "City Rank",
      suffix: "",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      prefix: "#",
    },
  ];

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
              <div className="font-bold text-sm sm:text-lg text-foreground break-words">
                {stat.prefix}
                {stat.value.toLocaleString()}
                {stat.suffix}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground break-words">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
