// =============================================
// TIPOS PARA FRONTEND - GENERADOS RÁPIDAMENTE
// Basados en la estructura actual del backend
// =============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    meta?: {
        totalItems: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
}

// ==================== AUTENTICACIÓN ====================
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
}

export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'RRHH' | 'EMPLEADO';
    employee?: Employee;
    createdAt: string;
    updatedAt: string;
}

// ==================== EMPLEADOS ====================
export interface Employee {
    id: string;
    nationalId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    departmentId: string;
    department?: Department;
    position?: string;
    hireDate?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'VACATION';
    createdAt: string;
    updatedAt: string;
    user?: User;
}

export interface EmployeeCreate {
    nationalId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    departmentId: string;
    position?: string;
    hireDate?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'VACATION';
}

export interface EmployeeUpdate extends Partial<EmployeeCreate> {}

export interface EmployeeQuery {
    page?: number;
    pageSize?: number;
    q?: string;
    department?: string;
    status?: string;
}

// ==================== DEPARTAMENTOS ====================
export interface Department {
    id: string;
    name: string;
    description?: string;
}


export interface Payroll {
    id: string;
    periodStart: string;
    periodEnd: string;
    description?: string;
    departmentId?: string;
    department?: Department;
    status: 'DRAFT' | 'FINALIZED' | 'PAID';
    items?: PayrollItem[];
    createdAt: string;
    updatedAt: string;
}

export interface PayrollCreate {
    periodStart: string;
    periodEnd: string;
    departmentId?: string;
    description?: string;
}

export interface PayrollItem {
    id: string;
    payrollId: string;
    employeeId: string;
    employee?: Employee;
    grossAmount: number;
    netAmount: number;
    deductions: Record<string, number>;
    createdAt: string;
}

export interface PayrollQuery {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    department?: string;
    status?: string;
}

// ==================== DOCUMENTOS ====================
export interface Document {
    id: string;
    employeeId: string;
    filename: string;
    storageKey: string;
    mimeType?: string;
    size?: number;
    tags?: string[];
    description?: string;
    uploadedBy: string;
    uploader?: User;
    createdAt: string;
    updatedAt: string;
}

// ==================== USUARIOS ====================
export interface UserQuery {
    page?: number;
    pageSize?: number;
    q?: string;
    role?: string;
}

// ==================== CLIENTE API ====================
export interface ApiClientConfig {
    baseURL: string;
    token?: string;
}

export class ApiClient {
    private baseURL: string;
    private token?: string;

    constructor(config: ApiClientConfig) {
        this.baseURL = config.baseURL;
        this.token = config.token;
    }

    setToken(token: string) {
        this.token = token;
    }

    // FUNCIÓN REQUEST CON CORRECCIÓN TS7053
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        
        // 1. Usamos Record<string, string> para permitir la indexación.
        const headers: Record<string, string> = { 
            'Content-Type': 'application/json',
            // 2. Copiamos los headers existentes, forzando el tipo para evitar el error.
            ...(options.headers as Record<string, string> || {}), 
        };

        if (this.token) {
            // 3. Indexamos el objeto headers sin error.
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            // 4. Pasamos el objeto ajustado a fetch, casteando de nuevo a HeadersInit.
            headers: headers as HeadersInit, 
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Request failed');
        }

        return data;
    }

    // Auth methods
    async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        return this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async getProfile(): Promise<ApiResponse<User>> {
        return this.request<User>('/auth/me');
    }

    // Employee methods
    async getEmployees(params?: EmployeeQuery): Promise<ApiResponse<Employee[]>> {
        const query = new URLSearchParams(params as any).toString();
        return this.request<Employee[]>(`/employees?${query}`);
    }

    async getEmployee(id: string): Promise<ApiResponse<Employee>> {
        return this.request<Employee>(`/employees/${id}`);
    }

    async createEmployee(data: EmployeeCreate): Promise<ApiResponse<Employee>> {
        return this.request<Employee>('/employees', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateEmployee(id: string, data: EmployeeUpdate): Promise<ApiResponse<Employee>> {
        return this.request<Employee>(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteEmployee(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
        return this.request(`/employees/${id}`, {
            method: 'DELETE',
        });
    }

    // Payroll methods
    async getPayrolls(params?: PayrollQuery): Promise<ApiResponse<Payroll[]>> {
        const query = new URLSearchParams(params as any).toString();
        return this.request<Payroll[]>(`/payroll?${query}`);
    }

    async createPayroll(data: PayrollCreate): Promise<ApiResponse<Payroll>> {
        return this.request<Payroll>('/payroll', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // User methods
    async getUsers(params?: UserQuery): Promise<ApiResponse<User[]>> {
        const query = new URLSearchParams(params as any).toString();
        return this.request<User[]>(`/users?${query}`);
    }
}