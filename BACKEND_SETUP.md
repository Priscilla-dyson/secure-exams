# Backend Setup Guide

This guide will help you set up the backend for the Secure Exams system.

## Prerequisites

- PostgreSQL installed and running
- Node.js (v20 or higher)
- npm

## Setup Steps

### 1. Configure Database Connection

Update the `.env` file with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/secure_exams?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

**Important:** Replace `postgres:password` with your actual PostgreSQL username and password.

### 2. Create Database

Create a new PostgreSQL database named `secure_exams`:

```sql
CREATE DATABASE secure_exams;
```

### 3. Run Database Migrations

Generate Prisma Client and create database tables:

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Database with Initial Data

Populate the database with test users, modules, and a sample exam:

```bash
npm run seed
```

This will create:
- 1 Admin user
- 1 Lecturer user
- 2 Student users
- 2 Modules
- 1 Sample exam with 4 questions

### 5. Start the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## Test Credentials

After seeding, you can use these credentials to test the system:

### Admin
- Email: `admin@university.edu`
- Password: `Admin@2024`

### Lecturer
- Email: `lecturer@university.edu`
- Password: `Lecturer@2024`

### Student 1
- Email: `student1@university.edu`
- Password: `Student@2024`

### Student 2
- Email: `student2@university.edu`
- Password: `Student@2024`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout

### Exams (Lecturer/Admin)

- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create a new exam
- `GET /api/exams/[id]` - Get a specific exam
- `PUT /api/exams/[id]` - Update an exam
- `DELETE /api/exams/[id]` - Delete an exam

### Questions (Lecturer/Admin)

- `GET /api/exams/[examId]/questions` - Get all questions for an exam
- `POST /api/exams/[examId]/questions` - Add a question to an exam
- `PUT /api/questions/[id]` - Update a question
- `DELETE /api/questions/[id]` - Delete a question

### Student Exam Flow

- `GET /api/student/exams` - Get scheduled exams for student
- `POST /api/student/exams/[examId]/start` - Start an exam attempt
- `POST /api/student/attempts/[attemptId]/submit` - Submit exam answers

### Results

- `GET /api/results` - Get results (filtered by role)
- `POST /api/results/[id]/publish` - Publish a result (Lecturer/Admin)

### Admin

- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create a new user
- `GET /api/admin/modules` - Get all modules
- `POST /api/admin/modules` - Create a new module

## Database Schema

### Tables

- `User` - Users (students, lecturers, admins)
- `Module` - Course modules
- `Exam` - Exams
- `Question` - Exam questions
- `QuestionOption` - Multiple choice options
- `ExamAttempt` - Student exam attempts
- `StudentAnswer` - Student answers to questions
- `Result` - Published exam results
- `Announcement` - System announcements

## Role-Based Access Control

- **STUDENT**: Can view published exams, take exams, view published results
- **LECTURER**: Can create/edit exams, view submissions, publish results
- **ADMIN**: Full access to all features

## Next Steps

1. Test the login endpoint with the provided credentials
2. Create a new exam as a lecturer
3. Take the exam as a student
4. Publish the results as a lecturer
5. View results as a student

## Troubleshooting

### Database Connection Error

If you get a database connection error:
1. Verify PostgreSQL is running
2. Check your DATABASE_URL in `.env`
3. Ensure the database `secure_exams` exists

### Prisma Client Error

If you get Prisma client errors:
```bash
npx prisma generate
```

### Seed Script Error

If the seed script fails:
1. Ensure the database exists
2. Run `npx prisma db push` first
3. Check your DATABASE_URL
