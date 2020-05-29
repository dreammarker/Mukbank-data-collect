"use strict";
module.exports = (sequelize, DataTypes) => {
  const restaurant = sequelize.define(
    "test4_2",
    {
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      image: DataTypes.STRING,
      longitude: DataTypes.STRING,
      latitude: DataTypes.STRING,
      xmap: DataTypes.STRING,
      ymap: DataTypes.STRING,
      roadAddress: DataTypes.STRING,
      fd_category_id: DataTypes.STRING,
      reviewsort: DataTypes.INTEGER
    },
    {
      timestamps: true,
      paranoid: true
    }
  );
  restaurant.associate = function(models) {
    // associations can be defined here
  };
  return restaurant;
};
