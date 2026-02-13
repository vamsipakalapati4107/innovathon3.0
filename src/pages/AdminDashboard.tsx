import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import StatCard from '@/components/shared/StatCard';
import { Users, UserCheck, Calendar, DollarSign, Building2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import type { AdminStats } from '@/types';

const CHART_COLORS = [
  'hsl(234, 85%, 55%)', 'hsl(160, 70%, 40%)', 'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)', 'hsl(210, 100%, 52%)', 'hsl(280, 60%, 50%)', 'hsl(180, 60%, 40%)'
];

const defaultStats: AdminStats = {
  totalWorkers: 0,
  availableWorkers: 0,
  activeEvents: 0,
  totalSalaryPayout: 0,
  totalVacancies: 0,
  totalComplaints: 0,
  complaintsByStatus: { 'Submitted': 0, 'Under Review': 0, 'Approved & Prioritized': 0, 'Assigned': 0, 'In Progress': 0, 'Resolved': 0 },
  workersByDepartment: { Cleaning: 0, Electrical: 0, Plumbing: 0, Infrastructure: 0, Security: 0, 'Washroom Maintenance': 0, HVAC: 0 },
  monthlyExpenses: [{ month: 'Jan', amount: 0 }, { month: 'Feb', amount: 0 }],
  workerPerformance: [{ name: 'Cleaning', rating: 0 }, { name: 'Electrical', rating: 0 }, { name: 'Plumbing', rating: 0 }, { name: 'Infra', rating: 0 }, { name: 'Security', rating: 0 }, { name: 'Washroom', rating: 0 }, { name: 'HVAC', rating: 0 }],
};

const AdminDashboard = () => {
  const { college } = useCollege();
  const { data: stats = defaultStats } = useQuery({
    queryKey: ['adminStats', college?._id],
    queryFn: () => api.getAdminStats(college!._id),
    enabled: !!college,
    retry: false,
  });

  const deptData = Object.entries(stats.workersByDepartment).map(([name, value]) => ({ name, value }));
  const complaintData = Object.entries(stats.complaintsByStatus).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of campus operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Workers" value={stats.totalWorkers} icon={Users} gradient="bg-gradient-to-br from-primary to-primary/80" />
        <StatCard title="Available" value={stats.availableWorkers} icon={UserCheck} gradient="bg-gradient-to-br from-success to-success/80" />
        <StatCard title="Active Events" value={stats.activeEvents} icon={Calendar} gradient="bg-gradient-to-br from-info to-info/80" />
        <StatCard title="Salary Payout" value={`₹${(stats.totalSalaryPayout / 1000).toFixed(0)}K`} icon={DollarSign} gradient="bg-gradient-to-br from-warning to-warning/80" />
        <StatCard title="Vacancies" value={stats.totalVacancies} icon={Building2} gradient="bg-gradient-to-br from-accent to-accent/80" />
        <StatCard title="Complaints" value={stats.totalComplaints} icon={AlertTriangle} gradient="bg-gradient-to-br from-destructive to-destructive/80" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Workers by Department</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                  {deptData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Complaint Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={complaintData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(234, 85%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Monthly Salary Expense</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="amount" stroke="hsl(160, 70%, 40%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Worker Performance by Dept</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.workerPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="rating" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
