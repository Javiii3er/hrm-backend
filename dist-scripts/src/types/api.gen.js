"use strict";
// =============================================
// TIPOS PARA FRONTEND - GENERADOS RÁPIDAMENTE
// Basados en la estructura actual del backend
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
class ApiClient {
    baseURL;
    token;
    constructor(config) {
        this.baseURL = config.baseURL;
        this.token = config.token;
    }
    setToken(token) {
        this.token = token;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const response = await fetch(url, {
            ...options,
            headers,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Request failed');
        }
        return data;
    }
    // Auth methods
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }
    async getProfile() {
        return this.request('/auth/me');
    }
    // Employee methods
    async getEmployees(params) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/employees?${query}`);
    }
    async getEmployee(id) {
        return this.request(`/employees/${id}`);
    }
    async createEmployee(data) {
        return this.request('/employees', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateEmployee(id, data) {
        return this.request(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    async deleteEmployee(id) {
        return this.request(`/employees/${id}`, {
            method: 'DELETE',
        });
    }
    // Payroll methods
    async getPayrolls(params) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/payroll?${query}`);
    }
    async createPayroll(data) {
        return this.request('/payroll', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // User methods
    async getUsers(params) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/users?${query}`);
    }
}
exports.ApiClient = ApiClient;
//# sourceMappingURL=api.gen.js.map