import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Save, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import Navbar from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Laptop } from "lucide-react";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, preferences, isLoading, updateProfile, updatePreferences } = useProfile();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [saving, setSaving] = useState(false);
  const [cookieContent, setCookieContent] = useState("");
  const [cookieStatus, setCookieStatus] = useState<{ configured: boolean; type: string } | null>(null);
  const [savingCookies, setSavingCookies] = useState(false);
  const [useLocalBackend, setUseLocalBackend] = useState(false);

  useEffect(() => {
    // Check local backend preference
    setUseLocalBackend(localStorage.getItem('USE_LOCAL_BACKEND') === 'true');
  }, []);

  const toggleLocalBackend = (checked: boolean) => {
    setUseLocalBackend(checked);
    if (checked) {
      localStorage.setItem('USE_LOCAL_BACKEND', 'true');
      toast({
        title: "Local Mode Enabled",
        description: "Switched to local backend. App will reload."
      });
    } else {
      localStorage.removeItem('USE_LOCAL_BACKEND');
      toast({
        title: "Remote Mode Enabled",
        description: "Switched to deployed backend. App will reload."
      });
    }
    // Reload to apply new API_BASE_URL
    setTimeout(() => window.location.reload(), 1000);
  };

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
    if (preferences) {
      setEmailNotifications(preferences.email_notifications);
    }
  }, [profile, preferences]);

  // Fetch cookie status
  useEffect(() => {
    const fetchCookieStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/youtube/cookies`);
        if (response.ok) {
          const data = await response.json();
          setCookieStatus(data);
        }
      } catch (error) {
        console.error("Failed to fetch cookie status:", error);
      }
    };
    fetchCookieStatus();
  }, []);

  const handleSaveCookies = async () => {
    if (!cookieContent.trim()) {
      toast({ title: "Please enter cookie content", variant: "destructive" });
      return;
    }

    setSavingCookies(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/youtube/cookies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: cookieContent }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "Cookies saved successfully!" });
        setCookieStatus({ configured: true, type: 'file' });
        setCookieContent(""); // Clear input on success
      } else {
        toast({ title: data.error || "Failed to save cookies", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setSavingCookies(false);
    }
  };

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

            {/* YouTube Settings */}
            <div className="bg-card rounded-2xl p-6 border">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" /> YouTube Settings
              </h2>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Age-Restricted Content</AlertTitle>
                  <AlertDescription>
                    To download age-restricted videos, you need to provide your YouTube cookies.
                    Using an extension like "Get cookies.txt LOCALLY", export your cookies and paste the content below.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Netscape Cookie File Content</label>
                    {cookieStatus?.configured && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Configured
                      </span>
                    )}
                  </div>
                  <Textarea
                    placeholder="# Netscape HTTP Cookie File..."
                    value={cookieContent}
                    onChange={(e) => setCookieContent(e.target.value)}
                    className="font-mono text-xs h-32"
                  />
                  <Button
                    onClick={handleSaveCookies}
                    disabled={savingCookies}
                    className="w-full sm:w-auto"
                    variant="secondary"
                  >
                    {savingCookies ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Cookies
                  </Button>
                </div>
              </div>
            </div>

            {/* Connection Settings - Local Companion */}
            <div className="bg-card rounded-2xl p-6 border border-indigo-500/20 shadow-sm">
              <h2 className="font-semibold mb-4 flex items-center gap-2 text-indigo-500">
                <Laptop className="w-4 h-4" /> Connection Settings
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Local Companion Mode</p>
                  <p className="text-xs text-muted-foreground max-w-[280px]">
                    Use your own computer as the server to bypass IP blocks and use local cookies (Chrome/Firefox).
                  </p>
                </div>
                <Switch
                  checked={useLocalBackend}
                  onCheckedChange={toggleLocalBackend}
                />
              </div>
              {useLocalBackend && (
                <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg text-xs text-indigo-600 dark:text-indigo-400">
                  <p className="font-semibold mb-1">Set up instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open <code>Backend/start_backend.bat</code></li>
                    <li>Select your browser (e.g., Chrome)</li>
                    <li>Keep the window open while using the app</li>
                  </ol>
                </div>
              )}
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
          </div >
        </motion.div >
      </div >
    </div >
  );
};

export default Profile;
