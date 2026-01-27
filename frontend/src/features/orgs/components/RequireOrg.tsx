import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserOrgId } from '../hooks/useUserOrgId';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

export function RequireOrg({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const { data: orgId, status } = useUserOrgId();

  useEffect(() => {
    if (status === 'success' && !orgId) {
      nav('/org/new', { replace: true });
    }
  }, [status, orgId, nav]);

  if (status === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-[var(--text-secondary)]">Loading…</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <GlassSurface>
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-[var(--text-secondary)]" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Unable to load organization
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              There was an error loading your organization information.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </GlassSurface>
      </div>
    );
  }

  if (!orgId) return null;
  
  return <>{children}</>;
}
