import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Get in <span className="gradient-text">touch</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Have questions about VidCluster? We'd love to hear from you.
          </p>
          <div className="glass rounded-xl p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-pink/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-pink" />
              </div>
              <p className="text-muted-foreground">
                Reach out to us at
              </p>
              <Button variant="gradient" size="lg" asChild>
                <a href="mailto:hello@vidcluster.com">
                  hello@vidcluster.com
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
