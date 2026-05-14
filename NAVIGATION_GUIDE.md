# SWEARS - Navigation and Page Flow Guide

## System Overview

The SWEARS (Secure Web-Based Examination and Automated Results System) is a professional examination management platform with three distinct user portals: **Student**, **Lecturer**, and **Admin**.

---

## Main Entry Points

### 1. Landing Page (`/`)
- **Purpose**: Introduction to the system
- **Navigation**: 
  - Features section with system overview
  - Login button in the top navigation
  - Call-to-action buttons

### 2. Login Page (`/login`)
- **Purpose**: User authentication portal
- **User Types**: Three tabs to select user role
  - **Student**: Redirects to `/student/dashboard`
  - **Lecturer**: Redirects to `/lecturer/dashboard`
  - **Admin**: Redirects to `/admin/dashboard`
- **Features**: 
  - Dynamic placeholder text based on selected role
  - Remember me option
  - Forgot password link

---

## Student Portal (`/student`)

### Structure
- **Layout**: Sidebar navigation on the left
- **Main Pages**: 

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/student/dashboard` | Overview of enrolled exams, recent results, notifications |
| Current Exams | `/student/exams` | List of ongoing and upcoming exams |
| Results | `/student/results` | Completed exam results with scores and analysis |
| Notifications | `/student/notifications` | System alerts and announcements |
| Settings | `/student/settings` | Profile and preference management |

### Navigation Flow
```
Login → Student Dashboard
  ├── Current Exams
  ├── Results
  ├── Notifications
  └── Settings
```

---

## Lecturer Portal (`/lecturer`)

### Structure
- **Layout**: Sidebar navigation on the left
- **Main Pages**:

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/lecturer/dashboard` | Exam management, violations overview, student status |
| Examinations | `/lecturer/exams` | Create and manage exams, question assignments |
| Question Bank | `/lecturer/questions` | Manage exam questions by difficulty and usage |
| AI Violations | `/lecturer/violations` | Review suspicious activities detected during exams |
| Results | `/lecturer/results` | Exam analytics, student performance reports |
| Settings | `/lecturer/settings` | Exam preferences, proctoring options |

### Navigation Flow
```
Login → Lecturer Dashboard
  ├── Examinations
  ├── Question Bank
  ├── AI Violations
  ├── Results
  └── Settings
```

---

## Admin Portal (`/admin`)

### Structure
- **Layout**: Dark sidebar navigation (professional institutional design)
- **Sidebar Links**:

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/admin/dashboard` | System overview, activity logs, department summary |
| Students | `/admin/students` | Manage all enrolled students, status tracking |
| Lecturers | `/admin/lecturers` | Faculty management, course assignments |
| Departments | `/admin/departments` | Academic department management and statistics |
| Courses | `/admin/courses` | Course catalog management and enrollment |
| Examinations | `/admin/examinations` | Monitor all system exams, status tracking |
| System Logs | `/admin/logs` | System activity audit trail and event logging |
| Settings | `/admin/settings` | System configuration, security, email setup |

### Navigation Flow
```
Login → Admin Dashboard
  ├── Students
  ├── Lecturers
  ├── Departments
  ├── Courses
  ├── Examinations
  ├── System Logs
  └── Settings
