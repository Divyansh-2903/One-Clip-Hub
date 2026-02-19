import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Download, Zap, Film, History, Youtube, Instagram, ArrowRight, Check, Star, Link as LinkIcon, Search, ClipboardPaste, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: Film, title: "Universal Support", desc: "YouTube, Facebook, Instagram, Twitter & Pinterest" },
  { icon: Zap, title: "Lighting Fast", desc: "Paste a URL and download instantly" },
  { icon: Download, title: "Multiple Formats", desc: "MP4, MP3, JPG, PNG — whatever you need" },
  { icon: History, title: "Smart History", desc: "Track and re-download your past content" },
];

const steps = [
  { num: "1", title: "Paste URL", desc: "Copy any link from your favorite social app" },
  { num: "2", title: "Choose Format", desc: "Select your preferred quality (up to 4K)" },
  { num: "3", title: "Download", desc: "Save directly to your device" },
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
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFocused, setIsFocused] = useState(false);

  const detectPlatform = (url: string): "youtube" | "instagram" | "pinterest" | "twitter" | "facebook" | "tiktok" | null => {
    if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
    if (/instagram\.com/i.test(url)) return "instagram";
    if (/pinterest\.com|pin\.it/i.test(url)) return "pinterest";
    if (/twitter\.com|x\.com/i.test(url)) return "twitter";
    if (/facebook\.com|fb\.watch/i.test(url)) return "facebook";
    if (/tiktok\.com/i.test(url)) return "tiktok";
    return null;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;

    const platform = detectPlatform(url);
    if (platform) {
      // Save URL to sessionStorage so dashboard can use it
      sessionStorage.setItem("pendingDownloadUrl", url);
      // Navigate to dashboard (guest access allowed)
      navigate("/dashboard");
    } else {
      // Navigate anyway for generic handling attempts or show error
      // For now, let's allow it and let dashboard handle the "unknown" state or try generic dl
      sessionStorage.setItem("pendingDownloadUrl", url);
      navigate("/dashboard");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-secondary/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000" />

        {/* Floating Icons Background (Optional/Subtle) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
          <Youtube className="absolute top-20 left-[20%] w-24 h-24 rotate-12 animate-pulse duration-[3000ms]" />
          <Instagram className="absolute top-40 right-[20%] w-32 h-32 -rotate-12 animate-pulse delay-700 duration-[4000ms]" />
          <Facebook className="absolute bottom-40 left-[30%] w-20 h-20 rotate-6 animate-pulse delay-1000 duration-[3000ms]" />
          {/* TikTok Icon */}
          <svg className="absolute bottom-20 right-[25%] w-28 h-28 rotate-[15deg] opacity-80 animate-pulse delay-500 duration-[4000ms]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto text-center relative z-10 max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-primary/20 text-sm font-medium text-accent-foreground mb-8 backdrop-blur-sm"
          >
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span>Free • No Signup • Unlimited Speed</span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6">
            The Ultimate <br className="hidden sm:block" />
            <span className="gradient-text">Universal Downloader</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            One tool for all your media. Download high-quality videos and images from YouTube, Facebook, Instagram, Twitter/X, and Pinterest in seconds.
          </p>

          {/* URL Input Bar */}
          <form onSubmit={handleSubmit} className="mt-10 max-w-2xl mx-auto relative z-20">
            <div className={`relative flex items-center gap-2 bg-card/80 backdrop-blur-xl border-2 ${isFocused ? 'border-primary ring-4 ring-primary/10' : 'border-border/50'} rounded-2xl p-2 shadow-2xl transition-all duration-300`}>
              <div className="absolute left-5 pointer-events-none">
                <LinkIcon className={`w-5 h-5 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Paste any video URL..."
                className="flex-1 h-14 pl-12 pr-4 border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 active:scale-95"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-5 h-5" />
              </button>
              <Button
                type="submit"
                size="lg"
                className="rounded-xl gradient-primary border-0 text-primary-foreground px-8 h-12 text-lg font-bold shadow-lg shadow-primary/25 hover:opacity-90 hover:scale-[1.02] transition-all shrink-0"
              >
                Download
              </Button>
            </div>

            {/* Quick Chips */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 items-center text-sm text-muted-foreground">
              <span className="opacity-70">Supports:</span>
              <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-muted/40 border border-border/50">
                <Youtube className="w-4 h-4 text-[#FF0000]" />
                <Facebook className="w-4 h-4 text-[#1877F2]" />
                <Instagram className="w-4 h-4 text-[#E4405F]" />
                <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                <svg className="w-4 h-4 text-[#BD081C]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
                <svg className="w-4 h-4 text-[#000000] dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
              </div>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {/* Conditional rendering could go here regarding auth */}
            <Link to="/signup">
              <Button size="lg" variant="outline" className="rounded-xl border-2 px-8 h-14 text-base font-semibold hover:bg-muted/50 transition-colors">
                Create Free Account
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" className="rounded-xl gradient-primary border-0 text-primary-foreground px-8 h-14 text-base font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
                View Premium Plans <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="text-center mb-16"
          >
            <motion.h2 variants={item} className="text-3xl md:text-4xl font-bold tracking-tight">
              Power & Simplicity Combined
            </motion.h2>
            <motion.p variants={item} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              We've stripped away the complexity. No ads, no popups, just clean, fast downloads.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={item}
                whileHover={{ y: -8 }}
                className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${i % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Three simple steps to offline freedom</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={item}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/25 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>

                {/* Connector Line (Desktop) */}
                {i !== steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-border to-transparent" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-4 bg-card border-t border-border/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Unbeatable Value</h2>
            <p className="mt-3 text-muted-foreground">Professional tools at an accessible price</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-muted/30 rounded-3xl p-8 border hover:border-border/80 transition-colors"
            >
              <h3 className="text-lg font-semibold text-muted-foreground">Starter</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-8 space-y-4">
                {["15 downloads/day", "Standard Speed", "720p Quality", "Basic Support"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-muted/80 flex items-center justify-center text-[10px]">✓</div> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button variant="outline" className="w-full mt-8 rounded-xl h-12 border-2 hover:bg-background">
                  Start for Free
                </Button>
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative rounded-3xl p-1 bg-gradient-to-b from-primary to-secondary shadow-2xl shadow-primary/20"
            >
              <div className="bg-card rounded-[22px] p-8 h-full">
                <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1 rounded-full gradient-primary text-xs font-bold text-white shadow-md">
                  BEST VALUE
                </div>
                <h3 className="text-lg font-semibold gradient-text">Pro Member</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight">₹299</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="mt-8 space-y-4">
                  {["Unlimited Everything", "4K Ultra HD", "Batch Downloading", "Priority Support", "No Ads"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-[10px]">✓</div> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className="w-full mt-8 rounded-xl gradient-primary border-0 text-white h-12 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
