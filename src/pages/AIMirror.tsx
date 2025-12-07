import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, BottomNav } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  StopCircle, 
  Eye, 
  Mic, 
  BookOpen, 
  TrendingUp,
  Lightbulb,
  Clock,
  Play,
  Zap,
  Target,
  MessageSquare,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { AISarthi } from "@/components/AISarthi";
import { useAuth } from "@/hooks/useAuth";
import { getUserProgress } from "@/services/firestore";
import { 
  generateInterviewQuestion, 
  analyzeInterviewResponse,
  getInterviewCategories,
  type InterviewQuestion,
  type InterviewAnalysis,
  type InterviewMode,
  type ExamType
} from "@/services/interview";
import { 
  saveInterviewAttempt, 
  getUserInterviewStats,
  type InterviewAttempt
} from "@/services/firestore";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type InterviewStage = "setup" | "question" | "recording" | "analyzing" | "results";

export default function AIMirror() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Interview state
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [mode, setMode] = useState<InterviewMode>("quick");
  const [stage, setStage] = useState<InterviewStage>("setup");
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [examTypeLoading, setExamTypeLoading] = useState(true);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  
  // Analysis state
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Progress state
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    categoriesPracticed: [] as string[],
  });
  
  // Media state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadStats();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [stream]);

  // Update video element when stream changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      console.log("Setting up video element with stream...");
      
      // Check if stream has video tracks
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) {
        console.error("Stream has no video tracks");
        return;
      }
      
      console.log(`Stream has ${videoTracks.length} video track(s):`, videoTracks.map(t => ({
        label: t.label,
        enabled: t.enabled,
        readyState: t.readyState
      })));
      
      // Set the stream
      if (video.srcObject !== stream) {
        video.srcObject = stream;
        video.muted = true;
        console.log("✅ Stream attached to video element");
      }
      
      // Force video to load and play
      const setupVideo = async () => {
        try {
          // Wait for video to be ready
          if (video.readyState === 0) {
            video.load();
          }
          
          // Try to play
          try {
            await video.play();
            console.log("✅ Video playing successfully!");
            setCameraReady(true);
          } catch (playError: any) {
            console.error("Play error:", playError);
            // Wait and retry
            setTimeout(async () => {
              try {
                await video.play();
                console.log("✅ Video playing on retry!");
                setCameraReady(true);
              } catch (e) {
                console.error("Retry play failed:", e);
              }
            }, 500);
          }
        } catch (error) {
          console.error("Video setup error:", error);
        }
      };
      
      // Setup event handlers
      const handleLoadedMetadata = () => {
        console.log("📹 Video metadata loaded");
        setupVideo();
      };
      
      const handleCanPlay = () => {
        console.log("📹 Video can play");
        setupVideo();
      };
      
      const handlePlaying = () => {
        console.log("▶️ Video is playing!");
        setCameraReady(true);
      };
      
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("playing", handlePlaying);
      
      // Try immediately if already ready
      if (video.readyState >= 2) {
        setupVideo();
      }
      
      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("playing", handlePlaying);
      };
    } else if (!stream && cameraReady) {
      setCameraReady(false);
    }
  }, [stream, cameraReady]);

  const loadUserData = async () => {
    if (!user) {
      setExamTypeLoading(false);
      return;
    }

    try {
      setExamTypeLoading(true);
      const progress = await getUserProgress(user.uid);
      if (progress?.examType) {
        setExamType(progress.examType === "SSC" ? "SSC" : "Banking");
      } else {
        setExamType("SSC"); // Default
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setExamType("SSC"); // Default on error
    } finally {
      setExamTypeLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const interviewStats = await getUserInterviewStats(user.uid);
      setStats(interviewStats);
    } catch (error) {
      console.error("Error loading interview stats:", error);
    }
  };

  const handleGenerateQuestion = async () => {
    if (!examType) {
      toast.error("Please select an exam type first");
      return;
    }

    try {
      setIsAnalyzing(true);
      const question = await generateInterviewQuestion(examType);
      setCurrentQuestion(question);
      setStage("question");
      setIsAnalyzing(false);
    } catch (error) {
      console.error("Error generating question:", error);
      toast.error("Failed to generate question. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = "Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.";
        setPermissionError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Check if HTTPS or localhost (required for camera access)
      // Allow local network IPs for mobile testing (192.168.x.x, 10.x.x.x, etc.)
      const hostname = window.location.hostname;
      const isSecure = 
        window.location.protocol === "https:" || 
        hostname === "localhost" || 
        hostname === "127.0.0.1" ||
        /^192\.168\./.test(hostname) ||
        /^10\./.test(hostname) ||
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname);
        
      if (!isSecure && window.location.protocol !== "https:") {
        const errorMsg = "Camera access requires HTTPS or a local network connection. For mobile: Use your computer's local IP (e.g., http://192.168.x.x:8080) from the same WiFi network, or enable HTTPS.";
        setPermissionError(errorMsg);
        toast.error(errorMsg);
        console.warn("Insecure context detected. Camera may not work:", {
          protocol: window.location.protocol,
          hostname: hostname,
          isSecure: isSecure
        });
        // Don't return - let it try anyway as some browsers allow it in development
      }

      setPermissionError(null);
      console.log("Requesting camera and microphone permissions...");

      // Request camera and microphone permissions with better error handling
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        },
      }).catch((error: any) => {
        console.error("Permission error:", error);
        let errorMessage = "Failed to access camera/microphone. ";
        
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          errorMessage = "Camera/microphone permission was denied. Please allow camera and microphone access in your browser settings and try again.";
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          errorMessage = "No camera or microphone found. Please connect a camera and microphone and try again.";
        } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
          errorMessage = "Camera or microphone is already in use by another application. Please close other apps using the camera and try again.";
        } else if (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError") {
          errorMessage = "Camera doesn't support the requested settings. Trying with default settings...";
          // Try again with simpler constraints
          return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } else {
          errorMessage += error.message || "Unknown error occurred.";
        }
        
        setPermissionError(errorMessage);
        toast.error(errorMessage);
        throw error;
      });

      if (!mediaStream) {
        return;
      }

      console.log("✅ Permissions granted, stream obtained");
      
      // Check if stream has video tracks
      const videoTracks = mediaStream.getVideoTracks();
      const audioTracks = mediaStream.getAudioTracks();
      
      console.log(`Stream received: ${videoTracks.length} video track(s), ${audioTracks.length} audio track(s)`);
      
      if (videoTracks.length > 0) {
        console.log("Video track details:", {
          label: videoTracks[0].label,
          enabled: videoTracks[0].enabled,
          readyState: videoTracks[0].readyState,
          settings: videoTracks[0].getSettings()
        });
      }

      // Set stream state first
      setStream(mediaStream);

      // Initialize video element immediately
      if (videoRef.current) {
        const video = videoRef.current;
        console.log("Setting stream on video element directly...");
        
        video.srcObject = mediaStream;
        video.muted = true;
        
        // Try to play immediately
        video.play().then(() => {
          console.log("✅ Video playing immediately!");
          setCameraReady(true);
        }).catch((playError) => {
          console.log("Initial play failed, will retry on events:", playError);
        });
      }

      // Start MediaRecorder
      try {
        const mimeType = MediaRecorder.isTypeSupported("video/webm") 
          ? "video/webm" 
          : MediaRecorder.isTypeSupported("video/mp4")
          ? "video/mp4"
          : "";

        if (!mimeType) {
          throw new Error("No supported video format found");
        }

        const mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType,
          videoBitsPerSecond: 2500000,
        });

        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
        setStage("recording");
        setRecordingTime(0);
        setTranscript("");

        timerRef.current = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
          
          // Auto-stop for quick mode after 2 minutes
          if (mode === "quick" && recordingTime >= 120) {
            handleStopRecording();
          }
        }, 1000);

        // Start speech recognition
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
          try {
            const SpeechRecognition =
              (window as any).SpeechRecognition ||
              (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = currentLanguage === "hi" ? "hi-IN" : "en-IN";
            
            recognition.onresult = (event: any) => {
              let finalTranscript = "";
              let interimTranscript = "";
              
              for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                  finalTranscript += transcript + " ";
                } else {
                  interimTranscript += transcript;
                }
              }
              
              const fullTranscript = finalTranscript + interimTranscript;
              if (fullTranscript.trim()) {
                setTranscript(fullTranscript.trim());
              }
            };

            recognition.onerror = (event: any) => {
              console.error("Speech recognition error:", event.error);
              if (event.error === "no-speech") {
                return;
              }
            };
            
            recognition.onend = () => {
              if (mediaRecorderRef.current?.state === "recording" && recognitionRef.current) {
                setTimeout(() => {
                  if (recognitionRef.current && mediaRecorderRef.current?.state === "recording") {
                    recognitionRef.current.start();
                  }
                }, 100);
              }
            };

            recognitionRef.current = recognition;
            recognition.start();
          } catch (speechError) {
            console.error("Error initializing speech recognition:", speechError);
          }
        }

        toast.success("Recording started!");
      } catch (recorderError: any) {
        console.error("MediaRecorder error:", recorderError);
        toast.error(`Failed to start recording: ${recorderError.message}`);
        // Clean up stream on error
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    } catch (error: any) {
      console.error("Error starting recording:", error);
      if (!permissionError) {
        const errorMsg = error.message || "Failed to start recording. Please check your camera and microphone permissions.";
        setPermissionError(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  const handleStopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraReady(false);
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStage("analyzing");
    await analyzeResponse();
  };

  const analyzeResponse = async () => {
    if (!currentQuestion || !user || !examType) return;

    try {
      setIsAnalyzing(true);
      const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });

      const analysisResult = await analyzeInterviewResponse(
        currentQuestion.question,
        transcript,
        examType,
        currentLanguage
      );

      setAnalysis(analysisResult);

      const attempt: InterviewAttempt = {
        id: `${user.uid}_${Date.now()}`,
        userId: user.uid,
        examType,
        mode,
        question: currentQuestion.question,
        category: currentQuestion.category,
        userResponse: transcript,
        analysis: analysisResult,
        completedAt: new Date().toISOString(),
      };

      await saveInterviewAttempt(attempt);
      await loadStats();

      setStage("results");
    } catch (error) {
      console.error("Error analyzing response:", error);
      toast.error("Failed to analyze response. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextQuestion = async () => {
    setAnalysis(null);
    setTranscript("");
    setStage("setup");
    await handleGenerateQuestion();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (examTypeLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
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
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                AI Interview Coach
              </h1>
              <p className="text-muted-foreground mt-1">
                Practice with instant feedback on answers
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Setup Stage */}
          {stage === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Interview Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Exam Type
                    </label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-semibold text-foreground">
                        {examType || "Loading..."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically selected from your profile
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Practice Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={mode === "quick" ? "hero" : "outline"}
                        onClick={() => setMode("quick")}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                      >
                        <Zap className="w-5 h-5" />
                        <div className="text-left w-full">
                          <div className="font-semibold">Quick Practice</div>
                          <div className="text-xs opacity-80">2 minutes</div>
                        </div>
                      </Button>
                      <Button
                        variant={mode === "full" ? "hero" : "outline"}
                        onClick={() => setMode("full")}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                      >
                        <Clock className="w-5 h-5" />
                        <div className="text-left w-full">
                          <div className="font-semibold">Full Simulation</div>
                          <div className="text-xs opacity-80">5 minutes</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {permissionError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive mb-1">Permission Error</p>
                          <p className="text-xs text-muted-foreground">{permissionError}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Mobile users:</strong> Make sure you're using HTTPS or accessing via your computer's local IP address (e.g., https://192.168.x.x:8080)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleGenerateQuestion}
                    disabled={!examType}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Generate Question
                  </Button>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{stats.totalAttempts}</div>
                      <div className="text-xs text-muted-foreground">Total Attempts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{stats.averageScore}%</div>
                      <div className="text-xs text-muted-foreground">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent">{stats.bestScore}%</div>
                      <div className="text-xs text-muted-foreground">Best Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-secondary">{stats.categoriesPracticed.length}</div>
                      <div className="text-xs text-muted-foreground">Categories</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Question Stage */}
          {stage === "question" && currentQuestion && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card variant="elevated" className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Interview Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {currentQuestion.category}
                      </Badge>
                      <h2 className="text-xl font-bold text-foreground mb-4">
                        {currentQuestion.question}
                      </h2>
                    </div>

                    {showSampleAnswer && currentQuestion.sampleAnswer && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Sample Answer:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSampleAnswer(false)}
                          >
                            Hide
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {currentQuestion.sampleAnswer}
                        </p>
                      </div>
                    )}

                    {!showSampleAnswer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSampleAnswer(true)}
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Show Sample Answer
                      </Button>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="hero"
                        size="lg"
                        className="flex-1"
                        onClick={handleStartRecording}
                      >
                        <Video className="w-5 h-5 mr-2" />
                        Start Recording Answer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextQuestion}
                      >
                        Skip Question
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recording Stage */}
          {stage === "recording" && currentQuestion && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              {/* Recording Timer */}
              <Card variant="elevated" className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                      <span className="text-lg font-semibold text-foreground">Recording in progress</span>
                    </div>
                    <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
                      <span className="text-base font-medium">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                  </div>
                  {mode === "quick" && recordingTime >= 105 && (
                    <div className="mt-4 bg-yellow-500/90 text-yellow-900 px-4 py-2 rounded-lg text-sm font-medium text-center">
                      ⏱️ Less than 15 seconds remaining
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="lg"
                    className="w-full mt-4"
                    onClick={handleStopRecording}
                  >
                    <StopCircle className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                </CardContent>
              </Card>

              {/* Live Transcript */}
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    Live Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-xl min-h-[300px] max-h-[500px] overflow-y-auto">
                    {transcript ? (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {transcript}
                      </p>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Mic className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
                          <p>Start speaking...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground text-center">
                    Speak clearly and answer the question naturally
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Analyzing Stage */}
          {stage === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Analyzing your response...</h2>
              <p className="text-muted-foreground">This may take a few moments</p>
            </motion.div>
          )}

          {/* Results Stage */}
          {stage === "results" && analysis && currentQuestion && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Interview Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center p-6 bg-gradient-primary rounded-xl">
                    <div className="text-5xl font-bold text-primary-foreground mb-2">
                      {analysis.overallScore}%
                    </div>
                    <div className="text-primary-foreground/80">Overall Score</div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card variant="default" className="p-4 text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {analysis.contentScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Content Quality</div>
                    </Card>
                    <Card variant="default" className="p-4 text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {analysis.deliveryScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Delivery</div>
                    </Card>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald" />
                        Strengths
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-coral" />
                        Areas for Improvement
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {analysis.improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Detailed Feedback</h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {analysis.feedback}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleNextQuestion}
                  >
                    Practice Another Question
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
      <AISarthi />
    </div>
  );
}
