// prisma/seed.ts - Agrega esta línea al inicio
/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import { SecurityUtils } from '../src/core/utils/security';

const prisma = new PrismaClient();

async function main() {
  let department = await prisma.department.findFirst({
    where: { name: 'Administración' }
  });

  if (!department) {
    department = await prisma.department.create({
      data: {
        name: 'Administración',
        description: 'Departamento de administración del sistema'
      }
    });
  }

  let adminEmployee = await prisma.employee.findFirst({
    where: { 
      OR: [
        { email: 'admin@empresa.com' },
        { nationalId: '123456789' }
      ]
    }
  });

  if (!adminEmployee) {
    adminEmployee = await prisma.employee.create({
      data: {
        nationalId: '123456789',
        firstName: 'Administrador',
        lastName: 'Sistema',
        email: 'admin@empresa.com',
        departmentId: department.id,
        position: 'Administrador del Sistema',
        hireDate: new Date(),
        status: 'ACTIVE'
      }
    });
  }

  let adminUser = await prisma.user.findFirst({
    where: { email: 'admin@empresa.com' }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@empresa.com',
        passwordHash: await SecurityUtils.hashPassword('admin123'),
        role: 'ADMIN',
        employeeId: adminEmployee.id
      }
    });
  }

  console.log('Usuario admin creado:');
  console.log('Email: admin@empresa.com');
  console.log('Password: admin123');
  console.log('Departamento ID:', department.id);
  console.log('Empleado ID:', adminEmployee.id);
  console.log('Usuario ID:', adminUser.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });