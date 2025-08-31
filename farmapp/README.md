# Sistema de Gestión de Farmacia

Aplicación web completa para la gestión integral de una farmacia, desarrollada con Node.js, Express, MySQL, Handlebars y tecnologías modernas de desarrollo web.

## 🚀 Características Principales

- 🔐 Autenticación segura con roles (administrador/empleado)
- 📦 Gestión completa de productos (CRUD)
- 📊 Control de inventario con alertas de stock bajo
- 🏷️ Gestión de categorías y proveedores
- 💰 Registro de ventas y facturación
- 📈 Panel de control con estadísticas en tiempo real
- 🌐 Interfaz responsiva y moderna
- 🔒 Seguridad mejorada con Helmet, CORS y protección contra XSS
- ⚡ Optimización de rendimiento con compresión y caché

## 🛠️ Requisitos del Sistema

- Node.js (v16 o superior)
- MySQL (v8.0 o superior)
- npm (v8 o superior) o yarn

## 🚀 Instalación Rápida

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/BryanLobo06/Gestion_almacen_medicamentos.git
   cd farmapp
   ```

2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn
   ```

3. Configuración del entorno:
   - Copiar el archivo `.env.example` a `.env`
   - Configurar las variables de entorno según tu configuración local

4. Configuración de la base de datos:
   ```bash
   # Crear la base de datos (asegúrate de que MySQL esté en ejecución)
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS drugstore;"
   
   # Ejecutar migraciones y seeders
   npm run setup-db
   ```

## 🏃‍♂️ Iniciar la Aplicación

Para el entorno de desarrollo:
```bash
npm run dev
```

Para producción:
```bash
npm start
```

La aplicación estará disponible en:
- **URL local:** http://localhost:3000
- **Usuario por defecto (admin):** admin@farmacia.com
- **Contraseña:** admin123

## 🛠️ Estructura del Proyecto

```
farmapp/
├── config/           # Configuraciones de la aplicación
├── controllers/      # Controladores de la lógica de negocio
├── middleware/       # Middlewares personalizados
├── models/           # Modelos de base de datos
├── public/           # Archivos estáticos (CSS, JS, imágenes)
│   ├── css/
│   ├── js/
│   └── images/
├── routes/           # Rutas de la API
├── utils/            # Utilidades y helpers
├── views/            # Plantillas Handlebars
│   ├── layouts/
│   ├── partials/
│   └── ...
├── .env.example      # Variables de entorno de ejemplo
├── app.js            # Punto de entrada de la aplicación
└── package.json
```

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=drugstore
DB_PORT=3306

# JWT
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=24h

# Session
SESSION_SECRET=tu_clave_secreta_sesion
```

## 🧪 Testing

Para ejecutar los tests:
```bash
npm test
```

## 🛡️ Seguridad

La aplicación incluye las siguientes medidas de seguridad:
- Protección contra XSS
- Prevención de inyección SQL
- Headers de seguridad con Helmet
- Rate limiting
- Validación de entrada
- CORS configurado

## 🤝 Contribuir

1. Haz un Fork del proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## ✨ Créditos

- [Tu Nombre](https://github.com/tu-usuario)
- [Contribuidores](https://github.com/tu-usuario/farmapp/contributors)

---

<div align="center">
  Hecho con ❤️ para una mejor gestión farmacéutica
</div>

- **Empleado:**
  - Usuario: empleado1
  - Contraseña: empleado123

## Estructura del Proyecto

```
farmapp/
├── config/               # Configuraciones
├── controllers/          # Controladores
├── middleware/           # Middlewares
├── models/              # Modelos de datos
├── public/              # Archivos estáticos
│   ├── css/
│   ├── js/
│   └── images/
├── routes/              # Rutas de la aplicación
├── utils/               # Utilidades
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables de entorno
├── app.js               # Aplicación principal
├── package.json
└── README.md
```

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=drugstore

# JWT
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=24h

# Session
SESSION_SECRET=tu_clave_secreta_sesion

# App
APP_NAME=FarmApp
APP_URL=http://localhost:3000
```

## Seguridad

- Autenticación con JWT
- Protección contra XSS
- Headers de seguridad con Helmet
- Sanitización de datos de entrada
- Protección contra inyección SQL
- CORS habilitado

## Despliegue

1. Configurar las variables de entorno para producción
2. Instalar dependencias de producción:
   ```bash
   npm install --production
   ```
3. Iniciar la aplicación:
   ```bash
   npm start
   ```

## Tecnologías Utilizadas

- **Backend:** Node.js, Express
- **Base de datos:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Motor de plantillas:** Handlebars
- **Autenticación:** JWT (JSON Web Tokens)
- **Estilos:** Bootstrap 5
- **Iconos:** Bootstrap Icons


