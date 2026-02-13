import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Building } from 'lucide-react';
import type { CampusEvent } from '@/types';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.getEvent(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive font-medium">Event not found</p>
            <p className="text-sm text-muted-foreground mt-2">
              The event you're looking for doesn't exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Events
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-display flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                {event.eventName}
              </CardTitle>
              <div className="mt-2">
                <StatusBadge status={event.status} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">{new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>

            {(event.startTime || event.endTime) && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="text-base">
                    {event.startTime && event.endTime 
                      ? `${event.startTime} - ${event.endTime}`
                      : event.startTime || event.endTime || 'Not specified'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-base">{event.location}</p>
              </div>
            </div>

            {event.block && (
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Block</p>
                  <p className="text-base font-medium">Block {event.block}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Workers Required</p>
                <p className="text-base">
                  {event.workerCount !== undefined && event.workerCount !== null && event.workerCount !== ''
                    ? `${event.workerCount} worker${event.workerCount !== 1 ? 's' : ''}`
                    : event.assignedWorkers?.length 
                      ? `${event.assignedWorkers.length} assigned`
                      : 'Not specified'}
                </p>
                {event.assignedWorkers && event.assignedWorkers.length > 0 && event.workerCount !== undefined && event.workerCount !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.assignedWorkers.length} worker{event.assignedWorkers.length !== 1 ? 's' : ''} assigned
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
              <p className="text-base whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Assigned Workers */}
          {event.assignedWorkers && event.assignedWorkers.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">Assigned Workers</p>
              <div className="space-y-2">
                {event.assignedWorkers.map((workerId: string) => (
                  <div key={workerId} className="p-2 rounded border text-sm">
                    Worker ID: {workerId}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department Assignments */}
          {event.departmentAssignments && Object.keys(event.departmentAssignments).length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">Department Assignments</p>
              <div className="space-y-2">
                {Object.entries(event.departmentAssignments).map(([dept, workers]: [string, any]) => (
                  <div key={dept} className="p-2 rounded border">
                    <p className="text-sm font-medium">{dept}</p>
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(workers) ? `${workers.length} worker${workers.length !== 1 ? 's' : ''}` : 'No workers'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetail;
