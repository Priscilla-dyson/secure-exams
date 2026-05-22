import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Reset all student passwords to 'changeme123' with mustChangePassword = true
  const studentHash = bcrypt.hashSync('changeme123', 10)
  const studentResult = await prisma.user.updateMany({
    where: { role: 'STUDENT' },
    data: { password: studentHash, mustChangePassword: true }
  })
  console.log(`Updated ${studentResult.count} student passwords to 'changeme123'`)

  // Reset all lecturer passwords to 'lecturer123'
  const lecturerHash = bcrypt.hashSync('lecturer123', 10)
  const lecturerResult = await prisma.user.updateMany({
    where: { role: 'LECTURER' },
    data: { password: lecturerHash }
  })
  console.log(`Updated ${lecturerResult.count} lecturer passwords to 'lecturer123'`)

  // Verify the fix
  const testUser = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    select: { userId: true, name: true, password: true }
  })
  
  if (testUser) {
    const testMatch = bcrypt.compareSync('changeme123', testUser.password)
    console.log(`\nVerification for ${testUser.userId} (${testUser.name}):`)
    console.log(`  Password 'changeme123' matches: ${testMatch}`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)