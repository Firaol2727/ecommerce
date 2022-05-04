'use strict';
const {
  Model
} = require('sequelize');
const Customer=require('./customer');
const Category=require('./category')
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Category,Customer,Purchased})
    {
      Product.belongsTo(Category) 
      Product.hasMany(Purchased)
    }
  }
    Product.init(
    {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
      type:DataTypes.STRING,
      allowNull:false
      },
    picture:{
      type:DataTypes.TEXT('long'),
      allowNull:true
    },
    price:{
      type:DataTypes.STRING,
      allowNull:true
    },
    amount:{
      type:DataTypes.INTEGER,
      allowNull:false,
    },
    description:{
      type:DataTypes.TEXT,
      allowNull:true
    },
    available:{
      type:DataTypes.BOOLEAN,
      allowNull:false

    }
    }, {
    sequelize,
    tableName:'product',
    modelName: 'Product',
    });

  
  return Product;
};