const { DataTypes } = require('sequelize');
const sequelize = require('../Configuracion/config');

const Solucion = sequelize.define('Solucion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true, // Si no es obligatorio, puedes permitir null
  },
  precio: {
    type: DataTypes.INTEGER,
    allowNull: true, // Si no es obligatorio, puedes permitir null
  }
}, {
  tableName: 'solucions'  // Especifica el nombre exacto de la tabla
});

module.exports = Solucion;
