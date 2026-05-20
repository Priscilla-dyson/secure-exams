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

  console.log('Database seed completed successfully!')
  console.log('\nAdmin Credentials:')
  console.log('==================')
  console.log('User ID: ADMIN001')
  console.log('Password: Admin@2024')
  console.log('\nNote: Use the admin panel to create lecturers, students, classes, and modules.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
