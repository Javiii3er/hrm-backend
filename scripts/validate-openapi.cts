const { createConfig, lint } = require('@redocly/cli');
const path = require('path');
const { readFileSync } = require('fs');
async function validateOpenAPI() {
    console.log(' Iniciando validación de OpenAPI (Redocly)...');
    

    const configPath = path.resolve(process.cwd(), 'redocly.yaml');

    try {
        readFileSync(configPath);  
    } catch (e) {
        console.error(`\n Error: No se encontró el archivo de configuración en ${configPath}.`);
        console.error('Asegúrate de que el archivo redocly.yaml exista en la raíz del proyecto.');
        process.exit(1);
    }

    const config = await createConfig({ configFile: configPath });


    const apiRoot = config.apis.get('hrm-api@v1.0.0')?.root;

    if (!apiRoot) {
        console.error(`\n Error: La API 'hrm-api@v1.0.0' no se encontró en el archivo redocly.yaml.`);
        process.exit(1);
    }

    const results = await lint({
        config,
        apis: [apiRoot], 
        logInfo: () => {},
    });

    if (!results || results.length === 0) {
        console.log(' Validación exitosa: El archivo openapi.yaml cumple con las reglas de Redocly.');
        return;
    }

    let errorCount = 0;
    let warningCount = 0;
    
    console.log('\n--- Resultados de la Validación OpenAPI ---');
    for (const result of results) {
        if (result.severity === 'error') {
            errorCount++;
            console.error(`\n  ERROR [${result.ruleId}] en ${result.location[0].pointer}: ${result.message}`);
        } else if (result.severity === 'warn') {
            warningCount++;
            console.warn(`\n  WARNING [${result.ruleId}] en ${result.location[0].pointer}: ${result.message}`);
        }
    }

    console.log('\n-----------------------------------------');

    if (errorCount > 0) {
        console.error(` Validación fallida: Se encontraron ${errorCount} errores y ${warningCount} advertencias.`);
        console.error('Corrígelos antes de generar tipos o desplegar la documentación.');
        process.exit(1);
    } else {
        console.log(` Validación completada: ${warningCount} advertencias encontradas. Archivo usable.`);
        process.exit(0);
    }
}

validateOpenAPI().catch(err => {
    console.error(' Error fatal durante la validación:', err.message || err);
    process.exit(1);
});