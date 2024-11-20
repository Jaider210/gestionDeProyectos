  const express = require('express');
  const router = express.Router();
  const { Op } = require('sequelize');
  const Solucion = require('../models/Solucion');
  const Click = require('../models/Click');

  // Sincronizar la tabla Click al iniciar
  (async () => {
    try {
      await Click.sync({ alter: true }); // Sincroniza el modelo con la base de datos
      console.log('Modelo Click sincronizado correctamente.');
    } catch (error) {
      console.error('Error al sincronizar el modelo Click:', error);
    }
  })();

  // Función para normalizar texto (eliminar tildes, mayúsculas y caracteres especiales)
  function normalizeText(text) {
    return text
      .normalize('NFD') // Normaliza para separar caracteres acentuados
      .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
      .toLowerCase(); // Convierte todo a minúsculas
  }

  // Ruta para obtener todas las soluciones de IA
  router.get('/', async (req, res) => {
    try {
      const { keyword, categoria, precio } = req.query; // Obtener keyword, categoría y precio de la consulta
      let condiciones = {};

      // Filtro por palabra clave en nombre o descripción
      if (keyword) {
        const normalizedKeyword = `%${normalizeText(keyword)}%`;
        condiciones[Op.or] = [
          { nombre: { [Op.iLike]: normalizedKeyword } },
          { descripcion: { [Op.iLike]: normalizedKeyword } }
        ];
      }

      // Filtro por categoría en la columna "categoria"
      if (categoria) {
        const normalizedCategoria = `%${normalizeText(categoria)}%`;
        condiciones.categoria = { [Op.iLike]: normalizedCategoria };
      }

      // Filtro por rango de precios específico
      if (precio) {
        const [minPrice, maxPrice] = precio.split('-').map(value => parseFloat(value));
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
          condiciones.precio = { [Op.between]: [minPrice, maxPrice] };
        }
      }

      // Realizar la consulta con las condiciones definidas
      const soluciones = await Solucion.findAll({
        attributes: ['id', 'nombre', 'categoria', 'descripcion', 'url', 'precio'], // Incluir campos específicos
        where: condiciones
      });

      // Verificar si se encontraron resultados
      if (soluciones.length === 0) {
        return res.status(404).json({ message: 'No se encontraron resultados que coincidan con los filtros seleccionados.' });
      }

      res.json(soluciones);

    } catch (error) {
      console.error('Error al obtener las soluciones:', error);
      res.status(500).json({ error: 'Error al obtener las soluciones', details: error.message });
    }
  });

// Ruta para registrar clics en "Ver más"
router.post('/', async (req, res) => {
  const { solution_id, name, category } = req.body;

  if (!solution_id || !name) {
      return res.status(400).json({ error: 'solution_id y name son obligatorios' });
  }

  try {
      // Verifica si ya existe un registro para esta solución
      const [click, created] = await Click.findOrCreate({
          where: { solution_id },
          defaults: {
              name,
              category,
              click_count: 1, // Si es nuevo, comienza con un clic
          },
      });

      if (!created) {
          // Incrementa el contador si el registro ya existe
          click.click_count += 1;
          click.last_clicked = new Date();
          await click.save();
      }

      res.status(200).json({ success: true, click_count: click.click_count });
  } catch (error) {
      console.error('Error al registrar el clic:', error);
      res.status(500).json({ error: 'Error al registrar el clic', details: error.message });
  }
});

  // Ruta para obtener los nombres del carrusel
  router.get('/carousel-searches', async (req, res) => {
    console.log('Solicitud recibida en /carousel-searches'); // Añade este log para verificar
    try {
        const clicks = await Click.findAll({
            attributes: ['name'],
            // order: [['last_clicked', 'DESC']],
            order: [['click_count', 'DESC']],
            limit: 10,
        });

        res.json(clicks.map(click => click.name));
    } catch (error) {
        console.error('Error al obtener las búsquedas para el carrusel:', error);
        res.status(500).json({ error: 'Error al obtener las búsquedas para el carrusel', details: error.message });
    }
});

  module.exports = router;
