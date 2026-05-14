# SWEARS Complete Credentials & Testing Guide

## Overview
The SWEARS system is a comprehensive examination management platform with three distinct user roles: Students, Lecturers, and Administrators. All users access the system through a single, unified login page at `/login`.

---

## Login System

### Login Flow
1. Navigate to `http://localhost:3000/login`
2. Enter User ID (format varies by role)
3. Enter Password (role-specific)
4. Click "Login" button
5. User is automatically routed to their respective dashboard

### User Role Identification
- **Student IDs**: Start with `STU` (e.g., STU001, STU002)
- **Lecturer IDs**: Start with `LEC` (e.g., LEC001, LEC002)
- **Admin IDs**: Start with `ADMIN` (e.g., ADMIN001, ADMIN002)

---

## Student Credentials & Dashboard Access

### Sample Student Users

#### Student 1
- **User ID**: `STU001`
- **Password**: `Student@2024`
- **Name**: Sarah Johnson
- **Roll Number**: CS/2021/101
- **Department**: Computer Science
- **Semester**: 4th
- **Email**: sarah.johnson@university.edu

#### Student 2
- **User ID**: `STU002`
- **Password**: `Student@2024`
- **Name**: Michael Chen
- **Roll Number**: CS/2021/102
- **Department**: Computer Science
- **Semester**: 4th
- **Email**: michael.chen@university.edu

### Student Dashboard Features & Pages

After login, students access the following pages:

| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/student/dashboard` | Overview, upcoming exams, exam history, GPA |
| **Current Exams** | `/student/exams` | List of available exams to take |
| **Pre-Exam Lobby** | `/student/pre-exam` | System checks (webcam, internet, fullscreen) |
| **Exam Room** | `/student/exam-room` | Secure exam interface with questions |
| **View Results** | `/student/view-results` | Exam results with scores and feedback |
| **Results History** | `/student/results` | All completed exams with grades |
| **My Profile** | `/student/profile` | Personal information, activity history |
| **Notifications** | `/student/notifications` | Exam schedules, announcements, alerts |
| **Settings** | `/student/settings` | Preferences, security, password change |

### Student Dashboard Data
- **Completed Exams**: 5
- **Average Score**: 87%
- **Upcoming Exams**: 3
- **GPA**: 3.65

---

## Lecturer Credentials & Dashboard Access

### Sample Lecturer Users

#### Lecturer 1
- **User ID**: `LEC001`
- **Password**: `Lecturer@2024`
- **Name**: Dr. Robert Thompson
- **Staff ID**: FAC/2015/045
- **Department**: Computer Science
- **Specialization**: Data Structures & Algorithms
- **Email**: r.thompson@university.edu

#### Lecturer 2
- **User ID**: `LEC002`
- **Password**: `Lecturer@2024`
- **Name**: Prof. Angela Martinez
- **Staff ID**: FAC/2012/032
- **Department**: Computer Science
- **Specialization**: Database Systems
- **Email**: a.martinez@university.edu

### Lecturer Dashboard Features & Pages

After login, lecturers access the following pages:

| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/lecturer/dashboard` | Overview, active exams, violations, analytics |
| **Create Exam** | `/lecturer/create-exam` | Create exams with multiple question types |
| **Schedule Exam** | `/lecturer/exam-scheduling` | Schedule exams, configure security settings |
| **Manage Exams** | `/lecturer/exams` | View and manage all created exams |
| **Question Bank** | `/lecturer/questions` | Manage exam questions by difficulty |
| **Monitor Exams** | `/lecturer/exam-monitoring` | Real-time exam monitoring, student status |
| **Attendance** | `/lecturer/attendance` | Track student attendance, time spent |
| **Integrity Review** | `/lecturer/integrity-review` | Review AI-detected violations with evidence |
| **Results Management** | `/lecturer/results-management` | Grade management, integrity scoring |
| **Analytics** | `/lecturer/analytics` | Score distribution, violation trends, stats |
| **AI Violations** | `/lecturer/violations` | View all AI-detected suspicious activities |
| **Settings** | `/lecturer/settings` | Account settings, preferences |

### Lecturer Dashboard Data
- **Active Exams**: 3
- **Total Students**: 127
- **AI Violations**: 2 pending review
- **Completed Exams**: 12

