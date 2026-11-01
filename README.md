# Dashboard_Flota

Proyecto académico de Base de Datos Aplicada: tablero de flota de una empresa de transporte.

El tablero muestra datos reales del sistema de gestión de la empresa. Un importador del backend los obtiene de la réplica (Supabase), los guarda en una zona previa de PostgreSQL y los carga en las tablas del modelo. La API consulta esas tablas con SQL y el frontend presenta indicadores, gráficos, recorridos de tres niveles y semáforos.

## Funcionalidades

- Inicio de sesión contra la tabla `Usuarios`, con contraseñas en bcrypt y JWT en cookie HttpOnly.
- Importación periódica desde la réplica, con validación y carga en una sola transacción.
- Tablero principal con tarjetas, unidades por estado, consumo mensual y resumen de semáforos.
- Cuatro recorridos con Drill Down y Drill Up:
  - Flota: estados → unidades del estado → ficha de la unidad.
  - Combustible: meses → unidades del mes → cargas de la unidad.
  - Documentación: semáforo → documentos de un color → ficha de la unidad.
  - Choferes: semáforo de licencias → choferes de un color → ficha de la unidad asignada.
- Semáforos de vencimiento de documentos, vencimiento de licencias y eficiencia de combustible.

## Tecnologías

| Parte | Tecnologías |
| --- | --- |
| Frontend | React, Vite, React Router, React Hook Form, Axios y Recharts. |
| Backend | Node.js, Express, pg, dotenv, cors y cookie-parser. |
| Autenticación | bcrypt y jsonwebtoken. |
| Base de datos | PostgreSQL. |
| Fuente de datos | La réplica (Supabase), mediante la API REST de PostgREST. |

## Estructura

```text
Dashboard_Flota/
├── db/
│   ├── 01_CreateDb.sql      # Base de datos y tabla Usuarios
│   ├── 02_Modelo.sql        # Tablas del modelo de flota
│   ├── 03_Importacion.sql   # Schema importacion: zona previa y estado de la importación
│   └── consultas/           # SELECT de ejemplo para ejecutar en pgAdmin (no crean nada)
├── src/
│   ├── importador/          # Descarga desde la réplica, validación y carga en el modelo
│   ├── consultas/           # Consultas SQL del tablero
│   ├── controllers/         # Respuestas de cada ruta de la API
│   ├── routes/              # Rutas de la API
│   ├── middleware/          # Validación del token
│   ├── libs/                # JWT, memoria de consultas y precarga
│   ├── scripts/             # Creación de usuarios
│   ├── app.js               # Configuración de Express
│   ├── config.js            # Variables de entorno
│   ├── db.js                # Conexión con PostgreSQL
│   └── index.js             # Inicio del servidor y de la importación periódica
└── client/                  # Frontend React
```

## Instalación

Se necesita Node.js 24, npm y PostgreSQL.

```powershell
npm install
cd client
npm install
cd ..
```

### Base de datos

En pgAdmin, ejecutar los scripts de `db/` en orden:

1. `01_CreateDb.sql`: la primera sentencia conectado a la base `postgres`; el resto conectado a `dashboard_flota`.
2. `02_Modelo.sql`, conectado a `dashboard_flota`.
3. `03_Importacion.sql`, conectado a `dashboard_flota`.

Las tablas del modelo quedan vacías hasta la primera importación.

### Variables de entorno

El backend lee `.env.local`, en la raíz del repositorio. Ese archivo está excluido de Git.

| Variable | Contenido |
| --- | --- |
| `PORT` | Puerto de la API. Por defecto, 3000. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Conexión con PostgreSQL. |
| `TOKEN_SECRET` | Clave para firmar los JWT del login. |
| `MIRROR_URL` | URL del proyecto de la réplica, sin `/rest/v1`. |
| `MIRROR_PUBLISHABLE_KEY` | Publishable key de la réplica. |
| `MIRROR_EMAIL`, `MIRROR_PASSWORD` | Usuario de integración habilitado en `mirror.tablero_acceso`. |
| `IMPORTACION_MINUTOS` | Intervalo de la importación periódica. Por defecto, 10. |

