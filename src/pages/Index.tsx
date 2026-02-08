import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Download, Zap, Film, History, Youtube, Instagram, ArrowRight, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const features = [
  { icon: Film, title: "Multi-Platform", desc: "YouTube, Instagram & Pinterest all in one place" },
  { icon: Zap, title: "One-Click", desc: "Paste a URL and download instantly" },
  { icon: Download, title: "Multiple Formats", desc: "MP4, MP3, JPG, PNG — whatever you need" },
  { icon: History, title: "Download History", desc: "Track and re-download your past content" },
];

const steps = [
  { num: "1", title: "Paste URL", desc: "Copy any link from YouTube, Instagram, or Pinterest" },
  { num: "2", title: "Choose Format", desc: "Select your preferred quality and format" },
  { num: "3", title: "Download", desc: "Click download and get your content instantly" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-secondary/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto text-center relative z-10 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 text-sm font-medium text-accent-foreground mb-6">
            <Star className="w-4 h-4 text-primary" />
            Free to use • No signup required to browse
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Download from{" "}
            <span className="gradient-text">YouTube, Instagram & Pinterest</span>{" "}
            in One Click
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            The fastest multi-platform media downloader. Paste any URL and get your content in seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <Button size="lg" className="rounded-xl gradient-primary border-0 text-primary-foreground px-8 h-12 text-base font-semibold hover:opacity-90 transition-opacity">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="rounded-xl px-8 h-12 text-base">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Platform logos */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Youtube className="w-6 h-6 text-youtube" /> YouTube
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Instagram className="w-6 h-6 text-instagram" /> Instagram
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <svg className="w-6 h-6 text-pinterest" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              Pinterest
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="text-center mb-12"
          >
            <motion.h2 variants={item} className="text-3xl font-bold">
              Why Choose <span className="gradient-text">OneClip</span>?
            </motion.h2>
            <motion.p variants={item} className="mt-3 text-muted-foreground">
              Everything you need to download your favorite content
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                whileHover={{ y: -4 }}
                className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to download any content</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="space-y-6"
          >
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={item}
                className="flex items-start gap-5 bg-card rounded-2xl p-6 border shadow-sm"
              >
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Simple Pricing</h2>
            <p className="mt-3 text-muted-foreground">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 border shadow-sm"
            >
              <h3 className="text-lg font-semibold">Free</h3>
              <div className="mt-3">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {["15 downloads/day", "All platforms", "720p max quality", "30-day history"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button variant="outline" className="w-full mt-6 rounded-xl">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative rounded-2xl p-8 border-2 border-primary/30 shadow-lg bg-card"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                POPULAR
              </div>
              <h3 className="text-lg font-semibold">Premium</h3>
              <div className="mt-3">
                <span className="text-4xl font-extrabold gradient-text">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {["Unlimited downloads", "All platforms", "4K quality", "Lifetime history", "CSV export", "Ad-free", "Batch downloads"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="w-full mt-6 rounded-xl gradient-primary border-0 text-primary-foreground hover:opacity-90">
                  Upgrade to Premium
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
