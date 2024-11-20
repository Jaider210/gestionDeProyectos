const { DataTypes } = require('sequelize');
const sequelize = require('../Configuracion/config');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
}, {
    tableName: 'usuarios',
    timestamps: true,  // Asegúrate de que las columnas createdAt y updatedAt sean gestionadas automáticamente
});

module.exports = Usuario;
