import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header, BottomNav } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { getVideosByExamType, type VideoMetadata } from "@/services/videos";
import { useAuth } from "@/hooks/useAuth";
import { getUserProgress } from "@/services/firestore";
import ReactPlayer from "react-player";
import { VideoPlayer } from "@/components/VideoPlayer";
import { AISarthi } from "@/components/AISarthi";

export default function ConceptReels() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [examType, setExamType] = useState<"SSC" | "Banking" | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);

  useEffect(() => {
    if (user) {
      loadUserExamType();
    }
  }, [user]);

  const loadUserExamType = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const progress = await getUserProgress(user.uid);
      if (progress?.examType) {
        const userExamType = progress.examType === "SSC" ? "SSC" : "Banking";
        setExamType(userExamType);
        setVideos(getVideosByExamType(userExamType));
      } else {
        // Default to SSC if no exam type found
        setExamType("SSC");
        setVideos(getVideosByExamType("SSC"));
      }
    } catch (error) {
      console.error("Error loading user exam type:", error);
      // Default to SSC on error
      setExamType("SSC");
      setVideos(getVideosByExamType("SSC"));
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (video: VideoMetadata) => {
    if (currentLanguage === "hi" && video.titleHi) {
      return video.titleHi;
    }
    return video.title;
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

  if (!examType) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please complete onboarding first</p>
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
            {t("videos.conceptReels")} 📹
          </h1>
          <p className="text-muted-foreground mt-1">
            Quick concept explanations in 60 seconds
          </p>
        </motion.div>

        {selectedVideo ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <VideoPlayer src={selectedVideo.path} className="w-full h-full" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {getTitle(selectedVideo)}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{selectedVideo.subject}</span>
                      <span>•</span>
                      <span>{selectedVideo.topic}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.floor(selectedVideo.duration / 60)} min
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVideo(null)}
                  >
                    Back
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t("videos.download")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="task"
                  className="cursor-pointer hover:shadow-lg transition-all overflow-hidden"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="aspect-video bg-gradient-primary relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-8 h-8 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-xs">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">
                      {getTitle(video)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {video.subject} • {video.topic}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          video.difficulty === "beginner"
                            ? "bg-accent/20 text-accent"
                            : video.difficulty === "intermediate"
                            ? "bg-gold/20 text-foreground"
                            : "bg-coral/20 text-coral"
                        }`}
                      >
                        {video.difficulty}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
      <AISarthi />
    </div>
  );
}

