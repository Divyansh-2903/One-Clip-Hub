import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Save, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import Navbar from "@/components/layout/Navbar";
import { Navigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, preferences, isLoading, updateProfile, updatePreferences } = useProfile();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
    if (preferences) {
      setEmailNotifications(preferences.email_notifications);
    }
  }, [profile, preferences]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ full_name: fullName });
      await updatePreferences.mutateAsync({ email_notifications: emailNotifications });
      toast({ title: "Profile updated successfully!" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const subscriptionTier = profile?.subscription_tier || "free";
  const isVerified = profile?.is_verified || false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account</p>

          <div className="mt-8 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">{fullName || user.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${subscriptionTier === "premium"
                      ? "gradient-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                    }`}>
                    {subscriptionTier}
                  </span>
                  {isVerified && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Account */}
            <div className="bg-card rounded-2xl p-6 border">
              <h2 className="font-semibold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={user.email || ""} disabled className="pl-10 rounded-xl bg-muted" />
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl gradient-primary border-0 text-primary-foreground hover:opacity-90"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-card rounded-2xl p-6 border">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates about your downloads</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Default Quality</p>
                    <p className="text-xs text-muted-foreground">{preferences?.default_quality || "720p"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Default Format</p>
                    <p className="text-xs text-muted-foreground uppercase">{preferences?.default_format || "mp4"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-card rounded-2xl p-6 border">
              <h2 className="font-semibold mb-2">Subscription</h2>
              <p className="text-sm text-muted-foreground">
                You're on the <strong className="capitalize">{subscriptionTier}</strong> plan.
              </p>
              {subscriptionTier === "free" && (
                <Link to="/pricing">
                  <Button variant="outline" className="mt-4 rounded-xl">
                    Upgrade to Premium
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
