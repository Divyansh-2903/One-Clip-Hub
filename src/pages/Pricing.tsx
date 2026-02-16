import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "Perfect for casual downloads",
    features: [
      { text: "15 downloads/day", included: true },
      { text: "All platforms", included: true },
      { text: "720p max quality", included: true },
      { text: "30-day history", included: true },
      { text: "4K quality", included: false },
      { text: "Batch downloads", included: false },
      { text: "CSV export", included: false },
      { text: "Ad-free experience", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "₹299",
    period: "/month",
    desc: "For power users who want it all",
    features: [
      { text: "Unlimited downloads", included: true },
      { text: "All platforms", included: true },
      { text: "4K quality", included: true },
      { text: "Lifetime history", included: true },
      { text: "Batch downloads", included: true },
      { text: "CSV export", included: true },
      { text: "Usage statistics", included: true },
      { text: "Ad-free experience", included: true },
    ],
    cta: "Upgrade to Premium",
    popular: true,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 pt-28 pb-20 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-extrabold">Pricing</h1>
        <p className="mt-3 text-muted-foreground text-lg">Choose the plan that works for you</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative bg-card rounded-2xl p-8 border shadow-sm ${tier.popular ? "border-2 border-primary/30 shadow-lg" : ""
              }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                POPULAR
              </div>
            )}
            <h2 className="text-xl font-bold">{tier.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{tier.desc}</p>
            <div className="mt-4">
              <span className={`text-4xl font-extrabold ${tier.popular ? "gradient-text" : ""}`}>{tier.price}</span>
              <span className="text-muted-foreground">{tier.period}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {tier.features.map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-sm">
                  {f.included ? (
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span className={f.included ? "" : "text-muted-foreground/60"}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button
                className={`w-full mt-6 rounded-xl ${tier.popular
                    ? "gradient-primary border-0 text-primary-foreground hover:opacity-90"
                    : ""
                  }`}
                variant={tier.popular ? "default" : "outline"}
              >
                {tier.cta}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default Pricing;
