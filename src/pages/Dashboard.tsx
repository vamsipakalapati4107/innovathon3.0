import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import StaffDashboard from './StaffDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    case 'student': return <StudentDashboard />;
    case 'technician': return <TechnicianDashboard />;
    case 'staff': return <StaffDashboard />;
    default: return <AdminDashboard />;
  }
};

export default Dashboard;
