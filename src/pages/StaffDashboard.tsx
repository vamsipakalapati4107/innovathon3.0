import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import CampusMapPreview from '@/components/dashboard/CampusMapPreview';
import { AlertTriangle, Calendar } from 'lucide-react';
import { useCollege } from '@/contexts/CollegeContext';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { college } = useCollege();
  const navigate = useNavigate();

  const { data: complaints = [] } = useQuery({
    queryKey: ['complaints', college?._id],
    queryFn: () => api.getComplaints(college!._id),
    enabled: !!college,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', college?._id],
    queryFn: () => api.getEvents(college!._id),
    enabled: !!college,
  });

  const recentComplaints = complaints.slice(0, 5);
  const upcomingEvents = events
    .filter((e: { status: string; date: string }) => e.status === 'Upcoming' || e.status === 'Ongoing')
    .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome, {user?.fullName}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Recent Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No complaints yet</p>
            ) : (
              <div className="space-y-2">
                {recentComplaints.map((c: { _id: string; title: string; status: string }) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/complaints/${c._id}`)}
                  >
                    <span className="text-sm font-medium truncate flex-1">{c.title}</span>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((e: { _id: string; eventName: string; date: string; startTime?: string; endTime?: string; location: string; block?: string; workerCount?: number }) => (
                  <div key={e._id} className="p-2 rounded border">
                    <p className="text-sm font-medium">{e.eventName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString()}
                      {e.startTime && e.endTime && ` • ${e.startTime} - ${e.endTime}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {e.block && `Block ${e.block} • `}{e.location}
                      {e.workerCount !== undefined && ` • ${e.workerCount} workers`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <CampusMapPreview />
      </div>
    </div>
  );
};

export default StaffDashboard;
