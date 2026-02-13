import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ComplaintStatus, AvailabilityStatus, EventStatus } from '@/types';

type StatusType = ComplaintStatus | AvailabilityStatus | EventStatus | 'Paid' | 'Unpaid';

const statusConfig: Record<string, { className: string }> = {
  'Submitted': { className: 'bg-info/15 text-info border-info/30' },
  'Under Review': { className: 'bg-warning/15 text-warning border-warning/30' },
  'Approved & Prioritized': { className: 'bg-accent/15 text-accent border-accent/30' },
  'Assigned': { className: 'bg-primary/15 text-primary border-primary/30' },
  'In Progress': { className: 'bg-warning/15 text-warning border-warning/30' },
  'Resolved': { className: 'bg-success/15 text-success border-success/30' },
  'Available': { className: 'bg-success/15 text-success border-success/30' },
  'On Leave': { className: 'bg-muted text-muted-foreground border-border' },
  'Upcoming': { className: 'bg-info/15 text-info border-info/30' },
  'Ongoing': { className: 'bg-warning/15 text-warning border-warning/30' },
  'Completed': { className: 'bg-success/15 text-success border-success/30' },
  'Paid': { className: 'bg-success/15 text-success border-success/30' },
  'Unpaid': { className: 'bg-destructive/15 text-destructive border-destructive/30' },
  'Low': { className: 'bg-muted text-muted-foreground border-border' },
  'Medium': { className: 'bg-warning/15 text-warning border-warning/30' },
  'High': { className: 'bg-destructive/15 text-destructive border-destructive/30' },
  'Emergency': { className: 'bg-destructive text-destructive-foreground border-destructive' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || { className: 'bg-muted text-muted-foreground' };
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
