import { Upload, Brain, BarChart3, Target } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Ingest your channels",
    description: "Upload your CSV or connect YouTube metadata. We support bulk imports from multiple channels.",
  },
  {
    icon: Brain,
    title: "AI topic clustering",
    description: "Gemini-powered embeddings group your videos into meaningful topic clusters automatically.",
  },
  {
    icon: BarChart3,
    title: "Statistical performance engine",
    description: "We calculate medians, quartiles, IQR, and identify outliers across all your clusters.",
  },
  {
    icon: Target,
    title: "Cluster Viability Score (V8)",
    description: "Get clear SCALE, TEST, or AVOID recommendations for each niche in your portfolio.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From raw channel data to{" "}
            <span className="gradient-text">cluster intelligence.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            VidCluster ingests your data, clusters topics, models performance, and tells you which niches to double down on.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-[2px] bg-gradient-to-r from-border to-transparent" />
              )}
              
              <div className="relative glass rounded-xl p-6 h-full transition-all duration-300 hover:border-pink/50 hover:shadow-lg hover:shadow-pink/5">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-pink to-purple flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-pink/10 transition-colors">
                  <step.icon className="w-6 h-6 text-pink" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
