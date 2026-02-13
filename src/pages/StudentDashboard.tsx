import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import CampusMapPreview from '@/components/dashboard/CampusMapPreview';
import { Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Complaint } from '@/types';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: complaints = [] } = useQuery({
    queryKey: ['myComplaints', user?._id],
    queryFn: () => api.getMyComplaints(user!._id),
    enabled: !!user,
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.fullName}</p>
        </div>
        <Button onClick={() => navigate('/complaints/new')}>
          <Plus className="h-4 w-4 mr-2" /> New Complaint
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> My Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complaints.slice(0, 5).map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/complaints/${c._id}`)}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.category} • {new Date(c.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.priorityLevel && <StatusBadge status={c.priorityLevel} />}
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
              {complaints.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No complaints yet</p>
              )}
              {complaints.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate('/complaints')}
                >
                  View All Complaints ({complaints.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <CampusMapPreview />
      </div>
    </div>
  );
};

export default StudentDashboard;
