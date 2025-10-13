// scripts/test-api.ts
const API_BASE = 'http://localhost:4000';

async function testEndpoint(endpoint: string, options: any = {}) {
  try {
    const start = Date.now();
    
    // Asegurar que body sea string JSON válido
    if (options.body && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
    
    const responseTime = Date.now() - start;
    const data = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      success: response.ok,
      data,
      responseTime
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: 0
    };
  }
}

async function testAPI() {
  console.log('INICIANDO PRUEBAS DEL SISTEMA HRM\n');
  
  console.log('🔍 Probando Health Check...');
  const health = await testEndpoint('/health');
  console.log(`   Status: ${health.status} | Time: ${health.responseTime}ms`);
  

  console.log('\n Probando Login...');
  const login = await testEndpoint('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@hrm.com',
      password: 'admin123'
    }
  });
  
  console.log(`   Status: ${login.status} | Success: ${login.success}`);
  
  if (login.success && login.data?.data?.accessToken) {
    const token = login.data.data.accessToken;
    console.log(' Login exitoso, token obtenido');
    

    console.log('\n👥 Probando Lista de Empleados...');
    const employees = await testEndpoint('/api/employees?page=1&pageSize=5', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Status: ${employees.status} | Time: ${employees.responseTime}ms`);
    if (employees.success && employees.data?.data) {

      const employeesData = employees.data.data;
      console.log(`   📊 ${Array.isArray(employeesData) ? employeesData.length : 'N/A'} empleados encontrados`);
      if (employees.data.meta) {
        console.log(`   📄 Paginación: página ${employees.data.meta.pagination?.page} de ${employees.data.meta.pagination?.totalPages}`);
      }
    } else {
      console.log(`    Error: ${employees.data?.error?.message}`);
    }
    

    console.log('\n Probando Nóminas...');
    const payrolls = await testEndpoint('/api/payroll?page=1&pageSize=5', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Status: ${payrolls.status} | Time: ${payrolls.responseTime}ms`);
    if (payrolls.success && payrolls.data?.data) {
      const payrollsData = payrolls.data.data;
      console.log(`   📊 ${Array.isArray(payrollsData) ? payrollsData.length : 'N/A'} nóminas encontradas`);
      if (payrolls.data.meta) {
        console.log(`   📄 Paginación: página ${payrolls.data.meta.pagination?.page} de ${payrolls.data.meta.pagination?.totalPages}`);
      }
    } else {
      console.log(`   ❌ Error: ${payrolls.data?.error?.message}`);
    }
    
    console.log('\n👤 Probando Usuarios...');
    const users = await testEndpoint('/api/users?page=1&pageSize=5', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Status: ${users.status} | Time: ${users.responseTime}ms`);
    if (users.success && users.data?.data) {
      const usersData = users.data.data;
      console.log(`    ${Array.isArray(usersData) ? usersData.length : 'N/A'} usuarios encontrados`);
    } else if (users.status === 404) {
      console.log(`    Ruta de usuarios no encontrada - verificar montaje de rutas`);
    } else {
      console.log(`    Error: ${users.data?.error?.message}`);
    }
    

    console.log('\n👤 Probando Perfil de Usuario...');
    const profile = await testEndpoint('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Status: ${profile.status} | Time: ${profile.responseTime}ms`);
    if (profile.success) {
      console.log(`   Perfil obtenido: ${profile.data.data.email} (${profile.data.data.role})`);
    }
    
  } else {
    console.log('   No se pudo obtener token, saltando pruebas protegidas');
  }
  
  console.log('\n PRUEBAS COMPLETADAS');
}

testAPI();