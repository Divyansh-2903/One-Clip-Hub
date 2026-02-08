import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;

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
                <p className="font-semibold">{user.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">Free</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
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
                  onClick={() => toast({ title: "Profile updated!" })}
                  className="rounded-xl gradient-primary border-0 text-primary-foreground hover:opacity-90"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-card rounded-2xl p-6 border">
              <h2 className="font-semibold mb-2">Subscription</h2>
              <p className="text-sm text-muted-foreground">You're on the <strong>Free</strong> plan.</p>
              <Button variant="outline" className="mt-4 rounded-xl" onClick={() => toast({ title: "Payment integration coming soon!" })}>
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
