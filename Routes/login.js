const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario'); // Importa tu modelo de usuario
const JWT_SECRET = 'tu_clave_secreta';

// Configura la ruta para login
router.post('/', async (req, res) => {
    console.log('Iniciando sesión:', req.body);
    const { email, password } = req.body;
    try {
        console.log('Buscando usuario:', email);
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(400).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }

        // Compara la contraseña proporcionada con la contraseña encriptada
        const isMatch = await bcrypt.compare(password, usuario.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.log('Error al iniciar sesión:');
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

module.exports = router;
