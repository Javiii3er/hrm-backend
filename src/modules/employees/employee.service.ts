// src/modules/employees/employee.service.ts
import { prisma } from '../../core/config/database.js';
import { 
  EmployeeCreateDTO, 
  EmployeeUpdateDTO, 
  EmployeeQueryDTO 
} from './employee.schemas.js';

export class EmployeeService {
  async createEmployee(data: EmployeeCreateDTO) {
    const existingEmployee = await prisma.employee.findUnique({
      where: { nationalId: data.nationalId }
    });

    if (existingEmployee) {
      throw new Error('DUPLICATE_NATIONAL_ID');
    }

    const existingEmail = await prisma.employee.findFirst({
      where: { email: data.email }
    });

    if (existingEmail) {
      throw new Error('DUPLICATE_EMAIL');
    }

    const department = await prisma.department.findUnique({
      where: { id: data.departmentId }
    });

    if (!department) {
      throw new Error('DEPARTMENT_NOT_FOUND');
    }

    const employee = await prisma.employee.create({
      data: {
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
        metadata: {}
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    return employee;
  }

  async getEmployees(query: EmployeeQueryDTO) {
    const { q, department, status, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {}; 
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { nationalId: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { position: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (department) {
      where.departmentId = department;
    }

    if (status) {
      where.status = status;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.employee.count({ where })
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: employees,
      meta: {
        pagination: {
          page,
          pageSize,
          total,
          totalPages
        }
      }
    };
  }

  async getEmployeeById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 5 
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    return employee;
  }

  async updateEmployee(id: string, data: EmployeeUpdateDTO) {
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!existingEmployee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    if (data.nationalId && data.nationalId !== existingEmployee.nationalId) {
      const duplicateNationalId = await prisma.employee.findUnique({
        where: { nationalId: data.nationalId }
      });

      if (duplicateNationalId) {
        throw new Error('DUPLICATE_NATIONAL_ID');
      }
    }

    if (data.email && data.email !== existingEmployee.email) {
      const duplicateEmail = await prisma.employee.findFirst({
        where: { 
          email: data.email,
          id: { not: id }
        }
      });

      if (duplicateEmail) {
        throw new Error('DUPLICATE_EMAIL');
      }
    }

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      });

      if (!department) {
        throw new Error('DEPARTMENT_NOT_FOUND');
      }
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        ...data,
        ...(data.hireDate && { hireDate: new Date(data.hireDate) })
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedEmployee;
  }

  async deleteEmployee(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true
      }
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    if (employee.user) {
      throw new Error('EMPLOYEE_HAS_USER_ACCOUNT');
    }

    if (employee.documents.length > 0) {
      throw new Error('EMPLOYEE_HAS_DOCUMENTS');
    }

    await prisma.employee.delete({
      where: { id }
    });

    return { success: true, message: 'Empleado eliminado correctamente' };
  }

  async getEmployeeStats() {
    const totalEmployees = await prisma.employee.count();
    const activeEmployees = await prisma.employee.count({
      where: { status: 'ACTIVE' }
    });
    
    const byDepartment = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    return {
      total: totalEmployees,
      active: activeEmployees,
      byDepartment: byDepartment.map(dept => ({
        department: dept.name,
        count: dept._count.employees
      }))
    };
  }
}