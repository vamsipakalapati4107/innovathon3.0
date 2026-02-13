import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollege } from '@/contexts/CollegeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { DEPARTMENTS } from '@/types';
import type { Department, AvailabilityStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

const WorkerForm = () => {
  const navigate = useNavigate();
  const { college } = useCollege();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState<Department>('Electrical');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college?._id) return;
    try {
      await api.createWorker({
        name,
        phone,
        department,
        role,
        experience: Number(experience),
        joiningDate,
        collegeId: college._id,
        availabilityStatus: 'Available',
      });
      toast({ title: 'Worker Added', description: `${name} added successfully` });
      navigate('/workers');
    } catch {
      toast({ title: 'Error', description: 'Failed to add worker', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/workers')}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
      <Card>
        <CardHeader><CardTitle className="font-display">Add New Worker</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} required /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={department} onValueChange={v => setDepartment(v as Department)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Role</Label><Input value={role} onChange={e => setRole(e.target.value)} required placeholder="e.g. Senior Technician" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Experience (years)</Label><Input type="number" value={experience} onChange={e => setExperience(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Joining Date</Label><Input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} required /></div>
            </div>
            <Button type="submit" className="w-full">Add Worker</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerForm;
