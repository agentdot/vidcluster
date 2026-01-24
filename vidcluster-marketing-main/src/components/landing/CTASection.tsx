import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const WAITLIST_URL = "https://forms.gle/XDLWLci5i9w8jmE29";

const CTASection = () => {
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
                Get early signals{" "}
                <span className="gradient-text">before topics get crowded.</span>
              </h2>

              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                We’re validating a detection engine that spots emerging YouTube topics early.
                Join the waitlist to get updates and early access.
              </p>

              <div className="flex justify-center">
                <a
                  href={WAITLIST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="gradient" size="lg" className="glow">
                    Join waitlist
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                No spam. Just signals and updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
