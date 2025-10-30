export type ReportType = 'PAYROLL' | 'EMPLOYEES' | 'DOCUMENTS';
export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV';

export interface ReportRequest {
  type: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  department?: string;
  filters?: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  availableFormats: ReportFormat[];
}

export interface GeneratedReport {
  downloadUrl: string;
  filename: string;
  generatedAt: string;
  recordCount: number;
}
