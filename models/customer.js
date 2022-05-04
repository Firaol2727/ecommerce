'use strict';
const {
  Model, VIRTUAL
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Product,Purchased}) {
      // define association here
      Customer.hasMany(Purchased)

      Customer.belongsToMany(Product,{through:Purchased})
    }
  }
  Customer.init({
    id: {
      type:DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    fname: {
      type: DataTypes.STRING,
      allowNull:false
    },
    lname: {
      type: DataTypes.STRING,
      allowNull:false
    },
    fullname:{
      type:DataTypes.VIRTUAL,
      get(){
        return `${this.fname} ${this.lname}`
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate:{
        isEmail:true
      },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull:false,

    },
    Location: {
      type: DataTypes.STRING,
      allowNull:false
    },
    Gender: {
      type: DataTypes.STRING,
      allowNull:false
    },
    PhoneNo: {
      type: DataTypes.STRING,
      allowNull:false
    },    
  },
  {
    sequelize,
    tableName:'Customer',
    modelName: 'Customer',
  });
  return Customer;
};