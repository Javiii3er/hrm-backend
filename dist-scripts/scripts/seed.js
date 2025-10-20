"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node" /> 
const client_1 = require("@prisma/client");
const security_js_1 = require("../src/core/utils/security.js");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Iniciando seeding de base de datos...');
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_DB_WIPE === 'true') {
        console.log('Limpiando base de datos (Modo Desarrollo/Prueba)...');
        await prisma.auditLog.deleteMany();
        await prisma.payrollItem.deleteMany();
        await prisma.payroll.deleteMany();
        await prisma.document.deleteMany();
        await prisma.user.deleteMany();
        await prisma.employee.deleteMany();
        await prisma.department.deleteMany();
        console.log('Limpieza completada.');
    }
    else {
        console.log('Omitiendo limpieza de base de datos. No es un entorno de desarrollo.');
    }
    console.log('Creando departamentos...');
    const departments = await Promise.all([
        prisma.department.create({
            data: {
                id: 'dep-001',
                name: 'Recursos Humanos',
                description: 'Gestión de talento humano y nóminas'
            }
        }),
        prisma.department.create({
            data: {
                id: 'dep-002',
                name: 'Tecnología',
                description: 'Desarrollo y soporte tecnológico'
            }
        }),
        prisma.department.create({
            data: {
                id: 'dep-003',
                name: 'Finanzas',
                description: 'Gestión financiera y contabilidad'
            }
        }),
        prisma.department.create({
            data: {
                id: 'dep-004',
                name: 'Ventas',
                description: 'Equipo comercial y atención al cliente'
            }
        })
    ]);
    console.log('Creando empleados...');
    const employees = await Promise.all([
        prisma.employee.create({
            data: {
                nationalId: '1234567890101',
                firstName: 'María',
                lastName: 'García',
                email: 'maria.garcia@empresa.com',
                phone: '1234-5678',
                departmentId: 'dep-001',
                position: 'Gerente de RH',
                hireDate: new Date('2022-01-15'),
                status: 'ACTIVE'
            }
        }),
        prisma.employee.create({
            data: {
                nationalId: '1234567890102',
                firstName: 'Carlos',
                lastName: 'López',
                email: 'carlos.lopez@empresa.com',
                phone: '1234-5679',
                departmentId: 'dep-002',
                position: 'Desarrollador Senior',
                hireDate: new Date('2023-03-20'),
                status: 'ACTIVE'
            }
        }),
        prisma.employee.create({
            data: {
                nationalId: '1234567890103',
                firstName: 'Ana',
                lastName: 'Martínez',
                email: 'ana.martinez@empresa.com',
                phone: '1234-5680',
                departmentId: 'dep-003',
                position: 'Contadora',
                hireDate: new Date('2022-11-10'),
                status: 'ACTIVE'
            }
        }),
        prisma.employee.create({
            data: {
                nationalId: '1234567890104',
                firstName: 'Pedro',
                lastName: 'Ramírez',
                email: 'pedro.ramirez@empresa.com',
                phone: '1234-5681',
                departmentId: 'dep-004',
                position: 'Ejecutivo de Ventas',
                hireDate: new Date('2023-06-05'),
                status: 'VACATION'
            }
        }),
        prisma.employee.create({
            data: {
                nationalId: '1234567890105',
                firstName: 'Laura',
                lastName: 'Hernández',
                email: 'laura.hernandez@empresa.com',
                phone: '1234-5682',
                departmentId: 'dep-002',
                position: 'Desarrolladora Frontend',
                hireDate: new Date('2024-01-08'),
                status: 'ACTIVE'
            }
        })
    ]);
    console.log('Creando usuarios del sistema...');
    const adminPassword = await security_js_1.SecurityUtils.hashPassword('admin123');
    const rrhhPassword = await security_js_1.SecurityUtils.hashPassword('rrhh123');
    const empleadoPassword = await security_js_1.SecurityUtils.hashPassword('empleado123');
    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'admin@hrm.com',
                passwordHash: adminPassword,
                role: 'ADMIN'
            }
        }),
        prisma.user.create({
            data: {
                email: 'rrhh@empresa.com',
                passwordHash: rrhhPassword,
                role: 'RRHH',
                employeeId: employees[0].id
            }
        }),
        prisma.user.create({
            data: {
                email: 'carlos.lopez@empresa.com',
                passwordHash: empleadoPassword,
                role: 'EMPLEADO',
                employeeId: employees[1].id
            }
        })
    ]);
    console.log('Creando nóminas de ejemplo...');
    const payrolls = await Promise.all([
        prisma.payroll.create({
            data: {
                periodStart: new Date('2024-10-01'),
                periodEnd: new Date('2024-10-15'),
                departmentId: 'dep-001',
                description: 'Nómina quincenal RH - Octubre 1-15',
                status: 'FINALIZED'
            }
        }),
        prisma.payroll.create({
            data: {
                periodStart: new Date('2024-10-01'),
                periodEnd: new Date('2024-10-15'),
                departmentId: 'dep-002',
                description: 'Nómina quincenal Tecnología - Octubre 1-15',
                status: 'DRAFT'
            }
        })
    ]);
    console.log('Creando items de nómina...');
    const payrollItems = await Promise.all([
        prisma.payrollItem.create({
            data: {
                payrollId: payrolls[0].id,
                employeeId: employees[0].id,
                grossAmount: 8500.00,
                netAmount: 7650.25,
                deductions: {
                    igss: 410.55,
                    isr: 439.20
                }
            }
        }),
        prisma.payrollItem.create({
            data: {
                payrollId: payrolls[1].id,
                employeeId: employees[1].id,
                grossAmount: 7500.00,
                netAmount: 6850.00,
                deductions: {
                    igss: 362.25,
                    isr: 287.75
                }
            }
        }),
        prisma.payrollItem.create({
            data: {
                payrollId: payrolls[1].id,
                employeeId: employees[4].id,
                grossAmount: 6000.00,
                netAmount: 5520.00,
                deductions: {
                    igss: 289.80,
                    isr: 190.20
                }
            }
        })
    ]);
    console.log('Creando documentos de ejemplo...');
    const documents = await Promise.all([
        prisma.document.create({
            data: {
                employeeId: employees[0].id,
                filename: 'contrato_maria_garcia.pdf',
                storageKey: 'contrato_maria_garcia_12345.pdf',
                mimeType: 'application/pdf',
                size: 2048576,
                uploadedBy: users[0].id, // Admin
                tags: ['contrato', 'rrhh'],
                description: 'Contrato de trabajo firmado'
            }
        }),
        prisma.document.create({
            data: {
                employeeId: employees[1].id,
                filename: 'cv_carlos_lopez.docx',
                storageKey: 'cv_carlos_lopez_67890.docx',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                size: 153600,
                uploadedBy: users[1].id, // RRHH
                tags: ['cv', 'contrato'],
                description: 'Currículum actualizado'
            }
        })
    ]);
    console.log('Seeding completado exitosamente!');
    console.log('\nRESUMEN DE DATOS CREADOS:');
    console.log(`    - Departamentos: ${departments.length}`);
    console.log(`    - Empleados: ${employees.length}`);
    console.log(`    - Usuarios: ${users.length}`);
    console.log(`    - Nóminas: ${payrolls.length}`);
    console.log(`    - Items de nómina: ${payrollItems.length}`);
    console.log(`    - Documentos: ${documents.length}`);
    console.log('\n CREDENCIALES DE PRUEBA:');
    console.log('    ADMIN:');
    console.log('      - Email: admin@hrm.com');
    console.log('      - Password: admin123');
    console.log('      - Rol: ADMIN (super usuario)');
    console.log('\n    RRHH:');
    console.log('      - Email: rrhh@empresa.com');
    console.log('      - Password: rrhh123');
    console.log('      - Rol: RRHH (asociado a María García)');
    console.log('\n    EMPLEADO:');
    console.log('      - Email: carlos.lopez@empresa.com');
    console.log('      - Password: empleado123');
    console.log('      - Rol: EMPLEADO (asociado a Carlos López)');
}
main()
    .catch((e) => {
    console.error('Error en seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map