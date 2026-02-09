import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Favorite = Tables<"favorites">;
export type FavoriteInsert = TablesInsert<"favorites">;
export type FavoriteUpdate = TablesUpdate<"favorites">;

export const useFavorites = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: favorites = [], isLoading, error } = useQuery({
        queryKey: ["favorites", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("favorites")
                .select("*")
                .eq("user_id", user.id)
                .order("added_at", { ascending: false });
            if (error) throw error;
            return data as Favorite[];
        },
        enabled: !!user,
    });

    const addFavorite = useMutation({
        mutationFn: async (favorite: Omit<FavoriteInsert, "user_id">) => {
            if (!user) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from("favorites")
                .insert({ ...favorite, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
        },
    });

    const updateFavorite = useMutation({
        mutationFn: async ({ id, ...updates }: FavoriteUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from("favorites")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
        },
    });

    const deleteFavorite = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("favorites")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
        },
    });

    // Check if a URL is already favorited
    const isFavorited = (url: string) => {
        return favorites.some((f) => f.content_url === url);
    };

    // Get favorite by URL
    const getFavoriteByUrl = (url: string) => {
        return favorites.find((f) => f.content_url === url);
    };

    return {
        favorites,
        isLoading,
        error,
        addFavorite,
        updateFavorite,
        deleteFavorite,
        isFavorited,
        getFavoriteByUrl,
    };
};
