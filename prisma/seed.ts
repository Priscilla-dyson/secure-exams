import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create Admin User (only admin account created during setup)
  const adminPassword = await hashPassword('Admin@2024')
  const admin = await prisma.user.upsert({
    where: { userId: 'ADMIN001' },
    update: {},
    create: {
      userId: 'ADMIN001',
      email: 'admin@university.edu',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      employeeId: 'ADMIN001',
      mustChangePassword: false
    }
  })
  console.log('Created admin user:', admin.userId)

  // Create Programs
  const ictProgram = await prisma.program.upsert({
    where: { name: 'ICT' },
    update: {},
    create: { name: 'ICT', isActive: true }
  })
  const nursingProgram = await prisma.program.upsert({
    where: { name: 'Nursing' },
    update: {},
    create: { name: 'Nursing', isActive: true }
  })
  console.log('Created programs: ICT, Nursing')

  // Classes are auto-generated when program is created via admin, but for seed we create them manually
  const ictYear1 = await prisma.class.upsert({
    where: { name: 'ICT Year 1' },
    update: {},
    create: {
      name: 'ICT Year 1',
      programId: ictProgram.id,
      year: 1,
      isActive: true
    }
  })
  const ictYear2 = await prisma.class.upsert({
    where: { name: 'ICT Year 2' },
    update: {},
    create: {
      name: 'ICT Year 2',
      programId: ictProgram.id,
      year: 2,
      isActive: true
    }
  })
  const ictYear3 = await prisma.class.upsert({
    where: { name: 'ICT Year 3' },
    update: {},
    create: {
      name: 'ICT Year 3',
      programId: ictProgram.id,
      year: 3,
      isActive: true
    }
  })
  const nursingYear1 = await prisma.class.upsert({
    where: { name: 'Nursing Year 1' },
    update: {},
    create: {
      name: 'Nursing Year 1',
      programId: nursingProgram.id,
      year: 1,
      isActive: true
    }
  })
  console.log('Created classes')

  // Create Lecturers
  const lecturer1Password = await hashPassword('lecturer123')
  const lecturer1 = await prisma.user.upsert({
    where: { userId: 'LEC001' },
    update: {},
    create: {
      userId: 'LEC001',
      email: 'john.doe@university.edu',
      password: lecturer1Password,
      name: 'Dr. John Doe',
      role: 'LECTURER',
      employeeId: 'LEC001',
      mustChangePassword: false
    }
  })

  const lecturer2Password = await hashPassword('lecturer123')
  const lecturer2 = await prisma.user.upsert({
    where: { userId: 'LEC002' },
    update: {},
    create: {
      userId: 'LEC002',
      email: 'jane.smith@university.edu',
      password: lecturer2Password,
      name: 'Prof. Jane Smith',
      role: 'LECTURER',
      employeeId: 'LEC002',
      mustChangePassword: false
    }
  })
  console.log('Created lecturers: LEC001, LEC002')

  // Create Modules and assign lecturers
  // ICT Year 1 modules
  const module1 = await prisma.module.upsert({
    where: { code: 'COS101' },
    update: {},
    create: {
      name: 'Introduction to Programming',
      code: 'COS101',
      classId: ictYear1.id,
      programId: ictProgram.id,
      lecturerId: lecturer1.id,
      semester: '1'
    }
  })
  const module2 = await prisma.module.upsert({
    where: { code: 'DBT101' },
    update: {},
    create: {
      name: 'Database Fundamentals',
      code: 'DBT101',
      classId: ictYear1.id,
      programId: ictProgram.id,
      lecturerId: lecturer1.id,
      semester: '1'
    }
  })
  // ICT Year 2 modules
  const module3 = await prisma.module.upsert({
    where: { code: 'COS201' },
    update: {},
    create: {
      name: 'Data Structures & Algorithms',
      code: 'COS201',
      classId: ictYear2.id,
      programId: ictProgram.id,
      lecturerId: lecturer1.id,
      semester: '1'
    }
  })
  const module4 = await prisma.module.upsert({
    where: { code: 'DBT201' },
    update: {},
    create: {
      name: 'Advanced Database Systems',
      code: 'DBT201',
      classId: ictYear2.id,
      programId: ictProgram.id,
      lecturerId: lecturer2.id,
      semester: '1'
    }
  })
  // ICT Year 3 modules
  const module5 = await prisma.module.upsert({
    where: { code: 'NET301' },
    update: {},
    create: {
      name: 'Computer Networks',
      code: 'NET301',
      classId: ictYear3.id,
      programId: ictProgram.id,
      lecturerId: lecturer2.id,
      semester: '1'
    }
  })
  // Nursing Year 1 modules
  const module6 = await prisma.module.upsert({
    where: { code: 'NUR101' },
    update: {},
    create: {
      name: 'Introduction to Nursing',
      code: 'NUR101',
      classId: nursingYear1.id,
      programId: nursingProgram.id,
      lecturerId: lecturer2.id,
      semester: '1'
    }
  })
  console.log('Created modules with lecturer assignments')

  // Create Students and assign to classes
  const studentPassword = await hashPassword('student123')
  
  const student1 = await prisma.user.upsert({
    where: { userId: 'STU001' },
    update: {},
    create: {
      userId: 'STU001',
      email: 'alice.m@university.edu',
      password: studentPassword,
      name: 'Alice Mokoena',
      role: 'STUDENT',
      registrationNumber: 'STU001',
      classId: ictYear1.id,
      programId: ictProgram.id,
      year: 1,
      mustChangePassword: false
    }
  })
  const student2 = await prisma.user.upsert({
    where: { userId: 'STU002' },
    update: {},
    create: {
      userId: 'STU002',
      email: 'bob.m@university.edu',
      password: studentPassword,
      name: 'Bob Moeketsi',
      role: 'STUDENT',
      registrationNumber: 'STU002',
      classId: ictYear1.id,
      programId: ictProgram.id,
      year: 1,
      mustChangePassword: false
    }
  })
  const student3 = await prisma.user.upsert({
    where: { userId: 'STU003' },
    update: {},
    create: {
      userId: 'STU003',
      email: 'carol.z@university.edu',
      password: studentPassword,
      name: 'Carol Zulu',
      role: 'STUDENT',
      registrationNumber: 'STU003',
      classId: ictYear2.id,
      programId: ictProgram.id,
      year: 2,
      mustChangePassword: false
    }
  })
  const student4 = await prisma.user.upsert({
    where: { userId: 'STU004' },
    update: {},
    create: {
      userId: 'STU004',
      email: 'david.k@university.edu',
      password: studentPassword,
      name: 'David Khumalo',
      role: 'STUDENT',
      registrationNumber: 'STU004',
      classId: ictYear2.id,
      programId: ictProgram.id,
      year: 2,
      mustChangePassword: false
    }
  })
  const student5 = await prisma.user.upsert({
    where: { userId: 'STU005' },
    update: {},
    create: {
      userId: 'STU005',
      email: 'nurse.f@university.edu',
      password: studentPassword,
      name: 'Florence Ndlovu',
      role: 'STUDENT',
      registrationNumber: 'STU005',
      classId: nursingYear1.id,
      programId: nursingProgram.id,
      year: 1,
      mustChangePassword: false
    }
  })
  console.log('Created 5 students with class assignments')

  // Update student counts for classes
  await prisma.class.update({
    where: { id: ictYear1.id },
    data: {
      studentCount: await prisma.user.count({ where: { classId: ictYear1.id } })
    }
  })
  await prisma.class.update({
    where: { id: ictYear2.id },
    data: {
      studentCount: await prisma.user.count({ where: { classId: ictYear2.id } })
    }
  })
  await prisma.class.update({
    where: { id: nursingYear1.id },
    data: {
      studentCount: await prisma.user.count({ where: { classId: nursingYear1.id } })
    }
  })

  console.log('Database seed completed successfully!')
  console.log('\n===== SEED CREDENTIALS =====')
  console.log('Admin:')
  console.log('  User ID: ADMIN001')
  console.log('  Password: Admin@2024')
  console.log('\nLecturers:')
  console.log('  User ID: LEC001 | Password: lecturer123 | Name: Dr. John Doe')
  console.log('  User ID: LEC002 | Password: lecturer123 | Name: Prof. Jane Smith')
  console.log('\nStudents:')
  console.log('  User ID: STU001 | Password: student123 | Name: Alice Mokoena | Class: ICT Year 1')
  console.log('  User ID: STU002 | Password: student123 | Name: Bob Moeketsi | Class: ICT Year 1')
  console.log('  User ID: STU003 | Password: student123 | Name: Carol Zulu | Class: ICT Year 2')
  console.log('  User ID: STU004 | Password: student123 | Name: David Khumalo | Class: ICT Year 2')
  console.log('  User ID: STU005 | Password: student123 | Name: Florence Ndlovu | Class: Nursing Year 1')
  console.log('\nModule Assignments:')
  console.log('  Dr. John Doe teaches: COS101, DBT101, COS201')
  console.log('  Prof. Jane Smith teaches: DBT201, NET301, NUR101')
  console.log('')
  console.log('Note: Lecturers automatically see only their assigned modules when creating exams.')
  console.log('Students automatically see only exams for modules in their class.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })