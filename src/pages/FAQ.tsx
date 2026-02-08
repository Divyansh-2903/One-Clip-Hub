import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const faqs = [
  { q: "What platforms does OneClip support?", a: "OneClip supports downloading from YouTube, Instagram, and Pinterest. We're constantly working on adding more platforms." },
  { q: "Is OneClip free to use?", a: "Yes! OneClip offers a free tier with 15 downloads per day. For unlimited downloads and premium features, check out our Premium plan." },
  { q: "What formats can I download in?", a: "For YouTube: MP4 (video) and MP3 (audio). For Instagram: MP4 and JPG. For Pinterest: JPG, PNG, and MP4." },
  { q: "What video quality is available?", a: "Free users can download up to 720p. Premium users get access to 4K quality on supported content." },
  { q: "Is it legal to download content?", a: "OneClip is designed for downloading content you own or have permission to download. Always respect copyright laws and the terms of service of each platform." },
  { q: "Do you store my downloaded files?", a: "No. We only store metadata (URLs, titles, thumbnails) for your download history. We do NOT store actual media files on our servers." },
  { q: "How does the daily limit work?", a: "Free users get 15 downloads per day across all platforms. The counter resets at midnight UTC." },
  { q: "Can I download Instagram Stories?", a: "Yes, OneClip supports downloading Instagram posts, reels, and stories." },
  { q: "What happens if a download fails?", a: "If a download fails, try again. The content may have been removed or the URL may be incorrect. Failed downloads don't count toward your daily limit." },
  { q: "How do I upgrade to Premium?", a: "Click the 'Upgrade to Premium' button on your dashboard or visit the pricing page. Payment integration is coming soon!" },
];

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-extrabold">FAQ</h1>
        <p className="mt-3 text-muted-foreground text-lg">Frequently asked questions</p>
      </motion.div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <AccordionItem value={`item-${i}`} className="bg-card rounded-2xl border px-6">
              <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
    <Footer />
  </div>
);

export default FAQ;
