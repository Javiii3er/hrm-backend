// src/modules/payroll/payroll.service.ts
import { prisma } from '../../core/config/database.js';
import { Prisma } from '@prisma/client';
import { 
  PayrollCreateDTO, 
  PayrollUpdateDTO, 
  PayrollQueryDTO,
  GeneratePayrollDTO,
  PayrollItemDTO
} from './payroll.schemas.js';

interface EmployeeWithDepartment {
    id: string;
    departmentId: string;
    status: string;
    [key: string]: any; 
}


export class PayrollService {
  async createPayroll(data: PayrollCreateDTO) {
    const startDate = data.periodStart;
    const endDate = data.periodEnd;
    
    if (startDate.getTime() >= endDate.getTime()) {
      throw new Error('INVALID_DATE_RANGE');
    }

    const overlappingPayroll = await prisma.payroll.findFirst({
      where: {
        status: { in: ['DRAFT', 'FINALIZED'] },
        OR: [
          { periodStart: { gte: startDate, lte: endDate } },
          { periodEnd: { gte: startDate, lte: endDate } },
          { periodStart: { lte: startDate }, periodEnd: { gte: endDate } }
        ]
      }
    });

    if (overlappingPayroll) {
      throw new Error('OVERLAPPING_PERIOD');
    }

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      });

      if (!department) {
        throw new Error('DEPARTMENT_NOT_FOUND');
      }
    }

    const payroll = await prisma.payroll.create({
      data: {
        periodStart: startDate,
        periodEnd: endDate,
        departmentId: data.departmentId,
        description: data.description,
        status: 'DRAFT'
      },
      include: {
        department: { select: { id: true, name: true } },
        items: { 
          include: { 
            employee: { 
              select: { 
                id: true, firstName: true, lastName: true, position: true 
              } 
            } 
          } 
        }
      }
    });

    return payroll;
  }

  async getPayrolls(query: PayrollQueryDTO) {
    const { startDate, endDate, department, status, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PayrollWhereInput = {};

    if (startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      
      where.periodStart = { gte: start };
      where.periodEnd = { lte: end };
    }


    if (department) {
      where.departmentId = department;
    }

    if (status) {
      where.status = status;
    }

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          _count: { select: { items: true } },
          items: {
            take: 1, 
            include: {
              employee: { select: { firstName: true, lastName: true } }
            }
          }
        },
        orderBy: { periodStart: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.payroll.count({ where })
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: payrolls,
      meta: {
        pagination: { page, pageSize, total, totalPages }
      }
    };
  }

  async getPayrollById(id: string) {
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, description: true } },
        items: {
          include: {
            employee: {
              include: { department: { select: { name: true } } }
            }
          },
          orderBy: { employee: { firstName: 'asc' } }
        }
      }
    });

    if (!payroll) {
      throw new Error('PAYROLL_NOT_FOUND');
    }

    const totals = payroll.items.reduce((acc, item) => ({
      totalGross: acc.totalGross + item.grossAmount,
      totalNet: acc.totalNet + item.netAmount,
      totalDeductions: acc.totalDeductions + (item.grossAmount - item.netAmount)
    }), { totalGross: 0, totalNet: 0, totalDeductions: 0 });

    return { ...payroll, totals };
  }

  async generatePayrollItems(id: string, data: GeneratePayrollDTO) {
    const payroll = await prisma.payroll.findUnique({ where: { id } });

    if (!payroll) {
      throw new Error('PAYROLL_NOT_FOUND');
    }

    if (payroll.status !== 'DRAFT') {
      throw new Error('PAYROLL_NOT_EDITABLE');
    }

    await prisma.payrollItem.deleteMany({ where: { payrollId: id } });


    let itemsToCreate: PayrollItemDTO[] = [];

    if (data.items && data.items.length > 0) {
      itemsToCreate = data.items;
    } else {
      const employees = await prisma.employee.findMany({
        where: { 
          status: 'ACTIVE',
          ...(payroll.departmentId && { departmentId: payroll.departmentId })
        },
        include: { department: true }
      });

      if (employees.length === 0) {
        throw new Error('NO_EMPLOYEES_FOUND');
      }

      itemsToCreate = employees.map(employee => ({
          employeeId: employee.id,
          grossAmount: this.calculateGrossSalary(employee as EmployeeWithDepartment), 
          deductions: {}
      }));
    }

    const payrollItemsData = await Promise.all(
      itemsToCreate.map(async (item) => {
        const employee = await prisma.employee.findUnique({ where: { id: item.employeeId } });

        if (!employee) {
          throw new Error(`EMPLOYEE_NOT_FOUND: ${item.employeeId}`);
        }
        const deductions = await this.calculateDeductions(item.grossAmount, item.deductions);
        
        const totalDeductions = Object.values(deductions).reduce((sum, amount) => sum + amount, 0);
        
        const netAmount = item.grossAmount - totalDeductions;
        
        return {
          payrollId: id,
          employeeId: item.employeeId,
          grossAmount: item.grossAmount,
          netAmount: parseFloat(netAmount.toFixed(2)),
          deductions: deductions as Prisma.InputJsonValue
        };
      })
    );
    
    await prisma.payrollItem.createMany({ data: payrollItemsData });

    return this.getPayrollById(id);
  }

  async finalizePayroll(id: string) {
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!payroll || payroll.status !== 'DRAFT' || payroll.items.length === 0) {
      if (!payroll) throw new Error('PAYROLL_NOT_FOUND');
      if (payroll.status !== 'DRAFT') throw new Error('PAYROLL_ALREADY_FINALIZED');
      if (payroll.items.length === 0) throw new Error('NO_PAYROLL_ITEMS');
    }

    const updatedPayroll = await prisma.payroll.update({
      where: { id },
      data: { status: 'FINALIZED' },
      include: {
        department: { select: { id: true, name: true } },
        items: { 
          include: { 
            employee: { select: { firstName: true, lastName: true } } 
          } 
        }
      }
    });

    return updatedPayroll;
  }

  async deletePayroll(id: string) {
    const payroll = await prisma.payroll.findUnique({ where: { id } });

    if (!payroll) {
      throw new Error('PAYROLL_NOT_FOUND');
    }

    if (payroll.status !== 'DRAFT') {
      throw new Error('PAYROLL_NOT_DELETABLE');
    }

    await prisma.$transaction([
      prisma.payrollItem.deleteMany({ where: { payrollId: id } }),
      prisma.payroll.delete({ where: { id } })
    ]);

    return { success: true, message: 'Nómina eliminada correctamente' };
  }

  private calculateGrossSalary(employee: EmployeeWithDepartment): number {

    return 5000; 
  }

  private async calculateDeductions(grossAmount: number, customDeductions: Record<string, number> = {}): Promise<Record<string, number>> {
    const deductions: Record<string, number> = {};

    deductions.igss = parseFloat((grossAmount * 0.0483).toFixed(2));

    deductions.isr = this.calculateISR(grossAmount);

    Object.entries(customDeductions).forEach(([key, value]) => {
      deductions[key] = (deductions[key] || 0) + value; 
    });

    return deductions;
  }

  private calculateISR(grossAmount: number): number {
    let isrAmount = 0;
    if (grossAmount > 100000) isrAmount = grossAmount * 0.15;
    else if (grossAmount > 50000) isrAmount = grossAmount * 0.10;
    else if (grossAmount > 30000) isrAmount = grossAmount * 0.05;

    return parseFloat(isrAmount.toFixed(2));
  }

  async getPayrollStats() {
    const totalPayrolls = await prisma.payroll.count();
    const finalizedPayrolls = await prisma.payroll.count({
      where: { status: 'FINALIZED' }
    });

    const totalAmount = await prisma.payrollItem.aggregate({
      _sum: { grossAmount: true }
    });

    const byDepartment = await prisma.department.findMany({
      include: {
        _count: {
          select: { payrolls: true }
        },
        payrolls: {
          include: { items: true }
        }
      }
    });

    return {
      total: totalPayrolls,
      finalized: finalizedPayrolls,
      totalAmount: totalAmount._sum.grossAmount || 0,
      byDepartment: byDepartment.map(dept => ({
        department: dept.name,
        count: dept._count.payrolls,
        amount: dept.payrolls.reduce((sum, payroll) => 
          sum + payroll.items.reduce((itemSum, item) => itemSum + item.grossAmount, 0), 0
        )
      }))
    };
  }
}