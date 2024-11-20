const express = require('express');
const bcrypt = require('bcrypt');
const  Usuario  = require('../models/usuario');  // Asegúrate de que el modelo 'Usuario' esté correctamente importado
const router = express.Router();

router.post('/', async (req, res) => {
    console.log('Registrando usuario:', req.body);
    try {
        const { nombre, apellido, fecha, email, password } = req.body;

        if (!nombre || !apellido || !fecha || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const newUser = await Usuario.create({
            nombre,
            apellido,
            fecha,
            email,
            password: hashedPassword // Usa la contraseña encriptada
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;
