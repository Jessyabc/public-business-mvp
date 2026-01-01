import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ExternalLink, Loader2, Users } from 'lucide-react';
import { useOrgApplications } from '@/hooks/useOrgApplications';
import { OrgApplicationModal } from './OrgApplicationModal';
import { useOrgMembership } from '@/hooks/useOrgMembership';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  industry_id: string | null;
  company_size: string | null;
  status: 'pending' | 'approved' | 'rejected';
  industry?: {
    id: string;
    name: string;
  };
}

interface CompanySearchProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const COMPANY_SIZES: Record<string, string> = {
  '1-10': '1-10 employees',
  '11-50': '11-50 employees',
  '51-200': '51-200 employees',
  '201-1000': '201-1000 employees',
  '1000+': '1000+ employees',
};

export function CompanySearch({ searchQuery = '', onSearchChange }: CompanySearchProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [industries, setIndustries] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const { applyToOrg } = useOrgApplications();
  const { data: memberships } = useOrgMembership();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Get user's org IDs to check membership
  const userOrgIds = memberships?.map(m => m.org_id) || [];

  useEffect(() => {
    const fetchIndustries = async () => {
      const { data, error } = await supabase
        .from('industries')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching industries:', error);
      } else {
        setIndustries(data || []);
      }
    };

    fetchIndustries();
  }, []);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orgs')
        .select(`
          *,
          industry:industries(id, name)
        `)
        .eq('status', 'approved') // Only show approved orgs
        .order('name', { ascending: true });

      if (localSearchQuery.trim()) {
        query = query.or(`name.ilike.%${localSearchQuery}%,description.ilike.%${localSearchQuery}%`);
      }

      if (filterIndustry !== 'all') {
        query = query.eq('industry_id', filterIndustry);
      }

      const { data, error } = await query;
      if (error) throw error;

      setOrganizations((data || []) as Organization[]);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  }, [localSearchQuery, filterIndustry]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(localSearchQuery);
    }
  }, [localSearchQuery, onSearchChange]);

  const handleApply = (org: Organization) => {
    setSelectedOrg(org);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async (message?: string) => {
    if (!selectedOrg) return;

    try {
      await applyToOrg(selectedOrg.id, message);
      setShowApplicationModal(false);
      setSelectedOrg(null);
      await fetchOrganizations();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const isUserMember = (orgId: string) => {
    return userOrgIds.includes(orgId);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search companies by name or description..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="bg-background border-input text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={filterIndustry} onValueChange={setFilterIndustry}>
          <SelectTrigger className="w-48 bg-background border-input text-foreground">
            <SelectValue placeholder="Filter by industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry.id} value={industry.id}>
                {industry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Organizations List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-muted border border-border">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No companies found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {organizations.map((org, index) => {
            const isMember = isUserMember(org.id);

            return (
              <Card
                key={org.id}
                className="rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 animate-feed-card-enter bg-card border border-border shadow-sm hover:shadow-md hover:border-border/80"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {org.name}
                      </CardTitle>
                      {org.website && (
                        <CardDescription className="mt-1">
                          <a
                            href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            {org.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {org.industry && (
                        <Badge variant="secondary">{org.industry.name}</Badge>
                      )}
                      {org.company_size && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {COMPANY_SIZES[org.company_size] || org.company_size}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {org.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {org.description}
                    </p>
                    {isMember && (
                      <div className="mt-4">
                        <Badge variant="default">You are a member</Badge>
                      </div>
                    )}
                    {!isMember && (
                      <div className="mt-4">
                        <Button
                          onClick={() => handleApply(org)}
                          variant="default"
                          size="sm"
                        >
                          Apply to Join
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {showApplicationModal && selectedOrg && (
        <OrgApplicationModal
          org={selectedOrg}
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedOrg(null);
          }}
          onSubmit={handleSubmitApplication}
        />
      )}
    </div>
  );
}

