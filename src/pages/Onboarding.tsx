import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/onboarding/LanguageSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Briefcase, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

type OnboardingStep = "language" | "goal" | "diagnostic";

export default function Onboarding() {
  const [step, setStep] = useState<OnboardingStep>("language");
  const [examType, setExamType] = useState<"SSC" | "Banking">("SSC");
  const [examYear, setExamYear] = useState<string>("2025");
  const [dataSaver, setDataSaver] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleContinue = () => {
    if (step === "language") {
      setStep("goal");
    } else if (step === "goal") {
      // Save user preferences
      localStorage.setItem("examType", examType);
      localStorage.setItem("examYear", examYear);
      localStorage.setItem("dataSaver", dataSaver.toString());
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "language" && (
          <motion.div
            key="language"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full"
          >
            <LanguageSelector />
            <div className="flex justify-center mt-8">
              <Button
                variant="hero"
                size="lg"
                onClick={handleContinue}
                className="px-8"
              >
                {t("common.continue")}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "goal" && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full max-w-2xl"
          >
            <Card variant="elevated" className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {t("onboarding.goal.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("onboarding.goal.subtitle")}
                </p>
              </div>

              <div className="space-y-6">
                {/* Exam Type Selection */}
                <div>
                  <Label className="text-base font-semibold mb-4 block">
                    {t("onboarding.goal.subtitle")}
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        variant={examType === "SSC" ? "gradient" : "default"}
                        className={`cursor-pointer h-full transition-all ${
                          examType === "SSC"
                            ? "border-primary border-2 shadow-lg"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setExamType("SSC")}
                      >
                        <CardContent className="p-6 text-center">
                          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-primary" />
                          <div className="font-bold text-lg">
                            {t("onboarding.goal.ssc")}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        variant={examType === "Banking" ? "gradient" : "default"}
                        className={`cursor-pointer h-full transition-all ${
                          examType === "Banking"
                            ? "border-primary border-2 shadow-lg"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setExamType("Banking")}
                      >
                        <CardContent className="p-6 text-center">
                          <Briefcase className="w-12 h-12 mx-auto mb-3 text-secondary" />
                          <div className="font-bold text-lg">
                            {t("onboarding.goal.banking")}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>

                {/* Exam Year */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    {t("onboarding.goal.examYear")}
                  </Label>
                  <Select value={examYear} onValueChange={setExamYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["2024", "2025", "2026", "2027"].map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Saver Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex-1">
                    <Label className="text-base font-semibold">
                      {t("onboarding.goal.dataSaver")}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("onboarding.goal.dataSaverDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={dataSaver}
                    onCheckedChange={setDataSaver}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep("language")}
                    className="flex-1"
                  >
                    {t("common.back")}
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleContinue}
                    className="flex-1"
                  >
                    {t("common.continue")}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

