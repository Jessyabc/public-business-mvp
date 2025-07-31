import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAppMode } from "@/contexts/AppModeContext";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function DisconnectButton() {
  const { signOut } = useAuth();
  const { mode } = useAppMode();
  const navigate = useNavigate();

  const handleDisconnect = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      // Force navigation to root which will show Landing page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <Button 
      onClick={handleDisconnect}
      variant="outline"
      className={`w-full transition-all duration-300 ${
        mode === 'public'
          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
          : 'bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-500/30'
      }`}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Disconnect
    </Button>
  );
}