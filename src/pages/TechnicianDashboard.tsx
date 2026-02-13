import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { AlertTriangle, Calendar, DollarSign, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCollege } from '@/contexts/CollegeContext';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const { college } = useCollege();
  const navigate = useNavigate();

  const { data: complaints = [] } = useQuery({
    queryKey: ['complaints', 'technician', user?._id],
    queryFn: () => api.getTechnicianComplaints(user!._id),
    enabled: !!user && user.role === 'technician',
  });

  const { data: salaries = [] } = useQuery({
    queryKey: ['salaries', 'technician', user?._id],
    queryFn: () => api.getMySalaries(),
    enabled: !!user,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', college?._id],
    queryFn: () => api.getEvents(college!._id),
    enabled: !!college,
  });

  // Complaints are already filtered by technician in the API
  const assignedComplaints = complaints;
  const myEvents = events.filter((e: { assignedWorkers: string[] }) => e.assignedWorkers?.includes(user?._id || ''));
  const lastSalary = salaries.length > 0 ? salaries[salaries.length - 1] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Technician Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome, {user?.fullName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Assigned Tasks" value={assignedComplaints.length} icon={AlertTriangle} gradient="bg-gradient-to-br from-primary to-primary/80" />
        <StatCard title="My Events" value={myEvents.length} icon={Calendar} gradient="bg-gradient-to-br from-info to-info/80" />
        <StatCard
          title="Last Salary"
          value={lastSalary ? `₹${(lastSalary.totalSalary / 1000).toFixed(0)}K` : '—'}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-success to-success/80"
        />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-display">Assigned Complaints</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {assignedComplaints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No complaints assigned to you</p>
          ) : (
            assignedComplaints.map((c: { _id: string; title: string; category: string; status: string; priorityLevel?: string }) => (
              <div key={c._id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.priorityLevel && <StatusBadge status={c.priorityLevel} />}
                  <StatusBadge status={c.status} />
                  {c.status === 'Assigned' && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/complaints/${c._id}`)}>
                      <MapPin className="h-3 w-3 mr-1" /> Mark Arrived
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicianDashboard;
