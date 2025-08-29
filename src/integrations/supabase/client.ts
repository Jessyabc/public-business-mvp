// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// ✅ Read values from environment (Vite exposes only VITE_*)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  console.error("Missing VITE_SUPABASE_URL environment variable");
  // Use fallback for development to prevent blank screen
  console.warn("Using fallback Supabase URL - please set environment variables");
}
if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error("Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable");
  console.warn("Using fallback Supabase key - please set environment variables");
}

export const supabase = createClient<Database>(
  SUPABASE_URL || "https://opjltuyirkbbpwgkavjq.supabase.co",
  SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamx0dXlpcmtiYnB3Z2thdmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjEyMjcsImV4cCI6MjA2ODI5NzIyN30.LEiJvfprvGbLk7ni4SavBQJl8SYc32ugdCQUGg8DTaQ",
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
