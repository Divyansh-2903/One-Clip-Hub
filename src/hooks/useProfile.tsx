import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type UserPreferences = Tables<"user_preferences">;

export const useProfile = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
        queryKey: ["profile", user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();
            if (error) throw error;
            return data as Profile;
        },
        enabled: !!user,
    });

    const { data: preferences, isLoading: preferencesLoading, error: preferencesError } = useQuery({
        queryKey: ["preferences", user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from("user_preferences")
                .select("*")
                .eq("user_id", user.id)
                .single();
            if (error) throw error;
            return data as UserPreferences;
        },
        enabled: !!user,
    });

    const updateProfile = useMutation({
        mutationFn: async (updates: TablesUpdate<"profiles">) => {
            if (!user) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("user_id", user.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
        },
    });

    const updatePreferences = useMutation({
        mutationFn: async (updates: TablesUpdate<"user_preferences">) => {
            if (!user) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from("user_preferences")
                .update(updates)
                .eq("user_id", user.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["preferences", user?.id] });
        },
    });

    return {
        profile,
        preferences,
        isLoading: profileLoading || preferencesLoading,
        error: profileError || preferencesError,
        updateProfile,
        updatePreferences,
    };
};
