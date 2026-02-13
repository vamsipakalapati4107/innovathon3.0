import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollege } from '@/contexts/CollegeContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/shared/StatusBadge';
import { Plus, Search, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CampusEvent } from '@/types';

const EventList = () => {
  const { college } = useCollege();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const { data: events = [] } = useQuery({
    queryKey: ['events', college?._id],
    queryFn: () => api.getEvents(college!._id),
    enabled: !!college,
    retry: false,
  });

  const filtered = events.filter(e => {
    const matchSearch = e.eventName.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || e.status === tab;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Events</h1>
          <p className="text-muted-foreground text-sm mt-1">{events.length} total events</p>
        </div>
        <Button onClick={() => navigate('/events/new')}>
          <Plus className="h-4 w-4 mr-2" /> Create Event
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="Ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="Completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{e.eventName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-muted-foreground">{new Date(e.date).toLocaleDateString()}</div>
                      {e.startTime && e.endTime && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {e.startTime} - {e.endTime}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.block && e.block.trim() !== '' ? <span className="font-medium">{e.block}</span> : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.location}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">
                        {e.workerCount !== undefined && e.workerCount !== null && e.workerCount !== '' 
                          ? e.workerCount 
                          : (e.assignedWorkers && e.assignedWorkers.length > 0 ? e.assignedWorkers.length : 0)}
                      </span>
                      {e.assignedWorkers && e.assignedWorkers.length > 0 && e.workerCount !== undefined && e.workerCount !== null && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({e.assignedWorkers.length} assigned)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={e.status} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/events/${e._id}`)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventList;
