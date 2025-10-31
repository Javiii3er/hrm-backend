# Sistema HRM – Backend API  
**Sistema de Gestión de Recursos Humanos y Nóminas**

---

## Descripción General

El **Sistema HRM (Human Resources Management System)** es una API RESTful desarrollada en **Node.js con TypeScript**, utilizando **Express** y **Prisma ORM** para la gestión integral de empleados, usuarios, documentos y nóminas.  
Esta API forma parte del ecosistema completo junto con el frontend [`hrm-frontend`](https://github.com/Javiii3er/hrm-frontend.git), creado en **React + Vite**, con autenticación JWT y comunicación directa con este backend.

El objetivo principal del sistema es ofrecer una base sólida para la administración de personal, control de documentos laborales, generación de nóminas y reportes dinámicos.

---

## Arquitectura del Proyecto

La API está construida bajo una arquitectura **modular y escalable**, separando responsabilidades por dominio funcional.

src/  
├── core/  
│ ├── config/ # Configuración de base de datos, variables de entorno  
│ ├── middleware/ # Middlewares globales (auth, logging, validation)  
│ └── utils/ # Utilidades compartidas (respuestas, logger, seguridad)  
│  
├── modules/  
│ ├── auth/ # Autenticación JWT, login, refresh tokens  
│ ├── employees/ # Gestión de empleados  
│ ├── departments/ # Gestión de departamentos  
│ ├── documents/ # Subida y descarga de documentos  
│ ├── payroll/ # Nóminas (generación, cálculo, finalización)  
│ ├── users/ # Administración de usuarios  
│ ├── profile/ # Perfil del usuario autenticado  
│ └── reports/ # Generación de reportes PDF/CSV  
│  
├── types/ # Tipos globales y generados desde OpenAPI  
├── app.ts # Configuración principal de Express  
└── server.ts # Punto de entrada del servidor  

---

##  Tecnologías Utilizadas

| Categoría | Tecnologías |
|------------|--------------|
| Lenguaje | TypeScript (ESM) |
| Framework | Express.js |
| ORM | Prisma (MySQL) |
| Autenticación | JWT + bcrypt |
| Validación | Zod |
| Seguridad | Helmet, CORS, Rate limiting |
| Logs | Winston |
| Documentación | OpenAPI 3.1 (Redocly CLI) |
| Otros | Multer, dotenv, compression |

---

## Base de Datos

- **Motor:** MySQL  
- **Versión:** 8.0.36  
- **ORM:** Prisma  
- **Modelo de datos:** definido en `prisma/schema.prisma`  
- **Relaciones:** incluye modelos `User`, `Employee`, `Department`, `Document`, `Payroll`, `PayrollItem`, `AuditLog`.

---

##  Migraciones de Base de Datos (Prisma)

Para mantener el esquema sincronizado con la base de datos y generar el cliente actualizado:

# 1 Crear migración cuando haya cambios en el esquema
npx prisma migrate dev --name update-employee-relations

# 2 Regenerar el cliente Prisma
npx prisma generate

---

### Clonar y configurar la base de datos local

1. Instala **MySQL** o utiliza **MySQL Workbench** / **XAMPP**.  
2. Crea una base de datos vacía llamada:

   ```sql
   CREATE DATABASE hrm_db;

3. Copia el archivo .env.example y renómbralo a .env:

   cp .env.example .env

4. Dentro del archivo .env, configura la URL de conexión:

   DATABASE_URL="mysql://root:tu_contraseña@localhost:3306/hrm_db"
    PORT=4000
    JWT_SECRET=tu_clave_secreta

5. Ejecuta las migraciones y genera el cliente Prisma:

   npx prisma generate
    npx prisma db push

6. (Opcional) Si tienes un script de semillas:

   npm run db:seed

---

## Instalación y Ejecución

1. Clonar el repositorio

   git clone https://github.com/Javiii3er/hrm-backend.git
    cd hrm-backend

2. Instalar dependencias

   npm install

3. Configurar entorno

   Asegúrate de haber configurado tu archivo .env como se muestra arriba.

4. Ejecutar el servidor en desarrollo

   npm run dev

Esto iniciará el servidor en modo desarrollo con recarga automática gracias a tsx watch.
Por defecto, estará disponible en: http://localhost:4000/api

5. Compilar para producción

   npm run build
    npm start

---

## Documentación de la API

La documentación completa del API está definida en el archivo openapi.yaml.

Validar especificación OpenAPIrsonal, control de documentos laborales, generación de nóminas y reportes dinámicos.
   npm run docs:validate-openapi

Generar tipos TypeScript desde el esquema OpenAPI
   npm run docs:generate-types

Esto crea automáticamente los tipos dentro de src/types/api.gen.ts, sincronizados con el contrato de la API.

---
## Autenticación y Seguridad

- Autenticación por **JWT** (`/auth/login`, `/auth/refresh`, `/auth/me`)
- Protección de rutas con middleware `authenticateJWT`
- Roles de usuario: **ADMIN**, **RRHH**, **EMPLEADO**

### Seguridad reforzada con:
-  **Helmet:** cabeceras HTTP seguras  
-  **CORS:** configurado correctamente  
-  **Compression:** para mejorar el rendimiento  
-  **Logging centralizado:** con **Winston**  
-  **Validación exhaustiva:** mediante **Zod**

---

##  Módulos Principales

| Módulo | Descripción | Endpoints clave |
|--------|--------------|----------------|
| **Auth** | Login, refresh tokens, perfil autenticado | `/auth/login`, `/auth/me` |
| **Empleados** | CRUD de empleados | `/employees`, `/employees/{id}` |
| **Usuarios** | Gestión de usuarios del sistema | `/users`, `/users/{id}` |
| **Documentos** | Subida, descarga y listado de documentos | `/documents`, `/employees/{id}/documents` |
| **Nóminas** | Creación, generación de items y finalización | `/payroll`, `/payroll/{id}/generate` |
| **Reportes** | Generación de reportes PDF y CSV | `/reports/generate` |

---

##  Integración con el Frontend

Este backend está diseñado para trabajar junto con el proyecto [`hrm-frontend`](https://github.com/Javiii3er/hrm-frontend.git), desarrollado con **React + Vite + TypeScript**.

- **URL base de la API utilizada por el frontend:** http://localhost:4000/api

---

### Comunicación y autenticación:
-  Autenticación compartida mediante **JWT**, guardado en `localStorage` del navegador  
-  Comunicación vía **Axios** a través del cliente `apiClient`  
-  Soporte completo para **CORS** y peticiones seguras **HTTPS** en entornos productivos  

---

##  Scripts Disponibles

| Script | Descripción |
|--------|--------------|
| `npm run dev` | Inicia el servidor en modo desarrollo (`tsx watch`) |
| `npm run build` | Compila TypeScript a JavaScript en `/dist` |
| `npm start` | Inicia el servidor compilado en producción |
| `npm run db:push` | Aplica el modelo de Prisma a la base de datos |
| `npm run db:seed` | Carga datos iniciales (si existe script de seed) |
| `npm run db:reset` | Restaura la base de datos desde cero |
| `npm run docs:validate-openapi` | Valida el archivo OpenAPI |
| `npm run docs:generate-types` | Genera tipos TypeScript desde OpenAPI |
| `npm run test:api` | Ejecuta pruebas de endpoints (si configuradas) |

---

##  Buenas Prácticas

-  Uso de **tipado fuerte con TypeScript**  
-  **Modularización completa** de controladores, servicios y esquemas  
-  **Validaciones centralizadas** con `zod`  
-  **Errores estandarizados** mediante `sendSuccess` y `sendError`  
-  **Logs estructurados** con **Winston**  
-  Cumplimiento de principios **REST** y diseño de **APIs escalables**

---

##  Autor

**Javier Rivera**  
Proyecto académico-profesional para el sistema de gestión de recursos humanos.  
Desarrollado con dedicación, siguiendo las mejores prácticas de desarrollo web moderno.

---

##  Licencia

Este proyecto se distribuye bajo licencia **ISC**.  
Puedes usarlo y modificarlo libremente, manteniendo la atribución correspondiente.

---

>  **Tip:** Para ver visualmente la documentación del API, puedes importar `openapi.yaml` en **Swagger Editor** o **Redocly**.

