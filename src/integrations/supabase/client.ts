// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// ✅ Read values from environment (Vite exposes only VITE_*)


if (!SUPABASE_URL) {
  throw new Error("supabaseUrl is required. Set VITE_SUPABASE_URL in your env.");
}
if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "supabase publishable key is required. Set VITE_SUPABASE_PUBLISHABLE_KEY in your env."
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
