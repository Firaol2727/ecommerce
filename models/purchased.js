'use strict';
const {
  Model
} = require('sequelize');
const { Sequelize } = require('.');
module.exports = (sequelize, DataTypes) => {
  class Purchased extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Customer,Product}) {
      Purchased.belongsTo(Customer)
      Purchased.belongsTo(Product)
    }
  }
  Purchased.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true

    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    fee:{
      type:DataTypes.FLOAT,
      allowNull:false,
    },
    date:{
      type:DataTypes.DATE,
      allowNull:false
    }
  }, 
  {
    sequelize,
    tableName:'purchased',
    modelName: 'Purchased',
  });
  return Purchased;
};