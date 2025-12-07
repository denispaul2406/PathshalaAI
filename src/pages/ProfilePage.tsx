import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Header, BottomNav } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User,
  Settings,
  Bell,
  Download,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Globe,
  Shield,
  Star,
  Video
} from "lucide-react";
import { AISarthi } from "@/components/AISarthi";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth";
import { getUserProgress } from "@/services/firestore";
import { useTranslation } from "react-i18next";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/hooks/useLanguage";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    daysActive: 0,
    totalXP: 0,
    rank: 0,
  });
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const progress = await getUserProgress(user.uid);
      if (progress?.stats) {
        const lastActive = progress.lastActive ? new Date(progress.lastActive).getTime() : Date.now();
        const daysActive = Math.ceil((Date.now() - lastActive) / (1000 * 60 * 60 * 24));
        setStats({
          daysActive: daysActive || 1,
          totalXP: progress.stats.totalXP || 0,
          rank: 0,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: Video, label: "AI Interview Coach", sublabel: "Practice your interview skills", action: () => navigate("/ai-mirror") },
    { icon: Bell, label: t("profile.notifications"), sublabel: "Manage alerts", action: () => {} },
    { icon: Download, label: t("profile.offline"), sublabel: "Download for offline", action: () => navigate("/offline") },
    { icon: Globe, label: t("profile.language"), sublabel: currentLanguage.toUpperCase(), action: () => setShowLanguageDialog(true) },
    { icon: Moon, label: "Dark Mode", sublabel: "Coming soon", disabled: true, action: () => {} },
    { icon: Shield, label: "Privacy", sublabel: "Data & security", action: () => {} },
    { icon: HelpCircle, label: t("profile.settings"), sublabel: "FAQs, contact us", action: () => {} },
  ];

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

  const userName = user?.displayName || user?.email?.split("@")[0] || "Student";
  const userEmail = user?.email || "";

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
      <Header />

      <main className="container py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" className="overflow-hidden">
              <div className="bg-gradient-primary h-24" />
              <CardContent className="relative pt-12 pb-6 text-center">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <div className="w-24 h-24 rounded-full bg-card border-4 border-card flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground">{userName}</h2>
                <p className="text-muted-foreground">{userEmail}</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {localStorage.getItem("examType") || "SSC"}
                    </div>
                    <div className="text-xs text-muted-foreground">Target Exam</div>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{stats.daysActive}</div>
                    <div className="text-xs text-muted-foreground">Days Active</div>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground flex items-center gap-1">
                      4.8 <Star className="w-4 h-4 fill-gold text-gold" />
                    </div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4">
                  <Settings className="w-4 h-4 mr-2" />
                  {t("profile.edit")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Days Active", value: stats.daysActive.toString() },
              { label: t("progress.xp"), value: stats.totalXP.toLocaleString() },
              { label: t("progress.rank"), value: `#${stats.rank || "---"}` },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="default" className="p-4 text-center">
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Subscription */}
          <Card variant="gradient" className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-primary">
                    Free Plan
                  </span>
                  <h3 className="font-bold text-foreground mt-2">Upgrade to Pro</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlimited access, offline mode, no ads
                  </p>
                </div>
                <Button variant="hero" size="sm">
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Menu */}
          <Card variant="default">
            <CardContent className="p-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  disabled={item.disabled}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                    item.disabled 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.sublabel}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              ))}
            </CardContent>
          </Card>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("profile.logout")}
          </Button>

          {/* App Info */}
          <p className="text-center text-xs text-muted-foreground">
            Pathshala Coach v1.0.0 • Made with ❤️ in India
          </p>
        </div>
      </main>

      {/* Language Selector Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.language")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={currentLanguage === lang.code ? "default" : "outline"}
                className="justify-start"
                onClick={() => {
                  changeLanguage(lang.code);
                  setShowLanguageDialog(false);
                }}
              >
                {lang.nativeName}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
      <AISarthi />
    </div>
  );
}
