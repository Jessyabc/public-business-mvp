import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Rate limiting configuration
const RATE_LIMIT = 5; // requests per hour
const WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Input validation schema
const ContactRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().min(1, "Message is required").max(2000, "Message too long"),
  company: z.string().optional(),
  phone: z.string().optional(),
});

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  phone?: string;
}

// Hash IP for privacy-compliant rate limiting
function hashIP(ip: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + new Date().toDateString());
  return crypto.subtle.digest('SHA-256', data)
    .then(hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get client IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const clientIP = forwardedFor?.split(',')[0] || realIP || 'unknown';
    
    const ipHash = await hashIP(clientIP);

    // Check rate limit
    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MS);

    const { data: recentRequests, error: rateError } = await supabase
      .from('api_hits')
      .select('id')
      .eq('ip_hash', ipHash)
      .eq('endpoint', 'contact-relay')
      .gte('created_at', windowStart.toISOString());

    if (rateError) {
      console.error('Rate limit check error:', rateError);
    }

    if (recentRequests && recentRequests.length >= RATE_LIMIT) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED' 
        }), 
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = ContactRequestSchema.parse(body);

    // Log the rate limit hit
    await supabase.from('api_hits').insert({
      ip_hash: ipHash,
      endpoint: 'contact-relay',
      metadata: { 
        subject: validatedData.subject,
        has_company: !!validatedData.company,
        message_length: validatedData.message.length
      }
    });

    // Store contact request (without exposing email to public)
    const { error: insertError } = await supabase
      .from('contact_requests')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        company: validatedData.company || null,
        phone: validatedData.phone || null,
        ip_hash: ipHash,
        status: 'pending'
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process request. Please try again.',
          code: 'DATABASE_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // In a real implementation, you would send an email here
    // using a service like Resend, SendGrid, or similar
    console.log('Contact request received:', {
      name: validatedData.name,
      subject: validatedData.subject,
      company: validatedData.company,
      timestamp: now.toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact request received successfully. We will respond within 24 hours.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Contact relay error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: error.errors,
          code: 'VALIDATION_ERROR'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error. Please try again later.',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});