# Pharmacy Management System
Complete web application for the comprehensive management of a pharmacy, developed with Node.js, Express, MySQL, Handlebars, and modern web development technologies.

## 🚀 Main Features

- 🔐 Secure authentication with roles (administrator/employee)
- 📦 Complete product management (CRUD)
- 📊 Inventory control with low stock alerts
- 🏷️ Category and supplier management
- 💰 Sales and billing records
- 📈 Dashboard with real-time statistics
- 🌐 Responsive and modern interface
- 🔒 Enhanced security with Helmet, CORS, and XSS protection
- ⚡ Performance optimization with compression and caching

## 🛠️ System Requirements

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm (v8 or higher) or yarn

## 🚀 Quick Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/BryanLobo06/Gestion_almacen_medicamentos.git
   cd farmapp
   ```

2. Install dependencies:
   ```bash
   npm install
   # o
   yarn
   ```

3. Environment configuration:
   - Copy the file `.env.example` to `.env`
   - Configure environment variables according to your local configuration

4. Database Configuration:
   ```bash
   # Create the database (make sure MySQL is running)
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS drugstore;"
   
   # Run migrations and seeders
   npm run setup-db
   ```

## 🏃‍♂️ Start the Application

For the development environment:
```bash
npm run dev
```

For production:
```bash
npm start
```

The application will be available in:
- **URL local:** http://localhost:3000
- **Default user(admin):** admin@farmacia.com
- **Password:** admin123

## 🛠️ Project Structure

```
farmapp/
├── config/           # Application settings
├── controllers/      # Business logic controllers
├── middleware/       # Custom middlewares
├── models/           # Database models
├── public/           # Static files (CSS, JS, images)
│   ├── css/
│   ├── js/
│   └── images/
├── routes/           # API Routes
├── utils/            # Utilities and helpers
├── views/            # Handlebar Templates
│   ├── layouts/
│   ├── partials/
│   └── ...
├── .env.example      # Example environment variables
├── app.js            # Application entry point
└── package.json
```

## 🔧 Environment Variables

Create a `.env` file in the project root with the following variables:

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

To run the tests:
```bash
npm test
```

## 🛡️ Security

The application includes the following security measures:
- XSS protection
- SQL injection prevention
- Helmet security headers
- Rate limiting
- Input validation
- CORS configured

## 🤝 Contribute

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Credits

- [Tu Nombre](https://github.com/tu-usuario)
- [Contribuidores](https://github.com/tu-usuario/farmapp/contributors)

---

<div align="center">
  Made with ❤️ for better pharmaceutical management
</div>

- **Employee:**
  - User: empleado1
  - Password: empleado123

## Project Structure

```
farmapp/
├── config/               # Settings
├── controllers/          # Drivers
├── middleware/           # Middleware
├── models/              # Data models
├── public/              # Static files
│   ├── css/
│   ├── js/
│   └── images/
├── routes/              # Application routes
├── utils/               # Utilities
├── .env                 # Environment variables
├── .env.example         # Example of environment variables
├── app.js               # Main application
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

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

## Security

- JWT authentication
- XSS protection
- Helmet security headers
- Input data sanitization
- SQL injection protection
- CORS enabled

## Deployment

1. Configure environment variables for production
2. Install production dependencies:
   ```bash
   npm install --production
   ```
3. Start the application:
   ```bash
   npm start
   ```

## Technologies Used

- **Backend:** Node.js, Express
- **Base de datos:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Motor de plantillas:** Handlebars
- **Autenticación:** JWT (JSON Web Tokens)
- **Estilos:** Bootstrap 5
- **Iconos:** Bootstrap Icons


