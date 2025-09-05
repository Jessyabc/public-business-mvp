import { useEffect, useState } from 'react';
import { GlassCard } from '@/ui/components/GlassCard';
import { notificationService, type MockNotification } from '@/services/mock';
import { SkeletonList } from '@/ui/feedback/Skeleton';
import { Bell, Brain, FileText, Settings, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function Notifications() {
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      const data = notificationService.listNotifications();
      setNotifications(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const getNotificationIcon = (type: MockNotification['type']) => {
    switch (type) {
      case 'brainstorm':
        return Brain;
      case 'report':
        return FileText;
      case 'system':
        return Settings;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: MockNotification['type']) => {
    switch (type) {
      case 'brainstorm':
        return 'text-blue-500';
      case 'report':
        return 'text-green-500';
      case 'system':
        return 'text-orange-500';
      default:
        return 'text-primary';
    }
  };

  if (loading) {
    return (
      <div className="pt-8">
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your activity</p>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => {
          const IconComponent = getNotificationIcon(notification.type);
          const iconColor = getNotificationColor(notification.type);
          
          return (
            <GlassCard 
              key={notification.id}
              className={cn(
                'transition-opacity duration-200',
                notification.read ? 'opacity-60' : 'opacity-100'
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  notification.read ? 'bg-muted/20' : 'bg-primary/10'
                )}>
                  <IconComponent className={cn('w-5 h-5', iconColor)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm leading-relaxed',
                    notification.read ? 'text-muted-foreground' : 'text-foreground'
                  )}>
                    {notification.text}
                  </p>
                  
                  <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <GlassCard className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet</p>
        </GlassCard>
      )}
    </div>
  );
}