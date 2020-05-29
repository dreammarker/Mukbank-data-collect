"use strict";
module.exports = (sequelize, DataTypes) => {
  const foodcategory = sequelize.define(
    "foodcategory",
    {
      parent: DataTypes.STRING,
      firchild: DataTypes.STRING,
      secondchild: DataTypes.STRING,
      thirdchild: DataTypes.STRING,
      fourchild: DataTypes.STRING,
      longword: DataTypes.STRING
    },
    {
      timestamps: true,
      paranoid: true
    }
  );
  foodcategory.associate = function(models) {
    // associations can be defined here
  };
  return foodcategory;
};
