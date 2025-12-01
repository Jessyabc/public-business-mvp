import { useState } from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useComposerStore } from '@/hooks/useComposerStore';
import { BusinessMemberBadge } from '@/components/business/BusinessMemberBadge';
import { BusinessInvitations } from '@/components/business/BusinessInvitations';
import { GlassPanel, GlassButton, GlassCard } from '@/components/ui/glass';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  Settings, 
  Plus,
  Crown,
  Eye,
  Sparkles
} from 'lucide-react';

export function BusinessDashboard() {
  const { isBusinessMember, isAdmin, canCreateBusinessPosts } = useUserRoles();
  const { profile } = useBusinessProfile();
  const { openComposer } = useComposerStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'team' | 'settings'>('overview');

  const isBusinessMemberRole = isBusinessMember() || isAdmin();
  const isAdminRole = isAdmin();

  if (!isBusinessMemberRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0f1729] via-[#1a1147] to-[#0f1729]">
        <GlassPanel className="max-w-md w-full p-8 text-center">
          <Building2 className="h-16 w-16 text-[#00D9FF] mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-semibold text-white/90 mb-3">Business Access Required</h2>
          <p className="text-white/60 mb-6 leading-relaxed">
            You need to be a Business Member to access this premium dashboard.
          </p>
          <GlassButton 
            variant="primary" 
            glow="aqua" 
            onClick={() => window.location.href = '/create-business'}
          >
            Create Business Account
          </GlassButton>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1729] via-[#1a1147] to-[#0f1729] p-6 pb-32">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <GlassPanel variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#00A3CC] shadow-[0_0_24px_rgba(0,217,255,0.4)]">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-light text-white/95 tracking-wide">Business Dashboard</h1>
                  <BusinessMemberBadge />
                </div>
                {profile && (
                  <p className="text-white/50 text-sm">
                    Welcome back to {profile.company_name}
                  </p>
                )}
              </div>
            </div>
            
            {canCreateBusinessPosts && (
              <GlassButton 
                variant="primary" 
                glow="aqua"
                size="md"
                onClick={() => openComposer()}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Insight
              </GlassButton>
            )}
          </div>
        </GlassPanel>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard
            icon={Building2}
            iconColor="text-[#00D9FF]"
            title="Company"
            subtitle={profile?.company_name || 'N/A'}
          >
            <div className="text-xs text-white/40 mt-2">
              Active organization
            </div>
          </GlassCard>

          <GlassCard
            icon={Users}
            iconColor="text-[#9D6CFF]"
            title="Team Size"
            subtitle={profile?.company_size || 'N/A'}
          >
            <div className="text-xs text-white/40 mt-2">
              Organization members
            </div>
          </GlassCard>

          <GlassCard
            icon={FileText}
            iconColor="text-[#00D9FF]"
            title="Insights"
            subtitle="0"
          >
            <div className="text-xs text-white/40 mt-2">
              Published this month
            </div>
          </GlassCard>

          <GlassCard
            icon={TrendingUp}
            iconColor="text-[#FF3B5C]"
            title="Total Views"
            subtitle="0"
          >
            <div className="text-xs text-white/40 mt-2">
              Engagement analytics
            </div>
          </GlassCard>
        </div>

        {/* Tab Navigation */}
        <GlassPanel className="p-2">
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'insights', label: 'My Insights' },
              { id: 'team', label: 'Team' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/[0.12] text-white shadow-[0_0_16px_rgba(0,217,255,0.2)]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </GlassPanel>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.05]">
                  <TrendingUp className="w-5 h-5 text-[#FF3B5C]" />
                </div>
                <h3 className="text-lg font-semibold text-white/90">Recent Activity</h3>
              </div>
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 text-sm">No recent activity to display</p>
              </div>
            </GlassPanel>

            {/* Quick Actions */}
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.05]">
                  <Settings className="w-5 h-5 text-[#9D6CFF]" />
                </div>
                <h3 className="text-lg font-semibold text-white/90">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <GlassButton 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => openComposer()}
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Create Business Insight
                </GlassButton>
                <GlassButton 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/business-profile'}
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  Edit Business Profile
                </GlassButton>
                <GlassButton 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/business-membership'}
                >
                  <Users className="w-4 h-4 mr-3" />
                  Manage Team
                </GlassButton>
              </div>
            </GlassPanel>

            {/* Business Benefits */}
            <GlassPanel variant="elevated" neonAccent="purple" className="p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3B5C] to-[#CC2E49] shadow-[0_0_16px_rgba(255,59,92,0.3)]">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white/90">Business Member Benefits</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#00D9FF]" />
                    <h4 className="font-semibold text-white/80">Content Creation</h4>
                  </div>
                  <ul className="text-sm text-white/50 space-y-2 pl-6">
                    <li>• Post Business Insights with privacy controls</li>
                    <li>• Share industry reports and whitepapers</li>
                    <li>• Create webinars and video content</li>
                    <li>• Target specific industries and departments</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#9D6CFF]" />
                    <h4 className="font-semibold text-white/80">Team Management</h4>
                  </div>
                  <ul className="text-sm text-white/50 space-y-2 pl-6">
                    <li>• Invite team members to your business</li>
                    <li>• Manage business member roles</li>
                    <li>• Control content permissions</li>
                    {isAdminRole && <li>• Admin privileges for approvals</li>}
                  </ul>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {activeTab === 'insights' && (
          <GlassPanel className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white/90 mb-3">No Business Insights Yet</h3>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Start sharing your professional knowledge and industry insights with the community.
            </p>
            <GlassButton 
              variant="primary" 
              glow="aqua"
              onClick={() => openComposer()}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Insight
            </GlassButton>
          </GlassPanel>
        )}

        {activeTab === 'team' && (
          <BusinessInvitations />
        )}

        {activeTab === 'settings' && (
          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.05]">
                <Settings className="w-5 h-5 text-[#00D9FF]" />
              </div>
              <h3 className="text-lg font-semibold text-white/90">Business Settings</h3>
            </div>
            <div className="space-y-4">
              <GlassButton 
                variant="secondary"
                onClick={() => window.location.href = '/business-profile'}
              >
                Edit Business Profile
              </GlassButton>
              {isAdminRole && (
                <div className="pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-4 w-4 text-[#FF3B5C]" />
                    <span className="text-sm font-semibold text-white/80">Admin Privileges</span>
                  </div>
                  <p className="text-xs text-white/50">
                    As a business admin, you can approve posts and manage team members.
                  </p>
                </div>
              )}
            </div>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}

export default BusinessDashboard;
