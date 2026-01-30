import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { rpcConsumeInvite } from "@/integrations/supabase/rpc";

export default function AcceptInvite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    const run = async () => {
      const token = new URLSearchParams(window.location.search).get("token");
      // Immediately scrub token from URL (reduces referrer leakage)
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      if (!token) {
        setBusy(false);
        toast({ title: "No token found", description: "This invite link is invalid or incomplete.", variant: "destructive" });
        navigate("/");
        return;
      }
      if (!user) {
        // store token for after-login consumption
        sessionStorage.setItem("pending_invite_token", token);
        toast({ title: "Sign in to continue", description: "We saved your invite—finish sign-in to accept it." });
        navigate("/auth?next=/accept-invite");
        return;
      }

      try {
        const { error } = await rpcConsumeInvite(token);
        if (error) throw error;
        toast({ title: "Welcome!", description: "Business Member access granted." });
        navigate("/settings"); // or wherever makes sense
      } catch (e: any) {
        toast({ title: "Invite failed", description: e?.message ?? "Invalid or expired token.", variant: "destructive" });
        navigate("/");
      } finally {
        setBusy(false);
      }
    };
    run();
  }, [user, toast, navigate]);

  return <div className="p-6">Processing your invitation…</div>;
}