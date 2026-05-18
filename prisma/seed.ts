import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create Admin User
  const adminPassword = await hashPassword('Admin@2024')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      password: adminPassword,
      name: 'Dr. James Williams',
      role: 'ADMIN',
      employeeId: 'ADMIN001',
      department: 'Administration'
    }
  })
  console.log('Created admin user:', admin.email)

  // Create Lecturer User
  const lecturerPassword = await hashPassword('Lecturer@2024')
  const lecturer = await prisma.user.upsert({
    where: { email: 'lecturer@university.edu' },
    update: {},
    create: {
      email: 'lecturer@university.edu',
      password: lecturerPassword,
      name: 'Dr. Robert Thompson',
      role: 'LECTURER',
      employeeId: 'LEC001',
      department: 'Computer Science'
    }
  })
  console.log('Created lecturer user:', lecturer.email)

  // Create Student Users
  const studentPassword = await hashPassword('Student@2024')
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@university.edu' },
    update: {},
    create: {
      email: 'student1@university.edu',
      password: studentPassword,
      name: 'Sarah Johnson',
      role: 'STUDENT',
      registrationNumber: 'STU001',
      department: 'Computer Science'
    }
  })
  console.log('Created student user:', student1.email)

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@university.edu' },
    update: {},
    create: {
      email: 'student2@university.edu',
      password: studentPassword,
      name: 'Michael Chen',
      role: 'STUDENT',
      registrationNumber: 'STU002',
      department: 'Computer Science'
    }
  })
  console.log('Created student user:', student2.email)

  // Create Modules
  const module1 = await prisma.module.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      code: 'CS101',
      name: 'Introduction to Computer Science',
      department: 'Computer Science',
      lecturerId: lecturer.id,
      semester: '1',
      studentCount: 2
    }
  })
  console.log('Created module:', module1.code)

  const module2 = await prisma.module.upsert({
    where: { code: 'CS201' },
    update: {},
    create: {
      code: 'CS201',
      name: 'Data Structures and Algorithms',
      department: 'Computer Science',
      lecturerId: lecturer.id,
      semester: '2',
      studentCount: 2
    }
  })
  console.log('Created module:', module2.code)

  // Create a Sample Exam
  const exam = await prisma.exam.create({
    data: {
      title: 'Introduction to Computer Science - Midterm',
      description: 'Test your knowledge of basic computer science concepts',
      type: 'midterm',
      moduleId: module1.id,
      creatorId: lecturer.id,
      duration: 60,
      totalMarks: 100,
      passingMarks: 40,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      scheduledTime: '09:00',
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
      endTime: '10:00',
      status: 'SCHEDULED',
      published: true,
      showResults: true,
      allowLateSubmission: false
    }
  })
  console.log('Created exam:', exam.title)

  // Create Questions for the Exam
  const question1 = await prisma.question.create({
    data: {
      examId: exam.id,
      type: 'MULTIPLE_CHOICE',
      text: 'What does CPU stand for?',
      marks: 10,
      order: 1,
      correctAnswer: 'Central Processing Unit'
    }
  })
  console.log('Created question:', question1.text)

  // Create options for question 1
  await prisma.questionOption.createMany({
    data: [
      { questionId: question1.id, text: 'Central Processing Unit', isCorrect: true, order: 1 },
      { questionId: question1.id, text: 'Central Program Unit', isCorrect: false, order: 2 },
      { questionId: question1.id, text: 'Computer Personal Unit', isCorrect: false, order: 3 },
      { questionId: question1.id, text: 'Central Peripheral Unit', isCorrect: false, order: 4 }
    ]
  })

  const question2 = await prisma.question.create({
    data: {
      examId: exam.id,
      type: 'MULTIPLE_CHOICE',
      text: 'Which of the following is a programming language?',
      marks: 10,
      order: 2,
      correctAnswer: 'Python'
    }
  })
  console.log('Created question:', question2.text)

  await prisma.questionOption.createMany({
    data: [
      { questionId: question2.id, text: 'HTML', isCorrect: false, order: 1 },
      { questionId: question2.id, text: 'Python', isCorrect: true, order: 2 },
      { questionId: question2.id, text: 'CSS', isCorrect: false, order: 3 },
      { questionId: question2.id, text: 'JSON', isCorrect: false, order: 4 }
    ]
  })

  const question3 = await prisma.question.create({
    data: {
      examId: exam.id,
      type: 'SHORT_ANSWER',
      text: 'What is the difference between RAM and ROM?',
      marks: 20,
      order: 3,
      instructions: 'Provide a clear comparison in 2-3 sentences.'
    }
  })
  console.log('Created question:', question3.text)

  const question4 = await prisma.question.create({
    data: {
      examId: exam.id,
      type: 'ESSAY',
      text: 'Explain the importance of algorithms in computer science.',
      marks: 30,
      order: 4,
      instructions: 'Write a comprehensive essay of at least 300 words.'
    }
  })
  console.log('Created question:', question4.text)

  // Add MATH question example
  const question5 = await prisma.question.create({
    data: {
      examId: exam.id,
      type: 'MATH',
      text: 'Solve for x: 2x + 5 = 15',
      marks: 15,
      order: 5,
      instructions: 'Show your work step by step.',
      mathAnswer: 'x = 5'
    }
  })
  console.log('Created math question:', question5.text)

  // Add DRAWING question example
  const question6 = await prisma.question.create({
    data: {
      examId: exam.id,
      type: 'DRAWING',
      text: 'Draw a simple flowchart for a login process',
      marks: 15,
      order: 6,
      instructions: 'Include start, input, process, decision, and end symbols.'
    }
  })
  console.log('Created drawing question:', question6.text)

  // Create Enrollments for students
  await prisma.enrollment.createMany({
    data: [
      { studentId: student1.id, moduleId: module1.id },
      { studentId: student1.id, moduleId: module2.id },
      { studentId: student2.id, moduleId: module1.id },
      { studentId: student2.id, moduleId: module2.id }
    ],
    skipDuplicates: true
  })
  console.log('Created enrollments for students')

  console.log('Database seed completed successfully!')
  console.log('\nTest Credentials:')
  console.log('==================')
  console.log('Admin: admin@university.edu / Admin@2024')
  console.log('Lecturer: lecturer@university.edu / Lecturer@2024')
  console.log('Student: student1@university.edu / Student@2024')
  console.log('Student: student2@university.edu / Student@2024')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
