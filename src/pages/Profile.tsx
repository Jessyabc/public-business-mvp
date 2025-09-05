import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/ui/components/GlassCard";
import { Settings, User, Plus, FileText, Building2 } from "lucide-react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useProfile } from "@/hooks/useProfile";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ComposerModal } from "@/components/composer/ComposerModal";
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { isBusinessMember, isAdmin } = useUserRoles();
  const [showComposer, setShowComposer] = useState(false);

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your profile and create content</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button 
            onClick={() => setShowComposer(true)}
            className="glass-ios-triple h-16 text-left justify-start"
            variant="outline"
          >
            <Plus className="h-5 w-5 mr-2" />
            <div>
              <div className="font-medium">Create Post</div>
              <div className="text-xs text-muted-foreground">Share your insights</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => navigate("/my-posts")}
            className="glass-ios-triple h-16 text-left justify-start"
            variant="outline"
          >
            <FileText className="h-5 w-5 mr-2" />
            <div>
              <div className="font-medium">My Posts</div>
              <div className="text-xs text-muted-foreground">View your content</div>
            </div>
          </Button>

          {(isBusinessMember() || isAdmin()) && (
            <Button 
              onClick={() => navigate("/business-dashboard")}
              className="glass-ios-triple h-16 text-left justify-start"
              variant="outline"
            >
              <Building2 className="h-5 w-5 mr-2" />
              <div>
                <div className="font-medium">Business</div>
                <div className="text-xs text-muted-foreground">Dashboard & tools</div>
              </div>
            </Button>
          )}
        </div>

        {/* Profile Form */}
        <ProfileForm />

        {/* Settings Link */}
        <GlassCard className="glass-ios-triple glass-corner-distort">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Account Settings</h3>
                <p className="text-sm text-muted-foreground">Manage preferences and account options</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/settings")}
              variant="outline"
              className="glass-ios-triple"
            >
              Open Settings
            </Button>
          </div>
        </GlassCard>
      </div>

      <ComposerModal 
        isOpen={showComposer} 
        onClose={() => setShowComposer(false)} 
      />
      </div>
    </ProtectedRoute>
  );
}