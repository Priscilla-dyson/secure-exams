# SWEARS Testing Guide

## Quick Start

The application is fully functional and running. Open the preview to test all pages and features.

---

## Testing Checklist

### 1. Landing Page (`/`)
- [ ] Verify header with SWEARS logo
- [ ] Check navigation links (Features, Institutional Access, Support, Login)
- [ ] Confirm "Enter Portal" button navigates to login
- [ ] Verify features section displays correctly
- [ ] Check responsive layout on mobile

### 2. Login Page (`/login`)
- [ ] **Student Tab**: 
  - [ ] Tab selection highlights correctly
  - [ ] Placeholder shows "Enter your university ID"
  - [ ] "Access Portal" button works
  - [ ] Clicking redirects to `/student/dashboard`
  
- [ ] **Lecturer Tab**:
  - [ ] Tab selection highlights correctly
  - [ ] Placeholder shows "Enter your university ID"
  - [ ] "Access Portal" button works
  - [ ] Clicking redirects to `/lecturer/dashboard`
  
- [ ] **Admin Tab**:
  - [ ] Tab selection highlights correctly
  - [ ] Placeholder shows "Enter admin ID"
  - [ ] "Access Portal" button works
  - [ ] Clicking redirects to `/admin/dashboard`

- [ ] Verify layout (split view on desktop, stacked on mobile)
- [ ] Check "Remember me" checkbox works
- [ ] Verify "Forgot password?" link is present

---

## Student Portal Testing (`/student`)

### Dashboard (`/student/dashboard`)
- [ ] Page loads with sidebar navigation
- [ ] Title: "Dashboard" with welcome message
- [ ] Overview cards display:
  - [ ] Enrolled Exams card
  - [ ] Active Exams card
  - [ ] Completed Exams card
  - [ ] Notifications card
- [ ] Table displays exam history with:
  - [ ] Course name
  - [ ] Date
  - [ ] Score
  - [ ] Status badge (completed/pending)
- [ ] Quick actions buttons work
- [ ] Responsive on mobile

### Navigation
- [ ] Current Exams link in sidebar
- [ ] Results link in sidebar
- [ ] Notifications link in sidebar
- [ ] Settings link in sidebar
- [ ] Active link is highlighted

### Current Exams (`/student/exams`)
- [ ] Page title and description
- [ ] Exam cards display:
  - [ ] Exam title
  - [ ] Date and time
  - [ ] Duration
  - [ ] Exam type badge
  - [ ] "Start Exam" button
- [ ] Sorting/filtering works

### Results (`/student/results`)
- [ ] Completed exams table with:
  - [ ] Exam name
  - [ ] Date taken
  - [ ] Score/percentage
  - [ ] Grade
  - [ ] Time spent
- [ ] Detailed analysis cards for each result
- [ ] Download/print buttons (if implemented)

### Notifications (`/student/notifications`)
- [ ] Notification list displays correctly
- [ ] Timestamps shown (e.g., "2 hours ago")
- [ ] Read/unread status indicators
- [ ] Notification types (info, alert, success)
- [ ] Notification categories filter

### Settings (`/student/settings`)
- [ ] Profile section editable
- [ ] Password change form
- [ ] Notification preferences toggles
- [ ] Theme/appearance options
- [ ] Privacy settings
- [ ] Save button functionality

---

## Lecturer Portal Testing (`/lecturer`)

### Dashboard (`/lecturer/dashboard`)
- [ ] Page loads with sidebar navigation
- [ ] Title: "Dashboard"
- [ ] Exam management cards:
  - [ ] Total exams
  - [ ] Students taught
  - [ ] Pending violations
  - [ ] Completed exams
- [ ] Recent exam table with status
- [ ] Violation alerts section
- [ ] Quick actions (Create Exam, etc.)

### Navigation
- [ ] Examinations link
- [ ] Question Bank link
- [ ] AI Violations link
- [ ] Results link
- [ ] Settings link
- [ ] Active link highlighted

### Examinations (`/lecturer/exams`)
- [ ] List of created exams
- [ ] Exam cards with:
  - [ ] Exam title
  - [ ] Course code
  - [ ] Date
  - [ ] Number of questions
  - [ ] Enrolled students count
  - [ ] Status (scheduled/ongoing/completed)
- [ ] "Create Exam" button present
- [ ] Edit/delete options per exam

