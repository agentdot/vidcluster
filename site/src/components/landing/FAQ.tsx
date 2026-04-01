import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Do I need the YouTube API to use VidCluster?",
    answer: "No! While we support direct API integration, you can also upload your data via CSV. This works great for historical data exports and doesn't require any technical setup.",
  },
  {
    question: "Is this tool suitable for small channels?",
    answer: "Absolutely. Our algorithms are designed to be fair to channels of all sizes. We focus on cluster potential and relative performance, not absolute subscriber counts. A small channel in a high-viability cluster often has more upside than a large channel in a saturated niche.",
  },
  {
    question: "Is VidCluster a keyword research tool?",
    answer: "No, we're fundamentally different. Keyword tools tell you what people search for. VidCluster analyzes topic clusters — groups of related content that share audience and performance patterns. We help you understand which content categories to invest in, not just which keywords to target.",
  },
  {
    question: "What is 'V8'?",
    answer: "V8 is the current version of our Viability Score engine. It incorporates cluster performance analysis, outlier detection, trend sensitivity, and competitive landscape modeling. We continuously improve the engine based on real-world feedback and performance data.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about VidCluster.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/50 transition-colors"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-6 text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
