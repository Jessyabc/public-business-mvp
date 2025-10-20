import { Badge } from '@/components/ui/badge';
import { Building2, Crown } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface BusinessMemberBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export function BusinessMemberBadge({ className, showIcon = true }: BusinessMemberBadgeProps) {
  const { isBusinessMember, isAdmin } = useUserRoles();
  
  if (!isBusinessMember() && !isAdmin()) {
    return null;
  }

  const isAdminRole = isAdmin();

  return (
    <Badge 
      variant="secondary" 
      className={`bg-accent text-accent-foreground ${className}`}
    >
      {showIcon && (
        isAdminRole ? (
          <Crown className="h-3 w-3 mr-1" />
        ) : (
          <Building2 className="h-3 w-3 mr-1" />
        )
      )}
      {isAdminRole ? 'Business Admin' : 'Business Member'}
    </Badge>
  );
}