import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import VisualTimeline from '@/components/shared/VisualTimeline';
import ImageUpload from '@/components/shared/ImageUpload';
import { ArrowLeft, Phone } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Complaint } from '@/types';

const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [afterImage, setAfterImage] = useState('');

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => api.getComplaint(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Complaint>) => api.updateComplaint(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({ title: 'Updated', description: 'Complaint updated successfully' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive font-medium">Complaint not found</p>
            <p className="text-sm text-muted-foreground mt-2">
              The complaint you're looking for doesn't exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timelineSteps = [
    { label: 'Submitted', timestamp: complaint.submittedAt, completed: true, description: `By ${complaint.studentName || 'Student'}` },
    { label: 'Under Review', timestamp: complaint.reviewTimestamp, completed: !!complaint.reviewTimestamp },
    { label: 'Approved & Prioritized', timestamp: complaint.approvalTimestamp, completed: !!complaint.approvalTimestamp, description: complaint.adminRemarks ? `Remarks: ${complaint.adminRemarks}` : undefined },
    { label: 'Assigned', timestamp: complaint.assignedTimestamp, completed: !!complaint.assignedTimestamp, description: complaint.technicianName ? `To: ${complaint.technicianName}` : undefined },
    { label: 'In Progress', timestamp: complaint.arrivalTimestamp, completed: !!complaint.arrivalTimestamp, active: complaint.status === 'In Progress' },
    { label: 'Resolved', timestamp: complaint.resolvedTimestamp, completed: complaint.status === 'Resolved' },
  ];

  const handleMarkArrived = () => {
    updateMutation.mutate({
      status: 'In Progress',
      arrivalTimestamp: new Date().toISOString(),
    });
  };

  const handleSubmitResolution = () => {
    updateMutation.mutate({
      status: 'Resolved',
      ...(afterImage ? { afterImage } : {}),
      resolvedTimestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">{complaint.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{complaint.category} • ID: {complaint._id}</p>
        </div>
        <div className="flex gap-2">
          {complaint.priorityLevel && <StatusBadge status={complaint.priorityLevel} />}
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Description</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{complaint.description}</p></CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm font-display">Before Image</CardTitle></CardHeader>
              <CardContent>
                {complaint.beforeImage ? (
                  <img src={complaint.beforeImage} alt="Before" className="rounded-lg w-full h-48 object-cover" />
                ) : (
                  <div className="h-48 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">No image</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-display">After Image</CardTitle></CardHeader>
              <CardContent>
                {complaint.afterImage ? (
                  <img src={complaint.afterImage} alt="After" className="rounded-lg w-full h-48 object-cover" />
                ) : user?.role === 'technician' && complaint.status === 'In Progress' ? (
                  <ImageUpload value={afterImage} onChange={setAfterImage} label="Upload resolution image" />
                ) : (
                  <div className="h-48 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">Pending resolution</div>
                )}
              </CardContent>
            </Card>
          </div>

          {user?.role === 'technician' && complaint.status === 'Assigned' && (
            <Card>
              <CardContent className="p-4">
                <Button className="w-full" onClick={handleMarkArrived} disabled={updateMutation.isPending}>
                  Mark Arrived at Location
                </Button>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" /> Admin contact will appear after marking arrival
                </div>
              </CardContent>
            </Card>
          )}

          {user?.role === 'technician' && complaint.status === 'In Progress' && (
            <Button className="w-full" onClick={handleSubmitResolution} disabled={updateMutation.isPending}>
              Submit Resolution
            </Button>
          )}

          {user?.role === 'admin' && complaint.status === 'Submitted' && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-display font-semibold">Review & Approve</h3>
                <div className="flex gap-2">
                  <Button onClick={() => updateMutation.mutate({ status: 'Under Review', reviewTimestamp: new Date().toISOString() })} disabled={updateMutation.isPending}>
                    Approve & Prioritize
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.role === 'admin' && complaint.afterImage && !complaint.resolutionApproved && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-display font-semibold">Resolution Approval</h3>
                <div className="flex gap-2">
                  <Button onClick={() => updateMutation.mutate({ status: 'Resolved', resolutionApproved: true })} disabled={updateMutation.isPending}>
                    Approve Resolution
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Timeline</CardTitle></CardHeader>
          <CardContent>
            <VisualTimeline steps={timelineSteps} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintDetail;
