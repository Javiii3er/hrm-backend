// scripts/test-api.ts
const API_BASE = 'http://localhost:4000/api';

async function testEndpoint(endpoint: string, options: any = {}) {
  try {
    const start = Date.now();
    const response = await fetch(`${API_BASE}${endpoint}`, options);
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
  console.log(' INICIANDO PRUEBAS DEL SISTEMA HRM\n');
  

  console.log(' Probando Health Check...');
  const health = await testEndpoint('/health');
  console.log(`   Status: ${health.status} | Time: ${health.responseTime}ms`);
  

  console.log('\n Probando Login...');
  const login = await testEndpoint('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@hrm.com',
      password: 'admin123'
    })
  });
  console.log(`   Status: ${login.status} | Success: ${login.success}`);
  if (login.data?.error) {
    console.log(`   Error: ${login.data.error.message}`);
  }
  
  if (login.success && login.data?.data?.accessToken) {
    const token = login.data.data.accessToken;
    console.log('    Login exitoso, token obtenido');
    

    console.log('\n👥 Probando Lista de Empleados...');
    const employees = await testEndpoint('/employees', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Status: ${employees.status} | Time: ${employees.responseTime}ms`);
    if (employees.data?.data) {
      console.log(`    ${employees.data.data.length} empleados encontrados`);
    }
    

    console.log('\n Probando Nóminas...');
    const payrolls = await testEndpoint('/payroll', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Status: ${payrolls.status} | Time: ${payrolls.responseTime}ms`);
    if (payrolls.data?.data) {
      console.log(`   📊 ${payrolls.data.data.length} nóminas encontradas`);
    }
    
    console.log('\n👤 Probando Usuarios...');
    const users = await testEndpoint('/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Status: ${users.status} | Time: ${users.responseTime}ms`);
    if (users.data?.data) {
      console.log(`    ${users.data.data.length} usuarios encontrados`);
    }
    

    console.log('\n Probando Documentos...');
    const documents = await testEndpoint('/employees/emp-001/documents', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Status: ${documents.status} | Time: ${documents.responseTime}ms`);
    
  } else {
    console.log('    No se pudo obtener token, saltando pruebas protegidas');
  }
  
  console.log('\n PRUEBAS COMPLETADAS');
}

testAPI();