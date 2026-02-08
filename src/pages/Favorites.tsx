import { motion } from "framer-motion";
import { Heart, Download, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { Navigate } from "react-router-dom";

const mockFavorites = [
  { id: "1", title: "Amazing Nature Documentary Clip", platform: "youtube", thumbnail: "https://picsum.photos/seed/f1/320/180", date: "5 days ago", hasNotes: true },
  { id: "2", title: "Street Photography Collection", platform: "instagram", thumbnail: "https://picsum.photos/seed/f2/320/180", date: "1 week ago", hasNotes: false },
  { id: "3", title: "Minimalist Room Decor", platform: "pinterest", thumbnail: "https://picsum.photos/seed/f3/320/180", date: "2 weeks ago", hasNotes: true },
  { id: "4", title: "Cooking Tutorial - Pasta", platform: "youtube", thumbnail: "https://picsum.photos/seed/f4/320/180", date: "3 weeks ago", hasNotes: false },
];

const platformColors: Record<string, string> = {
  youtube: "bg-youtube",
  instagram: "bg-instagram",
  pinterest: "bg-pinterest",
};

const Favorites = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-sm text-muted-foreground mt-1">Your saved content</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockFavorites.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative aspect-video">
                  <img src={f.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button size="icon" variant="ghost" className="w-9 h-9 rounded-full bg-card/90 text-foreground hover:bg-card">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-9 h-9 rounded-full bg-card/90 text-destructive hover:bg-card">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className={`absolute top-2 left-2 ${platformColors[f.platform]} text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize`}>
                    {f.platform}
                  </span>
                  {f.hasNotes && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-card/80 flex items-center justify-center">
                      <MessageSquare className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-secondary fill-secondary" /> Favorited {f.date}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Favorites;