### Question Bank (`/lecturer/questions`)
- [ ] Questions organized by course
- [ ] Question details:
  - [ ] Question ID
  - [ ] Question text
  - [ ] Difficulty level
  - [ ] Type (MCQ/Short Answer/etc.)
  - [ ] Times used
- [ ] Add/Edit/Delete buttons
- [ ] Search functionality

### AI Violations (`/lecturer/violations`)
- [ ] Violation alerts list
- [ ] Violation cards with:
  - [ ] Student name
  - [ ] Exam name
  - [ ] Type of violation
  - [ ] Severity level (red/orange/yellow badges)
  - [ ] Evidence/details
  - [ ] Timestamp
- [ ] Action buttons (Review, Mark Clear, etc.)

### Results (`/lecturer/results`)
- [ ] Exam results table with:
  - [ ] Exam name
  - [ ] Date held
  - [ ] Number of students
  - [ ] Average score
  - [ ] Pass rate
- [ ] Class analytics cards
- [ ] Performance distribution chart
- [ ] Export results option

### Settings (`/lecturer/settings`)
- [ ] Exam settings (duration, auto-save)
- [ ] Proctoring options
- [ ] Question categories
- [ ] Default settings for new exams
- [ ] Integration options

---

## Admin Portal Testing (`/admin`)

### Dashboard (`/admin/dashboard`)
- [ ] Dark sidebar theme applied
- [ ] Page title: "Dashboard"
- [ ] Overview cards (4 cards):
  - [ ] Total Students card (blue)
  - [ ] Total Lecturers card (indigo)
  - [ ] Active Exams card (purple)
  - [ ] System Alerts card (red)
- [ ] Each card displays:
  - [ ] Icon
  - [ ] Value/count
  - [ ] Trend indicator
- [ ] Recent Activity table:
  - [ ] Timestamp
  - [ ] Action description
  - [ ] Status badges
- [ ] Quick Actions panel with:
  - [ ] Create Exam
  - [ ] Enroll Students
  - [ ] View Reports
  - [ ] System Logs
- [ ] Department Summary table with:
  - [ ] Department name
  - [ ] Student count
  - [ ] Lecturer count
  - [ ] Active exams

### Navigation (Sidebar)
- [ ] Dashboard link
- [ ] Students link
- [ ] Lecturers link
- [ ] Departments link
- [ ] Courses link
- [ ] Examinations link
- [ ] System Logs link
- [ ] Settings link
- [ ] Active link highlighted
- [ ] Logout button at bottom

### Students (`/admin/students`)
- [ ] Page title: "Students"
- [ ] Search bar functional
- [ ] Add Student button present
- [ ] Student table with columns:
  - [ ] Student ID
  - [ ] Name
  - [ ] Email
  - [ ] Department
  - [ ] Status (active/inactive badges)
  - [ ] Enrollment date
  - [ ] Actions menu (three dots)
- [ ] Pagination (if needed)
- [ ] Responsive layout

### Lecturers (`/admin/lecturers`)
- [ ] Page title: "Lecturers"
- [ ] Search functionality
- [ ] Add Lecturer button
- [ ] Lecturer table with:
  - [ ] Lecturer ID
  - [ ] Name
  - [ ] Email
  - [ ] Department
  - [ ] Number of courses
  - [ ] Status badge
  - [ ] Actions menu
- [ ] Department filtering (optional)

### Departments (`/admin/departments`)
- [ ] Page title: "Departments"
- [ ] Department cards grid with:
  - [ ] Department name
  - [ ] Head name
  - [ ] Status badge
  - [ ] Quick stats (students, lecturers, courses)
- [ ] Detailed table view with:
  - [ ] Department code
  - [ ] Name
  - [ ] Head
  - [ ] Total members
  - [ ] Course count
- [ ] Add Department button

### Courses (`/admin/courses`)
- [ ] Page title: "Courses"
- [ ] Search functionality
- [ ] Add Course button
- [ ] Course table with:
  - [ ] Course code
  - [ ] Title
  - [ ] Department
  - [ ] Lecturer
  - [ ] Student count
  - [ ] Status badge
  - [ ] Actions menu
- [ ] Filter by department (optional)

