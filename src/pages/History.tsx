import { motion } from "framer-motion";
import { Search, Download, Trash2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { Navigate } from "react-router-dom";

const mockDownloads = [
  { id: "1", title: "How to Build a React App in 10 Minutes", platform: "youtube", format: "MP4", quality: "720p", date: "2 hours ago", thumbnail: "https://picsum.photos/seed/1/128/72" },
  { id: "2", title: "Beautiful Sunset Timelapse", platform: "instagram", format: "MP4", quality: "Original", date: "Yesterday", thumbnail: "https://picsum.photos/seed/2/128/72" },
  { id: "3", title: "Modern Interior Design Ideas", platform: "pinterest", format: "JPG", quality: "Original", date: "3 days ago", thumbnail: "https://picsum.photos/seed/3/128/72" },
];

const platformColors: Record<string, string> = {
  youtube: "bg-youtube",
  instagram: "bg-instagram",
  pinterest: "bg-pinterest",
};

const History = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;

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
              <Input placeholder="Search downloads..." className="pl-10 rounded-xl" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {mockDownloads.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-card rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow"
              >
                <img src={d.thumbnail} alt="" className="w-20 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{d.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`${platformColors[d.platform]} text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize`}>
                      {d.platform}
                    </span>
                    <span className="text-xs text-muted-foreground">{d.format} • {d.quality}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {d.date}
                  </span>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
