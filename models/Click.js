const { Model, DataTypes } = require('sequelize');
const sequelize = require('../Configuracion/config');// Asegúrate de que apunte a tu configuración

class Click extends Model {}

Click.init({
  solution_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Asegura que cada solución tenga un solo registro
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
  },
  click_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_clicked: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Click',
  tableName: 'search_clicks',
  timestamps: false,
});

module.exports = Click;
