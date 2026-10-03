# Dashboard_Flota

Proyecto académico de la materia Base de Datos Aplicada.

Tablero web de flota para Tablero de flota / la empresa,
orientado a consultar información de unidades, choferes,
cargas de combustible y documentación.

## Alcance de la primera etapa

- Inicio de sesión con nombre de usuario y contraseña.
- Consulta de usuarios en PostgreSQL.
- Verificación de contraseñas mediante bcrypt.
- Validación de cuenta activa y mayoría de edad.
- Emisión y verificación de JWT.
- Protección de rutas que requieran autenticación.
- Cierre de sesión.

No se incluye el registro público de usuarios.
La carga inicial de usuarios se realizará de manera controlada,
almacenando únicamente el hash de la contraseña.

La entidad Sesion queda prevista en el modelo de datos y no se
utilizará en esta primera implementación.

## Tecnologías previstas

- Frontend: React.
- Backend: Node.js y Express.
- Base de datos: PostgreSQL.
- Contraseñas: bcrypt.
- Autenticación: JSON Web Tokens (JWT).
- Control de versiones: Git y GitHub.

## Estructura del proyecto

Se conserva la organización general del ejemplo de la materia:

```text
Dashboard_Flota/
├── src/            # Backend
├── client/         # Frontend React
├── db/             # Scripts SQL
├── .gitignore
└── README.md
El ejemplo original utiliza MySQL. Este proyecto utilizará PostgreSQL,
adaptando la conexión y las consultas correspondientes.

## Modelo de usuario

La entidad Usuario contempla los siguientes campos:

| Campo | Descripción |
| --- | --- |
| idUsuario | Identificador único del usuario. |
| nombreUsuario | Nombre único utilizado para iniciar sesión. |
| nombre | Nombre de la persona. |
| contrasenaHash | Hash de la contraseña generado con bcrypt. |
| fechaNacimiento | Fecha utilizada para validar la mayoría de edad. |
| activo | Indica si la cuenta tiene permitido el acceso. |

## Autenticación prevista

El backend verificará que la cuenta esté activa, que el usuario tenga
al menos 18 años y que la contraseña coincida con el hash almacenado.

Cuando las validaciones sean correctas, emitirá un JWT con una duración
de 30 minutos. El token se enviará mediante una cookie HttpOnly,
con SameSite y con Secure cuando se utilice HTTPS.

Las rutas protegidas verificarán la firma y el vencimiento del token,
además de comprobar que el usuario continúe activo.

El cierre de sesión eliminará la cookie. Mientras no se implemente
el registro de sesiones, el JWT emitido conservará su validez hasta
su vencimiento.

## Configuración y ejecución

Las instrucciones de instalación, las variables de entorno y los
comandos de ejecución se incorporarán a medida que se implemente
y verifique cada componente.

Las credenciales de PostgreSQL y la clave de firma de JWT se
configurarán mediante variables de entorno.

Los archivos .env no se incluirán en el repositorio. Se incorporará
un archivo .env.example con valores de ejemplo y sin secretos.

## Alcance futuro

Una vez completada la autenticación, el tablero permitirá consultar:

- Unidades y estados de la flota.
- Choferes y asignaciones.
- Cargas de combustible.
- Documentación y vencimientos.
- Indicadores y navegación hacia el detalle.

El tablero será de unicamente de consulta, sin ABM, ni nada relacionado. 

Para las demostraciones se utilizarán datos ficticios.

## Autor

Gaspar Scalbi  
Base de Datos Aplicada