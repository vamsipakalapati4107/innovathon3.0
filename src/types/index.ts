// ==================== College ====================
export interface College {
  _id: string;
  name: string;
  logo: string;
  location: string;
  emailDomain: string;
  description?: string;
}

// ==================== User / Auth ====================
export type UserRole = 'student' | 'technician' | 'admin' | 'staff';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  pin: string;
  role: UserRole;
  collegeId: string;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  fullName: string;
  pin: string;
  email: string;
  role: UserRole;
  collegeId: string;
}

// ==================== Worker ====================
export type AvailabilityStatus = 'Available' | 'Assigned' | 'On Leave';

export type Department =
  | 'Cleaning'
  | 'Electrical'
  | 'Plumbing'
  | 'Infrastructure'
  | 'Security'
  | 'Washroom Maintenance'
  | 'HVAC';

export const DEPARTMENTS: Department[] = [
  'Cleaning',
  'Electrical',
  'Plumbing',
  'Infrastructure',
  'Security',
  'Washroom Maintenance',
  'HVAC',
];

export interface Worker {
  _id: string;
  name: string;
  phone: string;
  department: Department;
  role: string;
  experience: number;
  joiningDate: string;
  availabilityStatus: AvailabilityStatus;
  complaintsAssigned: string[];
  eventsAssigned: string[];
  performanceRating: number;
  collegeId: string;
}

export interface Technician {
  _id: string;
  name: string;
  phone: string;
  department: Department;
  role: string;
  experience: number;
  joiningDate: string;
  availabilityStatus: AvailabilityStatus;
  complaintsAssigned: string[];
  eventsAssigned: string[];
  performanceRating: number;
  collegeId: string;
  companyName?: string | null;
  isInternal: boolean;
  userId?: string | null;
}

// ==================== Department / Vacancy ====================
export interface DepartmentVacancy {
  _id: string;
  name: Department;
  requiredCount: number;
  currentCount: number;
  vacancyCount: number;
  collegeId: string;
}

// ==================== Complaint ====================
export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved & Prioritized'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: Department;
  status: ComplaintStatus;
  priorityLevel?: PriorityLevel;
  studentId: string;
  studentName?: string;
  technicianId?: string;
  technicianName?: string;
  adminRemarks?: string;
  beforeImage?: string;
  afterImage?: string;
  resolutionApproved?: boolean;
  resolutionTime?: number;
  submittedAt: string;
  reviewTimestamp?: string;
  approvalTimestamp?: string;
  assignedTimestamp?: string;
  arrivalTimestamp?: string;
  resolvedTimestamp?: string;
  collegeId: string;
  roomId?: string;
}

// ==================== Room ====================
export type RoomStatus = 'Available' | 'Under Maintenance' | 'Event Ongoing' | 'Reserved';

export interface Room {
  _id: string;
  roomName: string;
  block: string;
  floor: number;
  status: RoomStatus;
  activeComplaintId?: string | null;
  activeEventId?: string | null;
  collegeId: string;
  capacity?: number | null;
  roomType?: string;
  statusColor?: string;
  complaint?: {
    _id: string;
    title: string;
    description: string;
    status: string;
    priorityLevel?: PriorityLevel;
    submittedAt: string;
    technicianInfo?: {
      name: string;
      phone: string;
      company?: string;
    };
    estimatedResolutionTime?: string | null;
  } | null;
  event?: {
    _id: string;
    eventName: string;
    date: string;
    description: string;
    status: string;
  } | null;
}

// ==================== Event ====================
export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed';

export interface CampusEvent {
  _id: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  block?: string;
  description: string;
  workerCount: number;
  assignedWorkers: string[];
  departmentAssignments: Record<string, string[]>;
  status: EventStatus;
  collegeId: string;
  roomId?: string;
}

// ==================== Salary ====================
export type SalaryRecipientType = 'worker' | 'technician';

export interface Salary {
  _id: string;
  recipientId: string; // Can be workerId or technicianId
  recipientType: SalaryRecipientType;
  recipientName?: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  totalSalary: number;
  paymentStatus: 'Paid' | 'Unpaid';
  collegeId: string;
  // Legacy fields for backward compatibility
  workerId?: string;
  workerName?: string;
}

// ==================== Notification ====================
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'complaint' | 'event' | 'salary' | 'escalation' | 'remark';
  isRead: boolean;
  relatedEntityId?: string;
  timestamp: string;
}

// ==================== Dashboard Stats ====================
export interface AdminStats {
  totalWorkers: number;
  availableWorkers: number;
  activeEvents: number;
  totalSalaryPayout: number;
  totalVacancies: number;
  totalComplaints: number;
  complaintsByStatus: Record<ComplaintStatus, number>;
  workersByDepartment: Record<string, number>;
  monthlyExpenses: { month: string; amount: number }[];
  workerPerformance: { name: string; rating: number }[];
}
