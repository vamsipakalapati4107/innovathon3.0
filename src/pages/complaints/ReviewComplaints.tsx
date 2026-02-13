import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StatusBadge from '@/components/shared/StatusBadge';
import { Search, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Complaint, PriorityLevel, Worker, Department } from '@/types';
import { DEPARTMENTS } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ReviewComplaints = () => {
  const { user } = useAuth();
  const { college } = useCollege();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('Medium');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { data: complaints = [] } = useQuery({
    queryKey: ['complaints', college?._id],
    queryFn: () => api.getComplaints(college!._id),
    enabled: !!college && user?.role === 'admin',
    retry: false,
  });

  const { data: technicians = [], isLoading: isLoadingTechnicians, error: techniciansError } = useQuery({
    queryKey: ['technicians', selectedComplaint?.category, college?._id],
    queryFn: async () => {
      if (!selectedComplaint || !college) {
        throw new Error('Missing complaint or college');
      }
      const dept = selectedComplaint.category;
      const collegeId = college._id;
      
      console.log('=== Fetching Technicians ===');
      console.log('Department:', dept);
      console.log('College ID:', collegeId);
      console.log('Complaint:', selectedComplaint);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('Auth token exists:', !!token);
      console.log('User data exists:', !!user);
      
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      try {
        const result = await api.getTechniciansByDepartment(dept, collegeId);
        console.log(`✓ Successfully loaded ${result.length} technicians for department "${dept}"`);
        return result;
      } catch (error) {
        console.error('✗ API Error loading technicians:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    },
    enabled: !!selectedComplaint && !!college && isAssignDialogOpen && !!selectedComplaint.category,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Complaint>) =>
      api.updateComplaint(selectedComplaint!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', selectedComplaint!._id] });
      setIsReviewDialogOpen(false);
      setIsAssignDialogOpen(false);
      setSelectedComplaint(null);
      setAdminRemarks('');
      setSelectedTechnician('');
      toast({ title: 'Success', description: 'Complaint updated successfully' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update complaint', variant: 'destructive' }),
  });

  const filtered = complaints.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                       c.category.toLowerCase().includes(search.toLowerCase()) ||
                       (c.studentName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingComplaints = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review');
  const newComplaintsCount = complaints.filter(c => c.status === 'Submitted').length;

  const handleReview = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setPriorityLevel(complaint.priorityLevel || 'Medium');
    setAdminRemarks(complaint.adminRemarks || '');
    setIsReviewDialogOpen(true);
  };

  const handleAssign = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setSelectedTechnician(complaint.technicianId || '');
    setIsAssignDialogOpen(true);
    // Reset technician selection when opening dialog
    if (!complaint.technicianId) {
      setSelectedTechnician('');
    }
  };

  const handleReviewSubmit = () => {
    if (!selectedComplaint) return;
    updateMutation.mutate({
      status: 'Under Review',
      priorityLevel,
      adminRemarks: adminRemarks || undefined,
      reviewTimestamp: new Date().toISOString(),
      approvalTimestamp: new Date().toISOString(),
    });
  };

  const handleAssignSubmit = () => {
    if (!selectedComplaint || !selectedTechnician) {
      toast({ title: 'Error', description: 'Please select a technician', variant: 'destructive' });
      return;
    }
    const technician = technicians.find(t => t._id === selectedTechnician);
    if (!technician) {
      toast({ title: 'Error', description: 'Selected technician not found', variant: 'destructive' });
      return;
    }
    updateMutation.mutate({
      technicianId: selectedTechnician,
      technicianName: technician.name,
      status: 'Assigned',
      assignedTimestamp: new Date().toISOString(),
    });
  };

  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Review Complaints</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} total • {newComplaintsCount} new submissions
          </p>
        </div>
        {newComplaintsCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">{newComplaintsCount} new complaint{newComplaintsCount > 1 ? 's' : ''} require review</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search complaints..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Submitted">Submitted ({complaints.filter(c => c.status === 'Submitted').length})</SelectItem>
            <SelectItem value="Under Review">Under Review ({complaints.filter(c => c.status === 'Under Review').length})</SelectItem>
            <SelectItem value="Assigned">Assigned ({complaints.filter(c => c.status === 'Assigned').length})</SelectItem>
            <SelectItem value="In Progress">In Progress ({complaints.filter(c => c.status === 'In Progress').length})</SelectItem>
            <SelectItem value="Resolved">Resolved ({complaints.filter(c => c.status === 'Resolved').length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-muted-foreground">{c.studentName || 'Unknown'}</TableCell>
                  <TableCell className="text-muted-foreground">{c.category}</TableCell>
                  <TableCell>{c.priorityLevel ? <StatusBadge status={c.priorityLevel} /> : '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      {(c.status === 'Submitted' || c.status === 'Under Review') && (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(c.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.technicianName || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/complaints/${c._id}`)}
                      >
                        View
                      </Button>
                      {(c.status === 'Submitted' || c.status === 'Under Review') && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReview(c)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Review
                          </Button>
                          {c.status === 'Under Review' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAssign(c)}
                            >
                              <UserPlus className="h-3 w-3 mr-1" /> Assign
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No complaints found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Complaint</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{selectedComplaint.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedComplaint.description}</p>
              </div>
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select value={priorityLevel} onValueChange={v => setPriorityLevel(v as PriorityLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Admin Remarks (Optional)</Label>
                <Textarea 
                  value={adminRemarks} 
                  onChange={e => setAdminRemarks(e.target.value)}
                  placeholder="Add any remarks or notes..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReviewSubmit} disabled={updateMutation.isPending}>
                  Approve & Prioritize
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{selectedComplaint.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Category: {selectedComplaint.category}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Select Technician</Label>
                {isLoadingTechnicians ? (
                  <div className="p-3 rounded-md bg-muted">
                    <p className="text-sm text-muted-foreground">Loading technicians...</p>
                  </div>
                ) : techniciansError ? (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">
                      Error loading technicians
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      {techniciansError instanceof Error ? techniciansError.message : 'Failed to load technicians'}
                    </p>
                    {techniciansError instanceof Error && techniciansError.message.includes('authenticated') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          window.location.href = '/login';
                        }}
                      >
                        Go to Login
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Troubleshooting:
                      <br />• Check browser console (F12) for detailed errors
                      <br />• Ensure backend is running on port 5000
                      <br />• Try logging out and logging back in
                    </p>
                  </div>
                ) : technicians.length === 0 ? (
                  <div className="p-3 rounded-md bg-muted">
                    <p className="text-sm text-muted-foreground font-medium">
                      No technicians available for {selectedComplaint.category} department.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please add technicians with department "{selectedComplaint.category}" in the Workers section.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                      <SelectTrigger><SelectValue placeholder="Select a technician" /></SelectTrigger>
                      <SelectContent>
                        {technicians.map((tech) => (
                          <SelectItem key={tech._id} value={tech._id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{tech.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({tech.availabilityStatus})
                                {tech.phone && ` • ${tech.phone}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {technicians.filter(t => t.availabilityStatus === 'Available').length} available,{' '}
                      {technicians.filter(t => t.availabilityStatus === 'Assigned').length} assigned
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignSubmit} 
                  disabled={updateMutation.isPending || technicians.length === 0}
                >
                  Assign Technician
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewComplaints;
