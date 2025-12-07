import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Brain,
  Smartphone,
  Zap,
  MessageCircle,
  Target,
  Users,
  Star,
  ChevronRight,
  Play,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import heroPattern from "@/assets/hero-pattern.png";

const features = [
  {
    icon: Brain,
    title: "Adaptive Learning",
    description: "AI understands your weaknesses and serves content accordingly",
    color: "bg-saffron-light text-primary",
  },
  {
    icon: Zap,
    title: "Micro-Learning",
    description: "3-5 minute bite-sized lessons that work on any device",
    color: "bg-indigo-light text-secondary",
  },
  {
    icon: MessageCircle,
    title: "AI Sarthi",
    description: "24/7 available study buddy to help you learn effectively",
    color: "bg-emerald-light text-accent",
  },
  {
    icon: Target,
    title: "Smart Practice",
    description: "Remember with spaced repetition and score well in exams",
    color: "bg-muted text-gold",
  },
];

const exams = [
  { name: "SSC CGL", students: "5L+" },
  { name: "UPSC", students: "2L+" },
  { name: "Bank PO", students: "3L+" },
  { name: "Railway", students: "4L+" },
  { name: "State PSC", students: "1L+" },
  { name: "Defence", students: "2L+" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    city: "Jaipur",
    exam: "SSC CGL",
    quote: "Learning in my preferred language made exam preparation so much easier!",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    city: "Patna",
    exam: "UPSC Prelims",
    quote: "AI Sarthi identified my math weaknesses and helped me improve.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    city: "Hyderabad",
    exam: "Bank PO",
    quote: "The Daily Mix feature brought consistency to my preparation.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg text-foreground truncate">Pathshala</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground -mt-1 truncate">Coach</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="hero" size="sm" asChild className="text-xs sm:text-sm whitespace-nowrap">
              <Link to="/onboarding">Start Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroPattern}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 break-words">
                <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Works on 2G/3G Networks</span>
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground leading-tight break-words px-4">
                Your Preparation,
                <br />
                <span className="text-gradient-primary">Your Language</span>
              </h1>

              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 break-words">
                Prepare for government exams in your preferred language, 
                with AI-powered adaptive learning. 
                <span className="text-foreground font-medium"> 5 lakh+ students</span> are already learning with us!
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/onboarding">
                    <Play className="w-5 h-5 mr-2" />
                    Start Free Now
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/onboarding">
                    <BookOpen className="w-5 h-5 mr-2" />
                    View Demo
                  </Link>
                </Button>
              </div>

              {/* Social Proof */}
              <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-primary border-2 border-background"
                      />
                    ))}
                  </div>
                  <span>5L+ Active Students</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                  <span className="ml-1">4.8/5 Rating</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Exams Section */}
      <section className="py-12 bg-muted/50">
        <div className="container">
          <p className="text-center text-muted-foreground mb-6">
            Prepare for these exams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {exams.map((exam) => (
              <motion.div
                key={exam.name}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 rounded-xl bg-card border border-border shadow-sm"
              >
                <span className="font-semibold text-foreground">{exam.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {exam.students}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What Makes Pathshala <span className="text-gradient-primary">Different?</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Platform specially designed for students from Tier-2/3 cities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="feature" className="h-full">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${feature.color} flex items-center justify-center`}
                    >
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              How It Works
            </h2>
            <p className="mt-4 opacity-80 max-w-xl mx-auto">
              Start your journey with a simple 3-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Quick Diagnostic Test",
                desc: "Take a 5-minute test, AI will understand your strengths and weaknesses",
              },
              {
                step: "2",
                title: "Personalized Path",
                desc: "Follow your custom learning path, complete daily tasks",
              },
              {
                step: "3",
                title: "Track & Improve",
                desc: "Monitor your progress, get help from AI Sarthi, crack the exam!",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="opacity-80">{item.desc}</p>

                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 opacity-50" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Student <span className="text-gradient-primary">Success Stories</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated" className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="text-foreground font-medium mb-4">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary" />
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.city} • {t.exam}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-primary">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Start? Begin Now!
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Sign up for free and take your preparation to the next level.
              No credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                asChild
              >
                <Link to="/onboarding">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Create Free Account
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary text-secondary-foreground">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pathshala Coach</h3>
                <p className="text-xs opacity-70">Your Preparation, Your Language</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm opacity-70">
              <a href="#" className="hover:opacity-100">About</a>
              <a href="#" className="hover:opacity-100">Contact</a>
              <a href="#" className="hover:opacity-100">Privacy</a>
              <a href="#" className="hover:opacity-100">Terms</a>
            </div>
            <p className="text-sm opacity-50">
              © 2025 Pathshala Coach. Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
