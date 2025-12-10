import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import ClusterViability from "@/components/landing/ClusterViability";
import CTASection from "@/components/landing/CTASection";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <ClusterViability />
        <CTASection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
