import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">View your profile and manage settings</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Profile
            </CardTitle>
            <CardDescription>
              Your profile information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Email: {user.email}
            </div>
            <div className="text-sm text-muted-foreground">
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </div>
            <Button 
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Profile & Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}