import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Link as LinkIcon, Youtube, Instagram, X, Download, Heart, Clock, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDownloads } from "@/hooks/useDownloads";
import { useFavorites } from "@/hooks/useFavorites";
import { useProfile } from "@/hooks/useProfile";
import Navbar from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import {
  fetchVideoInfo, downloadVideo, getFileUrl, type VideoInfo,
  fetchInstagramInfo, downloadInstagram, getInstagramFileUrl,
  fetchPinterestInfo, downloadPinterest, getPinterestFileUrl,
  getProxyThumbnailUrl
} from "@/lib/api";

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
  youtube: ["1080p", "720p", "480p", "360p"],
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

const FREE_DAILY_LIMIT = 15;

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { addDownload, todayCount } = useDownloads();
  const { addFavorite, deleteFavorite, isFavorited, getFavoriteByUrl } = useFavorites();
  const { profile } = useProfile();

  const [activePlatform, setActivePlatform] = useState<Platform>("youtube");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("MP4");
  const [quality, setQuality] = useState("720p");
  const [downloading, setDownloading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);

  // Guest download tracking
  const [guestDownloadCount, setGuestDownloadCount] = useState(() => {
    const stored = localStorage.getItem("guestDownloads");
    if (stored) {
      const { date, count } = JSON.parse(stored);
      if (new Date(date).toDateString() === new Date().toDateString()) {
        return count;
      }
    }
    return 0;
  });

  const isPremium = profile?.subscription_tier === "premium";
  const currentTodayCount = user ? todayCount : guestDownloadCount;
  const remainingDownloads = isPremium ? Infinity : FREE_DAILY_LIMIT - currentTodayCount;

  useEffect(() => {
    if (url) {
      const detected = detectPlatform(url);
      if (detected) setActivePlatform(detected);
    }
  }, [url]);

  useEffect(() => {
    setFormat(formatOptions[activePlatform][0]);
    setQuality(qualityOptions[activePlatform][0]);
    // Reset available qualities when platform changes
    if (activePlatform !== "youtube") {
      setAvailableQualities(qualityOptions[activePlatform]);
    }
  }, [activePlatform]);

  // Load pending URL from sessionStorage (from homepage)
  useEffect(() => {
    const pendingUrl = sessionStorage.getItem("pendingDownloadUrl");
    if (pendingUrl) {
      setUrl(pendingUrl);
      sessionStorage.removeItem("pendingDownloadUrl");
      // Auto-detect platform
      const detected = detectPlatform(pendingUrl);
      if (detected) setActivePlatform(detected);
    }
  }, []);

  if (loading) return null;

  const handleFetchMetadata = async () => {
    if (!url) {
      toast({ title: "Please enter a URL", variant: "destructive" });
      return;
    }
    const detected = detectPlatform(url);
    if (!detected) {
      toast({ title: "Invalid URL", description: "Please enter a valid YouTube, Instagram, or Pinterest URL", variant: "destructive" });
      return;
    }

    setFetchingInfo(true);
    try {
      let info: VideoInfo;

      if (detected === "youtube") {
        info = await fetchVideoInfo(url);
        // Set available qualities from the video
        if (info.formats?.video) {
          const qualities = info.formats.video.map(f => f.quality);
          setAvailableQualities(qualities.length > 0 ? qualities : qualityOptions.youtube);
          if (qualities.length > 0 && !qualities.includes(quality)) {
            setQuality(qualities[0]);
          }
        }
      } else if (detected === "instagram") {
        const igInfo = await fetchInstagramInfo(url);
        info = {
          id: igInfo.id,
          title: igInfo.title,
          description: igInfo.description,
          thumbnail: igInfo.thumbnail ? getProxyThumbnailUrl(igInfo.thumbnail) : undefined,
          duration: igInfo.duration,
          durationFormatted: igInfo.durationFormatted || "",
          channel: igInfo.channel,
          channelUrl: igInfo.channelUrl,
          viewCount: igInfo.viewCount,
          formats: { video: [], audio: [] },
          url: url
        };
        setAvailableQualities(qualityOptions.instagram);
      } else {
        // Pinterest
        const pinInfo = await fetchPinterestInfo(url);
        info = {
          id: pinInfo.id,
          title: pinInfo.title,
          description: pinInfo.description,
          thumbnail: pinInfo.thumbnail ? getProxyThumbnailUrl(pinInfo.thumbnail) : undefined,
          duration: pinInfo.duration,
          durationFormatted: pinInfo.durationFormatted || "",
          channel: pinInfo.channel,
          channelUrl: pinInfo.channelUrl,
          formats: { video: [], audio: [] },
          url: url
        };
        setAvailableQualities(qualityOptions.pinterest);
      }

      setVideoInfo(info);
      toast({ title: "Content info loaded!" });
    } catch (error) {
      toast({
        title: "Failed to fetch content info",
        description: error instanceof Error ? error.message : "Check if the backend server is running",
        variant: "destructive"
      });
    } finally {
      setFetchingInfo(false);
    }
  };

  const handleDownload = async () => {
    // Removed strict sign-in check for basic downloads
    // if (!user) { ... }

    if (remainingDownloads <= 0) {
      toast({
        title: "Daily limit reached",
        description: "Upgrade to Premium for unlimited downloads",
        variant: "destructive"
      });
      return;
    }

    if (!videoInfo) {
      toast({ title: "Please fetch video info first", variant: "destructive" });
      return;
    }

    setDownloading(true);
    setProgress(0);

    try {
      // Simulate progress with decay
      // Fast to 70%, then slower to 85%, then crawl to 95% (merging)
      const isHighQuality = quality === "4K" || quality === "2160p" || quality === "1080p";

      const progressInterval = setInterval(() => {
        setProgress(currentUserProgress => {
          if (currentUserProgress >= 95) return 95; // Cap at 95% until done

          let increment = 1;
          if (currentUserProgress < 30) increment = 5;
          else if (currentUserProgress < 70) increment = 2;
          else if (currentUserProgress < 85) increment = 0.5;
          else increment = 0.1; // Very slow for merging phase

          // Slower updates for high quality
          if (isHighQuality && currentUserProgress > 70) {
            increment = increment / 2;
          }

          return Math.min(currentUserProgress + increment, 95);
        });
      }, 200);

      let result: { fileName: string; fileSize: number };
      let downloadUrl: string;

      if (activePlatform === "youtube") {
        result = await downloadVideo(url, format, quality);
        downloadUrl = getFileUrl(result.fileName);
      } else if (activePlatform === "instagram") {
        result = await downloadInstagram(url, format, quality);
        downloadUrl = getInstagramFileUrl(result.fileName);
      } else {
        // Pinterest
        result = await downloadPinterest(url, format);
        downloadUrl = getPinterestFileUrl(result.fileName);
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Increment guest count if not logged in
      if (!user) {
        const newCount = guestDownloadCount + 1;
        setGuestDownloadCount(newCount);
        localStorage.setItem("guestDownloads", JSON.stringify({
          date: new Date().toISOString(),
          count: newCount
        }));
      }

      // Save to database (only if logged in)
      if (user) {
        try {
          await addDownload.mutateAsync({
            platform: activePlatform,
            content_url: url,
            content_title: videoInfo.title,
            thumbnail_url: videoInfo.thumbnail,
            format: format,
            quality: quality,
            content_type: format === "MP3" ? "audio" : (format === "JPG" || format === "PNG" ? "image" : "video"),
            file_size: result.fileSize,
            duration: videoInfo.duration,
            status: "completed",
          });
        } catch (dbError) {
          console.warn('Failed to save download to database:', dbError);
          // Don't throw - download was successful, just DB save failed
        }
      }

      // Trigger file download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({ title: "Download complete!" });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({ title: "Please sign in to save favorites", variant: "destructive" });
      return;
    }

    if (!url || !videoInfo) return;

    const existingFavorite = getFavoriteByUrl(url);

    if (existingFavorite) {
      try {
        await deleteFavorite.mutateAsync(existingFavorite.id);
        toast({ title: "Removed from favorites" });
      } catch {
        toast({ title: "Failed to remove favorite", variant: "destructive" });
      }
    } else {
      try {
        await addFavorite.mutateAsync({
          platform: activePlatform,
          content_url: url,
          content_title: videoInfo.title,
          thumbnail_url: videoInfo.thumbnail,
        });
        toast({ title: "Added to favorites!" });
      } catch {
        toast({ title: "Failed to add favorite", variant: "destructive" });
      }
    }
  };

  const isPremiumQuality = (q: string) => q === "4K" || q === "2160p";
  const isUrlFavorited = url ? isFavorited(url) : false;
  const currentQualities = activePlatform === "youtube" && availableQualities.length > 0
    ? availableQualities
    : qualityOptions[activePlatform];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Download</h1>
          <p className="text-sm text-muted-foreground mt-1">Paste any URL to get started</p>

          {/* Platform tabs */}
          <div className="flex gap-2 mt-6">
            <LayoutGroup id="dashboard-tabs">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePlatform(p.id);
                    setVideoInfo(null);
                  }}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activePlatform === p.id
                    ? "text-white dark:text-black"
                    : "text-muted-foreground hover:text-foreground bg-muted/50"
                    }`}
                >
                  {activePlatform === p.id && (
                    <motion.div
                      layoutId="platform-tab-dashboard"
                      className="absolute inset-0 bg-black dark:bg-white rounded-xl shadow-md"
                      style={{ zIndex: 0 }}
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {/* Ensure visibility by forcing text color and handling icon stroke */}
                  <span className={`relative z-10 flex items-center gap-2 ${activePlatform === p.id ? "text-white dark:text-black" : ""}`}>
                    {p.icon}
                    <span className="hidden sm:inline">{p.label}</span>
                  </span>
                </button>
              ))}
            </LayoutGroup>
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
                onClick={() => { setUrl(""); setVideoInfo(null); }}
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
            disabled={fetchingInfo}
          >
            {fetchingInfo ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              "Fetch Info"
            )}
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
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${format === f
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
                {currentQualities.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      if (isPremiumQuality(q) && !isPremium) {
                        toast({
                          title: "Premium feature",
                          description: "Upgrade to access 4K downloads"
                        });
                        return;
                      }
                      setQuality(q);
                    }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors relative ${quality === q
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                      } ${isPremiumQuality(q) && !isPremium ? "opacity-60" : ""}`}
                  >
                    {q}
                    {isPremiumQuality(q) && !isPremium && (
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
            {videoInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 bg-card rounded-2xl border overflow-hidden shadow-sm"
              >
                <div className="relative aspect-video bg-muted">
                  <img src={videoInfo.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className={`${platforms.find((p) => p.id === activePlatform)?.color} text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold`}>
                      {platforms.find((p) => p.id === activePlatform)?.label}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleFavorite}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isUrlFavorited ? "fill-secondary text-secondary" : ""}`} />
                  </button>
                  {videoInfo.durationFormatted && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-foreground/80 text-background text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {videoInfo.durationFormatted}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2">{videoInfo.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{videoInfo.channel}</p>
                  {videoInfo.viewCount && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {videoInfo.viewCount.toLocaleString()} views
                    </p>
                  )}
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
                <p className="text-sm text-muted-foreground text-center animate-pulse">
                  {progress < 70
                    ? `Downloading... ${Math.floor(progress)}%`
                    : progress < 85
                      ? `Processing... ${Math.floor(progress)}%`
                      : `Merging Audio & Video${quality === "4K" ? " (High Quality takes longer)" : ""}...`
                  }
                </p>
              </div>
            ) : (
              <Button
                onClick={handleDownload}
                disabled={!videoInfo || addDownload.isPending}
                className="w-full h-12 rounded-xl gradient-primary border-0 text-primary-foreground font-semibold text-base hover:opacity-90"
              >
                {addDownload.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 mr-2" />
                )}
                Download Now
              </Button>
            )}
          </div>



          {/* Download limit */}
          <div className="mt-6 bg-muted/50 rounded-2xl p-4 border">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Daily Downloads</span>
              <span className="text-muted-foreground">
                {isPremium ? "Unlimited" : `${currentTodayCount} / ${FREE_DAILY_LIMIT}`}
              </span>
            </div>
            {!isPremium && (
              <>
                <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all"
                    style={{ width: `${Math.min((currentTodayCount / FREE_DAILY_LIMIT) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Free tier: {FREE_DAILY_LIMIT} downloads/day.{" "}
                  <Link to="/pricing" className="text-primary hover:underline">
                    Upgrade to Premium
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
