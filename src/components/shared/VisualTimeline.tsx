import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check } from 'lucide-react';

interface TimelineStep {
  label: string;
  timestamp?: string;
  description?: string;
  active?: boolean;
  completed?: boolean;
}

const VisualTimeline = ({ steps }: { steps: TimelineStep[] }) => (
  <div className="space-y-0">
    {steps.map((step, i) => (
      <div key={i} className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className={cn(
            'h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2',
            step.completed
              ? 'bg-success text-success-foreground border-success'
              : step.active
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted text-muted-foreground border-border'
          )}>
            {step.completed ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={cn('w-0.5 flex-1 min-h-[2rem]', step.completed ? 'bg-success' : 'bg-border')} />
          )}
        </div>
        <div className="pb-6 pt-1">
          <p className={cn('text-sm font-medium', step.completed || step.active ? 'text-foreground' : 'text-muted-foreground')}>
            {step.label}
          </p>
          {step.timestamp && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(step.timestamp), 'MMM d, yyyy h:mm a')}
            </p>
          )}
          {step.description && (
            <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default VisualTimeline;
