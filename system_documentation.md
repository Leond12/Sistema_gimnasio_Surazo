# Documentación del Sistema ERP Gimnasio "Surazo"

## 1. Arquitectura del Sistema
El sistema ha sido estructurado siguiendo el modelo Cliente-Servidor separando las responsabilidades de Interfaz (Frontend) y Lógica de Negocio/Base de Datos (Backend).

### 1.1 Frontend (React + Vite)
- **Gestión de Estado y Contexto (Context API)**:
  - `ThemeContext`: Maneja de forma dinámica las variables CSS y el selector de clase `dark` de TailwindCSS. Permite seleccionar una paleta de colores personalizada que sobreescribe las variables CSS principales permitiendo una estética moderna y "exótica".
  - `AlertContext`: Todas las notificaciones de éxito, error y los popups de confirmación están encapsulados aquí. No se utilizan funciones nativas del navegador como `window.alert` o `window.confirm`.
  - `AuthContext`: Controla el inicio de sesión del usuario. Se incluye una validación de pruebas temporal para el usuario `Admin` y clave `Admin123`. **IMPORTANTE**: Borrar o comentar este bloque antes de pasar a producción pura.
- **Componentes Base**: 
  - `GenericCRUD`: Agilliza enormemente el sistema minimizando el código repetitivo. Se adapta dinámicamente según el endpoint que recibe y las estructuras de parámetros de cada tabla en la BD.
- **Rutas y Optimización**: Se ha utilizado `React.lazy()` en el archivo `App.jsx` para el envío de paquetes (code-splitting). Esto significa que la carga inicial de Dashboard no cargará los archivos de "Productos" o "Clases" hasta que el usuario intente ingresar a esos módulos, optimizando drásticamente la velocidad.

### 1.2 Backend (PHP + PDO)
- El backend está encapsulado en la carpeta `api/`.
- Se ha creado un archivo `generic_crud.php` que maneja inyecciones SQL de forma segura gracias a instrucciones preparadas usando `PDO`. 
- Cada módulo (ej: `clases.php`, `socios.php`) carga el core general, y en el caso del verbo HTTP `GET` realiza sus propios `LEFT JOIN` con otras tablas para traer descripciones legibles (como traer el *nombre del instructor* en vez del *ID* en clases).

---

## 2. Posibles Errores y Puntos a Tener en Cuenta

1. **Cors y API URL**:
   - El `.env` asume que el backend está alojado en `https://surazodigital.com/proyecto_gimnasio/api`. Si se corre de local usando VITE, puede presentarse un error de CORS de navegador si ambos dominios (localhost vs host real) no coinciden. El archivo `db.php` posee la cabecera `Access-Control-Allow-Origin: *` para solventar esto, pero se recomienda establecerlo únicamente para el dominio desde el cual se servirá la aplicación productiva.
2. **Password Mismatch (Hash bcrypt)**:
   - El sistema encripta las contraseñas al insertarlas o actualizarlas en el archivo `usuarios.php`. Sin embargo, si usuarios anteriores fueron cargados manuales en SQL sin el encriptado, no podrán hacer uso de su contraseña (dará error de credenciales incorrectas ya que se espera un hash bcrypt `password_verify`).
3. **Restricciones de Integridad (Foreign Keys)**:
   - Al eliminar un Socio que tiene Membresías activas, el backend devolverá un error con `PDOException`. El frontend está configurado para mostrar un "Error al eliminar" o "Registro en uso" de forma prolija.

---

## 3. Puntos de Mejora y Escalabilidad

1. **Roles y Permisos (RBAC)**:
   - Actualmente, cualquier usuario que entre tiene visibilidad de todas las páginas de `App.jsx`. Para escalar se recomienda integrar en el `AuthContext` una validación del `id_rol` o `roles_nombre` y crear un componente `<RoleProtectedRoute validRoles={[1, 2]}>` para las rutas (ej: Que un cajero no pueda ver Usuarios y Roles).
2. **Historial de Auditoría**:
   - Crear una tabla `logs` en MySQL donde los endpoints PHP registren `quién eliminó a quién`, `cuándo se modificó una venta`, etc. 
3. **Paginación del Lado del Servidor (Server-Side Pagination)**:
   - `GenericCRUD.jsx` y los archivos PHP actuales obtienen *todos* los registros usando `FETCH_ALL()`. Esto es excelente en rendimiento para tablas de hasta ~20,000 registros, pero cuando hayan 1 millón de asistencias almacenadas, el paquete JSON pesará demasiado. Se recomienda escalar a paginación basada en parámetros GET: `?action=read&page=1&limit=50`.
4. **JWT (JSON Web Tokens)**:
   - La seguridad en el proyecto actual confía en variables en `localStorage`. Migrar a un mecanismo de `httpOnly cookies` con JWT aumentará fuertemente la seguridad de las peticiones que se realicen a la API.

--- 
*Desarrollado y estructurado priorizando escalabilidad, UI/UX verde personalizable, y código limpio (Clean Code).*