```

### Admin Dashboard Features
- **Overview Cards**: 
  - Total Students
  - Total Lecturers
  - Active Exams
  - System Alerts
- **Recent Activity Table**: System events and actions
- **Department Summary**: Overview of all departments
- **Quick Actions**: Common administrative tasks

---

## Design System

### Color Palette
- **Primary Blue**: Deep institutional blue (`oklch(0.27 0.12 263)`)
- **Secondary**: Medium blue (`oklch(0.5 0.08 263)`)
- **Background**: Light neutral (`oklch(0.98 0 0)`)
- **Sidebar**: Dark blue background with light text
- **Accent Colors**: Status badges (green for active/success, red for errors, orange for alerts)

### Typography
- **Font Family**: Geist (sans-serif) throughout
- **Headings**: Bold, dark blue text
- **Body**: Regular weight, medium gray text
- **Muted**: Light gray for secondary information

### Components
- Professional table layouts with hover effects
- Status badges with color coding
- Card-based layouts for information grouping
- Consistent button styling across all portals
- Responsive design for mobile and desktop

---

## Key Navigation Features

### All Portals Include:
1. **Sidebar Navigation**: Persistent navigation on the left
2. **Current Page Indicator**: Active link highlighted
3. **Logout Button**: Located in sidebar footer (except landing page)
4. **Consistent Styling**: Professional academic design throughout

### Responsive Design
- Desktop: Full sidebar + main content area
- Mobile: Sidebar collapses/stacks above content
- Tablet: Adjusted layout for medium screens

---

## User Flow Summary

### First-Time User
```
Landing Page (/) 
  → Click "Login" 
  → Login Page (/login) 
  → Select user type 
  → Dashboard
```

### Returning User
```
Direct to Login Page (/login) 
  → Dashboard 
  → Sidebar navigation to specific features
```

### Admin Workflow Example
```
Admin Dashboard (/admin/dashboard)
  → Students (/admin/students) - review enrollment
  → Departments (/admin/departments) - monitor departments
  → Examinations (/admin/examinations) - track exams
  → System Logs (/admin/logs) - audit activities
  → Settings (/admin/settings) - configure system
```

---

## Technical Architecture

### Page Organization
```
app/
├── page.tsx (Landing)
├── login/
│   └── page.tsx (Login - shared entry)
├── student/
│   ├── layout.tsx (Sidebar wrapper)
│   ├── dashboard/
│   ├── exams/
│   ├── results/
│   ├── notifications/
│   └── settings/
├── lecturer/
│   ├── layout.tsx (Sidebar wrapper)
│   ├── dashboard/
│   ├── exams/
│   ├── questions/
│   ├── violations/
│   ├── results/
│   └── settings/
└── admin/
    ├── layout.tsx (Dark sidebar wrapper)
    ├── dashboard/
    ├── students/
    ├── lecturers/
    ├── departments/
    ├── courses/
    ├── examinations/
    ├── logs/
    └── settings/
```

### Shared Components
- `sidebar-layout.tsx`: Student/Lecturer sidebar
- `admin-sidebar.tsx`: Admin sidebar with dark theme
- UI components from shadcn/ui

---

## Styling Details

### Admin Sidebar (Dark Professional Theme)
- Background: Dark blue (`--sidebar: oklch(0.15 0 0)`)
- Text: Light color (`--sidebar-foreground: oklch(0.96 0 0)`)
- Active state: Bright primary blue background
- Hover effects: Smooth transitions with accent color

### Content Areas
- Clean white/light background
- Generous padding and spacing
- Card-based layouts for organization
- Professional table designs with proper hierarchy

### Status Indicators
- **Success/Active**: Green background, dark green text
- **Alert/Warning**: Orange background, dark orange text
- **Error**: Red background, dark red text
- **Info**: Blue background, dark blue text

---

## Notes for Developers

1. **All login routes use `/login` page** with tab selection
2. **Each portal has its own sidebar** - separate components for styling
3. **Professional academic design** - minimal decorations, focus on information hierarchy
4. **No fake analytics** - placeholder data structured like real tables
5. **Consistent spacing** - uses Tailwind's spacing scale
6. **No gradients** - solid colors for professional appearance
7. **Responsive tables** - horizontal scroll on mobile, proper alignment
8. **Accessibility** - semantic HTML, proper color contrast, readable fonts

---

## Future Enhancement Points

1. Real database integration with user authentication
2. API routes for data management
3. Real-time exam monitoring features
4. Advanced analytics and reporting
5. Email notification system
6. Mobile app version
7. Dark mode support
8. Multi-language support
