import { prisma } from '../../core/config/database.js';
import fs from 'fs';
import path from 'path';
import { ReportRequest, ReportTemplate, GeneratedReport } from './reports.types.js';
import { format } from 'date-fns';

export class ReportsService {
  async getReportTemplates(): Promise<ReportTemplate[]> {
    return [
      {
        id: '1',
        name: 'Reporte de Nóminas',
        description: 'Resumen de todas las nóminas generadas, filtradas por fechas o departamento.',
        type: 'PAYROLL',
        availableFormats: ['PDF', 'EXCEL', 'CSV']
      },
      {
        id: '2',
        name: 'Reporte de Empleados',
        description: 'Listado de empleados activos e inactivos con detalles de contacto.',
        type: 'EMPLOYEES',
        availableFormats: ['PDF', 'EXCEL', 'CSV']
      },
      {
        id: '3',
        name: 'Reporte de Documentos',
        description: 'Documentos cargados por los empleados en el sistema.',
        type: 'DOCUMENTS',
        availableFormats: ['PDF', 'EXCEL', 'CSV']
      }
    ];
  }

  async generateReport(request: ReportRequest): Promise<GeneratedReport> {
    const { type, format: fileFormat, startDate, endDate, department } = request;
    const now = new Date();
    const timestamp = format(now, 'yyyyMMdd_HHmmss');

    const outputDir = path.resolve('reports');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const filename = `${type.toLowerCase()}_${timestamp}.${fileFormat.toLowerCase()}`;
    const outputPath = path.join(outputDir, filename);

    let records: any[] = [];

    switch (type) {
      case 'PAYROLL':
        records = await this.getPayrollReport(startDate, endDate, department);
        break;

      case 'EMPLOYEES':
        records = await this.getEmployeeReport(department);
        break;

      case 'DOCUMENTS':
        records = await this.getDocumentsReport(department);
        break;

      default:
        throw new Error('INVALID_REPORT_TYPE');
    }

    if (fileFormat === 'CSV') {
      const csv = this.convertToCSV(records);
      fs.writeFileSync(outputPath, csv, 'utf8');
    } else {
      fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), 'utf8');
    }

    const downloadUrl = `/downloads/${filename}`;

    return {
      downloadUrl,
      filename,
      generatedAt: now.toISOString(),
      recordCount: records.length
    };
  }

  private async getPayrollReport(startDate?: string, endDate?: string, department?: string) {
    const where: any = {};
    if (startDate && endDate) {
      where.periodStart = { gte: new Date(startDate) };
      where.periodEnd = { lte: new Date(endDate) };
    }
    if (department) {
      where.departmentId = department;
    }

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        department: { select: { name: true } },
        items: true
      },
      orderBy: { periodStart: 'desc' }
    });

    return payrolls.map(p => ({
      id: p.id,
      periodo: `${p.periodStart.toISOString().slice(0,10)} - ${p.periodEnd.toISOString().slice(0,10)}`,
      departamento: p.department?.name || 'General',
      totalItems: p.items.length,
      estado: p.status
    }));
  }

  private async getEmployeeReport(department?: string) {
    const where: any = {};
    if (department) where.departmentId = department;

    const employees = await prisma.employee.findMany({
      where,
      include: { department: { select: { name: true } } },
      orderBy: { firstName: 'asc' }
    });

    return employees.map(e => ({
      id: e.id,
      nombre: `${e.firstName} ${e.lastName}`,
      departamento: e.department?.name || 'Sin asignar',
      estado: e.status,
      correo: e.email,
      telefono: e.phone
    }));
  }

  private async getDocumentsReport(department?: string) {
    const docs = await prisma.document.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return docs
      .filter(d => !department || d.employee.department?.name === department)
      .map(d => ({
        id: d.id,
        empleado: `${d.employee.firstName} ${d.employee.lastName}`,
        departamento: d.employee.department?.name || 'N/A',
        archivo: d.filename,
        fecha: d.createdAt.toISOString().slice(0,10),
        tamaño: `${(d.size || 0) / 1024} KB`
      }));
  }


  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(h => JSON.stringify(obj[h] ?? '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  }
}
