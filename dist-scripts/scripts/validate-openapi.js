"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/validate-openapi.ts
const cli_1 = require("@redocly/cli");
const path_1 = __importDefault(require("path"));
async function validateOpenAPI() {
    console.log('Iniciando validación de OpenAPI (Redocly)...');
    const configPath = path_1.default.resolve(process.cwd(), 'redocly.yaml');
    const config = await (0, cli_1.createConfig)({ configFile: configPath });
    const results = await (0, cli_1.lint)({
        config,
        apis: config.apis.get('hrm-api@v1.0.0')?.root,
        logInfo: () => { },
    });
    if (!results || results.length === 0) {
        console.log(' Validación exitosa: El archivo openapi.yaml cumple con las reglas de Redocly.');
        return;
    }
    let hasErrors = false;
    for (const result of results) {
        if (result.type === 'error') {
            hasErrors = true;
            console.error(`\n ERROR en ${result.location[0].pointer}: ${result.message} [${result.ruleId}]`);
        }
        else if (result.type === 'warning') {
            console.warn(`\n WARNING en ${result.location[0].pointer}: ${result.message} [${result.ruleId}]`);
        }
    }
    if (hasErrors) {
        console.error('\n Validación fallida: Se encontraron errores en el archivo OpenAPI. Corrígelos antes de generar tipos.');
        process.exit(1);
    }
    else {
        console.log('\n Validación completada con advertencias. El archivo es usable, pero revisa las advertencias.');
    }
}
validateOpenAPI().catch(err => {
    console.error('Error fatal durante la validación:', err);
    process.exit(1);
});
//# sourceMappingURL=validate-openapi.js.map