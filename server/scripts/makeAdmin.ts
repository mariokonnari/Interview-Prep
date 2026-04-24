/// <reference types="node" />
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx ts-node scripts/makeAdmin.ts your@email.com')
    process.exit(1)
  }

  const user = await prisma.user.updateMany({
    where: { email },
    data: { role: 'ADMIN' },
  })

  if (user.count === 0) {
    console.log('No user found with that email.')
  } else {
    console.log(`Done — ${email} is now an ADMIN.`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())