### Examinations (`/admin/examinations`)
- [ ] Page title: "Examinations"
- [ ] Search bar functional
- [ ] Create Exam button
- [ ] Exams table with:
  - [ ] Exam ID
  - [ ] Title
  - [ ] Course
  - [ ] Lecturer
  - [ ] Date
  - [ ] Student count
  - [ ] Status badge (scheduled/ongoing/completed)
  - [ ] Actions menu
- [ ] Color-coded status badges

### System Logs (`/admin/logs`)
- [ ] Page title: "System Logs"
- [ ] Export Logs button
- [ ] Logs table with:
  - [ ] Timestamp (formatted)
  - [ ] Action type
  - [ ] User who performed action
  - [ ] Details/description
  - [ ] Type badge (success/alert/error/info)
- [ ] Chronological ordering
- [ ] Search/filter functionality
- [ ] Professional monospace font for timestamps

### Settings (`/admin/settings`)
- [ ] Page title: "Settings"
- [ ] Multiple settings sections:
  - [ ] Examination Settings
  - [ ] Security Settings
  - [ ] Notification Settings
  - [ ] Email Configuration
- [ ] Each section has:
  - [ ] Icon header
  - [ ] Setting name
  - [ ] Current value
  - [ ] Edit button
- [ ] System Information section:
  - [ ] System Version
  - [ ] Last Updated date
  - [ ] Database Status
  - [ ] API Server Status
- [ ] Save Changes button
- [ ] Reset to Defaults option

---

## Design & Styling Verification

### Color Scheme
- [ ] Primary blue used consistently
- [ ] Status badges properly color-coded
- [ ] Hover states visible on interactive elements
- [ ] Text contrast meets accessibility standards
- [ ] Sidebar dark theme in admin portal

### Typography
- [ ] Headings are bold and prominent
- [ ] Body text is readable at 14px+
- [ ] Consistent font family (Geist) throughout
- [ ] Proper spacing between text elements

### Layout
- [ ] Sidebar persists across page changes
- [ ] Main content area is properly spaced
- [ ] Tables have good padding and alignment
- [ ] Cards maintain consistent sizing
- [ ] Grid layouts responsive on all devices

### Responsive Design
- [ ] Desktop (1920px): Full width with optimal spacing
- [ ] Laptop (1366px): Comfortable viewing area
- [ ] Tablet (768px): Single/two column layouts
- [ ] Mobile (375px): Stacked layout, readable text

---

## Navigation Flow Testing

### User Path 1: Student
1. [ ] Land on `/` → Click "Login"
2. [ ] Verify on `/login` with Student tab active
3. [ ] Click "Access Portal"
4. [ ] Verify redirected to `/student/dashboard`
5. [ ] Test sidebar navigation
6. [ ] Logout button returns to `/login`

### User Path 2: Lecturer
1. [ ] Land on `/` → Click "Login"
2. [ ] Click Lecturer tab
3. [ ] Click "Access Portal"
4. [ ] Verify redirected to `/lecturer/dashboard`
5. [ ] Test all sidebar links
6. [ ] Logout returns to `/login`

### User Path 3: Admin
1. [ ] Land on `/` → Click "Login"
2. [ ] Click Admin tab
3. [ ] Click "Access Portal"
4. [ ] Verify redirected to `/admin/dashboard`
5. [ ] Test all admin sidebar links
6. [ ] Verify dark sidebar theme
7. [ ] Logout returns to `/login`

---

## Performance Testing

- [ ] Pages load quickly (< 2 seconds)
- [ ] Sidebar navigation is smooth
- [ ] No console errors
- [ ] Images load properly (if any)
- [ ] Search/filter functions respond quickly
- [ ] No layout shifts or jank

---

## Accessibility Testing

- [ ] Proper heading hierarchy (H1 > H2 > H3)
- [ ] Form labels associated with inputs
- [ ] Color not only indicator of status
- [ ] Sufficient contrast ratios (4.5:1 for text)
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Links are descriptive

---

## Notes

- All data is placeholder/mock data for demonstration
- Login redirects are client-side (no real authentication)
- Database operations are not implemented yet
- Forms are styled but not functional (no submission)
- This is a frontend prototype ready for backend integration

---

## Reporting Issues

When testing, note:
- Page URL that shows the issue
- Browser and version
- Device/screen size
- Expected vs actual behavior
- Any console errors
- Steps to reproduce

All pages should work smoothly with consistent styling and proper navigation flow.
