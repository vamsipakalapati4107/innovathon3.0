import { useCollege } from '@/contexts/CollegeContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DepartmentVacancy } from '@/types';
import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VacancyManagement = () => {
  const { college } = useCollege();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', college?._id],
    queryFn: () => api.getDepartments(college!._id),
    enabled: !!college,
    retry: false,
  });

  const totalVacancies = departments.reduce((sum, d) => sum + d.vacancyCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Vacancy Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{totalVacancies} total vacancies across departments</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-center">Required</TableHead>
                <TableHead className="text-center">Current</TableHead>
                <TableHead className="text-center">Vacancies</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map(d => (
                <TableRow key={d._id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {d.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {editing === d._id ? (
                      <Input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-20 mx-auto text-center" />
                    ) : d.requiredCount}
                  </TableCell>
                  <TableCell className="text-center">{d.currentCount}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn('font-bold', d.vacancyCount > 0 ? 'text-destructive' : 'text-success')}>
                      {d.vacancyCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    {d.vacancyCount > 0 ? (
                      <Badge variant="destructive" className="text-xs">Understaffed</Badge>
                    ) : (
                      <Badge className="bg-success/15 text-success border-success/30 text-xs" variant="outline">Full</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editing === d._id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          disabled={saving}
                          onClick={async () => {
                            setSaving(true);
                            try {
                              await api.updateDepartment(d._id, { requiredCount: Number(editValue) });
                              queryClient.invalidateQueries({ queryKey: ['departments', college?._id] });
                              setEditing(null);
                              toast({ title: 'Updated', description: 'Department updated' });
                            } catch {
                              toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
                            } finally {
                              setSaving(false);
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(d._id); setEditValue(String(d.requiredCount)); }}>Edit</Button>
                    )}
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

export default VacancyManagement;
