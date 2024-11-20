const Solucion = require('../models/Solucion');

const seedData = async () => {
    const soluciones = [
        { nombre: 'Solución A', categoria: 'Categoría 1', descripcion: 'Descripción de la solución A' },
        { nombre: 'Solución B', categoria: 'Categoría 2', descripcion: 'Descripción de la solución B' },
        // Agrega más soluciones aquí
    ];
    await Solucion.bulkCreate(soluciones);
    console.log('Datos iniciales cargados.');
};

seedData();
