import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  gradient?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, gradient }: Props) => (
  <Card className={cn(
    'relative overflow-hidden p-5',
    gradient || 'bg-card'
  )}>
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className={cn('text-sm font-medium', gradient ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
          {title}
        </p>
        <p className={cn('text-2xl font-display font-bold', gradient ? 'text-primary-foreground' : 'text-foreground')}>
          {value}
        </p>
        {trend && (
          <p className={cn('text-xs', gradient ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {trend}
          </p>
        )}
      </div>
      <div className={cn(
        'p-2.5 rounded-lg',
        gradient ? 'bg-primary-foreground/20' : 'bg-primary/10'
      )}>
        <Icon className={cn('h-5 w-5', gradient ? 'text-primary-foreground' : 'text-primary')} />
      </div>
    </div>
  </Card>
);

export default StatCard;
