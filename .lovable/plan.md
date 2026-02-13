

# Enterprise Campus Operations Management Platform — Frontend

## Overview
A comprehensive React frontend for a multi-college campus operations management system. The UI will connect to your external Node.js/Express/MongoDB API via REST calls. All data fetching will use configurable API base URLs so you can point to your backend.

---

## 1. Global Setup & Configuration
- API service layer with configurable base URL, JWT token management, and interceptors for auth headers
- React Query for data fetching/caching across all modules
- Protected route wrapper that checks JWT and user role
- Global layout with sidebar navigation, top bar with notifications bell, and user menu
- Dark mode support throughout
- Responsive design (desktop + tablet + mobile)

---

## 2. College Selection Homepage
- Modern SaaS landing page with college cards (logo, name, location)
- Search/filter colleges
- "Access Portal" button redirects to that college's login page
- College context stored globally after selection

---

## 3. Authentication Pages
- **Login page**: Full name, PIN, college email fields
- Client-side email domain validation (reject gmail/yahoo, allow only selected college's domain)
- Role selection (Student / Technician / Admin / Staff)
- JWT stored securely, role-based redirect after login
- Logout functionality

---

## 4. Admin Dashboard
- **Stats cards** with gradients: total workers, available workers, active events, salary payout, vacancies, complaints
- **Charts** (using Recharts, already installed):
  - Department-wise worker distribution (bar/pie)
  - Worker performance ratings (bar chart)
  - Monthly salary expense trend (line chart)
  - Complaint analytics (status breakdown, resolution times)
- Recent activity feed
- Quick action buttons

---

## 5. Complaint Management Module
- **Student view**: Submit complaint form (with before-image upload via your Cloudinary endpoint), track status with visual timeline
- **Admin view**: Review queue, set priority (Low/Medium/High/Emergency), add remarks, approve & assign to technician
- **Technician view**: See assigned complaints, mark "Arrived" (saves timestamp, shows admin contact), upload after-image, submit resolution
- **Admin resolution approval**: Side-by-side before/after images, approve/reject closure
- **Complaint detail page**: Full visual timeline with all timestamps, remarks, images, student & technician info
- Status flow: Submitted → Under Review → Approved & Prioritized → Assigned → In Progress → Resolved

---

## 6. Worker Management Module
- Worker list with filters (department, availability status)
- Add/edit/delete worker forms
- Worker detail page: assigned complaints, assigned events, performance rating, workload
- Availability status toggle (Available / Assigned / On Leave)

---

## 7. Vacancy Management Module
- Department table showing required count, current count, vacancy count
- Admin can edit required worker counts per department
- Visual indicators for departments with vacancies

---

## 8. Event Management Module
- Event list with status tabs (Upcoming / Ongoing / Completed)
- Create/edit event form (name, date, location, description)
- Worker assignment interface: select workers by department, assign multiples
- Event detail page showing assigned workers and status
- Workers see their assigned events on their dashboard

---

## 9. Salary Management Module
- **Admin view**: Add salary record per worker (base salary, bonus, deductions, auto-calculated total), set payment status
- Salary table with filters by month, department, payment status
- **Worker view**: Salary history list with monthly breakdown

---

## 10. Notification System UI
- Notification bell in top bar with unread count badge
- Notification dropdown/panel listing recent notifications
- Mark as read functionality
- Notification types: complaint updates, event assignments, salary payments, escalations, admin remarks

---

## 11. Role-Based Dashboards
- **Student Dashboard**: My complaints (with status tracking), notifications
- **Technician Dashboard**: Assigned complaints, assigned events, salary history, arrival/resolution actions
- **Admin Dashboard**: Full analytics, all management modules accessible
- **Staff Dashboard**: Complaints, events, notifications

---

## 12. Shared Components
- Visual timeline component (for complaint history)
- Image upload component (integrates with your Cloudinary API endpoint)
- Data tables with sorting, filtering, pagination
- Stat cards with gradient backgrounds
- Status badges
- Confirmation dialogs for destructive actions

