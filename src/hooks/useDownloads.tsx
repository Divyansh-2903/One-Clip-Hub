import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Download = Tables<"downloads">;
export type DownloadInsert = TablesInsert<"downloads">;

export const useDownloads = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: downloads = [], isLoading, error } = useQuery({
        queryKey: ["downloads", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("downloads")
                .select("*")
                .eq("user_id", user.id)
                .order("downloaded_at", { ascending: false });
            if (error) throw error;
            return data as Download[];
        },
        enabled: !!user,
    });

    const addDownload = useMutation({
        mutationFn: async (download: Omit<DownloadInsert, "user_id">) => {
            if (!user) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from("downloads")
                .insert({ ...download, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["downloads", user?.id] });
        },
    });

    const deleteDownload = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("downloads")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["downloads", user?.id] });
        },
    });

    // Get today's download count for rate limiting
    const todayCount = downloads.filter((d) => {
        const today = new Date();
        const downloadDate = new Date(d.downloaded_at);
        return (
            downloadDate.getDate() === today.getDate() &&
            downloadDate.getMonth() === today.getMonth() &&
            downloadDate.getFullYear() === today.getFullYear()
        );
    }).length;

    return {
        downloads,
        isLoading,
        error,
        addDownload,
        deleteDownload,
        todayCount,
    };
};
