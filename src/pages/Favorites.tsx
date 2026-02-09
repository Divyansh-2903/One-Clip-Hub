import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Download, Trash2, MessageSquare, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import Navbar from "@/components/layout/Navbar";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const platformColors: Record<string, string> = {
  youtube: "bg-youtube",
  instagram: "bg-instagram",
  pinterest: "bg-pinterest",
};

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites, isLoading, deleteFavorite } = useFavorites();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  if (authLoading) return null;
  if (!user) return <Navigate to="/signin" replace />;

  const filteredFavorites = favorites.filter((f) =>
    f.content_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteFavorite.mutateAsync(id);
      toast({ title: "Removed from favorites" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-sm text-muted-foreground mt-1">Your saved content</p>

          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search favorites..."
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="mt-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading favorites...</p>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="mt-12 text-center text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No favorites yet</p>
              <p className="text-sm mt-1">Content you favorite will appear here</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredFavorites.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-video">
                    <img
                      src={f.thumbnail_url || `https://picsum.photos/seed/${f.id}/320/180`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="icon" variant="ghost" className="w-9 h-9 rounded-full bg-card/90 text-foreground hover:bg-card">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-9 h-9 rounded-full bg-card/90 text-destructive hover:bg-card"
                        onClick={() => handleDelete(f.id)}
                        disabled={deleteFavorite.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className={`absolute top-2 left-2 ${platformColors[f.platform] || "bg-muted"} text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize`}>
                      {f.platform}
                    </span>
                    {f.notes && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-card/80 flex items-center justify-center">
                        <MessageSquare className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium line-clamp-2">{f.content_title || "Untitled"}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-secondary fill-secondary" /> Favorited {formatDate(f.added_at)}
                    </p>
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

export default Favorites;
