import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/shared/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { DEPARTMENTS } from '@/types';
import type { Department } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ComplaintNew = () => {
  const { user } = useAuth();
  const { college } = useCollege();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Department>('Electrical');
  const [beforeImage, setBeforeImage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id || !college?._id) return;
    try {
      await api.createComplaint({
        title,
        description,
        category,
        beforeImage: beforeImage || undefined,
        studentId: user._id,
        studentName: user.fullName,
        collegeId: college._id,
      });
      toast({ title: 'Complaint Submitted', description: 'Your complaint has been submitted for review.' });
      navigate('/complaints');
    } catch {
      toast({ title: 'Error', description: 'Failed to submit complaint', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Submit a Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Brief title of the issue" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="Detailed description..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={v => setCategory(v as Department)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Before Image</Label>
              <ImageUpload value={beforeImage} onChange={setBeforeImage} label="Upload image of the issue" />
            </div>
            <Button type="submit" className="w-full">Submit Complaint</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintNew;
