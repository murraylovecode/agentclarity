import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
  Shield,
  LineChart,
} from "lucide-react";
import heroImage from "@/assets/hero-image.png";

const features = [
  {
    icon: BarChart3,
    title: "Simple, Clear Reporting",
    description:
      "Understand what you own, how it's allocated, and where the risk is — without complexity.",
  },
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    description:
      "Evaluate new opportunities in the context of your existing portfolio. Get fit scores, risk flags, and sizing suggestions.",
  },
  {
    icon: Users,
    title: "Private Peer Comparison",
    description:
      "Share anonymized portfolio data with trusted friends to compare positioning and get perspective.",
  },
];

const benefits = [
  "Unified view of all assets",
  "Concentration risk alerts",
  "Liquidity analysis",
  "Scenario stress testing",
  "Deal evaluation AI",
  "Anonymous sharing",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="text-foreground font-semibold text-lg tracking-tight">
              AgentClarity
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-6 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight animate-fade-in">
                Clarity for your wealth
              </h1>
              <p className="text-xl text-muted-foreground mt-6 max-w-2xl animate-fade-in stagger-1">
                AgentClarity gives founders, operators, and investors the intelligence to understand
                their portfolio, evaluate opportunities, and make confident decisions.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-4 mt-10 animate-fade-in stagger-2">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/register">
                    Start for free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in stagger-2">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
              <img 
                src={heroImage} 
                alt="AgentClarity dashboard showing portfolio analytics and wealth insights" 
                className="relative rounded-2xl shadow-2xl border border-border/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              Three capabilities that matter
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Built for people who want signal over noise, context over raw data, and decision
              support over advice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="pt-8 pb-8">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Everything you need, nothing you don't
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                AgentClarity is built for clarity. No clutter, no trading features, no retail
                gimmicks. Just the intelligence you need to understand and manage your wealth.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-vig-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <LineChart className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Net Worth</p>
                      <p className="text-2xl font-bold text-foreground">$4,750,000</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Equities</span>
                      <span className="text-foreground font-medium">35%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-full w-[35%] bg-chart-1 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Private</span>
                      <span className="text-foreground font-medium">25%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-full w-[25%] bg-chart-2 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Real Estate</span>
                      <span className="text-foreground font-medium">20%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-full w-[20%] bg-chart-3 rounded-full" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Built for privacy</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Your data is encrypted, never sold, and you control who sees what. Share only what
            you choose, and revoke access at any time.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/register">
              Create your account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="text-foreground font-semibold">AgentClarity</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/admin/login"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Admin Login →
              </Link>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} AgentClarity. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
