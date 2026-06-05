import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Permissions
  const permissions = [
    'VIEW_DASHBOARD', 'SALES', 'PAYMENT', 'CANCEL_ORDER', 'EDIT_PRICE', 
    'VIEW_REPORTS', 'MANAGE_INVENTORY', 'MANAGE_MENU', 'MANAGE_STAFF', 
    'MANAGE_FINANCE', 'MANAGE_SETTINGS'
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p }
    });
  }

  const allPermissions = await prisma.permission.findMany();

  // Create Roles
  const roles = ['ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN', 'WAREHOUSE'];
  
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r },
      update: {},
      create: { 
        name: r,
        permissions: r === 'ADMIN' ? { connect: allPermissions.map(p => ({ id: p.id })) } : undefined
      }
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

  // Create Users
  if (adminRole) {
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        code: 'NV001',
        username: 'admin',
        password: 'password123', // In real app, this should be hashed
        name: 'Super Admin',
        roleId: adminRole.id,
        phone: '0988888888',
        baseSalary: 10000000,
        hourlyRate: 50000
      },
    })
  }

  // Delete old data to avoid foreign key constraints
  await prisma.diningTable.deleteMany({})
  await prisma.area.deleteMany({})

  // Create Areas
  const floor1 = await prisma.area.create({ data: { name: 'Tầng 1' } })
  const floor2 = await prisma.area.create({ data: { name: 'Tầng 2' } })
  const vip = await prisma.area.create({ data: { name: 'Phòng VIP' } })

  // Create Tables (15 tables)
  const tables = []
  for (let i = 1; i <= 6; i++) {
    tables.push({ name: `Bàn 10${i}`, areaId: floor1.id, capacity: 4 })
  }
  for (let i = 1; i <= 6; i++) {
    tables.push({ name: `Bàn 20${i}`, areaId: floor2.id, capacity: 4 })
  }
  for (let i = 1; i <= 3; i++) {
    tables.push({ name: `VIP ${i}`, areaId: vip.id, capacity: 10 })
  }
  await prisma.diningTable.createMany({ data: tables })

  // Delete old menu data
  await prisma.menuItem.deleteMany({})
  await prisma.category.deleteMany({})

  // Create Categories (5 categories)
  const catKhaitVi = await prisma.category.create({ data: { name: 'Khai vị' } })
  const catMonChinh = await prisma.category.create({ data: { name: 'Món chính' } })
  const catLauNuong = await prisma.category.create({ data: { name: 'Lẩu - Nướng' } })
  const catDoUong = await prisma.category.create({ data: { name: 'Đồ uống' } })
  const catTrangMieng = await prisma.category.create({ data: { name: 'Tráng miệng' } })

  // Create Menu Items (30 items)
  const items = [
    // Khai vị
    { name: 'Khoai tây chiên', price: 45000, cost: 15000, categoryId: catKhaitVi.id },
    { name: 'Ngô chiên bơ', price: 45000, cost: 12000, categoryId: catKhaitVi.id },
    { name: 'Salad cá hồi', price: 120000, cost: 50000, categoryId: catKhaitVi.id },
    { name: 'Gỏi tôm thịt', price: 95000, cost: 40000, categoryId: catKhaitVi.id },
    { name: 'Súp hải sản', price: 55000, cost: 20000, categoryId: catKhaitVi.id },
    { name: 'Bánh mì bơ tỏi', price: 35000, cost: 10000, categoryId: catKhaitVi.id },
    // Món chính
    { name: 'Bò lúc lắc', price: 150000, cost: 70000, categoryId: catMonChinh.id },
    { name: 'Gà quay', price: 250000, cost: 100000, categoryId: catMonChinh.id },
    { name: 'Cá chép om dưa', price: 180000, cost: 80000, categoryId: catMonChinh.id },
    { name: 'Mực hấp sả', price: 140000, cost: 60000, categoryId: catMonChinh.id },
    { name: 'Tôm sú rang muối', price: 200000, cost: 90000, categoryId: catMonChinh.id },
    { name: 'Cơm chiên hải sản', price: 90000, cost: 35000, categoryId: catMonChinh.id },
    { name: 'Đậu hũ tứ xuyên', price: 75000, cost: 25000, categoryId: catMonChinh.id },
    { name: 'Rau muống xào tỏi', price: 40000, cost: 10000, categoryId: catMonChinh.id },
    // Lẩu nướng
    { name: 'Lẩu thái Tomyum', price: 350000, cost: 150000, categoryId: catLauNuong.id },
    { name: 'Lẩu riêu cua bắp bò', price: 380000, cost: 160000, categoryId: catLauNuong.id },
    { name: 'Lẩu nấm', price: 300000, cost: 120000, categoryId: catLauNuong.id },
    { name: 'Sườn nướng tảng', price: 280000, cost: 130000, categoryId: catLauNuong.id },
    { name: 'Hải sản nướng', price: 450000, cost: 200000, categoryId: catLauNuong.id },
    { name: 'Bò nướng tảng', price: 320000, cost: 140000, categoryId: catLauNuong.id },
    // Đồ uống
    { name: 'Bia Heineken', price: 35000, cost: 18000, categoryId: catDoUong.id },
    { name: 'Bia Tiger', price: 30000, cost: 15000, categoryId: catDoUong.id },
    { name: 'Nước suối', price: 15000, cost: 5000, categoryId: catDoUong.id },
    { name: 'Coca Cola', price: 20000, cost: 8000, categoryId: catDoUong.id },
    { name: 'Sinh tố dưa hấu', price: 45000, cost: 15000, categoryId: catDoUong.id },
    { name: 'Nước ép cam', price: 50000, cost: 18000, categoryId: catDoUong.id },
    // Tráng miệng
    { name: 'Trái cây theo mùa', price: 80000, cost: 30000, categoryId: catTrangMieng.id },
    { name: 'Kem Vani', price: 35000, cost: 12000, categoryId: catTrangMieng.id },
    { name: 'Sữa chua nếp cẩm', price: 30000, cost: 10000, categoryId: catTrangMieng.id },
    { name: 'Chè bưởi', price: 25000, cost: 8000, categoryId: catTrangMieng.id },
  ]
  await prisma.menuItem.createMany({ data: items })

  // Setting and Printer
  await prisma.setting.upsert({
    where: { key: 'VAT' },
    update: {},
    create: { key: 'VAT', value: '10' }
  })
  await prisma.setting.upsert({
    where: { key: 'PAPER_SIZE' },
    update: {},
    create: { key: 'PAPER_SIZE', value: '80mm' }
  })

  console.log('Database seeded with 3 areas, 15 tables, 5 categories, 30 items successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