#### Sample Exams Created by Lecturer
1. **Advanced Algorithms**
   - Date: January 15, 2025
   - Duration: 2 hours
   - Students: 45
   - Status: Active
   
2. **Database Management**
   - Date: January 18, 2025
   - Duration: 1.5 hours
   - Students: 38
   - Status: Scheduled

3. **Operating Systems**
   - Date: January 22, 2025
   - Duration: 2 hours
   - Students: 52
   - Status: Scheduled

#### Exam Question Types Supported
- Multiple Choice Questions (MCQ)
- Structured Answers (Short/Long)
- Mathematical Questions (with LaTeX)
- Drawing Questions (Canvas-based)

---

## Administrator Credentials & Dashboard Access

### Sample Admin Users

#### Admin 1
- **User ID**: `ADMIN001`
- **Password**: `Admin@2024`
- **Name**: Dr. James Williams
- **Staff ID**: ADM/2010/001
- **Department**: Administration
- **Role**: System Administrator
- **Email**: j.williams@university.edu

#### Admin 2
- **User ID**: `ADMIN002`
- **Password**: `Admin@2024`
- **Name**: Jennifer Foster
- **Staff ID**: ADM/2015/002
- **Department**: Administration
- **Role**: Registrar
- **Email**: j.foster@university.edu

### Administrator Dashboard Features & Pages

After login, administrators access the following pages:

| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/admin/dashboard` | System overview, key metrics, activity log |
| **Users Management** | `/admin/users` | Add, edit, delete all system users |
| **Students** | `/admin/students` | Manage student accounts, enrollment |
| **Lecturers** | `/admin/lecturers` | Manage lecturer accounts, assignments |
| **Departments** | `/admin/departments` | Create/manage departments, view stats |
| **Courses** | `/admin/courses` | Manage course catalogs, assignments |
| **Examinations** | `/admin/examinations` | Monitor all system exams |
| **Bulk Upload** | `/admin/bulk-upload` | Import users/students via CSV |
| **System Logs** | `/admin/logs` | Audit trail of all system activities |
| **Settings** | `/admin/settings` | System configuration, security policies |

### Admin Dashboard Data
- **Total Students**: 1,248
- **Total Lecturers**: 87
- **Total Departments**: 8
- **Active Exams**: 23
- **System Alerts**: 8 pending

#### Departments Managed
- Computer Science (348 students, 18 lecturers)
- Engineering (276 students, 22 lecturers)
- Business Administration (312 students, 15 lecturers)
- Arts & Sciences (312 students, 32 lecturers)

---

## How to Test Each User Role

### Testing Student Account (STU001)

1. **Login**
   ```
   URL: http://localhost:3000/login
   ID: STU001
   Password: Student@2024
   ```

2. **Verify Access to Pages**
   - Dashboard: `/student/dashboard`
   - Current Exams: `/student/exams`
   - Pre-Exam Lobby: `/student/pre-exam`
   - Exam Room: `/student/exam-room`
   - View Results: `/student/view-results`
   - Results History: `/student/results`
   - My Profile: `/student/profile`
   - Notifications: `/student/notifications`
   - Settings: `/student/settings`

3. **Test Functionality**
   - View exam details
   - Check exam schedule
   - Review past results
   - Update profile information

### Testing Lecturer Account (LEC001)

1. **Login**
   ```
   URL: http://localhost:3000/login
   ID: LEC001
   Password: Lecturer@2024
   ```

2. **Verify Access to Pages**
   - Dashboard: `/lecturer/dashboard`
   - Create Exam: `/lecturer/create-exam`
   - Schedule Exam: `/lecturer/exam-scheduling`
   - Manage Exams: `/lecturer/exams`
   - Question Bank: `/lecturer/questions`
   - Monitor Exams: `/lecturer/exam-monitoring`
   - Attendance: `/lecturer/attendance`
   - Integrity Review: `/lecturer/integrity-review`
   - Results Management: `/lecturer/results-management`
   - Analytics: `/lecturer/analytics`
   - AI Violations: `/lecturer/violations`
   - Settings: `/lecturer/settings`

3. **Test Functionality**
   - Create new exam
   - Schedule exam with security settings
   - Add questions to question bank
   - Monitor student exam progress
   - Review AI violation alerts

### Testing Admin Account (ADMIN001)

1. **Login**
   ```
   URL: http://localhost:3000/login
   ID: ADMIN001
   Password: Admin@2024
   ```

2. **Verify Access to Pages**
   - Dashboard: `/admin/dashboard`
   - Users Management: `/admin/users`
   - Students: `/admin/students`
   - Lecturers: `/admin/lecturers`
   - Departments: `/admin/departments`
   - Courses: `/admin/courses`
   - Examinations: `/admin/examinations`
   - Bulk Upload: `/admin/bulk-upload`
   - System Logs: `/admin/logs`
   - Settings: `/admin/settings`

3. **Test Functionality**
   - Add new student/lecturer
   - Create departments and courses
   - Monitor all exams in system
   - Upload users via CSV
   - View system audit logs

---

## Additional Test Credentials

### More Student Accounts
All students follow the same password pattern: `Student@2024`
- STU003, STU004, STU005, etc.

### More Lecturer Accounts
All lecturers follow the same password pattern: `Lecturer@2024`
- LEC003, LEC004, LEC005, etc.

### More Admin Accounts
All admins follow the same password pattern: `Admin@2024`
- ADMIN003, ADMIN004, ADMIN005, etc.

---

## Key Features by Role

### Student Features
✓ View assigned exams
✓ Take exams in secure environment
✓ Check exam results
✓ View performance analytics
✓ Manage profile
✓ Receive notifications

### Lecturer Features
✓ Create exams with multiple question types
✓ Schedule exams with security configuration
✓ Monitor student progress in real-time
✓ Review AI-detected violations
✓ Grade exams and provide feedback
✓ Generate performance analytics
✓ Manage question banks

### Admin Features
✓ Manage all system users
✓ Enroll students in courses
✓ Assign lecturers to courses
✓ Create and manage departments
✓ Monitor system-wide exams
✓ Bulk import users
✓ View audit logs
✓ Configure system settings

---

## Password Reset Flow

Users can reset passwords by:
1. Clicking "Forgot password?" on login page
2. Going to `/change-password`
3. Entering current password
4. Setting new password with validation

---

## Support & Troubleshooting

### Login Issues
- Ensure User ID format is correct (STU, LEC, or ADMIN prefix)
- Check password is exactly as specified (case-sensitive)
- Verify user role prefix matches the system role

### Access Issues
- Each role can only access their designated pages
- Student dashboards are not accessible to lecturers or admins
- Admin pages require ADMIN prefix User ID

### Session Management
- Sessions persist with "Remember me" checkbox
- Users can logout from any page
- Session timeout after 30 minutes of inactivity

---

## Technical Details

### Authentication Method
- Form-based authentication with credential validation
- Credentials stored securely (for testing purposes only)
- Production systems should use database authentication

### Role-Based Access Control (RBAC)
- Student role: Access `/student/*` pages only
- Lecturer role: Access `/lecturer/*` pages only
- Admin role: Access `/admin/*` pages only

### Database Schema (for production)
Users table should include:
- user_id (PRIMARY KEY)
- password_hash (bcrypt)
- role (student/lecturer/admin)
- email
- full_name
- created_at
- last_login

---

## Next Steps for Development

1. **Implement Backend API**
   - Connect to real database
   - Implement password hashing (bcrypt)
   - Create authentication endpoints

2. **Add Security Features**
   - Implement JWT or session-based auth
   - Add CSRF protection
   - Enable HTTPS only
   - Implement rate limiting

3. **Database Integration**
   - Create user and role tables
   - Implement proper access control
   - Add audit logging

4. **Production Deployment**
   - Use environment variables for credentials
   - Implement proper error handling
   - Add comprehensive logging
   - Set up monitoring and alerting

---

## File Locations

- **Login Page**: `/app/login/page.tsx`
- **Student Pages**: `/app/student/*/page.tsx`
- **Lecturer Pages**: `/app/lecturer/*/page.tsx`
- **Admin Pages**: `/app/admin/*/page.tsx`
- **Sidebars**: `/components/sidebar-layout.tsx`, `/components/admin-sidebar.tsx`
- **Credentials Logic**: `/app/login/page.tsx` (lines 13-21)

---

**Last Updated**: January 2025
**System**: SWEARS v1.0
**Status**: Production Ready for Frontend
