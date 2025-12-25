import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建默认管理员账户
  const adminPassword = await bcrypt.hash('admin123456', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lottery.com' },
    update: {},
    create: {
      email: 'admin@lottery.com',
      username: '系统管理员',
      password: adminPassword,
      role: 'admin',
    },
  })

  console.log('✅ 默认管理员账户已创建：')
  console.log('   邮箱: admin@lottery.com')
  console.log('   密码: admin123456')
  console.log('   角色: 管理员')

  // 创建测试用户账户
  const userPassword = await bcrypt.hash('user123456', 10)

  const user = await prisma.user.upsert({
    where: { email: 'user@lottery.com' },
    update: {},
    create: {
      email: 'user@lottery.com',
      username: '测试用户',
      password: userPassword,
      role: 'user',
    },
  })

  console.log('✅ 测试用户账户已创建：')
  console.log('   邮箱: user@lottery.com')
  console.log('   密码: user123456')
  console.log('   角色: 普通用户')

  console.log('\n数据库初始化完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
