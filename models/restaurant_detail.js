"use strict";
module.exports = (sequelize, DataTypes) => {
  const restaurant_detail = sequelize.define(
    "restaurant_detail",
    {
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      roadAddress: DataTypes.STRING,
      clock: DataTypes.STRING,
      restdetail: DataTypes.STRING,
      image: DataTypes.STRING,
      menuImage: DataTypes.STRING,
      option: DataTypes.STRING,
      menu: DataTypes.STRING,
      category: DataTypes.STRING,
      rest_id: DataTypes.INTEGER
    },
    {
      timestamps: true,
      paranoid: true
    }
  );
  restaurant_detail.associate = function(models) {
    // associations can be defined here
  };
  return restaurant_detail;
};
