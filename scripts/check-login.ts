import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      userId: true,
      name: true,
      role: true,
      mustChangePassword: true,
      password: true
    }
  })

  console.log(`Found ${users.length} users`)
  
  for (const user of users) {
    console.log(`\nUser: ${user.userId} (${user.name}) - Role: ${user.role}`)
    console.log(`  Password hash: ${user.password.substring(0, 20)}...`)
    
    const match = await bcrypt.compare('student123', user.password)
    console.log(`  Match with 'student123': ${match}`)
    
    const matchAdmin = await bcrypt.compare('Admin@2024', user.password)
    console.log(`  Match with 'Admin@2024': ${matchAdmin}`)
    
    const matchLect = await bcrypt.compare('lecturer123', user.password)
    console.log(`  Match with 'lecturer123': ${matchLect}`)
    
    const matchDefault = await bcrypt.compare('changeme123', user.password)
    console.log(`  Match with 'changeme123': ${matchDefault}`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)