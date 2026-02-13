import { useState } from 'react';
import { useCollege } from '@/contexts/CollegeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import { Plus, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Salary, SalaryRecipientType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const SalaryManagement = () => {
  const { college } = useCollege();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: salaries = [] } = useQuery({
    queryKey: ['salaries', college?._id, user?._id, user?.role],
    queryFn: () => user?.role === 'technician' ? api.getMySalaries() : api.getSalaries(college!._id),
    enabled: user?.role === 'technician' ? !!user : !!college,
    retry: false,
  });

  const filtered = salaries.filter(s => statusFilter === 'all' || s.paymentStatus === statusFilter);

  const [base, setBase] = useState('');
  const [bonus, setBonus] = useState('');
  const [deductions, setDeductions] = useState('');
  const [recipientType, setRecipientType] = useState<SalaryRecipientType>('worker');
  const [recipientId, setRecipientId] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddSalary = async () => {
    if (!college?._id || !recipientId || !month) {
      toast({ title: 'Error', description: 'Select recipient and month', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const baseNum = Number(base) || 0;
      const bonusNum = Number(bonus) || 0;
      const deductionsNum = Number(deductions) || 0;
      await api.createSalary({
        recipientId,
        recipientType,
        month,
        baseSalary: baseNum,
        bonus: bonusNum,
        deductions: deductionsNum,
        collegeId: college._id,
      });
      toast({ title: 'Salary record added', description: 'Payment record created successfully' });
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      setDialogOpen(false);
      setBase('');
      setBonus('');
      setDeductions('');
      setRecipientId('');
      setRecipientType('worker');
      setMonth('');
    } catch (err) {
      console.error('Error creating salary:', err);
      toast({ title: 'Error', description: 'Failed to add salary', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Paid' | 'Unpaid' }) => 
      api.updateSalary(id, { paymentStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      toast({ title: 'Updated', description: 'Payment status updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update payment status', variant: 'destructive' });
    },
  });

  const handleUpdatePaymentStatus = (id: string, currentStatus: 'Paid' | 'Unpaid') => {
    const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    updatePaymentStatusMutation.mutate({ id, status: newStatus });
  };

  const { data: workers = [] } = useQuery({
    queryKey: ['workers', college?._id],
    queryFn: () => api.getWorkers(college!._id),
    enabled: !!college && !!dialogOpen && recipientType === 'worker',
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians', college?._id],
    queryFn: () => api.getTechnicians(college!._id),
    enabled: !!college && !!dialogOpen && recipientType === 'technician',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            {user?.role === 'admin' ? 'Salary Management' : 'My Salary'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} records</p>
        </div>
        {user?.role === 'admin' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Salary</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="font-display">Add Payment Record</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Recipient Type</Label>
                  <Select value={recipientType} onValueChange={(value) => {
                    setRecipientType(value as SalaryRecipientType);
                    setRecipientId(''); // Reset selection when type changes
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worker">Worker (Internal Staff)</SelectItem>
                      <SelectItem value="technician">Technician (External Contractor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{recipientType === 'worker' ? 'Worker' : 'Technician'}</Label>
                  <Select value={recipientId} onValueChange={setRecipientId}>
                    <SelectTrigger><SelectValue placeholder={`Select ${recipientType}`} /></SelectTrigger>
                    <SelectContent>
                      {recipientType === 'worker' 
                        ? workers.map(w => (
                            <SelectItem key={w._id} value={w._id}>
                              {w.name} ({w.department})
                            </SelectItem>
                          ))
                        : technicians.map(t => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.name} ({t.department}) - {t.companyName || 'External'}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Input type="month" value={month} onChange={e => setMonth(e.target.value)} required />
                </div>
                <div className="grid gap-4 grid-cols-3">
                  <div className="space-y-2">
                    <Label>Base Salary</Label>
                    <Input type="number" min="0" value={base} onChange={e => setBase(e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bonus</Label>
                    <Input type="number" min="0" value={bonus} onChange={e => setBonus(e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Deductions</Label>
                    <Input type="number" min="0" value={deductions} onChange={e => setDeductions(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Payment: <span className="font-bold text-foreground text-lg">
                      ₹{((Number(base) || 0) + (Number(bonus) || 0) - (Number(deductions) || 0)).toLocaleString()}
                    </span>
                  </p>
                </div>
                <Button className="w-full" onClick={handleAddSalary} disabled={loading}>
                  {loading ? 'Saving...' : 'Create Payment Record'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Paid">Paid</SelectItem>
          <SelectItem value="Unpaid">Unpaid</SelectItem>
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Bonus</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                {user?.role === 'admin' && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === 'admin' ? 9 : 8} className="text-center py-8 text-muted-foreground">
                    No salary records found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(s => {
                  const recipientName = s.recipientName || s.workerName || 'Unknown';
                  const recipientType = s.recipientType || (s.workerId ? 'worker' : 'technician');
                  return (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">
                      {recipientName}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${
                        recipientType === 'technician'
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {recipientType === 'technician' ? 'Technician' : 'Worker'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.month}</TableCell>
                    <TableCell className="text-right">₹{s.baseSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">+₹{s.bonus.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">-₹{s.deductions.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold">₹{s.totalSalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.paymentStatus} />
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdatePaymentStatus(s._id, s.paymentStatus)}
                          disabled={updatePaymentStatusMutation.isPending}
                          className={s.paymentStatus === 'Paid' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {s.paymentStatus === 'Paid' ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Mark Unpaid
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Mark Paid
                            </>
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryManagement;
