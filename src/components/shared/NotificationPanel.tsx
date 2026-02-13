import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?._id],
    queryFn: () => api.getNotifications(user!._id),
    enabled: !!user,
  });

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <span className="text-xs text-muted-foreground">{notifications.filter(n => !n.isRead).length} unread</span>
      </div>
      <ScrollArea className="max-h-80">
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
        ) : (
          notifications.slice(0, 20).map((n) => (
            <div key={n._id} className={`p-3 border-b border-border last:border-0 ${!n.isRead ? 'bg-primary/5' : ''}`}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(n.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
                {!n.isRead && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleMarkRead(n._id)}>
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationPanel;
