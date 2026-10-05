# Dashboard_Flota

Proyecto académico de Base de Datos Aplicada: dashboard de flota para Tablero de flota / la empresa

Actualmente están implementados el inicio de sesión y la pantalla de inicio. Los indicadores, las consultas y el detalle de la flota corresponden a la próxima etapa del proyecto.

## Funcionalidades actuales

- Inicio de sesión con nombre de usuario y contraseña.
- Verificación de credenciales contra la tabla `Usuarios` de PostgreSQL.
- Almacenamiento de contraseñas con bcrypt.
- Control de cuentas activas.
- Autenticación con JWT y acceso protegido a la pantalla de inicio.
- Cierre de sesión.

Los usuarios se crean mediante un script local. No hay registro público ni almacenamiento de un historial de sesiones.

## Tecnologías

| Parte | Tecnologías |
| --- | --- |
| Frontend | React, Vite, React Router, React Hook Form y Axios. |
| Backend | Node.js, Express, pg, dotenv, cors y cookie-parser. |
| Autenticación | bcrypt y jsonwebtoken. |
| Base de datos | PostgreSQL. |

La organización de archivos sigue el ejemplo de la materia. La conexión y las consultas están adaptadas de MySQL a PostgreSQL.

## Estructura

```text
Dashboard_Flota/
├── src/
│   ├── controllers/       # Login, cierre de sesión y datos del usuario
│   ├── middleware/        # Validación del token
│   ├── libs/              # Generación del JWT
│   ├── routes/            # Rutas de la API
│   ├── scripts/           # Creación del usuario inicial
│   ├── app.js             # Configuración de Express
│   ├── config.js          # Variables de entorno
│   ├── db.js              # Conexión con PostgreSQL
│   └── index.js           # Inicio del servidor
├── client/                # Frontend React
├── db/                    # Script de creación de la base de datos
├── .gitignore
├── package.json
└── README.md
```

## Instalación

Se necesita Node.js, npm y PostgreSQL. El proyecto se desarrolla con Node.js 24.

Desde la raíz del repositorio, instalar las dependencias:

```powershell
npm install
cd client
npm install
cd ..
```

### Base de datos

El archivo [db/CreateDb.Sql](db/CreateDb.Sql) contiene la creación de la base `dashboard_flota` y de la tabla `Usuarios`.

En pgAdmin:

1. Abrir el Query Tool de la base `postgres` y ejecutar la sentencia de creación de la base.
2. Actualizar la lista de bases de datos.
3. Abrir el Query Tool de `dashboard_flota` y ejecutar la sentencia de creación de la tabla.

Esta preparación se realiza una sola vez por base de datos.

### Configuración del backend

El backend carga las variables de entorno desde un archivo `.env.local` ubicado en la raíz del repositorio. Allí se configuran la conexión con PostgreSQL y la clave utilizada para firmar los JWT.

La contraseña de PostgreSQL permite acceder a la base de datos. La clave de firma permite generar y verificar los tokens de autenticación. Estos valores son privados, se configuran en cada equipo y no se publican en GitHub. El archivo `.env.local` está excluido de Git por `.gitignore`.

### Usuario inicial

El script `src/scripts/create-user.js` crea las cuentas iniciales en la tabla `Usuarios`. Genera el hash de la contraseña con bcrypt y guarda la cuenta en PostgreSQL.

Los usuarios permanecen en la base de datos entre ejecuciones. Si el nombre de usuario ya existe, el script conserva la cuenta existente.

## Ejecución

Mantener PostgreSQL en funcionamiento y abrir dos terminales.

**Backend:** desde la raíz del repositorio:

```powershell
npm run dev
```

La API se ejecuta en `http://localhost:3000/api`.

**Frontend:** en la segunda terminal, desde la raíz:

```powershell
cd client
npm run dev
```

Abrir [http://localhost:5173/](http://localhost:5173/) e ingresar con el usuario creado.

## Funcionamiento del login

El frontend envía el nombre de usuario y la contraseña a la API. El backend busca la cuenta en PostgreSQL, compara la contraseña con el hash mediante bcrypt y comprueba que esté activa.

Si las credenciales son correctas, genera un JWT válido durante 30 minutos y lo envía en una cookie HttpOnly. React redirige a la pantalla de inicio. Si las credenciales son incorrectas o la cuenta está inactiva, se muestra un mensaje y se impide el ingreso.

Al cargar la aplicación se verifica el token para recuperar el usuario autenticado. La API comprueba su firma y vencimiento, y consulta si la cuenta sigue activa. Al cerrar sesión, elimina la cookie del navegador.

### Rutas de la API

| Método | Ruta | Función |
| --- | --- | --- |
| POST | `/api/login` | Verifica las credenciales y genera el token. |
| POST | `/api/logout` | Cierra la sesión: elimina la cookie y el token deja de ser válido. |
| GET | `/api/verifyToken` | Verifica el token y devuelve el usuario autenticado. |
| GET | `/api/profile` | Devuelve los datos del usuario mediante una ruta protegida. |

### Tabla de usuarios

| Campo | Función |
| --- | --- |
| `idUsuario` | Identificador único generado por la base de datos. |
| `nombreUsuario` | Nombre único utilizado para iniciar sesión. |
| `nombre` | Nombre de la persona. |
| `contrasenaHash` | Hash de la contraseña generado con bcrypt. |
| `activo` | Indica si la cuenta tiene acceso al sistema. |

## Próxima etapa

El dashboard permitirá consultar unidades, choferes, asignaciones, cargas de combustible y documentación con sus vencimientos. Incluirá indicadores y navegación hacia el detalle de los datos.

El tablero será de consulta y las demostraciones utilizarán datos ficticios.

## Autor

Gaspar Scalbi  
Base de Datos Aplicada
