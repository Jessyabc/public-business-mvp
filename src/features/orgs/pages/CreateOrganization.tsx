import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrganization, addOwnerToOrg } from '../api/orgs';
import { supabase } from '@/integrations/supabase/client';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { GlassInput } from '@/components/ui/GlassInput';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CreateOrganization() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    try {
      if (!user?.id) throw new Error('Not authenticated');
      
      const org = await createOrganization({ name: name.trim() });
      await addOwnerToOrg(org.id, user.id);
      
      toast.success('Organization created successfully!');
      nav('/app/insights');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create organization');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <GlassSurface>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Create Your Organization
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Set up your business so teammates can post Insights and collaborate.
        </p>
        
        <form onSubmit={onSubmit} className="space-y-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Organization name
            </label>
            <GlassInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={busy || !name.trim()}
            className="w-full"
          >
            {busy ? 'Creating…' : 'Create organization'}
          </Button>
        </form>
      </GlassSurface>
    </div>
  );
}
