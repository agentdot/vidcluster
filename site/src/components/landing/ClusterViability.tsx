import { TrendingUp, Beaker, XCircle } from "lucide-react";

const viabilityLevels = [
  {
    range: "75–100",
    label: "SCALE",
    icon: TrendingUp,
    description: "High confidence cluster. Double down on content in this niche.",
    color: "aqua",
    bgColor: "bg-aqua/10",
    textColor: "text-aqua",
    borderColor: "border-aqua/30",
  },
  {
    range: "50–74",
    label: "TEST",
    icon: Beaker,
    description: "Promising potential. Worth experimenting with a few videos.",
    color: "data-blue",
    bgColor: "bg-data-blue/10",
    textColor: "text-data-blue",
    borderColor: "border-data-blue/30",
  },
  {
    range: "<50",
    label: "AVOID",
    icon: XCircle,
    description: "Low viability. Focus your resources elsewhere.",
    color: "pink",
    bgColor: "bg-pink/10",
    textColor: "text-pink",
    borderColor: "border-pink/30",
  },
];

const ClusterViability = () => {
  return (
    <section id="clusters" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Explanation */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Treat your niches like{" "}
              <span className="gradient-text">assets in a portfolio.</span>
            </h2>
            
            <p className="text-muted-foreground mb-6">
              The Viability Score (0–100) is our proprietary metric that combines cluster performance, consistency, growth potential, and competitive landscape into a single actionable number.
            </p>
            
            <p className="text-muted-foreground mb-6">
              Just like a hedge fund manages a portfolio of assets, VidCluster helps you allocate your creative resources to the clusters with the highest expected return on effort.
            </p>
            
            <div className="glass rounded-lg p-4 inline-block">
              <p className="text-sm">
                <span className="font-medium text-foreground">V8 Engine</span>
                <span className="text-muted-foreground"> — Our latest decision model with improved outlier detection and trend sensitivity.</span>
              </p>
            </div>
          </div>
          
          {/* Right Column - Score Card */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink/10 to-purple/10 blur-2xl opacity-50" />
            
            <div className="relative glass rounded-xl p-8">
              <h3 className="text-lg font-semibold mb-6 text-center">Viability Score Mapping</h3>
              
              <div className="space-y-4">
                {viabilityLevels.map((level) => (
                  <div
                    key={level.label}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${level.borderColor} ${level.bgColor}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${level.bgColor}`}>
                      <level.icon className={`w-5 h-5 ${level.textColor}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-mono text-muted-foreground">{level.range}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${level.bgColor} ${level.textColor}`}>
                          {level.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClusterViability;