Si faltan las variables `MIRROR_*`, el servidor arranca igual, pero no importa datos.

### Usuario del tablero

El script `src/scripts/create-user.js` crea una cuenta en `Usuarios` con la contraseña en bcrypt. En PowerShell:

```powershell
$env:INITIAL_USERNAME = "usuario"
$env:INITIAL_NAME = "Nombre Apellido"
$env:INITIAL_PASSWORD = "contraseña"
npm run seed:user
```

## Ejecución

Con PostgreSQL en funcionamiento, abrir dos terminales.

**Backend**, desde la raíz:

```powershell
npm run dev
```

La API queda en `http://localhost:3000/api`. Al iniciar, el servidor importa desde la réplica y repite la importación cada `IMPORTACION_MINUTOS`.

**Frontend**, desde la raíz:

```powershell
cd client
npm run dev
```

Abrir [http://localhost:5173/](http://localhost:5173/).

## Importación desde la réplica

1. Consulta el estado de la réplica. Si la generación de la publicación es la misma de la última importación, no descarga nada.
2. Descarga las entidades en páginas de 500 registros y las guarda en `importacion.registros`. La importación es completa al iniciar y en la primera importación después de las 3 de la mañana; el resto son incrementales y de combustible solo bajan las últimas 600 cargas.
3. Vuelve a consultar el estado. Si la generación cambió, reinicia la descarga (hasta tres intentos).
4. En una transacción valida cada registro en JavaScript y carga los válidos: la completa vacía y recarga el modelo, y la incremental actualiza solo lo que cambió. Los rechazados se cuentan con su motivo.
5. Registra el resultado en `importacion.estado`. Si algo falla, la transacción se revierte y el tablero conserva la última carga completa.

La API guarda en memoria el resultado de cada consulta hasta la próxima importación, y el frontend precarga las pantallas principales al iniciar sesión.

La réplica solo permite exportar si la última publicación del sistema de gestión tiene menos de 15 minutos. Cuando el sistema de gestión no está publicando, la importación queda registrada como `pausado` y el tablero sigue mostrando los datos anteriores.

## Rutas de la API

Todas las rutas, salvo `/login`, `/logout` y `/verifyToken`, exigen un token válido y una cuenta activa.

| Método | Ruta | Función |
| --- | --- | --- |
| POST | `/api/login` | Verifica las credenciales y genera el token. |
| POST | `/api/logout` | Cierra la sesión: elimina la cookie y el token deja de ser válido. |
| GET | `/api/verifyToken` | Verifica el token y devuelve el usuario. |
| GET | `/api/profile` | Devuelve los datos del usuario. |
| GET | `/api/tablero` | Indicadores del tablero principal. |
| GET | `/api/importacion` | Resultado de la última importación. |
| GET | `/api/flota` | Unidades por estado. |
| GET | `/api/flota/:estado` | Unidades de un estado. |
| GET | `/api/unidades/:idUnidad` | Ficha de una unidad. |
| GET | `/api/combustible` | Consumo de los últimos 12 meses. |
| GET | `/api/combustible/:mes` | Unidades que cargaron en un mes (`AAAA-MM`). |
| GET | `/api/combustible/:mes/unidades/:idUnidad` | Cargas de una unidad en un mes. |
| GET | `/api/documentos` | Documentos por color de semáforo y por tipo. |
| GET | `/api/documentos/:color` | Documentos de un color. |
| GET | `/api/choferes` | Licencias por color de semáforo. |
| GET | `/api/choferes/:color` | Choferes de un color. |

## Semáforos

| Semáforo | Criterio |
| --- | --- |
| Documentos y licencias | Rojo: vencido. Amarillo: vence en 30 días o menos. Verde: más de 30 días. Gris: sin fecha. |
| Eficiencia | Compara cada unidad con las del mismo tipo y la misma unidad de medida en el período, usando tramos entre lecturas de odómetro confiables. Verde: igual o menor. Amarillo: hasta 15 % más. Rojo: más de 15 % por encima. Gris: sin tramos válidos o con menos de la mitad del consumo de su tipo. |

## Autor

Gaspar Scalbi
Base de Datos Aplicada
