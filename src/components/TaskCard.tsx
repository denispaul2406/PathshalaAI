import { motion } from "framer-motion";
import { Play, BookOpen, Brain, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface DailyTask {
  id: string;
  type: "video" | "quiz" | "revision" | "practice";
  title: string;
  titleHindi?: string;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  subject: string;
  completed: boolean;
  progress?: number;
}

const taskTypeConfig = {
  video: {
    icon: Play,
    bgClass: "bg-saffron-light",
    iconClass: "text-primary",
    label: "Video",
  },
  quiz: {
    icon: Brain,
    bgClass: "bg-indigo-light",
    iconClass: "text-secondary",
    label: "Quiz",
  },
  revision: {
    icon: BookOpen,
    bgClass: "bg-emerald-light",
    iconClass: "text-accent",
    label: "Revision",
  },
  practice: {
    icon: Zap,
    bgClass: "bg-muted",
    iconClass: "text-gold",
    label: "Practice",
  },
};

const difficultyConfig = {
  easy: { color: "bg-accent text-accent-foreground", label: "Easy" },
  medium: { color: "bg-gold text-foreground", label: "Medium" },
  hard: { color: "bg-coral text-primary-foreground", label: "Hard" },
};

interface TaskCardProps {
  task: DailyTask;
  index: number;
  onStart: (id: string) => void;
}

export function TaskCard({ task, index, onStart }: TaskCardProps) {
  const { currentLanguage } = useLanguage();
  const config = taskTypeConfig[task.type];
  const difficulty = difficultyConfig[task.difficulty];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onStart(task.id)}
      className={`relative p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all cursor-pointer ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      {/* Progress indicator for partially completed */}
      {task.progress && task.progress > 0 && task.progress < 100 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-xl ${config.bgClass}`}>
          <Icon className={`w-6 h-6 ${config.iconClass}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {config.label}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficulty.color}`}>
              {difficulty.label}
            </span>
          </div>
          
          <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 break-words">
            {currentLanguage === "hi" && task.titleHindi ? task.titleHindi : task.title}
          </h3>
          
          <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <span className="break-words">{task.subject}</span>
            <span className="hidden sm:inline">•</span>
            <span className="break-words">{task.duration}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          {task.completed ? (
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export type { DailyTask };
