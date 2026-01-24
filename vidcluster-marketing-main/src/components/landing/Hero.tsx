import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

// ── ClusterCard Component ────────────────────────────────────────────────
const ClusterCard = () => {
  const clusters = [
    { name: "AI Faceless Finance", score: 87, status: "SCALE", color: "bg-aqua" },
    { name: "Premier League Clips", score: 72, status: "TEST", color: "bg-data-blue" },
    { name: "Urban Gardening", score: 58, status: "TEST", color: "bg-data-blue" },
    { name: "Crypto News", score: 34, status: "AVOID", color: "bg-pink" },
  ];

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-pink/20 to-purple/20 blur-3xl opacity-50" />

      <div className="relative glass rounded-xl p-6 animate-float">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-aqua animate-pulse" />
          <span className="text-sm font-medium text-foreground">Cluster Viability Overview</span>
        </div>

        <div className="space-y-4">
          {clusters.map((cluster, index) => (
            <div
              key={cluster.name}
              className="flex items-center gap-4"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{cluster.name}</span>
                  <span className="text-xs font-medium text-foreground">{cluster.score}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cluster.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${cluster.score}%` }}
                  />
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  cluster.status === "SCALE"
                    ? "bg-aqua/20 text-aqua"
                    : cluster.status === "TEST"
                    ? "bg-data-blue/20 text-data-blue"
                    : "bg-pink/20 text-pink"
                }`}
              >
                {cluster.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Hero Component ────────────────────────────────────────────────────────
const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-purple/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple/10 rounded-full blur-[120px] animate-pulse-glow"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-slide-up">
              <Sparkles className="w-4 h-4 text-signal-gold" />
              <span className="text-xs font-medium text-muted-foreground">
                Tracking emerging YouTube topics
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              Stop guessing{" "}
              <span className="gradient-text">YouTube topics.</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              VidCluster tracks YouTube topics that are quietly gaining momentum before they become crowded.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6 animate-slide-up relative z-10"
              style={{ animationDelay: "0.3s" }}
            >
              <Button asChild variant="gradient" size="lg" className="glow">
                <a
                  href="https://forms.gle/XDLWLci5i9w8jmE29" // ← Replace this with your working form link!
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join the waitlist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>

              {/* Optional second button example */}
              {/* <Button variant="outline" size="lg">
                Learn more
              </Button> */}
            </div>

            {/* Trust Line */}
            <p
              className="text-xs text-muted-foreground animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              We’re running a private experiment and sharing early signals publicly.
            </p>
          </div>

          {/* Right Column - Mock Dashboard */}
          <div className="lg:pl-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <ClusterCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
