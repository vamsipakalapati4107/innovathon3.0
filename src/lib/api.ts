import axios, { type AxiosInstance } from 'axios';
import type {
  College, LoginPayload, User, Worker, Technician, DepartmentVacancy,
  Complaint, CampusEvent, Salary, Notification, AdminStats, Room,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // Don't redirect on login endpoint failures
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors (backend not running, CORS, etc.)
    if (!err.response) {
      console.error('Network error details:', {
        code: err.code,
        message: err.message,
        config: err.config,
      });
      
      const networkMsg = err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED'
        ? 'Cannot connect to server. Please ensure the backend is running on port 5000.'
        : `Network error: ${err.message || err.code || 'Unknown error'}. Please check your connection and ensure the backend server is running.`;
      throw new Error(networkMsg);
    }
    
    const msg = err.response?.data?.message || err.message || err.response?.statusText || 'An error occurred';
    throw new Error(msg);
  }
);

export const api = {
  login(data: LoginPayload) {
    return client.post<{ user: User; token: string }>('/auth/login', data) as Promise<{ user: User; token: string }>;
  },

  getColleges() {
    return client.get<College[]>('/colleges') as Promise<College[]>;
  },

  getCollege(id: string) {
    return client.get<College>(`/colleges/${id}`) as Promise<College>;
  },

  getWorkers(collegeId: string) {
    return client.get<Worker[]>(`/workers?collegeId=${collegeId}`) as Promise<Worker[]>;
  },

  getTechnicians(collegeId: string) {
    return client.get<Technician[]>(`/technicians?collegeId=${collegeId}`) as Promise<Technician[]>;
  },

  getWorker(id: string) {
    return client.get<Worker>(`/workers/${id}`) as Promise<Worker>;
  },

  createWorker(data: Partial<Worker>) {
    return client.post<Worker>('/workers', data) as Promise<Worker>;
  },

  updateWorker(id: string, data: Partial<Worker>) {
    return client.put<Worker>(`/workers/${id}`, data) as Promise<Worker>;
  },

  deleteWorker(id: string) {
    return client.delete<void>(`/workers/${id}`) as Promise<void>;
  },

  getDepartments(collegeId: string) {
    return client.get<DepartmentVacancy[]>(`/departments?collegeId=${collegeId}`) as Promise<DepartmentVacancy[]>;
  },

  updateDepartment(id: string, data: Partial<DepartmentVacancy>) {
    return client.put<DepartmentVacancy>(`/departments/${id}`, data) as Promise<DepartmentVacancy>;
  },

  getComplaints(collegeId: string) {
    return client.get<Complaint[]>(`/complaints?collegeId=${collegeId}`) as Promise<Complaint[]>;
  },

  getComplaint(id: string) {
    return client.get<Complaint>(`/complaints/${id}`) as Promise<Complaint>;
  },

  createComplaint(data: Partial<Complaint>) {
    return client.post<Complaint>('/complaints', data) as Promise<Complaint>;
  },

  updateComplaint(id: string, data: Partial<Complaint>) {
    return client.put<Complaint>(`/complaints/${id}`, data) as Promise<Complaint>;
  },

  getMyComplaints(userId: string) {
    return client.get<Complaint[]>(`/complaints/user/${userId}`) as Promise<Complaint[]>;
  },

  getTechnicianComplaints(userId: string) {
    return client.get<Complaint[]>(`/complaints/technician/${userId}`) as Promise<Complaint[]>;
  },

  getTechniciansByDepartment(department: string, collegeId: string) {
    const url = `/complaints/technicians?department=${encodeURIComponent(department)}&collegeId=${encodeURIComponent(collegeId)}`;
    console.log('Fetching technicians from:', url);
    return client.get<Worker[]>(url) as Promise<Worker[]>;
  },

  getEvents(collegeId: string) {
    return client.get<CampusEvent[]>(`/events?collegeId=${collegeId}`) as Promise<CampusEvent[]>;
  },

  getEvent(id: string) {
    return client.get<CampusEvent>(`/events/${id}`) as Promise<CampusEvent>;
  },

  createEvent(data: Partial<CampusEvent>) {
    return client.post<CampusEvent>('/events', data) as Promise<CampusEvent>;
  },

  updateEvent(id: string, data: Partial<CampusEvent>) {
    return client.put<CampusEvent>(`/events/${id}`, data) as Promise<CampusEvent>;
  },

  getSalaries(collegeId: string) {
    return client.get<Salary[]>(`/salaries?collegeId=${collegeId}`) as Promise<Salary[]>;
  },

  getMySalaries() {
    return client.get<Salary[]>('/salaries/me') as Promise<Salary[]>;
  },

  getWorkerSalaries(workerId: string) {
    return client.get<Salary[]>(`/salaries/worker/${workerId}`) as Promise<Salary[]>;
  },

  createSalary(data: Partial<Salary>) {
    return client.post<Salary>('/salaries', data) as Promise<Salary>;
  },

  updateSalary(id: string, data: Partial<Salary>) {
    return client.put<Salary>(`/salaries/${id}`, data) as Promise<Salary>;
  },

  getNotifications(userId: string) {
    return client.get<Notification[]>(`/notifications/${userId}`) as Promise<Notification[]>;
  },

  markNotificationRead(id: string) {
    return client.put<void>(`/notifications/${id}/read`) as Promise<void>;
  },

  getAdminStats(collegeId: string) {
    return client.get<AdminStats>(`/dashboard/stats?collegeId=${collegeId}`) as Promise<AdminStats>;
  },

  getMapData(collegeId: string) {
    return client.get<Room[]>(`/rooms/map-data?collegeId=${collegeId}`) as Promise<Room[]>;
  },

  getRooms(collegeId: string) {
    return client.get<Room[]>(`/rooms?collegeId=${collegeId}`) as Promise<Room[]>;
  },

  getRoom(id: string) {
    return client.get<Room>(`/rooms/${id}`) as Promise<Room>;
  },
};
