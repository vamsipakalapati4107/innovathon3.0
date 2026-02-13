import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollege } from '@/contexts/CollegeContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EventForm = () => {
  const navigate = useNavigate();
  const { college } = useCollege();
  const { toast } = useToast();
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [block, setBlock] = useState('');
  const [description, setDescription] = useState('');
  const [workerCount, setWorkerCount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college?._id) return;
    setLoading(true);
    try {
      const eventData = { 
        eventName, 
        date, 
        startTime, 
        endTime, 
        location, 
        block: block.trim(), 
        description, 
        workerCount: workerCount && workerCount.trim() !== '' ? Number(workerCount) : null,
        collegeId: college._id 
      };
      console.log('Submitting event data:', eventData);
      await api.createEvent(eventData);
      toast({ title: 'Event Created', description: `${eventName} created successfully` });
      navigate('/events');
    } catch (err) {
      console.error('Error creating event:', err);
      toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/events')}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
      <Card>
        <CardHeader><CardTitle className="font-display">Create Event</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input value={eventName} onChange={e => setEventName(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Block</Label>
                <Input value={block} onChange={e => setBlock(e.target.value)} placeholder="e.g., A, B, C" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g., Auditorium, Hall" />
              </div>
              <div className="space-y-2">
                <Label>Workers Required</Label>
                <Input type="number" min="0" value={workerCount} onChange={e => setWorkerCount(e.target.value)} placeholder="Number of workers" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>Create Event</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventForm;
