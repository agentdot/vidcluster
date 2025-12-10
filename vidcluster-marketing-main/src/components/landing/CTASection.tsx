import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Waitlist signup:", email);
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink/10 via-purple/10 to-pink/10 blur-3xl" />
          
          {/* Card with Gradient Border */}
          <div className="relative gradient-border rounded-2xl p-1">
            <div className="bg-card rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Start treating your YouTube ideas{" "}
                <span className="gradient-text">like an investment portfolio.</span>
              </h2>
              
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Plug in your channels and get a ranked list of clusters to scale, test, or avoid. Join the early access waitlist and be the first to try VidCluster.
              </p>
              
              {isSubmitted ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-aqua/10 text-aqua">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">You're on the list! We'll be in touch soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 h-12 px-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink/50 transition-all"
                  />
                  <Button type="submit" variant="gradient" size="lg" className="glow">
                    Join Waitlist
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
              
              <p className="text-xs text-muted-foreground mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
