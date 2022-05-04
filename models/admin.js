'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Admin.init(
    {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
  
      },
    name:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    email:{ 
      type:DataTypes.STRING,
      unique:true,
      allowNull:false,
      validate:{
        isEmail:true
      }
    },
    password:{
      type:DataTypes.STRING,
      allowNull:false,
      
    }
   }, {
    sequelize,
    tableName:'admin',
    modelName: 'Admin',
  });
  return Admin;
};