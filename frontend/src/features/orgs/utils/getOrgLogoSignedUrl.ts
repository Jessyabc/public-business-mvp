/**
 * Fetches a signed URL for an organization logo from the Edge Function
 * @param orgId - Organization ID
 * @param logoPath - Optional logo path (if not provided, will be fetched from org_id)
 * @returns Promise with signed URL or null if error
 */
export async function getOrgLogoSignedUrl(
  orgId?: string,
  logoPath?: string
): Promise<string | null> {
  if (!orgId && !logoPath) {
    return null;
  }

  try {
    const SUPABASE_URL = "https://opjltuyirkbbpwgkavjq.supabase.co";
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-org-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamx0dXlpcmtiYnB3Z2thdmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjEyMjcsImV4cCI6MjA2ODI5NzIyN30.LEiJvfprvGbLk7ni4SavBQJl8SYc32ugdCQUGg8DTaQ',
      },
      body: JSON.stringify({
        org_id: orgId,
        logo_path: logoPath,
      }),
    });

    if (!response.ok) {
      console.error('Failed to get signed URL:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Error fetching signed URL:', error);
    return null;
  }
}

