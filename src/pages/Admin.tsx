import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Page } from '@/ui/layouts/Page';
import { GlassCard } from '@/ui/components/GlassCard';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Shield,
  Database,
  Mail,
  Globe
} from 'lucide-react';

interface AdminSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  links: { label: string; to: string; external?: boolean }[];
}

function AdminSection({ title, description, icon: Icon, links }: AdminSectionProps) {
  const navigate = useNavigate();
  
  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Button
                key={link.to}
                variant="outline"
                size="sm"
                onClick={() => {
                  if (link.external) {
                    window.open(link.to, '_blank');
                  } else {
                    navigate(link.to);
                  }
                }}
              >
                {link.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Admin() {
  const { isAdmin, loading } = useUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin()) {
      navigate('/public/profile', { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <Page>
        <div className="pt-8 text-center">
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </Page>
    );
  }

  if (!isAdmin()) {
    return null;
  }

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions.',
      icon: Users,
      links: [
        { label: 'All Users', to: '/admin/users' },
        { label: 'User Roles', to: '/admin/roles' },
        { label: 'Public Members', to: '/members/public-members' },
        { label: 'Business Members', to: '/members/business-members' },
      ],
    },
    {
      title: 'Business Management',
      description: 'Oversee business profiles, invitations, and approvals.',
      icon: Building2,
      links: [
        { label: 'Business Profiles', to: '/admin/business-profiles' },
        { label: 'Pending Approvals', to: '/admin/approvals' },
        { label: 'Invitations', to: '/admin/invitations' },
        { label: 'Create Business', to: '/create-business' },
      ],
    },
    {
      title: 'Content Management',
      description: 'Manage posts, brainstorms, reports, and content moderation.',
      icon: FileText,
      links: [
        { label: 'All Posts', to: '/admin/posts' },
        { label: 'Brainstorms', to: '/public/brainstorms' },
        { label: 'Reports', to: '/business/reports' },
        { label: 'Content Moderation', to: '/admin/moderation' },
      ],
    },
    {
      title: 'Analytics & Insights',
      description: 'View platform analytics, user engagement, and performance metrics.',
      icon: BarChart3,
      links: [
        { label: 'Dashboard', to: '/business/dashboard' },
        { label: 'User Analytics', to: '/admin/analytics/users' },
        { label: 'Content Analytics', to: '/admin/analytics/content' },
        { label: 'Performance', to: '/admin/analytics/performance' },
      ],
    },
    {
      title: 'Platform Settings',
      description: 'Configure platform settings, features, and system preferences.',
      icon: Settings,
      links: [
        { label: 'General Settings', to: '/admin/settings' },
        { label: 'Feature Flags', to: '/admin/features' },
        { label: 'Email Templates', to: '/admin/email-templates' },
        { label: 'Site Configuration', to: '/admin/site-config' },
      ],
    },
    {
      title: 'Support & Help',
      description: 'Manage support tickets, help documentation, and user assistance.',
      icon: HelpCircle,
      links: [
        { label: 'Help Center', to: '/support/help-center' },
        { label: 'Support Tickets', to: '/admin/support/tickets' },
        { label: 'FAQ Management', to: '/support/faq' },
        { label: 'Community Guidelines', to: '/support/community' },
      ],
    },
    {
      title: 'Security & Privacy',
      description: 'Monitor security, manage privacy settings, and handle security incidents.',
      icon: Shield,
      links: [
        { label: 'Security Logs', to: '/admin/security/logs' },
        { label: 'Privacy Settings', to: '/admin/privacy' },
        { label: 'Data Export', to: '/admin/data-export' },
        { label: 'Incident Reports', to: '/admin/security/incidents' },
      ],
    },
    {
      title: 'Database & System',
      description: 'Database administration, backups, and system monitoring.',
      icon: Database,
      links: [
        { label: 'Supabase Dashboard', to: 'https://supabase.com/dashboard/project/opjltuyirkbbpwgkavjq', external: true },
        { label: 'Database Health', to: '/admin/database/health' },
        { label: 'System Status', to: '/admin/system/status' },
        { label: 'Backup Management', to: '/admin/backups' },
      ],
    },
  ];

  return (
    <Page>
      <div className="space-y-6 pt-8" role="main">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Comprehensive administrative controls for Public Business platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4 text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">--</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Building2 className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">--</div>
            <div className="text-sm text-muted-foreground">Businesses</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">--</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">--</div>
            <div className="text-sm text-muted-foreground">Active Today</div>
          </GlassCard>
        </div>

        {/* Admin Sections */}
        <div className="space-y-6">
          {adminSections.map((section) => (
            <AdminSection key={section.title} {...section} />
          ))}
        </div>

        {/* Footer Info */}
        <GlassCard className="p-6 text-center">
          <Globe className="w-6 h-6 text-primary mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Platform Access</h3>
          <p className="text-muted-foreground mb-4">
            As an admin, you have access to all platform features and can switch between Public and Business modes.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => navigate('/public/profile')}>
              Public View
            </Button>
            <Button variant="outline" onClick={() => navigate('/business/dashboard')}>
              Business View
            </Button>
          </div>
        </GlassCard>
      </div>
    </Page>
  );
}