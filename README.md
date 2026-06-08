# Secure Web-Based Examination and Automated Results System

A professional, production-ready examination management platform built for educational institutions.

## Features

- **Role-based access**: Students, Lecturers, and Administrators
- **Secure exam delivery**: One attempt per student, anti-cheat monitoring, AI proctoring
- **Automated scheduling**: Exams auto-transition through DRAFT → SCHEDULED → ACTIVE → COMPLETED
- **Smart timer system**: Counts down to scheduled end time; late joiners get reduced time
- **Past-date prevention**: Lecturers cannot schedule exams with past dates/times
- **Question types**: Multiple Choice, Short Answer, Essay, Math (LaTeX), Drawing, Structured
- **Auto-grading**: Multiple choice questions graded instantly; others require manual grading
- **Email notifications**: Students notified when exams are scheduled

---

## Exam Timing System Documentation

### How the Exam Timer Works

The system enforces time-based access at three levels:

#### 1. Exam Creation (Lecturer Dashboard)
- **File**: `app/api/exams/route.ts` (POST handler)
- **File**: `app/api/exams/[examId]/route.ts` (PUT handler)
- **Behavior**: When a lecturer creates or updates an exam, the system validates that the `scheduledDate` is **in the future**. If today is June 7, setting a scheduled date of June 1 returns an error:
  > "Cannot schedule an exam in the past. The scheduled date and time must be in the future."
- **Why**: Prevents scheduling exams that would immediately expire or have zero remaining time

#### 2. Exam Start (Student taking exam)
- **File**: `app/api/student/exams/[examId]/start/route.ts`
- **Behavior when student clicks "Enter Exam"**:
  - **On-time students**: Get the full exam duration (e.g., 60 minutes)
  - **Late-joining students**: Get reduced time based on scheduled end
  - **Example scenario**:
    - Exam scheduled for 10:00 AM, duration 60 minutes (ends at 11:00 AM)
    - Student joins at 10:20 AM → they see **40 minutes remaining**
    - Student tries to join at 11:01 AM → blocked with:
      > "The scheduled exam time has ended. You can no longer access this exam."
- **Why**: All students' timers count down to the **same end time**, ensuring fairness and consistent exam closure

#### 3. One Attempt Rule
- **File**: `app/api/student/exams/[examId]/start/route.ts`
- **Behavior**: Each student gets exactly **one attempt** per exam:
  - Already SUBMITTED or GRADED → blocked
  - Still IN_PROGRESS → resumed with remaining time preserved
  - Never attempted → new attempt created
- **Why**: Ensures academic integrity and prevents re-taking

### Status Auto-Transition System

- **File**: `app/api/exams/route.ts` (helper function: `updateExamStatuses`)
- **Called automatically**: Every time the exam list is fetched (GET /api/exams)
- **Transitions**:
  - `DRAFT` → manually published by lecturer → `SCHEDULED`
  - `SCHEDULED` → scheduled time arrives → `ACTIVE`
  - `ACTIVE` or `SCHEDULED` → end time has passed → `COMPLETED`

### How remainingSeconds is Calculated

```
examEndTime = scheduledDate + duration (in minutes)
remainingSeconds = examEndTime - currentTime (in seconds)
```

If `endDate` is also set in the exam, the system uses whichever comes first (earliest of `scheduledDate + duration` or `endDate`).

---

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **AI Proctoring**: TensorFlow.js (face detection via webcam)
- **Email**: Nodemailer (exam notifications)

### Key Directories
```
app/
├── api/
│   ├── exams/
│   │   ├── route.ts              # CRUD for exams (create, list, status updates)
│   │   └── [examId]/route.ts     # Individual exam operations (get, update, delete)
│   └── student/
│       └── exams/[examId]/start/route.ts  # Student starts/resumes exam attempt
├── student/
│   ├── dashboard/                # Student dashboard (active/upcoming/missed exams)
│   └── examinations/[id]/page.tsx # Live exam-taking UI with timer and proctoring
└── lecturer/
    └── exam-management/          # Lecturer exam creation and management UI
prisma/
└── schema.prisma                 # Database schema (Exam, ExamAttempt, User, etc.)
```

### Key Database Models
- **Exam**: Stores title, duration, scheduledDate, endDate, status
- **ExamAttempt**: One per student per exam; tracks start time, violations, status
- **StudentAnswer**: Individual question responses
- **AntiCheatLog**: Logs tab switches, fullscreen exits, suspicious activity
- **LoginAttempt**: Records login events during exam

---

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secure-exams
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   Create a `.env` file with:
   ```
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret-key"
   SMTP_HOST=...
   SMTP_PORT=...
   SMTP_USER=...
   SMTP_PASS=...
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Student: `/student/dashboard`
   - Lecturer: `/lecturer/exam-management`
   - Admin: `/admin/dashboard`

---

## Test Scenarios

### Scenario 1: Student joins on time
1. Lecturer creates exam for June 10, 10:00 AM, duration 60 min
2. Student clicks "Enter Exam" at 10:00 AM → sees 60:00 countdown
3. Student submits at 10:45 → submission accepted
4. Student tries to re-enter → "You have already submitted this exam"

### Scenario 2: Student joins late
1. Exam scheduled June 10, 10:00 AM, 60 min duration (ends 11:00 AM)
2. Student clicks "Enter Exam" at 10:20 AM → sees 40:00 countdown
3. Student tries to start at 11:01 AM → blocked with "exam time has ended"

### Scenario 3: Lecturer schedules past date
1. Today is June 10. Lecturer tries to set scheduledDate = June 5
2. API returns error: "Cannot schedule an exam in the past"
3. Lecturer must choose a future date

### Scenario 4: Student has one attempt
1. Student starts exam (attempt created as IN_PROGRESS)
2. Student submits (attempt becomes SUBMITTED)
3. Student navigates back to exam → "You have already submitted this exam"
4. Page refresh during exam → IN_PROGRESS attempt resumed with correct remaining time

---

## Future Enhancements

- Automated "missed" status for students who never started
- Exam timer sync across tabs for robustness
- Real-time exam monitoring dashboard for lecturers
- Bulk exam scheduling and import/export