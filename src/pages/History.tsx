import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, Trash2, Clock, Loader2, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDownloads } from "@/hooks/useDownloads";
import { useFavorites } from "@/hooks/useFavorites";
import Navbar from "@/components/layout/Navbar";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const platformColors: Record<string, string> = {
  youtube: "bg-youtube",
  instagram: "bg-instagram",
  pinterest: "bg-pinterest",
};

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const { downloads, isLoading, deleteDownload } = useDownloads();
  const { addFavorite, deleteFavorite, isFavorited, getFavoriteByUrl } = useFavorites();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  if (authLoading) return null;
  if (!user) return <Navigate to="/signin" replace />;

  const filteredDownloads = downloads.filter((d) =>
    d.content_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteDownload.mutateAsync(id);
      toast({ title: "Download removed from history" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown date";
    }
  };

  const handleRedownload = (download: any) => {
    // Navigate to dashboard with the URL to start fresh
    sessionStorage.setItem("pendingDownloadUrl", download.content_url);
    navigate("/dashboard");
  };

  const handleToggleFavorite = async (download: any) => {
    const existingFavorite = getFavoriteByUrl(download.content_url);

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
          platform: download.platform,
          content_url: download.content_url,
          content_title: download.content_title,
          thumbnail_url: download.thumbnail_url,
        });
        toast({ title: "Added to favorites!" });
      } catch {
        toast({ title: "Failed to add favorite", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Download History</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage your past downloads</p>

          <div className="mt-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search downloads..."
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="mt-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading downloads...</p>
            </div>
          ) : filteredDownloads.length === 0 ? (
            <div className="mt-12 text-center text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No downloads yet</p>
              <p className="text-sm mt-1">Your download history will appear here</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredDownloads.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 bg-card rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={d.thumbnail_url || `https://picsum.photos/seed/${d.id}/128/72`}
                    alt=""
                    className="w-20 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{d.content_title || "Untitled"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`${platformColors[d.platform] || "bg-muted"} text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize`}>
                        {d.platform}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {d.format} • {d.quality}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(d.downloaded_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => handleToggleFavorite(d)}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited(d.content_url) ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => handleRedownload(d)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive"
                      onClick={() => handleDelete(d.id)}
                      disabled={deleteDownload.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default History;
