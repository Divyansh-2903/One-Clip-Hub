import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Youtube, Instagram, X, Download, Heart, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { Navigate } from "react-router-dom";

type Platform = "youtube" | "instagram" | "pinterest";

const platforms: { id: Platform; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "youtube", label: "YouTube", icon: <Youtube className="w-4 h-4" />, color: "bg-youtube" },
  { id: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "bg-instagram" },
  {
    id: "pinterest",
    label: "Pinterest",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
    color: "bg-pinterest",
  },
];

const qualityOptions: Record<Platform, string[]> = {
  youtube: ["4K", "1080p", "720p", "480p", "360p"],
  instagram: ["Original", "High", "Medium"],
  pinterest: ["Original", "High", "Medium"],
};

const formatOptions: Record<Platform, string[]> = {
  youtube: ["MP4", "MP3"],
  instagram: ["MP4", "JPG"],
  pinterest: ["JPG", "PNG", "MP4"],
};

const detectPlatform = (url: string): Platform | null => {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/pinterest\.com|pin\.it/i.test(url)) return "pinterest";
  return null;
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [activePlatform, setActivePlatform] = useState<Platform>("youtube");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("MP4");
  const [quality, setQuality] = useState("720p");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<{
    title: string;
    thumbnail: string;
    duration?: string;
    channel?: string;
  } | null>(null);

  useEffect(() => {
    if (url) {
      const detected = detectPlatform(url);
      if (detected) setActivePlatform(detected);
    }
  }, [url]);

  useEffect(() => {
    setFormat(formatOptions[activePlatform][0]);
    setQuality(qualityOptions[activePlatform][0]);
  }, [activePlatform]);

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;

  const handleFetchMetadata = () => {
    if (!url) {
      toast({ title: "Please enter a URL", variant: "destructive" });
      return;
    }
    const detected = detectPlatform(url);
    if (!detected) {
      toast({ title: "Invalid URL", description: "Please enter a valid YouTube, Instagram, or Pinterest URL", variant: "destructive" });
      return;
    }
    // Simulate metadata fetch
    setPreview({
      title: "Sample Content Title — This is a preview of the content you're about to download",
      thumbnail: `https://picsum.photos/seed/${Date.now()}/640/360`,
      duration: detected === "youtube" ? "4:32" : undefined,
      channel: detected === "youtube" ? "Creator Channel" : "@username",
    });
  };

  const handleDownload = () => {
    setDownloading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setDownloading(false);
          toast({ title: "Download complete!" });
          return 100;
        }
        return p + 10;
      });
    }, 300);
  };

  const isPremiumQuality = (q: string) => q === "4K";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Download</h1>
          <p className="text-sm text-muted-foreground mt-1">Paste any URL to get started</p>

          {/* Platform tabs */}
          <div className="flex gap-2 mt-6">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activePlatform === p.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground bg-muted"
                }`}
              >
                {activePlatform === p.id && (
                  <motion.div
                    layoutId="platform-tab"
                    className="absolute inset-0 gradient-primary rounded-xl"
                    style={{ zIndex: -1 }}
                  />
                )}
                {p.icon}
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            ))}
          </div>

          {/* URL Input */}
          <div className="mt-6 relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchMetadata()}
              placeholder={`Paste ${platforms.find((p) => p.id === activePlatform)?.label} URL here...`}
              className="h-14 pl-12 pr-12 rounded-xl text-base"
            />
            {url && (
              <button
                onClick={() => { setUrl(""); setPreview(null); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            onClick={handleFetchMetadata}
            variant="outline"
            className="mt-3 rounded-xl"
          >
            Fetch Info
          </Button>

          {/* Format & Quality */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <div className="flex gap-2">
                {formatOptions[activePlatform].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      format === f
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Quality</label>
              <div className="flex flex-wrap gap-2">
                {qualityOptions[activePlatform].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors relative ${
                      quality === q
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    } ${isPremiumQuality(q) ? "opacity-60" : ""}`}
                  >
                    {q}
                    {isPremiumQuality(q) && (
                      <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 text-[10px] rounded gradient-primary text-primary-foreground font-bold">
                        PRO
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 bg-card rounded-2xl border overflow-hidden shadow-sm"
              >
                <div className="relative aspect-video bg-muted">
                  <img src={preview.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className={`${platforms.find((p) => p.id === activePlatform)?.color} text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold`}>
                      {platforms.find((p) => p.id === activePlatform)?.label}
                    </span>
                  </div>
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  {preview.duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-foreground/80 text-background text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {preview.duration}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2">{preview.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{preview.channel}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Download Button */}
          <div className="mt-6">
            {downloading ? (
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">{progress}%</p>
              </div>
            ) : (
              <Button
                onClick={handleDownload}
                disabled={!preview}
                className="w-full h-12 rounded-xl gradient-primary border-0 text-primary-foreground font-semibold text-base hover:opacity-90"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Now
              </Button>
            )}
          </div>

          {/* Download limit */}
          <div className="mt-6 bg-muted/50 rounded-2xl p-4 border">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Daily Downloads</span>
              <span className="text-muted-foreground">0 / 15</span>
            </div>
            <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full gradient-primary rounded-full" style={{ width: "0%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Free tier: 15 downloads/day.{" "}
              <a href="/pricing" className="text-primary hover:underline">
                Upgrade to Premium
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
