import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            About <span className="gradient-text">VidCluster</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            VidCluster is building the future of data-driven content strategy. Our mission is to help creators and agencies make smarter decisions about which niches to pursue.
          </p>
          <div className="glass rounded-xl p-8">
            <p className="text-muted-foreground">
              Full about page coming soon. We're currently focused on building the best possible product for our early access users.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
