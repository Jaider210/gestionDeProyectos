require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, Op } = require('sequelize');
const solucionRoutes = require('./Routes/soluciones');  // Asegúrate de que este archivo esté bien definido
const registerRoutes = require('./Routes/register');  // Ruta para el registro
const loginRoutes = require('./Routes/login');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Carpeta para archivos estáticos

// Rutas para la vista principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Rutas para las vistas
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
app.get('/settings.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'settings.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Configura la conexión a la base de datos
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres', // Cambia esto si usas otro tipo de base de datos
});

// Probar la conexión
sequelize.authenticate()
    .then(() => {
        console.log('Conexión a la base de datos establecida con éxito.');
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
    });

// Usar las rutas definidas para las soluciones de IA
app.use('/api/soluciones', solucionRoutes);

// Usar la ruta de registro
app.use('/api/register', registerRoutes);  // Aquí se agrega la ruta para el registro

app.use('/api/login', loginRoutes); // Asegúrate de usar la ruta base '/api'
// Conectar a la base de datos y lanzar el servidor
sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(error => console.error('Error al conectar a la base de datos:', error));