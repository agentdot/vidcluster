import { TrendingUp, Zap, Users, Clock, Layers, MessageSquare } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Cluster-normalised performance",
    description: "Compare apples to apples. Every video is scored against its own cluster, not the entire channel.",
    accent: "pink",
  },
  {
    icon: Zap,
    title: "Strong vs lucky outliers",
    description: "Distinguish between videos that went viral due to skill versus those that just got lucky timing.",
    accent: "purple",
  },
  {
    icon: Users,
    title: "Small-channel fairness",
    description: "Our algorithms don't penalize small channels. Potential matters more than current subscriber count.",
    accent: "aqua",
  },
  {
    icon: Clock,
    title: "Trend & freshness detection",
    description: "Know which clusters are rising, stagnating, or declining before you commit resources.",
    accent: "data-blue",
  },
  {
    icon: Layers,
    title: "Multi-channel analysis",
    description: "Analyze multiple channels at once. Perfect for agencies managing a portfolio of creators.",
    accent: "signal-gold",
  },
  {
    icon: MessageSquare,
    title: "Explainable decisions",
    description: "Every SCALE, TEST, or AVOID recommendation comes with clear reasoning you can act on.",
    accent: "pink",
  },
];

const getAccentClasses = (accent: string) => {
  const accents: Record<string, { bg: string; text: string; border: string }> = {
    pink: { bg: "bg-pink/10", text: "text-pink", border: "hover:border-pink/50" },
    purple: { bg: "bg-purple/10", text: "text-purple", border: "hover:border-purple/50" },
    aqua: { bg: "bg-aqua/10", text: "text-aqua", border: "hover:border-aqua/50" },
    "data-blue": { bg: "bg-data-blue/10", text: "text-data-blue", border: "hover:border-data-blue/50" },
    "signal-gold": { bg: "bg-signal-gold/10", text: "text-signal-gold", border: "hover:border-signal-gold/50" },
  };
  return accents[accent] || accents.pink;
};

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple/5 rounded-full blur-[150px]" />
      
      <div className="relative max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for serious creators, agencies{" "}
            <span className="gradient-text">& automation teams.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make data-driven decisions about your YouTube content strategy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const accentClasses = getAccentClasses(feature.accent);
            return (
              <div
                key={feature.title}
                className={`glass rounded-xl p-6 transition-all duration-300 ${accentClasses.border} hover:shadow-lg`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg ${accentClasses.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${accentClasses.text}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
